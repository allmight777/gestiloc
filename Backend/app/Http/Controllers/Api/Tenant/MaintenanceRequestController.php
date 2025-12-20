<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\MaintenanceRequestResource;
use App\Models\MaintenanceRequest;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MaintenanceRequestController extends Controller
{
    private function tenantOrFail()
    {
        $user = auth()->user();
        if (!$user || !$user->isTenant() || !$user->tenant) {
            abort(403, 'Accès réservé aux locataires');
        }
        return $user->tenant;
    }

    public function index(Request $request)
    {
        $tenant = $this->tenantOrFail();

        $q = MaintenanceRequest::query()
            ->where('tenant_id', $tenant->id)
            ->with(['property.landlord.user'])
            ->latest();

        if ($request->filled('status')) {
            $q->where('status', $request->string('status'));
        }
        if ($request->filled('property_id')) {
            $q->where('property_id', $request->integer('property_id'));
        }

        return MaintenanceRequestResource::collection($q->paginate(20));
    }

    public function show($id)
    {
        $tenant = $this->tenantOrFail();

        $incident = MaintenanceRequest::with(['property.landlord.user'])
            ->where('tenant_id', $tenant->id)
            ->findOrFail($id);

        return new MaintenanceRequestResource($incident);
    }

    public function store(Request $request)
    {
        $tenant = $this->tenantOrFail();

        $data = $request->validate([
            'property_id' => ['required', 'integer', 'exists:properties,id'],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:plumbing,electricity,heating,other'],
            'priority' => ['required', 'in:low,medium,high,emergency'],
            'description' => ['nullable', 'string'],
            'preferred_slots' => ['nullable', 'array'],
            'preferred_slots.*.date' => ['required_with:preferred_slots', 'date_format:Y-m-d'],
            'preferred_slots.*.from' => ['required_with:preferred_slots', 'date_format:H:i'],
            'preferred_slots.*.to' => ['required_with:preferred_slots', 'date_format:H:i'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['string'],
        ]);

        $property = Property::findOrFail($data['property_id']);

        // Sécurité: le locataire doit avoir un bail sur ce bien
        $hasLease = $property->leases()->where('tenant_id', $tenant->id)->exists();
        if (!$hasLease) {
            return response()->json(['message' => 'Vous n\'avez pas accès à ce bien.'], 403);
        }

        $incident = MaintenanceRequest::create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id,
            'landlord_id' => $property->landlord_id,

            'title' => $data['title'],
            'category' => $data['category'],
            'priority' => $data['priority'],
            'description' => $data['description'] ?? null,

            'preferred_slots' => $data['preferred_slots'] ?? [],
            'photos' => $data['photos'] ?? [],
            'status' => 'open',
        ]);

        $incident->load(['property.landlord.user']);

        return (new MaintenanceRequestResource($incident))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, $id)
    {
        $tenant = $this->tenantOrFail();

        $incident = MaintenanceRequest::where('tenant_id', $tenant->id)->findOrFail($id);

        // On n'autorise l'édition que si pas déjà résolu/cancelled
        if (in_array($incident->status, ['resolved', 'cancelled'], true)) {
            return response()->json(['message' => 'Incident non modifiable.'], 422);
        }

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'in:plumbing,electricity,heating,other'],
            'priority' => ['sometimes', 'in:low,medium,high,emergency'],
            'description' => ['nullable', 'string'],
            'preferred_slots' => ['nullable', 'array'],
            'preferred_slots.*.date' => ['required_with:preferred_slots', 'date_format:Y-m-d'],
            'preferred_slots.*.from' => ['required_with:preferred_slots', 'date_format:H:i'],
            'preferred_slots.*.to' => ['required_with:preferred_slots', 'date_format:H:i'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['string'],
        ]);

        $incident->fill($data);
        $incident->save();

        $incident->load(['property.landlord.user']);

        return new MaintenanceRequestResource($incident);
    }

    public function destroy($id)
    {
        $tenant = $this->tenantOrFail();
        $incident = MaintenanceRequest::where('tenant_id', $tenant->id)->findOrFail($id);
        $incident->delete();

        return response()->json(['message' => 'Supprimé']);
    }

    /**
     * Upload photos (multipart)
     * POST /api/tenant/incidents/upload
     */
    public function upload(Request $request)
    {
        $this->tenantOrFail();

        $request->validate([
            'files' => ['required'],
            'files.*' => ['image', 'max:5120'], // 5MB
        ]);

        $paths = [];
        foreach ((array) $request->file('files', []) as $file) {
            $paths[] = $file->store('maintenance', 'public');
        }

        return response()->json([
            'paths' => $paths,
        ]);
    }
}
