<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RentReceipt;
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class RentReceiptController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        Log::info('[RentReceiptController@index] incoming', [
            'auth_id' => $user?->id,
            'roles'   => $user?->roles?->pluck('name'),
            'query'   => $request->query(),
        ]);

        $type = $request->query('type'); // independent | invoice | null

        $q = RentReceipt::query()->latest();

        if ($user?->hasRole('landlord')) {
            $q->where('landlord_id', $user->id);
        } else {
            $q->where('tenant_id', $user->id);
        }

        // ✅ Filtre type uniquement si colonne existe (évite crash si migration pas passée)
        if ($type && Schema::hasColumn('rent_receipts', 'type')) {
            $q->where('type', $type);
        }

        $rows = $q->with(['property', 'tenant', 'lease'])->get();

        Log::info('[RentReceiptController@index] result', [
            'count' => $rows->count(),
            'type_filter' => $type,
            'has_type_column' => Schema::hasColumn('rent_receipts', 'type'),
        ]);

        return response()->json($rows);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        Log::info('[RentReceiptController@store] incoming', [
            'auth_id' => $user?->id,
            'roles'   => $user?->roles?->pluck('name'),
            'payload' => $request->all(),
        ]);

        // ✅ On accepte paid_month "YYYY-MM"
        $validator = Validator::make($request->all(), [
            'lease_id'    => 'required|exists:leases,id',
            'type'        => 'required|in:independent,invoice',
            'paid_month'  => ['required', 'regex:/^\d{4}-\d{2}$/'],
            'issued_date' => 'required|date',
            'notes'       => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            Log::warning('[RentReceiptController@store] validation failed', [
                'errors' => $validator->errors(),
            ]);
            return response()->json($validator->errors(), 422);
        }

        // ✅ Récupérer le bail + relations utiles
        $lease = Lease::with(['property', 'tenant'])->find($request->lease_id);

        Log::info('[RentReceiptController@store] lease lookup', [
            'lease_found' => !!$lease,
            'lease_id'    => $lease?->id,
            'property_id' => $lease?->property_id,
            'tenant_id'   => $lease?->tenant_id,
        ]);

        if (!$lease) {
            return response()->json(['message' => 'Lease not found'], 404);
        }

        // ✅ Autorisation : seul le propriétaire du bien peut créer
        $property = $lease->property;

        Log::info('[RentReceiptController@store] property lookup', [
            'property_found'   => !!$property,
            'property_id'      => $property?->id,
            'property_user_id' => $property?->user_id ?? null,
            'auth_id'          => $user->id,
        ]);

        if (!$property || ($property->user_id ?? null) !== $user->id) {
            Log::warning('[RentReceiptController@store] forbidden - property not owned by auth user', [
                'auth_id'          => $user->id,
                'property_id'      => $property?->id,
                'property_user_id' => $property?->user_id ?? null,
            ]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // ✅ paid_month -> month/year
        [$yearStr, $monthStr] = explode('-', $request->paid_month);
        $year  = (int) $yearStr;
        $month = (int) $monthStr;

        // ✅ Montant payé: idéalement depuis lease->rent_amount
        $amount = (float) ($lease->rent_amount ?? 0);

        // ✅ Génération reference (si colonne existe) — Fix ton erreur "Field reference doesn't have a default value"
        $reference = null;
        if (Schema::hasColumn('rent_receipts', 'reference')) {
            $reference = $this->nextReference($user->id, $year, $month);
        }

        Log::info('[RentReceiptController@store] computed fields', [
            'paid_month' => $request->paid_month,
            'month'      => $month,
            'year'       => $year,
            'amount'     => $amount,
            'reference'  => $reference,
            'columns'    => [
                'has_reference'  => Schema::hasColumn('rent_receipts', 'reference'),
                'has_type'       => Schema::hasColumn('rent_receipts', 'type'),
                'has_paid_month' => Schema::hasColumn('rent_receipts', 'paid_month'),
                'has_month'      => Schema::hasColumn('rent_receipts', 'month'),
                'has_year'       => Schema::hasColumn('rent_receipts', 'year'),
                'has_amount_paid'=> Schema::hasColumn('rent_receipts', 'amount_paid'),
                'has_issued_date'=> Schema::hasColumn('rent_receipts', 'issued_date'),
            ],
        ]);

        // ✅ On ne set que les colonnes réellement existantes (évite crash env pas migré)
        $data = [
            'lease_id'    => $lease->id,
            'property_id' => $lease->property_id,
            'landlord_id' => $user->id,
            'tenant_id'   => $lease->tenant_id,
            'status'      => 'issued',
            'notes'       => $request->notes,
        ];

        if (Schema::hasColumn('rent_receipts', 'reference') && $reference) {
            $data['reference'] = $reference;
        }

        if (Schema::hasColumn('rent_receipts', 'type')) {
            $data['type'] = $request->type;
        }

        if (Schema::hasColumn('rent_receipts', 'paid_month')) {
            $data['paid_month'] = $request->paid_month;
        }

        if (Schema::hasColumn('rent_receipts', 'month')) {
            $data['month'] = $month;
        }

        if (Schema::hasColumn('rent_receipts', 'year')) {
            $data['year'] = $year;
        }

        if (Schema::hasColumn('rent_receipts', 'issued_date')) {
            $data['issued_date'] = $request->issued_date;
        }

        if (Schema::hasColumn('rent_receipts', 'amount_paid')) {
            $data['amount_paid'] = $amount;
        }

        Log::info('[RentReceiptController@store] insert payload', $data);

        $receipt = RentReceipt::create($data);

        Log::info('[RentReceiptController@store] created', [
            'receipt_id' => $receipt->id,
            'reference'  => $receipt->reference ?? null,
            'type'       => $receipt->type ?? null,
            'paid_month' => $receipt->paid_month ?? null,
            'month'      => $receipt->month ?? null,
            'year'       => $receipt->year ?? null,
        ]);

        return response()->json($receipt->load(['property', 'tenant', 'lease']), 201);
    }

    public function pdf($id)
    {
        $user = Auth::user();

        Log::info('[RentReceiptController@pdf] incoming', [
            'auth_id' => $user?->id,
            'roles'   => $user?->roles?->pluck('name'),
            'id'      => $id,
        ]);

        $receipt = RentReceipt::with(['property', 'tenant', 'lease'])->findOrFail($id);

        // ✅ autorisation
        if ($user->hasRole('landlord') && $receipt->landlord_id !== $user->id) {
            Log::warning('[RentReceiptController@pdf] forbidden landlord', [
                'auth_id' => $user->id,
                'receipt_landlord_id' => $receipt->landlord_id,
            ]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->hasRole('tenant') && $receipt->tenant_id !== $user->id) {
            Log::warning('[RentReceiptController@pdf] forbidden tenant', [
                'auth_id' => $user->id,
                'receipt_tenant_id' => $receipt->tenant_id,
            ]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // TODO: ici tu branches le générateur PDF
        // Exemple: return response()->streamDownload(...)
        return response()->json([
            'message' => 'PDF generator not implemented yet',
            'receipt' => $receipt,
        ], 501);
    }

    /**
     * Génère une reference stable, unique par landlord/mois.
     * Exemple: RR-2025-12-000001
     */
    private function nextReference(int $landlordId, int $year, int $month): string
    {
        $prefix = sprintf('RR-%04d-%02d-', $year, $month);

        $last = RentReceipt::query()
            ->where('landlord_id', $landlordId)
            ->where('reference', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->value('reference');

        if (!$last) {
            return $prefix . '000001';
        }

        $seq = (int) substr($last, -6);
        $seq++;

        return $prefix . str_pad((string) $seq, 6, '0', STR_PAD_LEFT);
    }
}
