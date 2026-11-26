<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductoRequest;
use App\Models\Producto;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    private const RELACIONES = ['proveedor:provee_id,provee_nombre'];

    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));
        $proveeId = $request->query('provee_id');

        $productos = Producto::query()
            ->with(self::RELACIONES)
            ->when(is_numeric($proveeId), fn ($q) => $q->where('provee_id', (int) $proveeId))
            ->when($buscar !== '', function ($consulta) use ($buscar) {
                $consulta->where(function ($q) use ($buscar) {
                    $q->where('produc_nombre', 'like', "%{$buscar}%")
                      ->orWhere('produc_serie', 'like', "%{$buscar}%");
                });
            })
            ->orderBy('produc_nombre')
            ->get();

        return response()->json(['data' => $productos]);
    }

    public function store(ProductoRequest $request): JsonResponse
    {
        $producto = Producto::create($request->validated());
        $producto->load(self::RELACIONES);

        return response()->json([
            'message' => 'Producto creado correctamente.',
            'data' => $producto,
        ], 201);
    }

    public function show(Producto $producto): JsonResponse
    {
        $producto->load(self::RELACIONES);

        return response()->json(['data' => $producto]);
    }

    public function update(ProductoRequest $request, Producto $producto): JsonResponse
    {
        $producto->update($request->validated());
        $producto->load(self::RELACIONES);

        return response()->json([
            'message' => 'Producto actualizado correctamente.',
            'data' => $producto,
        ]);
    }

    public function destroy(Producto $producto): JsonResponse
    {
        $totalLineas = $producto->detalles()->count();

        if ($totalLineas > 0) {
            $texto = $totalLineas . ' ' . ($totalLineas === 1 ? 'línea de factura' : 'líneas de factura');

            return response()->json([
                'message' => "No se puede eliminar: el producto tiene registros asociados ({$texto}).",
            ], 409);
        }

        try {
            $producto->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar: el producto tiene registros asociados.',
            ], 409);
        }

        return response()->json(['message' => 'Producto eliminado correctamente.']);
    }
}