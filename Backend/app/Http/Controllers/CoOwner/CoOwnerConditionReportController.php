<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyConditionReport;
use App\Models\PropertyConditionPhoto;
use App\Models\PropertyDelegation;
use App\Models\CoOwner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;

class CoOwnerConditionReportController extends Controller
{
    /**
     * Affiche la liste des états des lieux
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        // Récupérer les biens délégués
        $propertyIds = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('status', 'accepted')
            ->pluck('property_id');

        if ($propertyIds->isEmpty()) {
            $reports = new LengthAwarePaginator(
                [],
                0,
                15,
                null,
                ['path' => request()->url()]
            );

            return view('co-owner.condition-reports.index', [
                'reports' => $reports,
                'noProperties' => true
            ]);
        }

        // Query de base
        $query = PropertyConditionReport::whereIn('property_id', $propertyIds)
            ->with(['photos', 'lease.tenant', 'creator', 'property']);

        // Filtre par type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filtre par bien
        if ($request->filled('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('lease.tenant', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            })->orWhereHas('property', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $reports = $query->latest('report_date')->paginate(15);

        return view('co-owner.condition-reports.index', compact('reports'));
    }

    /**
     * Affiche le formulaire de création
     */
    public function create()
    {
        $user = Auth::user();
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $propertyIds = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('status', 'accepted')
            ->pluck('property_id');

        if ($propertyIds->isEmpty()) {
            return redirect()->route('co-owner.condition-reports.index')
                ->with('error', 'Aucun bien délégué. Vous ne pouvez pas créer d\'état des lieux.');
        }

        $properties = Property::whereIn('id', $propertyIds)
            ->with(['leases' => function($query) {
                $query->where('status', 'active')->with('tenant');
            }])
            ->get();

        return view('co-owner.condition-reports.create', compact('properties'));
    }

    /**
     * Enregistre un nouvel état des lieux
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id'   => 'required|exists:properties,id',
            'lease_id'      => 'required|exists:leases,id',
            'type'          => 'required|in:entry,exit,intermediate',
            'report_date'   => 'required|date',
            'notes'         => 'nullable|string',
            'photos'        => 'required|array|min:1',
            'photos.*'      => 'image|max:10240',
            'condition_statuses.*' => 'nullable|in:good,satisfactory,poor,damaged',
            'condition_notes.*'    => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $validated['property_id'])
            ->where('status', 'accepted')
            ->exists();

        if (!$hasAccess) {
            return redirect()->back()
                ->with('error', 'Vous n\'avez pas accès à ce bien.')
                ->withInput();
        }

        $leaseBelongs = \App\Models\Lease::where('id', $validated['lease_id'])
            ->where('property_id', $validated['property_id'])
            ->exists();

        if (!$leaseBelongs) {
            return redirect()->back()
                ->with('error', 'Le bail sélectionné ne correspond pas au bien.')
                ->withInput();
        }

        return DB::transaction(function () use ($validated, $request, $user) {
            $report = PropertyConditionReport::create([
                'property_id'    => $validated['property_id'],
                'lease_id'       => $validated['lease_id'],
                'created_by'     => $user->id,
                'type'           => $validated['type'],
                'report_date'    => $validated['report_date'],
                'notes'          => $validated['notes'] ?? null,
            ]);

            foreach ($request->file('photos') as $index => $photo) {
                $this->storePhoto($photo, $report, [
                    'condition_status' => $request->input("condition_statuses.{$index}", 'good'),
                    'condition_notes'  => $request->input("condition_notes.{$index}", ''),
                ]);
            }

            if ($validated['type'] === 'entry') {
                \App\Models\Lease::where('id', $validated['lease_id'])
                    ->update(['status' => 'active']);
            } elseif ($validated['type'] === 'exit') {
                \App\Models\Lease::where('id', $validated['lease_id'])
                    ->update(['status' => 'terminated']);
            }

            return redirect()->route('co-owner.condition-reports.show', $report->id)
                ->with('success', 'État des lieux créé avec succès.');
        });
    }

    /**
     * Affiche un état des lieux spécifique
     */
    public function show($id)
    {
        $user = Auth::user();
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $report = PropertyConditionReport::with([
            'photos',
            'lease.tenant',
            'property',
            'creator'
        ])->findOrFail($id);

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $report->property_id)
            ->where('status', 'accepted')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        return view('co-owner.condition-reports.show', compact('report'));
    }

    /**
     * Ajoute des photos à un état des lieux existant
     */
    public function addPhotos(Request $request, $id)
    {
        $validated = $request->validate([
            'photos' => 'required|array|min:1',
            'photos.*' => 'image|max:10240',
            'condition_statuses.*' => 'nullable|in:good,satisfactory,poor,damaged',
            'condition_notes.*'    => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $report = PropertyConditionReport::findOrFail($id);
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $report->property_id)
            ->where('status', 'accepted')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        foreach ($request->file('photos') as $index => $photo) {
            $this->storePhoto($photo, $report, [
                'condition_status' => $request->input("condition_statuses.{$index}", 'good'),
                'condition_notes'  => $request->input("condition_notes.{$index}", ''),
            ]);
        }

        return redirect()->back()
            ->with('success', 'Photos ajoutées avec succès.');
    }

    /**
     * Supprime un état des lieux
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $report = PropertyConditionReport::findOrFail($id);
        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $report->property_id)
            ->where('status', 'accepted')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        if ($report->signed_at) {
            return redirect()->back()
                ->with('error', 'Impossible de supprimer un état des lieux signé.');
        }

        foreach ($report->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }

        $report->delete();

        return redirect()->route('co-owner.condition-reports.index')
            ->with('success', 'État des lieux supprimé avec succès.');
    }

    /**
     * Télécharge un PDF de l'état des lieux
     */
    public function downloadPdf($id)
    {
        $user = Auth::user();
        $report = PropertyConditionReport::with([
            'photos',
            'lease.tenant',
            'property',
            'creator'
        ])->findOrFail($id);

        $coOwnerProfile = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwnerProfile) {
            abort(403, 'Vous n\'avez pas de profil copropriétaire.');
        }

        $hasAccess = PropertyDelegation::where('co_owner_id', $coOwnerProfile->id)
            ->where('property_id', $report->property_id)
            ->where('status', 'accepted')
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Accès non autorisé.');
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('co-owner.condition-reports.pdf', compact('report'));

        return $pdf->download("etat-des-lieux-{$report->id}.pdf");
    }

    /**
     * Méthode utilitaire pour stocker une photo
     */
    protected function storePhoto(UploadedFile $photo, PropertyConditionReport $report, array $attributes = [])
    {
        $filename = Str::uuid() . '.' . $photo->getClientOriginalExtension();

        $path = $photo->storeAs(
            'property_condition_photos/' . $report->id,
            $filename,
            'public'
        );

        return PropertyConditionPhoto::create([
            'report_id'          => $report->id,
            'path'              => $path,
            'original_filename' => $photo->getClientOriginalName(),
            'mime_type'         => $photo->getMimeType(),
            'size'              => $photo->getSize(),
            'taken_at'          => now(),
            'condition_status'  => $attributes['condition_status'] ?? 'good',
            'condition_notes'   => $attributes['condition_notes'] ?? null,
        ]);
    }
}
