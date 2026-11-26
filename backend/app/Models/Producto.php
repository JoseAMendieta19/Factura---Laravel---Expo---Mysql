<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producto extends Model
{
    protected $table = 't_productos';
    protected $primaryKey = 'produc_id';
    public $timestamps = false;

    protected $fillable = [
        'produc_serie',
        'produc_nombre',
        'produc_cantidad',
        'provee_id',
        'produc_fecha_venci',
        'produc_precio',
    ];

    protected function casts(): array
    {
        return [
            'produc_cantidad'    => 'integer',
            'produc_precio'      => 'decimal:2',
            'produc_fecha_venci' => 'date:Y-m-d',
        ];
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'provee_id', 'provee_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleFactura::class, 'produc_id', 'produc_id');
    }
}