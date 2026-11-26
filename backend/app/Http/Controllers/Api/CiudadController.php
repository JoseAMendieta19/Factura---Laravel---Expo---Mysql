<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CiudadRequest;
use App\Models\Ciudad;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CiudadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));
        $provId = $request->query('prov_id');

        $ciudades = Ciudad::query()
            ->with('provincia:prov_id,prov_nombres')
            ->when(is_numeric($provId), fn ($q) => $q->where('prov_id', (int) $provId))
            ->when($buscar !== '', function ($consulta) use ($buscar) {
                $consulta->where(function ($q) use ($buscar) {
                    $q->where('ciud_nombre', 'like', "%{$buscar}%")
                      ->orWhere('ciu_codigo', 'like', "%{$buscar}%");
                });
            })
            ->orderBy('ciud_nombre')
            ->get();

        return response()->json(['data' => $ciudades]);
    }

    public function store(CiudadRequest $request): JsonResponse
    {
        $ciudad = Ciudad::create($request->validated());
        $ciudad->load('provincia:prov_id,prov_nombres');

        return response()->json([
            'message' => 'Ciudad creada correctamente.',
            'data' => $ciudad,
        ], 201);
    }

    public function show(Ciudad $ciudad): JsonResponse
    {
        $ciudad->load('provincia:prov_id,prov_nombres');

        return response()->json(['data' => $ciudad]);
    }

    public function update(CiudadRequest $request, Ciudad $ciudad): JsonResponse
    {
        $ciudad->update($request->validated());
        $ciudad->load('provincia:prov_id,prov_nombres');

        return response()->json([
            'message' => 'Ciudad actualizada correctamente.',
            'data' => $ciudad,
        ]);
    }

    public function destroy(Ciudad $ciudad): JsonResponse
    {
        $relaciones = [
            'clientes' => ['cliente', 'clientes'],
            'vendedores' => ['vendedor', 'vendedores'],
            'proveedores' => ['proveedor', 'proveedores'],
        ];

        $ciudad->loadCount(array_keys($relaciones));

        $detalle = [];
        foreach ($relaciones as $relacion => [$singular, $plural]) {
            $total = (int) $ciudad->{$relacion . '_count'};
            if ($total > 0) {
                $detalle[] = $total . ' ' . ($total === 1 ? $singular : $plural);
            }
        }

        if (!empty($detalle)) {
            return response()->json([
                'message' => 'No se puede eliminar: la ciudad tiene registros asociados (' . implode(', ', $detalle) . ').',
            ], 409);
        }

        try {
            $ciudad->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar: la ciudad tiene registros asociados.',
            ], 409);
        }

        return response()->json(['message' => 'Ciudad eliminada correctamente.']);
    }
}