<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use App\Models\Property;
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class NoticeController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        Log::info('[NoticeController@index] incoming', [
            'auth_id' => $user?->id,
            'auth_email' => $user?->email,
            'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : null,
        ]);

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        // ✅ Bailleur
        if (method_exists($user, 'hasRole') && $user->hasRole('landlord')) {
            $notices = Notice::with(['property', 'tenant.user', 'landlord'])
                ->where('landlord_id', $user->id)
                ->latest()
                ->get();

            return response()->json($notices);
        }

        // ✅ Locataire
        if (method_exists($user, 'hasRole') && $user->hasRole('tenant')) {
            $tenant = $user->tenant;
            if (!$tenant) {
                return response()->json(['message' => 'Tenant profile not found for this user.'], 422);
            }

            $notices = Notice::with(['property', 'tenant.user', 'landlord'])
                ->where('tenant_id', $tenant->id)
                ->latest()
                ->get();

            return response()->json($notices);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    /**
     * store gère 2 cas :
     * - landlord => crée un préavis bailleur
     * - tenant   => crée une demande de préavis locataire
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        Log::info('[NoticeController@store] incoming', [
            'auth_id' => $user?->id,
            'auth_email' => $user?->email,
            'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : null,
            'payload' => $request->all(),
        ]);

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        // =========================
        // CASE 1: TENANT CREATES
        // =========================
        if (method_exists($user, 'hasRole') && $user->hasRole('tenant')) {
            $tenant = $user->tenant;
            if (!$tenant) {
                return response()->json(['message' => 'Tenant profile not found for this user.'], 422);
            }

            $validator = Validator::make($request->all(), [
                'lease_id'    => ['required', 'exists:leases,id'],
                'reason'      => ['required', 'string', 'max:1000'],
                'end_date'    => ['required', 'date', 'after:today'],
                'notes'       => ['nullable', 'string', 'max:1000'],
                'notice_date' => ['nullable', 'date'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            // ✅ IMPORTANT: on charge landlord_id depuis le bail
            $lease = Lease::with('property')->find($request->lease_id);
            if (!$lease) return response()->json(['message' => 'Lease not found'], 404);

            // ✅ sécurité: ce bail appartient bien à ce tenant (leases.tenant_id = tenants.id)
            if ((int)$lease->tenant_id !== (int)$tenant->id) {
                return response()->json(['message' => 'Forbidden (lease does not belong to tenant)'], 403);
            }

            $property = $lease->property ?: Property::find($lease->property_id);
            if (!$property) return response()->json(['message' => 'Property not found'], 404);

            // ✅ landlord_id DOIT être un users.id => on utilise lease.landlord_id en priorité
            $landlordId = $lease->landlord_id ?? null;

            // fallback (si ton schema n’a pas lease.landlord_id)
            if (!$landlordId) {
                if (!empty($property->user_id)) $landlordId = (int)$property->user_id;
                // ⚠️ property->landlord_id seulement si c’est bien users.id
                if (!$landlordId && !empty($property->landlord_id)) $landlordId = (int)$property->landlord_id;
            }

            if (!$landlordId) {
                return response()->json([
                    'message' => 'Impossible de déterminer le propriétaire (landlord_id) depuis le bail / bien.'
                ], 422);
            }

            try {
                $notice = Notice::create([
                    'property_id'  => (int)$property->id,
                    'landlord_id'  => (int)$landlordId,    // ✅ FIX FK
                    'tenant_id'    => (int)$tenant->id,
                    'type'         => 'tenant',
                    'reason'       => $request->reason,
                    'notice_date'  => $request->notice_date ?: now()->toDateString(),
                    'end_date'     => $request->end_date,
                    'status'       => 'pending',
                    'notes'        => $request->notes,
                ]);

                return response()->json($notice->load(['property', 'tenant.user', 'landlord']), 201);
            } catch (\Throwable $e) {
                Log::error('[NoticeController@store tenant] DB error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'resolved' => [
                        'property_id' => $property->id,
                        'tenant_id' => $tenant->id,
                        'landlord_id' => $landlordId,
                        'lease_id' => $lease->id,
                    ],
                ]);

                return response()->json([
                    'message' => 'Erreur lors de la création du préavis',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        // =========================
        // CASE 2: LANDLORD CREATES
        // =========================
        if (method_exists($user, 'hasRole') && $user->hasRole('landlord')) {
            $validator = Validator::make($request->all(), [
                'property_id'  => 'required|exists:properties,id',
                'lease_id'     => 'nullable|exists:leases,id',
                'tenant_id'    => 'nullable|exists:tenants,id',
                'reason'       => 'required|string|max:1000',
                'notice_date'  => 'required|date',
                'end_date'     => 'required|date|after:notice_date',
                'notes'        => 'nullable|string|max:1000',
                'type'         => ['nullable', Rule::in(['landlord', 'tenant'])],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $property = Property::find($request->property_id);
            if (!$property) return response()->json(['message' => 'Property not found'], 404);

            // ✅ ownership tolérant (user_id OU landlord_id)
            $ownerByUserId = isset($property->user_id) && ((int)$property->user_id === (int)$user->id);
            $ownerByLandlordId = isset($property->landlord_id) && ((int)$property->landlord_id === (int)$user->id);

            if (!$ownerByUserId && !$ownerByLandlordId) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $tenantId = $request->tenant_id;

            if (!$tenantId) {
                if ($request->filled('lease_id')) {
                    $lease = Lease::find($request->lease_id);
                    if (!$lease) return response()->json(['message' => 'Lease not found'], 404);

                    if ((int)$lease->property_id !== (int)$property->id) {
                        return response()->json(['message' => 'Lease does not belong to this property'], 422);
                    }

                    $tenantId = $lease->tenant_id;
                } else {
                    $lease = Lease::where('property_id', $property->id)
                        ->where('status', 'active')
                        ->latest()
                        ->first();

                    if (!$lease) {
                        return response()->json([
                            'message' => 'Aucun bail actif trouvé pour ce bien. Fournis lease_id ou tenant_id.'
                        ], 422);
                    }

                    $tenantId = $lease->tenant_id;
                }
            }

            try {
                $notice = Notice::create([
                    'property_id' => (int)$property->id,
                    'landlord_id' => (int)$user->id,
                    'tenant_id'   => (int)$tenantId,
                    'type'        => 'landlord',
                    'reason'      => $request->reason,
                    'notice_date' => $request->notice_date,
                    'end_date'    => $request->end_date,
                    'status'      => 'pending',
                    'notes'       => $request->notes,
                ]);

                return response()->json($notice->load(['property', 'tenant.user', 'landlord']), 201);
            } catch (\Throwable $e) {
                Log::error('[NoticeController@store landlord] DB error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                return response()->json([
                    'message' => 'Erreur lors de la création du préavis',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    /**
     * update:
     * - bailleur peut changer status + notes
     * - locataire peut annuler son préavis (pending -> cancelled) + notes
     */
    public function update(Request $request, Notice $notice)
    {
        $user = Auth::user();

        Log::info('[NoticeController@update] incoming', [
            'auth_id' => $user?->id,
            'notice_id' => $notice->id,
            'payload' => $request->all(),
        ]);

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        $isLandlord = method_exists($user, 'hasRole') && $user->hasRole('landlord');
        $isTenant   = method_exists($user, 'hasRole') && $user->hasRole('tenant');

        $tenantId = $user->tenant?->id;

        $canLandlord = $isLandlord && ((int)$user->id === (int)$notice->landlord_id);
        $canTenant   = $isTenant && $tenantId && ((int)$tenantId === (int)$notice->tenant_id);

        if (!$canLandlord && !$canTenant) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($canLandlord) {
            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|required|in:pending,confirmed,cancelled',
                'notes'  => 'nullable|string|max:1000',
            ]);
        } else {
            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|required|in:cancelled',
                'notes'  => 'nullable|string|max:1000',
            ]);

            if ($request->filled('status') && $notice->status !== 'pending') {
                return response()->json(['message' => 'Impossible de modifier un préavis non "pending".'], 422);
            }
        }

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $notice->update($request->only(['status', 'notes']));

        return response()->json($notice->load(['property', 'tenant.user', 'landlord']));
    }

    public function destroy(Notice $notice)
    {
        $user = Auth::user();

        Log::info('[NoticeController@destroy] incoming', [
            'auth_id' => $user?->id,
            'notice_id' => $notice->id,
        ]);

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        $isLandlord = method_exists($user, 'hasRole') && $user->hasRole('landlord');
        $isTenant   = method_exists($user, 'hasRole') && $user->hasRole('tenant');

        $tenantId = $user->tenant?->id;

        $canLandlord = $isLandlord && ((int)$user->id === (int)$notice->landlord_id);
        $canTenant   = $isTenant && $tenantId && ((int)$tenantId === (int)$notice->tenant_id);

        if (!$canLandlord && !$canTenant) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $notice->delete();

        return response()->json(['message' => 'Préavis supprimé avec succès']);
    }
}
