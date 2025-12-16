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

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (method_exists($user, 'hasRole') && $user->hasRole('landlord')) {
            $notices = Notice::with(['property', 'tenant'])
                ->where('landlord_id', $user->id)
                ->latest()
                ->get();

            return response()->json($notices);
        }

        // locataire (si tu veux plus tard)
        $notices = Notice::with(['property', 'landlord'])
            ->where('tenant_id', $user->id) // ⚠️ si tenant est une table séparée, à adapter (ex: tenant.user_id)
            ->latest()
            ->get();

        return response()->json($notices);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        Log::info('[NoticeController@store] incoming', [
            'auth_id' => $user?->id,
            'auth_email' => $user?->email,
            'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : null,
            'payload' => $request->all(),
        ]);

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validator = Validator::make($request->all(), [
            'property_id'  => 'required|exists:properties,id',
            'lease_id'     => 'nullable|exists:leases,id',

            // ✅ tenant_id doit référencer tenants.id (et ta FK aussi)
            'tenant_id'    => 'nullable|exists:tenants,id',

            'type'         => 'required|in:landlord,tenant',
            'reason'       => 'required|string|max:1000',
            'notice_date'  => 'required|date',
            'end_date'     => 'required|date|after:notice_date',
            'notes'        => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            Log::warning('[NoticeController@store] validation failed', [
                'errors' => $validator->errors()->toArray(),
            ]);

            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $property = Property::find($request->property_id);

        Log::info('[NoticeController@store] property lookup', [
            'property_found' => (bool) $property,
            'property_id' => $property?->id,
            'property_landlord_id' => $property?->landlord_id,
            'property_user_id' => $property?->user_id,
        ]);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        // ✅ ownership tolérant (user_id OU landlord_id)
        $ownerByUserId = isset($property->user_id) && ((int)$property->user_id === (int)$user->id);
        $ownerByLandlordId = isset($property->landlord_id) && ((int)$property->landlord_id === (int)$user->id);

        if (!is_null($property->user_id) && !is_null($property->landlord_id) && (int)$property->user_id !== (int)$property->landlord_id) {
            Log::warning('[NoticeController@store] property owner fields mismatch', [
                'property_id' => $property->id,
                'property_user_id' => $property->user_id,
                'property_landlord_id' => $property->landlord_id,
                'auth_id' => $user->id,
                'ownerByUserId' => $ownerByUserId,
                'ownerByLandlordId' => $ownerByLandlordId,
            ]);
        }

        Log::info('[NoticeController@store] ownership check', [
            'auth_id' => $user->id,
            'ownerByUserId' => $ownerByUserId,
            'ownerByLandlordId' => $ownerByLandlordId,
        ]);

        if (!$ownerByUserId && !$ownerByLandlordId) {
            Log::warning('[NoticeController@store] forbidden - property not owned by auth user', [
                'auth_id' => $user->id,
                'property_id' => $property->id,
                'property_landlord_id' => $property->landlord_id ?? null,
                'property_user_id' => $property->user_id ?? null,
            ]);

            return response()->json(['message' => 'Forbidden'], 403);
        }

        // ✅ On veut : sélectionner un bail/une location, et auto récupérer le tenant_id
        $tenantId = $request->tenant_id;

        if (!$tenantId) {
            if ($request->filled('lease_id')) {
                $lease = Lease::find($request->lease_id);

                Log::info('[NoticeController@store] lease lookup', [
                    'lease_found' => (bool) $lease,
                    'lease_id' => $lease?->id,
                    'lease_property_id' => $lease?->property_id,
                    'lease_tenant_id' => $lease?->tenant_id,
                ]);

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

                Log::info('[NoticeController@store] active lease lookup', [
                    'found' => (bool) $lease,
                    'lease_id' => $lease?->id,
                    'tenant_id' => $lease?->tenant_id,
                ]);

                if (!$lease) {
                    return response()->json([
                        'message' => 'Aucun bail actif trouvé pour ce bien. Fournis lease_id ou tenant_id.'
                    ], 422);
                }

                $tenantId = $lease->tenant_id;
            }
        }

        Log::info('[NoticeController@store] resolved tenant_id', [
            'tenant_id' => $tenantId,
        ]);

        try {
            $notice = Notice::create([
                'property_id' => $property->id,
                'landlord_id' => $user->id,
                'tenant_id' => $tenantId,
                'type' => $request->type,
                'reason' => $request->reason,
                'notice_date' => $request->notice_date,
                'end_date' => $request->end_date,
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            Log::info('[NoticeController@store] notice created', [
                'notice_id' => $notice->id,
                'property_id' => $notice->property_id,
                'landlord_id' => $notice->landlord_id,
                'tenant_id' => $notice->tenant_id,
            ]);

            return response()->json($notice->load('property', 'tenant'), 201);
        } catch (\Throwable $e) {
            Log::error('[NoticeController@store] DB error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => [
                    'property_id' => $property->id,
                    'landlord_id' => $user->id,
                    'tenant_id' => $tenantId,
                ],
            ]);

            return response()->json([
                'message' => 'Erreur lors de la création du préavis',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, Notice $notice)
    {
        $user = Auth::user();

        Log::info('[NoticeController@update] incoming', [
            'auth_id' => $user?->id,
            'notice_id' => $notice->id,
            'payload' => $request->all(),
        ]);

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        if ((int)$user->id !== (int)$notice->landlord_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|required|in:pending,confirmed,cancelled',
            'notes'  => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            Log::warning('[NoticeController@update] validation failed', [
                'errors' => $validator->errors()->toArray(),
            ]);

            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $notice->update($request->only(['status', 'notes']));

        return response()->json($notice->load('property', 'tenant'));
    }

    public function destroy(Notice $notice)
    {
        $user = Auth::user();

        Log::info('[NoticeController@destroy] incoming', [
            'auth_id' => $user?->id,
            'notice_id' => $notice->id,
        ]);

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        if ((int)$user->id !== (int)$notice->landlord_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $notice->delete();

        return response()->json(['message' => 'Préavis supprimé avec succès']);
    }
}
