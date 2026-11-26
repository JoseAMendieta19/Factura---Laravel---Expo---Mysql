<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClienteRequest;
use App\Models\Cliente;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    private const RELACIONES = [
        'ciudad:ciud_id,ciud_nombre',
        'provincia:prov_id,prov_nombres',
    ];

    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));

        $clientes = Cliente::query()
            ->with(self::RELACIONES)
            ->when($buscar !== '', function ($consulta) use ($buscar) {
                $consulta->where(function ($q) use ($buscar) {
                    $q->where('cli_nombres', 'like', "%{$buscar}%")
                      ->orWhere('cli_cedula', 'like', "%{$buscar}%")
                      ->orWhere('cli_correo', 'like', "%{$buscar}%");
                });
            })
            ->orderBy('cli_nombres')
            ->get();

        return response()->json(['data' => $clientes]);
    }

    public function store(ClienteRequest $request): JsonResponse
    {
        $cliente = Cliente::create($request->validated());
        $cliente->load(self::RELACIONES);

        return response()->json([
            'message' => 'Cliente creado correctamente.',
            'data' => $cliente,
        ], 201);
    }

    public function show(Cliente $cliente): JsonResponse
    {
        $cliente->load(self::RELACIONES);

        return response()->json(['data' => $cliente]);
    }

    public function update(ClienteRequest $request, Cliente $cliente): JsonResponse
    {
        $cliente->update($request->validated());
        $cliente->load(self::RELACIONES);

        return response()->json([
            'message' => 'Cliente actualizado correctamente.',
            'data' => $cliente,
        ]);
    }

    public function destroy(Cliente $cliente): JsonResponse
    {
        $totalFacturas = $cliente->facturas()->count();

        if ($totalFacturas > 0) {
            $texto = $totalFacturas . ' ' . ($totalFacturas === 1 ? 'factura' : 'facturas');

            return response()->json([
                'message' => "No se puede eliminar: el cliente tiene registros asociados ({$texto}).",
            ], 409);
        }

        try {
            $cliente->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar: el cliente tiene registros asociados.',
            ], 409);
        }

        return response()->json(['message' => 'Cliente eliminado correctamente.']);
    }
}