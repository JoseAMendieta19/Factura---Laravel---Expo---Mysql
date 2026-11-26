<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProveedorRequest;
use App\Models\Proveedor;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProveedorController extends Controller
{
    private const RELACIONES = [
        'ciudad:ciud_id,ciud_nombre',
        'provincia:prov_id,prov_nombres',
    ];

    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));

        $proveedores = Proveedor::query()
            ->with(self::RELACIONES)
            ->when($buscar !== '', function ($consulta) use ($buscar) {
                $consulta->where(function ($q) use ($buscar) {
                    $q->where('provee_nombre', 'like', "%{$buscar}%")
                      ->orWhere('provee_codigo', 'like', "%{$buscar}%");
                });
            })
            ->orderBy('provee_nombre')
            ->get();

        return response()->json(['data' => $proveedores]);
    }

    public function store(ProveedorRequest $request): JsonResponse
    {
        $proveedor = Proveedor::create($request->validated());
        $proveedor->load(self::RELACIONES);

        return response()->json([
            'message' => 'Proveedor creado correctamente.',
            'data' => $proveedor,
        ], 201);
    }

    public function show(Proveedor $proveedor): JsonResponse
    {
        $proveedor->load(self::RELACIONES);

        return response()->json(['data' => $proveedor]);
    }

    public function update(ProveedorRequest $request, Proveedor $proveedor): JsonResponse
    {
        $proveedor->update($request->validated());
        $proveedor->load(self::RELACIONES);

        return response()->json([
            'message' => 'Proveedor actualizado correctamente.',
            'data' => $proveedor,
        ]);
    }

    public function destroy(Proveedor $proveedor): JsonResponse
    {
        $totalProductos = $proveedor->productos()->count();

        if ($totalProductos > 0) {
            $texto = $totalProductos . ' ' . ($totalProductos === 1 ? 'producto' : 'productos');

            return response()->json([
                'message' => "No se puede eliminar: el proveedor tiene registros asociados ({$texto}).",
            ], 409);
        }

        try {
            $proveedor->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar: el proveedor tiene registros asociados.',
            ], 409);
        }

        return response()->json(['message' => 'Proveedor eliminado correctamente.']);
    }
}