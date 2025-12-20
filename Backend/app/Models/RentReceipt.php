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

        'type',        // ✅
        'paid_month',  // ✅
        'issued_date', // ✅
        'amount_paid', // ✅

        'month',
        'year',
        'reference',
        'status',
        'notes',
    ];

    protected $casts = [
        'month'       => 'integer',
        'year'        => 'integer',
        'issued_date' => 'date',      // ✅
        'amount_paid' => 'decimal:2', // ✅
    ];

    public function lease()    { return $this->belongsTo(\App\Models\Lease::class); }
    public function property() { return $this->belongsTo(\App\Models\Property::class); }
    public function landlord() { return $this->belongsTo(\App\Models\User::class, 'landlord_id'); }
    public function tenant()   { return $this->belongsTo(\App\Models\User::class, 'tenant_id'); }
}
