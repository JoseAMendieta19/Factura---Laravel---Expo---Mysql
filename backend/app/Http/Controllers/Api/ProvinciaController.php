<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProvinciaRequest;
use App\Models\Provincia;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProvinciaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));

        $provincias = Provincia::query()
            ->when($buscar !== '', function ($consulta) use ($buscar) {
                $consulta->where(function ($q) use ($buscar) {
                    $q->where('prov_nombres', 'like', "%{$buscar}%")
                      ->orWhere('prov_codigo', 'like', "%{$buscar}%");
                });
            })
            ->orderBy('prov_nombres')
            ->get();

        return response()->json(['data' => $provincias]);
    }

    public function store(ProvinciaRequest $request): JsonResponse
    {
        $provincia = Provincia::create($request->validated());

        return response()->json([
            'message' => 'Provincia creada correctamente.',
            'data' => $provincia,
        ], 201);
    }

    public function show(Provincia $provincia): JsonResponse
    {
        return response()->json(['data' => $provincia]);
    }

    public function update(ProvinciaRequest $request, Provincia $provincia): JsonResponse
    {
        $provincia->update($request->validated());

        return response()->json([
            'message' => 'Provincia actualizada correctamente.',
            'data' => $provincia,
        ]);
    }

    public function destroy(Provincia $provincia): JsonResponse
    {
        // relación => [singular, plural]
        $relaciones = [
            'ciudades' => ['ciudad', 'ciudades'],
            'clientes' => ['cliente', 'clientes'],
            'vendedores' => ['vendedor', 'vendedores'],
            'proveedores' => ['proveedor', 'proveedores'],
        ];

        $provincia->loadCount(array_keys($relaciones));

        $detalle = [];
        foreach ($relaciones as $relacion => [$singular, $plural]) {
            $total = (int) $provincia->{$relacion . '_count'};
            if ($total > 0) {
                $detalle[] = $total . ' ' . ($total === 1 ? $singular : $plural);
            }
        }

        if (!empty($detalle)) {
            return response()->json([
                'message' => 'No se puede eliminar: la provincia tiene registros asociados (' . implode(', ', $detalle) . ').',
            ], 409);
        }

        try {
            $provincia->delete();
        } catch (QueryException $e) {
            // Red de seguridad: si MySQL aún así rechaza (llave foránea), no hay error 500.
            return response()->json([
                'message' => 'No se puede eliminar: la provincia tiene registros asociados.',
            ], 409);
        }

        return response()->json(['message' => 'Provincia eliminada correctamente.']);
    }
}