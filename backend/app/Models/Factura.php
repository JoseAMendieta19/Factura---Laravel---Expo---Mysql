<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Factura extends Model
{
    protected $table = 't_factura';
    protected $primaryKey = 'fac_id';
    public $timestamps = false;

    protected $fillable = [
        'fac_numero',
        'fac_fecha',
        'cli_id',
        'vend_id',
        'fac_subtotal',
        'iva_id',
        'fac_descuento',
        'fac_total',
    ];

    // Se incluye siempre en el JSON, pero no existe como columna.
    protected $appends = ['iva_monto'];

    protected function casts(): array
    {
        return [
            'fac_fecha'     => 'date:Y-m-d',
            'fac_subtotal'  => 'decimal:2',
            'fac_descuento' => 'decimal:2',
            'fac_total'     => 'decimal:2',
        ];
    }

    /** IVA en dinero = total - subtotal + descuento (no se guarda en la base). */
    protected function ivaMonto(): Attribute
    {
        return Attribute::get(function () {
            $centavos = (int) round(
                ((float) $this->fac_total - (float) $this->fac_subtotal + (float) $this->fac_descuento) * 100
            );

            return number_format($centavos / 100, 2, '.', '');
        });
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cli_id', 'cli_id');
    }

    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(Vendedor::class, 'vend_id', 'vend_id');
    }

    public function iva(): BelongsTo
    {
        return $this->belongsTo(Iva::class, 'iva_id', 'iva_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleFactura::class, 'fac_id', 'fac_id');
    }
}