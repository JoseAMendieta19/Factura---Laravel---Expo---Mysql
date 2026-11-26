<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendedor extends Model
{
    protected $table = 't_vendedor';
    protected $primaryKey = 'vend_id';
    public $timestamps = false;

    protected $fillable = [
        'vend_codigo',
        'vend_nombre',
        'vend_correo',
        'vend_telefono',
        'prov_id',
        'ciud_id',
    ];

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'prov_id', 'prov_id');
    }

    public function ciudad(): BelongsTo
    {
        return $this->belongsTo(Ciudad::class, 'ciud_id', 'ciud_id');
    }

    public function facturas(): HasMany
    {
        return $this->hasMany(Factura::class, 'vend_id', 'vend_id');
    }
}