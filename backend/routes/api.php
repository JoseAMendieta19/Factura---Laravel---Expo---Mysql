<?php

use App\Http\Controllers\Api\CiudadController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\FacturaController;
use App\Http\Controllers\Api\IvaController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ProveedorController;
use App\Http\Controllers\Api\ProvinciaController;
use App\Http\Controllers\Api\VendedorController;
use Illuminate\Support\Facades\Route;

Route::apiResource('provincias', ProvinciaController::class)
    ->parameters(['provincias' => 'provincia']);

Route::apiResource('ciudades', CiudadController::class)
    ->parameters(['ciudades' => 'ciudad']);

Route::apiResource('iva', IvaController::class)
    ->parameters(['iva' => 'iva']);

Route::apiResource('clientes', ClienteController::class)
    ->parameters(['clientes' => 'cliente']);

Route::apiResource('vendedores', VendedorController::class)
    ->parameters(['vendedores' => 'vendedor']);

Route::apiResource('proveedores', ProveedorController::class)
    ->parameters(['proveedores' => 'proveedor']);

Route::apiResource('productos', ProductoController::class)
    ->parameters(['productos' => 'producto']);

// Las facturas no se editan ni se eliminan: solo crear, listar y ver detalle.
Route::apiResource('facturas', FacturaController::class)
    ->only(['index', 'show', 'store'])
    ->parameters(['facturas' => 'factura']);