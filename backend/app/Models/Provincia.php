<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provincia extends Model
{
    protected $table = 't_provincia';
    protected $primaryKey = 'prov_id';
    public $timestamps = false;

    protected $fillable = ['prov_codigo', 'prov_nombres'];

    public function ciudades(): HasMany
    {
        return $this->hasMany(Ciudad::class, 'prov_id', 'prov_id');
    }

    public function clientes(): HasMany
    {
        return $this->hasMany(Cliente::class, 'prov_id', 'prov_id');
    }

    public function vendedores(): HasMany
    {
        return $this->hasMany(Vendedor::class, 'prov_id', 'prov_id');
    }

    public function proveedores(): HasMany
    {
        return $this->hasMany(Proveedor::class, 'prov_id', 'prov_id');
    }
}