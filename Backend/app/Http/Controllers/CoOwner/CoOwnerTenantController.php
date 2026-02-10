<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Property;
use App\Models\PropertyDelegation;
use App\Models\PropertyUser;
use App\Models\TenantInvitation;
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Mail;

class CoOwnerTenantController extends Controller
{
    /**
     * Afficher la liste des locataires avec filtres
     */
    public function index(Request $request)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        Log::info('=== ACCÈS PAGE LARAVEL (COPRIO) ===', [
            'url' => $request->fullUrl(),
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
            'timestamp' => now(),
        ]);

        if (!$user) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        // Vérifier que c'est un co-propriétaire
        if (!$user->hasRole('co_owner')) {
            return view('co-owner.unauthorized')->with('error', 'Accès réservé aux co-propriétaires');
        }

        // Récupérer le co-propriétaire lié à l'utilisateur
        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return view('co-owner.unauthorized')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Récupérer les paramètres de filtrage
        $status = $request->get('status', 'active'); // 'active' ou 'archived'
        $perPage = $request->get('per_page', 100);
        $search = $request->get('search', '');
        $propertyId = $request->get('property_id', '');

        // Démarrer la requête de base
        $query = Tenant::where('meta->landlord_id', $coOwner->landlord_id);

        // Filtre par statut (active/archived)
        if ($status === 'archived') {
            // Locataires archivés (ceux sans bail actif ou avec statut spécifique)
            $query->where('status', '!=', 'active')
                  ->orWhere(function($q) {
                      $q->whereDoesntHave('leases', function($subQuery) {
                          $subQuery->where('status', 'active');
                      });
                  });
        } else {
            // Locataires actifs (avec bail actif)
            $query->where(function($q) {
                $q->where('status', 'active')
                  ->orWhereHas('leases', function($subQuery) {
                      $subQuery->where('status', 'active');
                  });
            });
        }

        // Filtre par bien
        if (!empty($propertyId)) {
            $query->whereHas('leases', function($q) use ($propertyId) {
                $q->where('property_id', $propertyId)
                  ->where('status', 'active');
            });
        }

        // Filtre par recherche
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                  ->orWhere('last_name', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function($subQuery) use ($search) {
                      $subQuery->where('email', 'LIKE', "%{$search}%")
                               ->orWhere('phone', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Récupérer les locataires avec pagination
        $tenants = $query->orderBy('created_at', 'desc')
                        ->paginate($perPage)
                        ->withQueryString();

        // Récupérer la liste des biens délégués pour le filtre
        $delegatedProperties = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->with('property')
            ->get()
            ->pluck('property')
            ->filter()
            ->unique('id');

        return view('co-owner.tenants.index', compact(
            'tenants',
            'user',
            'status',
            'perPage',
            'search',
            'propertyId',
            'delegatedProperties'
        ));
    }

    /**
     * Formulaire création locataire
     */
    public function create(Request $request)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        Log::info('=== FORMULAIRE CRÉATION LARAVEL (COPRIO) ===', [
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
        ]);

        if (!$user) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        // Vérifier que c'est un co-propriétaire
        if (!$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Accès réservé aux co-propriétaires');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        return view('co-owner.tenants.create', compact('user', 'coOwner'));
    }

    /**
     * Enregistrement locataire
     */
    public function store(Request $request)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        Log::info('=== ENREGISTREMENT LOCATAIRE LARAVEL (COPRIO) ===', [
            'data_keys' => array_keys($request->all()),
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
            'user_roles' => $user ? $user->getRoleNames() : null,
        ]);

        // Vérifier l'authentification
        if (!$user) {
            Log::error('Aucun utilisateur authentifié trouvé');
            return back()
                ->with('error', 'Vous devez être connecté pour créer un locataire')
                ->withInput();
        }

        // Vérifier que c'est un co-propriétaire
        if (!$user->hasRole('co_owner')) {
            Log::error('Utilisateur non autorisé', [
                'user_id' => $user->id,
                'roles' => $user->getRoleNames()
            ]);
            return back()
                ->with('error', 'Accès réservé aux co-propriétaires')
                ->withInput();
        }

        // Récupérer le co-propriétaire
        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()
                ->with('error', 'Profil co-propriétaire non trouvé')
                ->withInput();
        }

        // Validation - AJOUTER la validation unique pour le téléphone
        $validated = $request->validate([
            'tenant_type' => 'required|string|max:50',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'birth_date' => 'required|date',
            'birth_place' => 'required|string|max:200',
            'marital_status' => 'nullable|string',
            'profession' => 'required|string|max:200',
            'employer' => 'nullable|string|max:200',
            'annual_income' => 'nullable|numeric|min:0',
            'monthly_income' => 'nullable|numeric|min:0',
            'contract_type' => 'nullable|string',
            'address' => 'required|string|max:255',
            'zip_code' => 'required|string|max:10',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'emergency_contact_name' => 'nullable|string|max:200',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_email' => 'nullable|email|max:200',
            'notes' => 'nullable|string',
            'guarantor_name' => 'nullable|string|max:200',
            'guarantor_phone' => 'nullable|string|max:20',
            'guarantor_email' => 'nullable|email',
            'guarantor_profession' => 'nullable|string|max:200',
            'guarantor_income' => 'nullable|numeric|min:0',
            'guarantor_monthly_income' => 'nullable|numeric|min:0',
            'guarantor_address' => 'nullable|string|max:255',
            'guarantor_birth_date' => 'nullable|date',
            'guarantor_birth_place' => 'nullable|string|max:200',
            'document_type' => 'nullable|string|max:50',
            'document_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ], [
            'email.unique' => 'Cet email est déjà utilisé par un autre utilisateur.',
            'phone.unique' => 'Ce numéro de téléphone est déjà utilisé par un autre utilisateur.',
        ]);

        try {
            return DB::transaction(function () use ($validated, $user, $coOwner, $request) {
                Log::info('Début création locataire par co-propriétaire', [
                    'co_owner_id' => $coOwner->id,
                    'co_owner_email' => $user->email,
                    'tenant_email' => $validated['email']
                ]);

                // Gestion du fichier document
                $documentPath = null;
                if ($request->hasFile('document_file')) {
                    $documentPath = $request->file('document_file')->store('tenant_documents', 'public');
                }

                // 1. Vérifier si l'email existe déjà (déjà fait par validation mais double sécurité)
                $existingUser = User::where('email', $validated['email'])->first();

                if ($existingUser) {
                    $tenantUser = $existingUser;
                } else {
                    // Créer un user temporaire
                    $tempPassword = Hash::make(bin2hex(random_bytes(16)));

                    $tenantUser = User::create([
                        'email' => $validated['email'],
                        'phone' => $validated['phone'] ?? null,
                        'password' => $tempPassword,
                        'status' => 'pending',
                        'email_verified_at' => null,
                    ]);

                    // Assigner le rôle de locataire
                    $tenantUser->assignRole('tenant');
                }

                // 2. Créer l'invitation
                $invitation = TenantInvitation::create([
                    'landlord_id'    => $coOwner->landlord_id,
                    'tenant_user_id' => $tenantUser->id,
                    'email'          => $validated['email'],
                    'name'           => trim($validated['first_name'] . ' ' . $validated['last_name']),
                    'token'          => TenantInvitation::makeToken(),
                    'expires_at'     => now()->addDays(7),
                    'meta'           => [
                        'first_name' => $validated['first_name'],
                        'last_name'  => $validated['last_name'],
                        'phone'      => $validated['phone'] ?? null,
                        'invited_by' => 'co_owner',
                        'co_owner_id' => $coOwner->id,
                    ],
                ]);

                // 3. Créer le locataire - RETIRER les colonnes phone et email qui n'existent pas dans tenants
                $tenant = Tenant::create([
                    'user_id' => $tenantUser->id,
                    'tenant_type' => $validated['tenant_type'],
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'birth_date' => $validated['birth_date'],
                    'birth_place' => $validated['birth_place'],
                    'marital_status' => $validated['marital_status'] ?? 'single',
                    'profession' => $validated['profession'],
                    'employer' => $validated['employer'] ?? null,
                    'annual_income' => $validated['annual_income'] ?? null,
                    'monthly_income' => $validated['monthly_income'] ?? null,
                    'contract_type' => $validated['contract_type'] ?? null,
                    'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                    'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
                    'emergency_contact_email' => $validated['emergency_contact_email'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'status' => 'candidate',
                    'address' => $validated['address'],
                    'zip_code' => $validated['zip_code'],
                    'city' => $validated['city'],
                    'country' => $validated['country'],
                    'guarantor_name' => $validated['guarantor_name'] ?? null,
                    'guarantor_phone' => $validated['guarantor_phone'] ?? null,
                    'guarantor_email' => $validated['guarantor_email'] ?? null,
                    'guarantor_profession' => $validated['guarantor_profession'] ?? null,
                    'guarantor_income' => $validated['guarantor_income'] ?? null,
                    'guarantor_monthly_income' => $validated['guarantor_monthly_income'] ?? null,
                    'guarantor_address' => $validated['guarantor_address'] ?? null,
                    'guarantor_birth_date' => $validated['guarantor_birth_date'] ?? null,
                    'guarantor_birth_place' => $validated['guarantor_birth_place'] ?? null,
                    'document_type' => $validated['document_type'] ?? null,
                    'document_path' => $documentPath,
                    'meta' => [
                        'landlord_id' => $coOwner->landlord_id,
                        'invitation_email' => $validated['email'],
                        'phone' => $validated['phone'] ?? null,
                        'invitation_id' => $invitation->id,
                        'invitation_status' => 'invited',
                        'invited_by_co_owner' => $coOwner->id,
                        'co_owner_id' => $coOwner->id,
                        'email' => $validated['email'], // Stocker l'email dans meta
                    ],
                ]);

                // 4. Générer le lien d'invitation
                $signedUrl = URL::temporarySignedRoute(
                    'api.auth.accept-invitation',
                    now()->addDays(7),
                    ['invitationId' => $invitation->id]
                );

                Log::info('Locataire créé avec succès par co-propriétaire', [
                    'tenant_id' => $tenant->id,
                    'tenant_email' => $validated['email'],
                    'tenant_user_id' => $tenant->user_id,
                    'co_owner_id' => $coOwner->id,
                    'co_owner_email' => $user->email,
                    'invitation_id' => $invitation->id,
                ]);

                // 5. Envoyer l'email d'invitation
                $this->sendInvitationEmail($tenant, $invitation, $signedUrl, $user, $validated['email']);

                return redirect()
                    ->route('co-owner.tenants.index')
                    ->with('success', 'Locataire créé avec succès ! Un email d\'invitation a été envoyé.');

            });

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Erreur création locataire par co-propriétaire', [
                'error' => $e->getMessage(),
                'co_owner_id' => $user->id,
                'trace' => $e->getTraceAsString()
            ]);

            return back()
                ->with('error', 'Erreur lors de la création du locataire: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Envoyer l'email d'invitation
     */
    private function sendInvitationEmail($tenant, $invitation, $signedUrl, $coOwnerUser, $tenantEmail)
    {
        try {
            $appName = config('app.name', 'Gestiloc');
            $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');

            $ref = 'INV-' . str_pad((string) $invitation->id, 6, '0', STR_PAD_LEFT);
            $toTenant = $tenantEmail;

            if (empty($toTenant)) {
                Log::error('Email du locataire est vide', [
                    'tenant_id' => $tenant->id,
                    'invitation_id' => $invitation->id
                ]);
                return;
            }

            $subject = "✉️ Invitation $appName : $ref";

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour {$tenant->first_name},<br><br>
  Vous avez été invité(e) à rejoindre <strong>{$appName}</strong> par {$coOwnerUser->email}.
  Pour accéder à votre espace locataire et définir votre mot de passe, utilisez le lien ci-dessous.
</div>
<div style="height:14px"></div>
<div style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <div style="padding:14px;background:#f9fafb;">
    <div style="font-size:14px;font-weight:900;color:#111827;">Invitation</div>
    <div style="font-size:13px;color:#6b7280;margin-top:4px;">Locataire : {$tenant->first_name} {$tenant->last_name}</div>
    <div style="font-size:13px;color:#6b7280;margin-top:4px;">Email : {$tenantEmail}</div>
  </div>
  <div style="padding:14px;">
    <div style="font-size:13px;color:#374151;line-height:1.6;">
      Cliquez sur le bouton ci-dessous pour créer votre compte et définir votre mot de passe.
    </div>
    <div style="height:14px"></div>
    <a href="{$signedUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:800;font-size:14px;">
      Créer mon compte
    </a>
  </div>
</div>
<div style="height:16px"></div>
<a href="{$frontendUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:800;font-size:14px;">
  Ouvrir {$appName}
</a>
HTML;

            Mail::html($content, function ($message) use ($toTenant, $subject) {
                if (empty($toTenant)) {
                    throw new \Exception("L'adresse email est vide");
                }
                $message->to($toTenant)->subject($subject);
            });

            Log::info('Email d\'invitation envoyé', [
                'to' => $toTenant,
                'invitation_id' => $invitation->id
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur envoi email invitation', [
                'error' => $e->getMessage(),
                'tenant_id' => $tenant->id,
                'tenant_email' => $tenantEmail ?? 'null',
                'invitation_id' => $invitation->id
            ]);
        }
    }

    /**
     * Afficher un locataire
     */
    public function show(Request $request, $tenantId)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        $tenant = Tenant::where('id', $tenantId)
            ->where('meta->landlord_id', $coOwner->landlord_id)
            ->firstOrFail();

        Log::info('=== AFFICHAGE LOCATAIRE (COPRIO) ===', [
            'tenant_id' => $tenantId,
            'co_owner_id' => $user->id,
        ]);

        return view('co-owner.tenants.show', compact('tenant', 'user'));
    }

    /**
     * Archiver un locataire
     */
    public function archive(Request $request, $tenantId)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        $tenant = Tenant::where('id', $tenantId)
            ->where('meta->landlord_id', $coOwner->landlord_id)
            ->firstOrFail();

        try {
            $tenant->status = 'archived';
            $tenant->save();

            Log::info('=== LOCATAIRE ARCHIVÉ (COPRIO) ===', [
                'tenant_id' => $tenantId,
                'co_owner_id' => $user->id,
            ]);

            return redirect()
                ->route('co-owner.tenants.index', ['status' => 'active'])
                ->with('success', 'Locataire archivé avec succès.');

        } catch (\Exception $e) {
            Log::error('Erreur archivage locataire', [
                'error' => $e->getMessage(),
                'tenant_id' => $tenantId
            ]);

            return back()->with('error', 'Erreur lors de l\'archivage: ' . $e->getMessage());
        }
    }

    /**
     * Restaurer un locataire archivé
     */
    public function restore(Request $request, $tenantId)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        $tenant = Tenant::where('id', $tenantId)
            ->where('meta->landlord_id', $coOwner->landlord_id)
            ->firstOrFail();

        try {
            $tenant->status = 'active';
            $tenant->save();

            Log::info('=== LOCATAIRE RESTAURÉ (COPRIO) ===', [
                'tenant_id' => $tenantId,
                'co_owner_id' => $user->id,
            ]);

            return redirect()
                ->route('co-owner.tenants.index', ['status' => 'archived'])
                ->with('success', 'Locataire restauré avec succès.');

        } catch (\Exception $e) {
            Log::error('Erreur restauration locataire', [
                'error' => $e->getMessage(),
                'tenant_id' => $tenantId
            ]);

            return back()->with('error', 'Erreur lors de la restauration: ' . $e->getMessage());
        }
    }

    /**
     * Méthode utilitaire pour récupérer l'utilisateur authentifié
     */
    private function getAuthenticatedUser(Request $request)
    {
        // Vérifier l'authentification Sanctum (API)
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        // Vérifier le token en paramètre
        if ($request->has('api_token')) {
            $token = $request->get('api_token');
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        // Vérifier l'authentification web (session)
        if (auth()->check()) {
            return auth()->user();
        }

        // Essayer de récupérer depuis le header Authorization
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = str_replace('Bearer ', '', $authHeader);
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        return null;
    }
}
