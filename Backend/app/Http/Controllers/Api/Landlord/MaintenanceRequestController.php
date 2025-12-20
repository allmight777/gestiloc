<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Resources\MaintenanceRequestResource;
use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;

class MaintenanceRequestController extends Controller
{
    private function landlordOrFail()
    {
        $user = auth()->user();
        if (!$user || !$user->isLandlord() || !$user->landlord) {
            abort(403, 'Accès réservé aux bailleurs');
        }
        return $user->landlord;
    }

    public function index(Request $request)
    {
        $landlord = $this->landlordOrFail();

        $q = MaintenanceRequest::query()
            ->where('landlord_id', $landlord->id)
            ->with(['property.landlord.user', 'tenant.user'])
            ->latest();

        if ($request->filled('status')) $q->where('status', $request->string('status'));
        if ($request->filled('property_id')) $q->where('property_id', $request->integer('property_id'));

        return MaintenanceRequestResource::collection($q->paginate(20));
    }

    public function show($id)
    {
        $landlord = $this->landlordOrFail();

        $incident = MaintenanceRequest::with(['property.landlord.user', 'tenant.user'])
            ->where('landlord_id', $landlord->id)
            ->findOrFail($id);

        return new MaintenanceRequestResource($incident);
    }

    public function update(Request $request, $id)
    {
        $landlord = $this->landlordOrFail();

        $incident = MaintenanceRequest::where('landlord_id', $landlord->id)->findOrFail($id);

        $data = $request->validate([
            'status' => ['sometimes', 'in:open,in_progress,resolved,cancelled'],
            'assigned_provider' => ['nullable', 'string', 'max:255'],
        ]);

        if (isset($data['status']) && $data['status'] === 'resolved') {
            $incident->resolved_at = now();
        }
        if (isset($data['status']) && in_array($data['status'], ['open','in_progress','cancelled'], true)) {
            $incident->resolved_at = null;
        }

        $incident->fill($data);
        $incident->save();

        $incident->load(['property.landlord.user', 'tenant.user']);

        return new MaintenanceRequestResource($incident);
    }
}
