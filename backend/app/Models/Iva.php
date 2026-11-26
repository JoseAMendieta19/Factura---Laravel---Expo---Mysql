<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Iva extends Model
{
    protected $table = 't_iva';
    protected $primaryKey = 'iva_id';
    public $timestamps = false;

    protected $fillable = ['iva_nombre', 'iva_valor'];

    protected function casts(): array
    {
        return [
            'iva_valor' => 'decimal:2',
        ];
    }

    public function facturas(): HasMany
    {
        return $this->hasMany(Factura::class, 'iva_id', 'iva_id');
    }
}