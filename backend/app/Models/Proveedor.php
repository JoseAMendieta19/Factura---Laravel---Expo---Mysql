<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Proveedor extends Model
{
    protected $table = 't_proveedor';
    protected $primaryKey = 'provee_id';
    public $timestamps = false;

    protected $fillable = [
        'provee_codigo',
        'provee_nombre',
        'provee_telefono',
        'prov_id',
        'ciud_id',
        'provee_direccion',
    ];

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'prov_id', 'prov_id');
    }

    public function ciudad(): BelongsTo
    {
        return $this->belongsTo(Ciudad::class, 'ciud_id', 'ciud_id');
    }

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'provee_id', 'provee_id');
    }
}