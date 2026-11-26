<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VendedorRequest;
use App\Models\Vendedor;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendedorController extends Controller
{
    private const RELACIONES = [
        'ciudad:ciud_id,ciud_nombre',
        'provincia:prov_id,prov_nombres',
    ];

    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));

        $vendedores = Vendedor::query()
            ->with(self::RELACIONES)
            ->when($buscar !== '', function ($consulta) use ($buscar) {
                $consulta->where(function ($q) use ($buscar) {
                    $q->where('vend_nombre', 'like', "%{$buscar}%")
                      ->orWhere('vend_codigo', 'like', "%{$buscar}%")
                      ->orWhere('vend_correo', 'like', "%{$buscar}%");
                });
            })
            ->orderBy('vend_nombre')
            ->get();

        return response()->json(['data' => $vendedores]);
    }

    public function store(VendedorRequest $request): JsonResponse
    {
        $vendedor = Vendedor::create($request->validated());
        $vendedor->load(self::RELACIONES);

        return response()->json([
            'message' => 'Vendedor creado correctamente.',
            'data' => $vendedor,
        ], 201);
    }

    public function show(Vendedor $vendedor): JsonResponse
    {
        $vendedor->load(self::RELACIONES);

        return response()->json(['data' => $vendedor]);
    }

    public function update(VendedorRequest $request, Vendedor $vendedor): JsonResponse
    {
        $vendedor->update($request->validated());
        $vendedor->load(self::RELACIONES);

        return response()->json([
            'message' => 'Vendedor actualizado correctamente.',
            'data' => $vendedor,
        ]);
    }

    public function destroy(Vendedor $vendedor): JsonResponse
    {
        $totalFacturas = $vendedor->facturas()->count();

        if ($totalFacturas > 0) {
            $texto = $totalFacturas . ' ' . ($totalFacturas === 1 ? 'factura' : 'facturas');

            return response()->json([
                'message' => "No se puede eliminar: el vendedor tiene registros asociados ({$texto}).",
            ], 409);
        }

        try {
            $vendedor->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar: el vendedor tiene registros asociados.',
            ], 409);
        }

        return response()->json(['message' => 'Vendedor eliminado correctamente.']);
    }
}