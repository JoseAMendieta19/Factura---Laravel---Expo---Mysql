<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    protected $table = 't_cliente';
    protected $primaryKey = 'cli_id';
    public $timestamps = false;

    protected $fillable = [
        'cli_cedula',
        'cli_nombres',
        'cli_correo',
        'cli_telefono',
        'cli_direccion',
        'ciud_id',
        'prov_id',
    ];

    public function ciudad(): BelongsTo
    {
        return $this->belongsTo(Ciudad::class, 'ciud_id', 'ciud_id');
    }

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'prov_id', 'prov_id');
    }

    public function facturas(): HasMany
    {
        return $this->hasMany(Factura::class, 'cli_id', 'cli_id');
    }
}