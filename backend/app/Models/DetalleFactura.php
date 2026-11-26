<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleFactura extends Model
{
    protected $table = 't_detalle_factura';
    protected $primaryKey = 'det_fac_id';
    public $timestamps = false;

    protected $fillable = [
        'fac_id',
        'produc_id',
        'det_fac_cant',
        'det_fac_precio_unitario',
        'det_fac_total',
    ];

    protected function casts(): array
    {
        return [
            'det_fac_cant'            => 'integer',
            'det_fac_precio_unitario' => 'decimal:2',
            'det_fac_total'           => 'decimal:2',
        ];
    }

    public function factura(): BelongsTo
    {
        return $this->belongsTo(Factura::class, 'fac_id', 'fac_id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'produc_id', 'produc_id');
    }
}