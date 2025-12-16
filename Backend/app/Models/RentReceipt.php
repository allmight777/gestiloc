<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'lease_id',
        'property_id',
        'landlord_id',
        'tenant_id',
        'month',
        'year',
        'paid_at',
        'rent_amount',
        'charges_amount',
        'reference',
        'status',
        'notes',
    ];

    protected $casts = [
        'paid_at' => 'date',
        'month' => 'integer',
        'year' => 'integer',
        'rent_amount' => 'decimal:2',
        'charges_amount' => 'decimal:2',
    ];

    public function lease()    { return $this->belongsTo(\App\Models\Lease::class); }
    public function property() { return $this->belongsTo(\App\Models\Property::class); }
    public function landlord() { return $this->belongsTo(\App\Models\User::class, 'landlord_id'); }
    public function tenant()   { return $this->belongsTo(\App\Models\User::class, 'tenant_id'); }
}
