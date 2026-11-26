<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FacturaRequest;
use App\Models\Factura;
use App\Models\Iva;
use App\Models\Producto;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FacturaController extends Controller
{
    // Máximo de un DECIMAL(10,2): 99 999 999,99 expresado en centavos.
    private const MAXIMO_CENTAVOS = 9999999999;

    private const RELACIONES = [
        'cliente:cli_id,cli_cedula,cli_nombres',
        'vendedor:vend_id,vend_nombre',
        'iva',
        'detalles.producto:produc_id,produc_serie,produc_nombre',
    ];

    public function index(Request $request): JsonResponse
    {
        $filtros = $request->validate([
            'buscar' => ['nullable', 'string', 'max:100'],
            'desde' => ['bail', 'nullable', 'date_format:Y-m-d'],
            'hasta' => ['bail', 'nullable', 'date_format:Y-m-d', 'after_or_equal:desde'],
        ], [
            'desde.date_format' => 'La fecha Desde debe tener el formato AAAA-MM-DD.',
            'hasta.date_format' => 'La fecha Hasta debe tener el formato AAAA-MM-DD.',
            'hasta.after_or_equal' => 'La fecha Hasta no puede ser anterior a la fecha Desde.',
            'buscar.max' => 'La búsqueda no puede superar los :max caracteres.',
        ]);

        $consulta = Factura::query()
            ->with('cliente:cli_id,cli_cedula,cli_nombres')
            ->when(!empty($filtros['buscar']), function ($q) use ($filtros) {
                $buscar = trim($filtros['buscar']);

                // Por número de factura o por datos del cliente.
                $q->where(function ($q) use ($buscar) {
                    $q->where('fac_numero', 'like', "%{$buscar}%")
                      ->orWhereHas('cliente', function ($c) use ($buscar) {
                          $c->where('cli_nombres', 'like', "%{$buscar}%")
                            ->orWhere('cli_cedula', 'like', "%{$buscar}%");
                      });
                });
            })
            ->when(!empty($filtros['desde']), fn ($q) => $q->where('fac_fecha', '>=', $filtros['desde']))
            ->when(!empty($filtros['hasta']), fn ($q) => $q->where('fac_fecha', '<=', $filtros['hasta']));

        // El resumen se calcula con el mismo filtro, antes de ordenar.
        $cantidad = (clone $consulta)->count();
        $suma = (clone $consulta)->sum('fac_total');

        $facturas = $consulta
            ->orderByDesc('fac_fecha')
            ->orderByDesc('fac_id')
            ->get();

        return response()->json([
            'data' => $facturas,
            'resumen' => [
                'cantidad' => $cantidad,
                'total' => $this->formato((int) round(((float) $suma) * 100)),
            ],
        ]);
    }

    public function show(Factura $factura): JsonResponse
    {
        $factura->load([
            'cliente:cli_id,cli_cedula,cli_nombres,cli_correo,cli_telefono,cli_direccion',
            'vendedor:vend_id,vend_codigo,vend_nombre',
            'iva',
            'detalles' => fn ($q) => $q->orderBy('det_fac_id'),
            'detalles.producto:produc_id,produc_serie,produc_nombre',
        ]);

        return response()->json(['data' => $factura]);
    }

    public function store(FacturaRequest $request): JsonResponse
    {
        $datos = $request->validated();

        try {
            // Hasta 3 intentos si MySQL detecta un interbloqueo (deadlock).
            $factura = DB::transaction(fn () => $this->registrar($datos), 3);
        } catch (QueryException $e) {
            // 23000 = violación de unicidad o llave foránea; 40001 = interbloqueo persistente.
            if (in_array((string) $e->getCode(), ['23000', '40001'], true)) {
                report($e);

                return response()->json([
                    'message' => 'No se pudo registrar la factura. Intenta nuevamente.',
                ], 409);
            }

            throw $e;
        }

        return response()->json([
            'message' => 'Factura registrada correctamente.',
            'data' => $factura->load(self::RELACIONES),
        ], 201);
    }

    /** Todo lo que sigue corre dentro de UNA transacción: si algo falla, no se guarda nada. */
    private function registrar(array $datos): Factura
    {
        // 1. Bloquear las filas de los productos (en orden de id, para evitar interbloqueos)
        //    hasta que termine la transacción: nadie más puede vender ese stock mientras tanto.
        $ids = collect($datos['detalles'])->pluck('produc_id')->map(fn ($id) => (int) $id)->all();

        $productos = Producto::whereIn('produc_id', $ids)
            ->orderBy('produc_id')
            ->lockForUpdate()
            ->get()
            ->keyBy('produc_id');

        // 2. Validar cada línea contra el stock y la fecha de vencimiento reales.
        $hoy = today();
        $errores = [];
        $lineas = [];
        $subtotal = 0;

        foreach ($datos['detalles'] as $i => $linea) {
            $producto = $productos->get((int) $linea['produc_id']);
            $cantidad = (int) $linea['cantidad'];

            if (!$producto) {
                $errores["detalles.$i.produc_id"] = 'El producto seleccionado ya no existe.';
                continue;
            }

            if ($producto->produc_fecha_venci->lt($hoy)) {
                $errores["detalles.$i.produc_id"] = sprintf(
                    'El producto «%s» está vencido (venció el %s) y no se puede vender.',
                    $producto->produc_nombre,
                    $producto->produc_fecha_venci->format('Y-m-d')
                );
            }

            if ($cantidad > (int) $producto->produc_cantidad) {
                $errores["detalles.$i.cantidad"] = sprintf(
                    'Stock insuficiente de «%s»: disponible %d, solicitado %d.',
                    $producto->produc_nombre,
                    (int) $producto->produc_cantidad,
                    $cantidad
                );
            }

            // El precio unitario se COPIA del producto en este momento.
            $precio = $this->aCentavos($producto->produc_precio);
            $totalLinea = $precio * $cantidad;
            $subtotal += $totalLinea;

            $lineas[] = [
                'produc_id' => $producto->produc_id,
                'cantidad' => $cantidad,
                'precio' => $precio,
                'total' => $totalLinea,
            ];
        }

        if (!empty($errores)) {
            throw ValidationException::withMessages($errores);
        }

        // 3. Descuento y totales (fórmula B: el IVA se calcula sobre el subtotal ya descontado).
        $descuento = $this->aCentavos($datos['fac_descuento'] ?? 0);

        if ($descuento > $subtotal) {
            throw ValidationException::withMessages([
                'fac_descuento' => 'El descuento no puede ser mayor que el subtotal (' . $this->formato($subtotal) . ').',
            ]);
        }

        $iva = Iva::findOrFail($datos['iva_id']);
        $tarifa = $this->aCentavos($iva->iva_valor); // porcentaje en centésimas: 15.00 => 1500

        $base = $subtotal - $descuento;
        // IVA = base * tarifa / 100, redondeado a 2 decimales con mitad hacia arriba,
        // todo con enteros: (base * tarifa / 10000) redondeado.
        $ivaCentavos = intdiv($base * $tarifa + 5000, 10000);
        $total = $base + $ivaCentavos;

        if ($total > self::MAXIMO_CENTAVOS) {
            throw ValidationException::withMessages([
                'detalles' => 'El total de la factura supera el máximo permitido.',
            ]);
        }

        // 4. Número consecutivo: se bloquea la última factura para que dos ventas
        //    simultáneas no obtengan el mismo número.
        $ultima = Factura::orderByDesc('fac_id')->lockForUpdate()->first();
        $siguiente = $ultima ? ((int) substr($ultima->fac_numero, 4)) + 1 : 1;
        $numero = 'FAC-' . str_pad((string) $siguiente, 6, '0', STR_PAD_LEFT);

        // 5. Guardar la factura, sus líneas y descontar el stock.
        $factura = Factura::create([
            'fac_numero' => $numero,
            'fac_fecha' => $datos['fac_fecha'],
            'cli_id' => $datos['cli_id'],
            'vend_id' => $datos['vend_id'],
            'fac_subtotal' => $this->formato($subtotal),
            'iva_id' => $datos['iva_id'],
            'fac_descuento' => $this->formato($descuento),
            'fac_total' => $this->formato($total),
        ]);

        foreach ($lineas as $linea) {
            $factura->detalles()->create([
                'produc_id' => $linea['produc_id'],
                'det_fac_cant' => $linea['cantidad'],
                'det_fac_precio_unitario' => $this->formato($linea['precio']),
                'det_fac_total' => $this->formato($linea['total']),
            ]);

            Producto::where('produc_id', $linea['produc_id'])
                ->decrement('produc_cantidad', $linea['cantidad']);
        }

        return $factura;
    }

    /** "2.50" => 250. Los valores ya vienen validados con máximo 2 decimales. */
    private function aCentavos(string|int|float $valor): int
    {
        return (int) round(((float) $valor) * 100);
    }

    /** 250 => "2.50" */
    private function formato(int $centavos): string
    {
        return number_format($centavos / 100, 2, '.', '');
    }
}