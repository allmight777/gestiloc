<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoOwner;
use App\Models\Property;
use App\Models\PropertyDelegation;
use App\Models\Lease;
use App\Models\RentReceipt;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Notice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\PropertyModifiedNotification;

class CoOwnerMeController extends Controller
{
    /**
     * Récupérer le profil complet du co-propriétaire connecté
     */
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les statistiques
        $delegatedPropertiesCount = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->count();

        $activeLeasesCount = Lease::whereIn('property_id', function($query) use ($coOwner) {
            $query->select('property_id')
                ->from('property_delegations')
                ->where('co_owner_id', $coOwner->id)
                ->where('status', 'active');
        })->where('status', 'active')->count();

        $totalRentCollected = RentReceipt::whereIn('lease_id', function($query) use ($coOwner) {
            $query->select('id')
                ->from('leases')
                ->whereIn('property_id', function($subQuery) use ($coOwner) {
                    $subQuery->select('property_id')
                        ->from('property_delegations')
                        ->where('co_owner_id', $coOwner->id)
                        ->where('status', 'active');
                });
        })->where('status', 'paid')->sum('amount_paid');

        $profileData = [
            'id' => $coOwner->id,
            'user_id' => $coOwner->user_id,
            'first_name' => $coOwner->first_name,
            'last_name' => $coOwner->last_name,
            'email' => $user->email,
            'phone' => $coOwner->phone,
            'address' => $coOwner->address,
            'date_of_birth' => $coOwner->date_of_birth,
            'id_number' => $coOwner->id_number,
            'company_name' => $coOwner->company_name,
            'address_billing' => $coOwner->address_billing,
            'license_number' => $coOwner->license_number,
            'is_professional' => $coOwner->is_professional,
            'ifu' => $coOwner->ifu,
            'rccm' => $coOwner->rccm,
            'vat_number' => $coOwner->vat_number,
            'status' => $coOwner->status,
            'joined_at' => $coOwner->created_at,
            'created_at' => $coOwner->created_at,
            'updated_at' => $coOwner->updated_at,
            'statistics' => [
                'delegated_properties_count' => $delegatedPropertiesCount,
                'active_leases_count' => $activeLeasesCount,
                'total_rent_collected' => $totalRentCollected,
            ],
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'last_login_at' => $user->last_login_at,
            ]
        ];

        return response()->json([
            'data' => $profileData
        ]);
    }

    /**
     * Mettre à jour le profil du co-propriétaire
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:255',
            'date_of_birth' => 'sometimes|date',
            'id_number' => 'sometimes|string|max:50',
            'company_name' => 'sometimes|string|max:255',
            'address_billing' => 'sometimes|string|max:255',
            'license_number' => 'sometimes|string|max:100',
            'ifu' => 'sometimes|string|max:50',
            'rccm' => 'sometimes|string|max:50',
            'vat_number' => 'sometimes|string|max:50',
        ]);

        // Mettre à jour le co-propriétaire
        $coOwner->update($validated);

        // Mettre à jour l'email utilisateur si fourni
        if ($request->has('email')) {
            $request->validate(['email' => 'required|email|unique:users,email,' . $user->id]);
            $user->update(['email' => $request->email]);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $this->getProfile($request)->getData(true)
        ]);
    }

    /**
     * Récupérer les propriétés déléguées au co-propriétaire connecté
     */
    public function getDelegatedProperties(Request $request): JsonResponse
    {
        $user = $request->user();

        Log::info('CoOwnerMeController::getDelegatedProperties', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'user_roles' => $user?->roles,
            'is_co_owner' => $user?->isCoOwner(),
        ]);

        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden - User is not a co-owner', 'user_roles' => $user->roles], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les délégations actives pour ce co-propriétaire
        $delegations = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->with('property')
            ->get();

        // Extraire les propriétés depuis les délégations
        $properties = $delegations->map(function ($delegation) use ($coOwner) {
            $property = $delegation->property;
            if (!$property) return null;

            // Vérifier si la propriété est louée
            $activeLease = Lease::where('property_id', $property->id)
                ->where('status', 'active')
                ->first();

            return [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'city' => $property->city,
                'postal_code' => $property->postal_code,
                'country' => $property->country,
                'rent_amount' => $property->rent_amount,
                'surface' => $property->surface,
                'property_type' => $property->property_type,
                'description' => $property->description,
                'photos' => $property->photos ?? [],
                'status' => $activeLease ? 'rented' : 'available',
                'created_at' => $property->created_at,
                'updated_at' => $property->updated_at,
                'landlord_id' => $property->landlord_id,
                'co_owner_id' => $coOwner->id,
                'delegation' => [
                    'id' => $delegation->id,
                    'status' => $delegation->status,
                    'permissions' => $delegation->permissions,
                    'expires_at' => $delegation->expires_at,
                ],
            ];
        })->filter()->values();

        return response()->json([
            'data' => $properties
        ]);
    }

    /**
     * Récupérer les baux du co-propriétaire
     */
    public function getLeases(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les propriétés déléguées
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        // Récupérer les baux pour ces propriétés
        $leases = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->with(['property', 'tenant'])
            ->get();

        $leasesData = $leases->map(function ($lease) {
            return [
                'id' => $lease->id,
                'property_id' => $lease->property_id,
                'tenant_id' => $lease->tenant_id,
                'rent_amount' => $lease->rent_amount,
                'deposit_amount' => $lease->deposit_amount,
                'start_date' => $lease->start_date,
                'end_date' => $lease->end_date,
                'status' => $lease->status,
                'created_at' => $lease->created_at,
                'updated_at' => $lease->updated_at,
                'property' => $lease->property,
                'tenant' => $lease->tenant,
            ];
        });

        return response()->json([
            'data' => $leasesData
        ]);
    }

    /**
     * Récupérer les quittances du co-propriétaire
     */
    public function getRentReceipts(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les propriétés déléguées
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        // Récupérer les quittances pour ces propriétés
        $receipts = RentReceipt::whereIn('property_id', $delegatedPropertyIds)
            ->with(['lease', 'property'])
            ->orderBy('issued_date', 'desc')
            ->get();

        $receiptsData = $receipts->map(function ($receipt) {
            return [
                'id' => $receipt->id,
                'lease_id' => $receipt->lease_id,
                'paid_month' => $receipt->paid_month,
                'amount_paid' => $receipt->amount_paid,
                'payment_date' => $receipt->payment_date,
                'issued_date' => $receipt->issued_date,
                'status' => $receipt->status,
                'created_at' => $receipt->created_at,
                'lease' => $receipt->lease,
                'property' => $receipt->property,
            ];
        });

        return response()->json([
            'data' => $receiptsData
        ]);
    }

    /**
     * Récupérer les locataires du co-propriétaire
     */
    public function getTenants(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les propriétés déléguées
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        // Récupérer les locataires pour ces propriétés
        $tenantIds = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->where('status', 'active')
            ->pluck('tenant_id');

        $tenants = Tenant::whereIn('id', $tenantIds)->get();

        $tenantsData = $tenants->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'first_name' => $tenant->first_name,
                'last_name' => $tenant->last_name,
                'email' => $tenant->email,
                'phone' => $tenant->phone,
                'id_number' => $tenant->id_number,
                'address' => $tenant->address,
                'created_at' => $tenant->created_at,
                'updated_at' => $tenant->updated_at,
            ];
        });

        return response()->json([
            'data' => $tenantsData
        ]);
    }

    /**
     * Récupérer les notifications du co-propriétaire
     */
    public function getNotices(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les propriétés déléguées
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        // Récupérer les notifications pour ces propriétés
        $notices = Notice::whereIn('property_id', $delegatedPropertyIds)
            ->with(['property', 'tenant'])
            ->orderBy('created_at', 'desc')
            ->get();

        $noticesData = $notices->map(function ($notice) {
            return [
                'id' => $notice->id,
                'property_id' => $notice->property_id,
                'tenant_id' => $notice->tenant_id,
                'type' => $notice->type,
                'title' => $notice->reason, // Utiliser 'reason' comme titre
                'description' => $notice->reason, // Utiliser 'reason' comme description
                'status' => $notice->status,
                'priority' => 'medium', // Champ par défaut
                'notice_date' => $notice->notice_date,
                'end_date' => $notice->end_date,
                'notes' => $notice->notes,
                'created_at' => $notice->created_at,
                'updated_at' => $notice->updated_at,
                'property' => $notice->property,
                'tenant' => $notice->tenant,
            ];
        });

        return response()->json([
            'data' => $noticesData
        ]);
    }

    /**
     * Récupérer les délégations du co-propriétaire
     */
    public function getDelegations(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegations = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->with(['property', 'landlord'])
            ->orderBy('created_at', 'desc')
            ->get();

        $delegationsData = $delegations->map(function ($delegation) {
            return [
                'id' => $delegation->id,
                'property_id' => $delegation->property_id,
                'co_owner_id' => $delegation->co_owner_id,
                'landlord_id' => $delegation->landlord_id,
                'status' => $delegation->status,
                'permissions' => $delegation->permissions,
                'created_at' => $delegation->created_at,
                'expires_at' => $delegation->expires_at,
                'property' => $delegation->property,
                'landlord' => $delegation->landlord,
            ];
        });

        return response()->json([
            'data' => $delegationsData
        ]);
    }

    /**
     * Mettre à jour une propriété déléguée
     */
    public function updateProperty(Request $request, $propertyId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Vérifier la délégation
        $delegation = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Property not delegated to this co-owner'], 403);
        }

        $property = Property::find($propertyId);
        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        if (!in_array('edit', $delegation->permissions ?? [])) {
            return response()->json(['message' => 'No permission to edit this property'], 403);
        }

        // Log les données reçues
        Log::info('Données reçues pour modification', [
            'property_id' => $propertyId,
            'data' => $request->all(),
            'user_id' => $user->id
        ]);

        try {
            // Valider les données avec des règles qui acceptent null
            $validated = $request->validate([
                'name' => 'sometimes|nullable|string|max:255',
                'address' => 'sometimes|nullable|string|max:255',
                'district' => 'sometimes|nullable|string|max:255',
                'city' => 'sometimes|nullable|string|max:255',
                'state' => 'sometimes|nullable|string|max:255',
                'zip_code' => 'sometimes|nullable|string|max:20',
                'country' => 'sometimes|nullable|string|max:255',
                'latitude' => 'sometimes|nullable|string|max:50',
                'longitude' => 'sometimes|nullable|string|max:50',
                'surface' => 'sometimes|nullable|numeric|min:0',
                'floor' => 'sometimes|nullable|integer|min:0',
                'total_floors' => 'sometimes|nullable|integer|min:0',
                'room_count' => 'sometimes|nullable|integer|min:0',
                'bedroom_count' => 'sometimes|nullable|integer|min:0',
                'bathroom_count' => 'sometimes|nullable|integer|min:0',
                'wc_count' => 'sometimes|nullable|integer|min:0',
                'construction_year' => 'sometimes|nullable|integer|min:1800|max:' . date('Y'),
                'rent_amount' => 'sometimes|nullable|numeric|min:0',
                'charges_amount' => 'sometimes|nullable|numeric|min:0',
                'property_type' => 'sometimes|nullable|string|max:255',
                'description' => 'sometimes|nullable|string|max:2000',
                'has_garage' => 'sometimes|boolean',
                'has_parking' => 'sometimes|boolean',
                'is_furnished' => 'sometimes|boolean',
                'has_elevator' => 'sometimes|boolean',
                'has_balcony' => 'sometimes|boolean',
                'has_terrace' => 'sometimes|boolean',
                'has_cellar' => 'sometimes|boolean',
                'reference_code' => 'required|string|max:100',
                'status' => 'sometimes|nullable|string|in:available,rented,maintenance,renovation',
                'amenities' => 'sometimes|nullable|array',
                'amenities.*' => 'sometimes|string',
            ]);

            Log::info('Données validées', [
                'validated' => $validated,
                'has_reference_code' => isset($validated['reference_code'])
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log détaillé des erreurs de validation
            Log::error('Erreur de validation', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        // Nettoyer les données : convertir les chaînes vides en null
        foreach ($validated as $key => $value) {
            if ($value === '' || $value === null) {
                $validated[$key] = null;
            }
        }

        // S'assurer que reference_code existe
        if (!isset($validated['reference_code']) || empty($validated['reference_code'])) {
            $validated['reference_code'] = $property->reference_code ?: 'REF-' . time();
        }

        // Convertir les booléens
        $booleanFields = ['has_garage', 'has_parking', 'is_furnished', 'has_elevator', 'has_balcony', 'has_terrace', 'has_cellar'];
        foreach ($booleanFields as $field) {
            if (isset($validated[$field])) {
                $validated[$field] = (bool) $validated[$field];
            }
        }

        // Sauvegarder les anciennes données
        $originalData = $property->toArray();

        try {
            // Mettre à jour la propriété
            $property->update($validated);

            // Audit
            DB::table('property_modification_audits')->insert([
                'property_id' => $property->id,
                'co_owner_id' => $coOwner->id,
                'landlord_id' => $property->landlord_id,
                'original_data' => json_encode($originalData),
                'modified_data' => json_encode($validated),
                'status' => 'modified',
                'notification_sent_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Envoyer un email au propriétaire
            try {
                $landlord = User::find($property->landlord_id);
                if ($landlord && $landlord->email) {
                    Mail::to($landlord->email)->send(new PropertyModifiedNotification(
                        $property,
                        $coOwner,
                        $originalData,
                        $validated
                    ));

                    Log::info('Email envoyé au propriétaire', [
                        'property_id' => $property->id,
                        'co_owner_id' => $coOwner->id
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Erreur lors de l\'envoi de l\'email', [
                    'error' => $e->getMessage(),
                    'property_id' => $property->id,
                    'co_owner_id' => $coOwner->id
                ]);
            }

            Log::info('Propriété mise à jour avec succès', [
                'property_id' => $property->id,
                'modifications' => array_keys($validated)
            ]);

            $property->refresh();

            return response()->json([
                'message' => 'Propriété modifiée avec succès. Le propriétaire a été notifié par email.',
                'data' => $this->formatPropertyData($property, $coOwner, $delegation)
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur base de données', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'validated_data' => $validated
            ]);

            return response()->json([
                'message' => 'Erreur serveur: ' . $e->getMessage()
            ], 500);
        }
    }

    private function formatPropertyData($property, $coOwner, $delegation)
    {
        return [
            'id' => $property->id,
            'name' => $property->name,
            'address' => $property->address,
            'district' => $property->district,
            'city' => $property->city,
            'state' => $property->state,
            'zip_code' => $property->zip_code,
            'country' => $property->country,
            'latitude' => $property->latitude,
            'longitude' => $property->longitude,
            'rent_amount' => $property->rent_amount,
            'charges_amount' => $property->charges_amount,
            'surface' => $property->surface,
            'floor' => $property->floor,
            'total_floors' => $property->total_floors,
            'room_count' => $property->room_count,
            'bedroom_count' => $property->bedroom_count,
            'bathroom_count' => $property->bathroom_count,
            'wc_count' => $property->wc_count,
            'construction_year' => $property->construction_year,
            'property_type' => $property->property_type,
            'description' => $property->description,
            'has_garage' => $property->has_garage,
            'has_parking' => $property->has_parking,
            'is_furnished' => $property->is_furnished,
            'has_elevator' => $property->has_elevator,
            'has_balcony' => $property->has_balcony,
            'has_terrace' => $property->has_terrace,
            'has_cellar' => $property->has_cellar,
            'reference_code' => $property->reference_code,
            'status' => $property->status,
            'amenities' => $property->amenities ?? [],
            'photos' => $property->photos ?? [],
            'created_at' => $property->created_at,
            'updated_at' => $property->updated_at,
            'landlord_id' => $property->landlord_id,
            'co_owner_id' => $coOwner->id,
            'delegation' => [
                'id' => $delegation->id,
                'status' => $delegation->status,
                'permissions' => $delegation->permissions,
                'expires_at' => $delegation->expires_at,
            ],
        ];
    }

    /**
     * Uploader des photos pour une propriété
     */
    public function uploadPropertyPhotos(Request $request, $propertyId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Vérifier que la propriété est bien déléguée
        $delegation = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Property not delegated to this co-owner'], 403);
        }

        $property = Property::find($propertyId);
        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $request->validate([
            'photos' => 'required|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $uploadedPhotos = [];
        $currentPhotos = $property->photos ?? [];

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('properties/' . $propertyId, 'public');
                $uploadedPhotos[] = $path;
            }
        }

        // Sauvegarder les anciennes photos pour l'audit
        $originalPhotos = $property->photos;

        // Fusionner les nouvelles photos avec les existantes
        $allPhotos = array_merge($currentPhotos, $uploadedPhotos);
        $property->photos = $allPhotos;
        $property->save();

        // Envoyer un email de notification au propriétaire pour les photos
        try {
            $landlord = User::find($property->landlord_id);
            if ($landlord && $landlord->email) {
                Mail::to($landlord->email)->send(new \App\Mail\PhotosAddedNotification(
                    $property,
                    $coOwner,
                    count($uploadedPhotos)
                ));
            }
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi de l\'email pour photos', [
                'error' => $e->getMessage(),
                'property_id' => $property->id
            ]);
        }

        return response()->json([
            'message' => 'Photos uploaded successfully. Propriétaire notifié.',
            'photos' => $allPhotos
        ]);
    }

    /**
     * Accepter une délégation
     */
    public function acceptDelegation(Request $request, $delegationId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegation = PropertyDelegation::where('id', $delegationId)
            ->where('co_owner_id', $coOwner->id)
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Délégation non trouvée'], 404);
        }

        if ($delegation->status !== 'pending') {
            return response()->json(['message' => 'Délégation non disponible'], 400);
        }

        $delegation->status = 'active';
        $delegation->save();

        Log::info('Co-owner accepted delegation', [
            'co_owner_id' => $coOwner->id,
            'delegation_id' => $delegationId,
            'property_id' => $delegation->property_id
        ]);

        return response()->json([
            'message' => 'Délégation acceptée avec succès',
            'data' => $delegation
        ]);
    }

    /**
     * Refuser une délégation
     */
    public function rejectDelegation(Request $request, $delegationId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegation = PropertyDelegation::where('id', $delegationId)
            ->where('co_owner_id', $coOwner->id)
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Délégation non trouvée'], 404);
        }

        if ($delegation->status !== 'pending') {
            return response()->json(['message' => 'Délégation non disponible'], 400);
        }

        $delegation->status = 'revoked';
        $delegation->save();

        Log::info('Co-owner rejected delegation', [
            'co_owner_id' => $coOwner->id,
            'delegation_id' => $delegationId,
            'property_id' => $delegation->property_id,
            'reason' => $request->input('reason')
        ]);

        return response()->json([
            'message' => 'Délégation refusée'
        ]);
    }

    /**
     * Obtenir l'historique des modifications pour une propriété
     */
    public function getPropertyAuditHistory(Request $request, $propertyId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Vérifier que la propriété est déléguée
        $delegation = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Property not delegated to this co-owner'], 403);
        }

        // Récupérer l'historique d'audit
        $audits = DB::table('property_modification_audits')
            ->where('property_id', $propertyId)
            ->where('co_owner_id', $coOwner->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($audit) {
                return [
                    'id' => $audit->id,
                    'original_data' => json_decode($audit->original_data, true),
                    'modified_data' => json_decode($audit->modified_data, true),
                    'status' => $audit->status,
                    'created_at' => $audit->created_at,
                    'updated_at' => $audit->updated_at,
                ];
            });

        return response()->json([
            'data' => $audits
        ]);
    }
}
