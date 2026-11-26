<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IvaRequest;
use App\Models\Iva;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IvaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));

        $tarifas = Iva::query()
            ->when($buscar !== '', fn ($q) => $q->where('iva_nombre', 'like', "%{$buscar}%"))
            ->orderBy('iva_valor')
            ->get();

        return response()->json(['data' => $tarifas]);
    }

    public function store(IvaRequest $request): JsonResponse
    {
        $iva = Iva::create($request->validated());

        return response()->json([
            'message' => 'Tarifa de IVA creada correctamente.',
            'data' => $iva,
        ], 201);
    }

    public function show(Iva $iva): JsonResponse
    {
        return response()->json(['data' => $iva]);
    }

    public function update(IvaRequest $request, Iva $iva): JsonResponse
    {
        $iva->update($request->validated());

        return response()->json([
            'message' => 'Tarifa de IVA actualizada correctamente.',
            'data' => $iva,
        ]);
    }

    public function destroy(Iva $iva): JsonResponse
    {
        $totalFacturas = $iva->facturas()->count();

        if ($totalFacturas > 0) {
            $texto = $totalFacturas . ' ' . ($totalFacturas === 1 ? 'factura' : 'facturas');

            return response()->json([
                'message' => "No se puede eliminar: la tarifa de IVA tiene registros asociados ({$texto}).",
            ], 409);
        }

        try {
            $iva->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar: la tarifa de IVA tiene registros asociados.',
            ], 409);
        }

        return response()->json(['message' => 'Tarifa de IVA eliminada correctamente.']);
    }
}