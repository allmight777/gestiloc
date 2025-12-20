<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class RentReceipt extends Model
{
    protected $fillable = [
        'invoice_id',
        'lease_id',
        'tenant_id',
        'landlord_user_id',
        'receipt_number',
        'issued_date',
        'paid_month',
        'amount_paid',
        'pdf_path',
        'status',
        'meta',
    ];

    protected $casts = [
        'issued_date' => 'date',
        'meta' => 'array',
        'amount_paid' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->receipt_number)) {
                $model->receipt_number = 'REC-' . strtoupper(Str::random(10));
            }
            if (empty($model->issued_date)) {
                $model->issued_date = now()->toDateString();
            }
        });
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function landlordUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'landlord_user_id');
    }
}
