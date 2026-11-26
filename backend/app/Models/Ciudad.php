<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ciudad extends Model
{
    protected $table = 't_ciudad';
    protected $primaryKey = 'ciud_id';
    public $timestamps = false;

    protected $fillable = ['ciu_codigo', 'ciud_nombre', 'prov_id'];

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'prov_id', 'prov_id');
    }

    public function clientes(): HasMany
    {
        return $this->hasMany(Cliente::class, 'ciud_id', 'ciud_id');
    }

    public function vendedores(): HasMany
    {
        return $this->hasMany(Vendedor::class, 'ciud_id', 'ciud_id');
    }

    public function proveedores(): HasMany
    {
        return $this->hasMany(Proveedor::class, 'ciud_id', 'ciud_id');
    }
}