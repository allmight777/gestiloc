<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLandlordRequest;
use App\Http\Requests\StoreCoOwnerRequest;
use App\Http\Requests\LoginRequest;
use App\Models\TenantInvitation;
use App\Models\CoOwnerInvitation;
use App\Models\User;
use App\Models\Tenant;
use App\Models\CoOwner;
use App\Models\Landlord;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /* =========================
     * Helpers emails (modern HTML)
     * ========================= */

    private function appName(): string
    {
        return config('app.name', 'Gestiloc');
    }

    private function frontendUrl(): string
    {
        return rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');
    }

    private function mailLayoutHtml(string $title, string $ref, string $contentHtml): string
    {
        $appName = e($this->appName());
        $year = date('Y');

        return <<<HTML
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 30px rgba(17,24,39,0.08);">
          <tr>
            <td style="padding:20px 22px;background:linear-gradient(135deg,#111827,#374151);color:#fff;">
              <div style="font-size:14px;opacity:.9;">{$appName}</div>
              <div style="font-size:20px;font-weight:800;line-height:1.2;margin-top:6px;">{$title}</div>
              <div style="font-size:13px;opacity:.9;margin-top:6px;">
                Référence : <strong>{$ref}</strong>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px;">
              {$contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 22px;border-top:1px solid #eef2f7;background:#fbfcff;">
              <div style="font-size:12px;color:#6b7280;line-height:1.6;">
                Cet email a été envoyé automatiquement. Si vous n'êtes pas concerné, vous pouvez l'ignorer.
              </div>
              <div style="font-size:12px;color:#6b7280;margin-top:8px;">
                © {$year} {$appName}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
    }

    private function buttonHtml(string $label, string $url): string
    {
        $l = e($label);
        $u = e($url);

        return <<<HTML
<a href="{$u}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:800;font-size:14px;">
  {$l}
</a>
HTML;
    }

    private function sendHtmlEmail(string $to, string $subject, string $html): void
    {
        Mail::html($html, function ($message) use ($to, $subject) {
            $message->to($to)->subject($subject);
        });

        Log::info('[auth-mail] sent', ['to' => $to, 'subject' => $subject]);
    }

    private function trySendMail(string $to, string $subject, string $title, string $ref, string $contentHtml): void
    {
        try {
            $html = $this->mailLayoutHtml($title, e($ref), $contentHtml);
            $this->sendHtmlEmail($to, $subject, $html);
        } catch (\Throwable $e) {
            Log::error('[auth-mail] failed', [
                'to'      => $to,
                'subject' => $subject,
                'error'   => $e->getMessage(),
            ]);
        }
    }

    private function invitationRef(TenantInvitation $invitation): string
    {
        return 'INV-' . str_pad((string) $invitation->id, 6, '0', STR_PAD_LEFT);
    }

    private function coOwnerInvitationRef(CoOwnerInvitation $invitation): string
    {
        return 'CO-INV-' . str_pad((string) $invitation->id, 6, '0', STR_PAD_LEFT);
    }

    private function resolveLandlordEmailFromInvitation(TenantInvitation $invitation): ?string
    {
        $email = $invitation->landlord?->user?->email ?? null;
        if ($email) return $email;

        if (!empty($invitation->landlord_id)) {
            $u = User::find($invitation->landlord_id);
            if ($u?->email) return $u->email;
        }

        if (!empty($invitation->landlord_id)) {
            $landlord = Landlord::find($invitation->landlord_id);
            if ($landlord && !empty($landlord->user_id)) {
                $u = User::find($landlord->user_id);
                if ($u?->email) return $u->email;
            }
        }

        return null;
    }

    private function welcomeCoOwnerContentHtml(User $user, CoOwner $coOwner): string
    {
        $email = e((string) $user->email);
        $name  = e(trim(($coOwner->first_name ?? '') . ' ' . ($coOwner->last_name ?? '')) ?: 'Votre compte');
        $cta   = $this->buttonHtml('Accéder à mon espace', $this->frontendUrl());

        return <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour <strong>{$name}</strong>,<br><br>
  Votre compte copropriétaire est maintenant <strong>activé</strong>. Vous pouvez vous connecter et accéder à votre espace.
</div>
<div style="height:14px"></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Vos identifiants</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Email : <strong>{$email}</strong></div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Vous pouvez dès maintenant consulter vos informations, les délégations reçues, et gérer vos biens.
      </div>
      <div style="height:14px"></div>
      {$cta}
    </td>
  </tr>
</table>
<div style="height:14px"></div>
<div style="font-size:12px;color:#6b7280;line-height:1.6;">
  Conseil sécurité : ne partagez jamais votre mot de passe.
</div>
HTML;
    }

    private function landlordCoOwnerActivatedContentHtml(CoOwnerInvitation $invitation, User $coOwnerUser, CoOwner $coOwner): string
    {
        $coOwnerName  = e(trim(($coOwner->first_name ?? '') . ' ' . ($coOwner->last_name ?? '')) ?: ($invitation->name ?? 'Copropriétaire'));
        $coOwnerEmail = e((string) $coOwnerUser->email);
        $cta          = $this->buttonHtml('Ouvrir le dashboard', $this->frontendUrl());

        return <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Bonne nouvelle : le copropriétaire invité a finalisé son inscription et son compte est maintenant <strong>actif</strong>.
</div>
<div style="height:14px"></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Copropriétaire activé</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Nom : <strong>{$coOwnerName}</strong></div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Email : <strong>{$coOwnerEmail}</strong></div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Vous pouvez maintenant lui déléguer des propriétés et gérer les collaborations.
      </div>
      <div style="height:14px"></div>
      {$cta}
    </td>
  </tr>
</table>
HTML;
    }

    private function welcomeTenantContentHtml(User $user, Tenant $tenant): string
    {
        $email = e((string) $user->email);
        $name  = e(trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? '')) ?: 'Votre compte');
        $cta   = $this->buttonHtml('Accéder à mon espace', $this->frontendUrl());

        return <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour <strong>{$name}</strong>,<br><br>
  Votre compte locataire est maintenant <strong>activé</strong>. Vous pouvez vous connecter et accéder à votre espace.
</div>
<div style="height:14px"></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Vos identifiants</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Email : <strong>{$email}</strong></div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Vous pouvez dès maintenant consulter vos informations, vos baux, et échanger avec votre bailleur.
      </div>
      <div style="height:14px"></div>
      {$cta}
    </td>
  </tr>
</table>
<div style="height:14px"></div>
<div style="font-size:12px;color:#6b7280;line-height:1.6;">
  Conseil sécurité : ne partagez jamais votre mot de passe.
</div>
HTML;
    }

    private function landlordTenantActivatedContentHtml(TenantInvitation $invitation, User $tenantUser, Tenant $tenant): string
    {
        $tenantName  = e(trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? '')) ?: ($invitation->name ?? 'Locataire'));
        $tenantEmail = e((string) $tenantUser->email);
        $cta         = $this->buttonHtml('Ouvrir le dashboard', $this->frontendUrl());

        return <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Bonne nouvelle : le locataire invité a finalisé son inscription et son compte est maintenant <strong>actif</strong>.
</div>
<div style="height:14px"></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Locataire activé</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Nom : <strong>{$tenantName}</strong></div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Email : <strong>{$tenantEmail}</strong></div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Vous pouvez maintenant lui attribuer un bail, gérer les échanges, et suivre les demandes.
      </div>
      <div style="height:14px"></div>
      {$cta}
    </td>
  </tr>
</table>
HTML;
    }

    /* =========================
     * Auth endpoints
     * ========================= */

    public function registerLandlord(StoreLandlordRequest $request): JsonResponse
    {
        $result = $this->authService->registerLandlord($request->validated());

        return response()->json([
            'status'  => 'success',
            'message' => 'Landlord registered successfully.',
            'data'    => [
                'user'     => $result['user'],
                'landlord' => $result['landlord'],
            ],
        ], 201);
    }

    public function registerCoOwner(StoreCoOwnerRequest $request): JsonResponse
    {
        $data   = $request->validated();
        $result = $this->authService->registerCoOwner($data);

        return response()->json([
            'status'  => 'success',
            'message' => 'Co-owner registered successfully',
            'data'    => $result,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'status'  => 'success',
            'message' => 'Login successful.',
            'data'    => $result,
        ]);
    }

    /**
     * Redirige le co-owner vers le front avec token + email
     */
    public function acceptCoOwnerInvitation(Request $request, $invitationId)
    {
        $invitation = CoOwnerInvitation::where('id', $invitationId)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        $frontendUrl = config('app.frontend_url', '' . config('app.frontend_url') . '');

        return redirect()->away(
            rtrim($frontendUrl, '/') .
            '/activation/coproprietaire?token=' . urlencode($invitation->token) .
            '&email=' . urlencode($invitation->email)
        );
    }

    /**
     * Le co-propriétaire soumet son mot de passe depuis le front.
     *
     * BUGS CORRIGÉS :
     * 1. Le landlord_id dans l'invitation pointe vers users.id (pas landlords.id).
     *    On résout le vrai landlord_id (table landlords) avant de créer le CoOwner.
     * 2. Logs détaillés ajoutés pour diagnostiquer les erreurs futures.
     * 3. Réponse JSON toujours structurée avec token pour que le front puisse vérifier.
     */
    public function setCoOwnerPassword(Request $request)
    {
        Log::info('=== setCoOwnerPassword appelé ===', [
            'email' => $request->input('email'),
            'token_prefix' => substr($request->input('token', ''), 0, 10) . '...',
        ]);

        try {
            $data = $request->validate([
                'token'    => 'required|string',
                'email'    => 'required|email',
                'password' => 'required|string|min:8|confirmed',
            ]);

            // ─── 1. Trouver l'invitation ────────────────────────────────────────
            $invitation = CoOwnerInvitation::where('token', $data['token'])
                ->where('email', $data['email'])
                ->first();

            if (!$invitation) {
                Log::warning('setCoOwnerPassword: invitation introuvable', [
                    'email' => $data['email'],
                ]);
                throw ValidationException::withMessages([
                    'token' => ['Invitation invalide. Vérifiez votre lien ou demandez un nouveau.'],
                ]);
            }

            // ─── 2. Vérifier l'expiration ───────────────────────────────────────
            if ($invitation->expires_at <= now()) {
                Log::warning('setCoOwnerPassword: invitation expirée', [
                    'invitation_id' => $invitation->id,
                    'expires_at'    => $invitation->expires_at,
                ]);
                throw ValidationException::withMessages([
                    'token' => ['Cette invitation a expiré. Demandez une nouvelle invitation.'],
                ]);
            }

            // ─── 3. Vérifier si déjà acceptée ──────────────────────────────────
            // On autorise si déjà acceptée mais sans user existant (retry après crash)
            if ($invitation->accepted_at && $invitation->co_owner_user_id) {
                $existingUser = User::find($invitation->co_owner_user_id);
                if ($existingUser) {
                    Log::info('setCoOwnerPassword: invitation déjà utilisée, connexion auto', [
                        'invitation_id' => $invitation->id,
                        'user_id'       => $existingUser->id,
                    ]);
                    // Retourner un token pour que la personne puisse se connecter
                    $token = $existingUser->createToken('co-owner-login')->plainTextToken;
                    $coOwner = CoOwner::where('user_id', $existingUser->id)->first();

                    return response()->json([
                        'message'  => 'Compte déjà activé. Connexion automatique.',
                        'token'    => $token,
                        'user'     => [
                            'id'    => $existingUser->id,
                            'email' => $existingUser->email,
                            'roles' => method_exists($existingUser, 'getRoleNames')
                                ? $existingUser->getRoleNames()
                                : ['co_owner'],
                        ],
                        'co_owner' => $coOwner,
                    ]);
                }
            }

            $ref = $this->coOwnerInvitationRef($invitation);

            Log::info('setCoOwnerPassword: invitation trouvée', [
                'invitation_id' => $invitation->id,
                'landlord_id'   => $invitation->landlord_id,
                'meta'          => $invitation->meta,
            ]);

            return DB::transaction(function () use ($data, $invitation, $ref) {

                // ─── 4. Résoudre le vrai landlord_id ────────────────────────────
                //
                // PROBLÈME : Dans CoOwnerManagementController::invite(),
                // quand c'est un landlord qui invite :
                //   $landlordId = $user->id  (← c'est users.id, PAS landlords.id)
                //
                // Mais CoOwner.landlord_id doit pointer vers landlords.id.
                //
                // On résout ici : si landlord_id est dans la table users mais pas
                // dans landlords, on cherche l'enregistrement landlords correspondant.
                //
                $rawLandlordId    = $invitation->landlord_id;
                $resolvedLandlordId = null;

                // Cas A : landlord_id pointe directement vers landlords.id
                $landlordRecord = Landlord::find($rawLandlordId);
                if ($landlordRecord) {
                    $resolvedLandlordId = $landlordRecord->id;
                    Log::info('setCoOwnerPassword: landlord trouvé via landlords.id', [
                        'landlord_id' => $resolvedLandlordId,
                    ]);
                } else {
                    // Cas B : landlord_id est en fait un users.id
                    // On cherche le landlord dont user_id = landlord_id de l'invitation
                    $landlordViaUser = Landlord::where('user_id', $rawLandlordId)->first();
                    if ($landlordViaUser) {
                        $resolvedLandlordId = $landlordViaUser->id;
                        Log::info('setCoOwnerPassword: landlord trouvé via user_id', [
                            'raw_landlord_id'      => $rawLandlordId,
                            'resolved_landlord_id' => $resolvedLandlordId,
                        ]);
                    } else {
                        // Cas C : on n'a pas de table landlords (rare), on garde tel quel
                        $resolvedLandlordId = $rawLandlordId;
                        Log::warning('setCoOwnerPassword: impossible de résoudre landlord_id, utilisation brute', [
                            'raw_landlord_id' => $rawLandlordId,
                        ]);
                    }
                }

                // ─── 5. Créer ou mettre à jour le User ──────────────────────────
                $phoneFromInvitation = $invitation->meta['phone'] ?? null;
                $user                = User::where('email', $data['email'])->first();

                if (!$user) {
                    // Vérifier unicité téléphone
                    if ($phoneFromInvitation && User::where('phone', $phoneFromInvitation)->exists()) {
                        throw ValidationException::withMessages([
                            'phone' => ['Ce numéro de téléphone est déjà utilisé par un autre compte.'],
                        ]);
                    }

                    $user = User::create([
                        'email'             => $invitation->email,
                        'password'          => Hash::make($data['password']),
                        'phone'             => $phoneFromInvitation,
                        'email_verified_at' => now(),
                    ]);

                    Log::info('setCoOwnerPassword: nouvel utilisateur créé', ['user_id' => $user->id]);
                } else {
                    // Vérifier unicité téléphone pour un user existant
                    if (
                        $phoneFromInvitation &&
                        $user->phone !== $phoneFromInvitation &&
                        User::where('phone', $phoneFromInvitation)->where('id', '!=', $user->id)->exists()
                    ) {
                        throw ValidationException::withMessages([
                            'phone' => ['Ce numéro de téléphone est déjà utilisé par un autre compte.'],
                        ]);
                    }

                    $user->password          = Hash::make($data['password']);
                    $user->email_verified_at = $user->email_verified_at ?? now();
                    if ($phoneFromInvitation) {
                        $user->phone = $phoneFromInvitation;
                    }
                    $user->save();

                    Log::info('setCoOwnerPassword: utilisateur existant mis à jour', ['user_id' => $user->id]);
                }

                // ─── 6. Assigner le rôle co_owner ───────────────────────────────
                if (method_exists($user, 'assignRole')) {
                    $user->assignRole('co_owner');
                }

                // ─── 7. Créer ou mettre à jour le CoOwner ───────────────────────
                $parts     = preg_split('/\s+/', (string) $invitation->name, 2);
                $firstName = $invitation->meta['first_name'] ?? $parts[0] ?? ($invitation->name ?? 'Copropriétaire');
                $lastName  = $invitation->meta['last_name']  ?? $parts[1] ?? '';

                $coOwner = CoOwner::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'first_name'      => $firstName,
                        'last_name'       => $lastName,
                        'company_name'    => $invitation->meta['company_name']    ?? null,
                        'address_billing' => $invitation->meta['address_billing'] ?? null,
                        'phone'           => $invitation->meta['phone']           ?? null,
                        'license_number'  => $invitation->meta['license_number']  ?? null,
                        'is_professional' => $invitation->meta['is_professional'] ?? false,
                        'ifu'             => $invitation->meta['ifu']             ?? null,
                        'rccm'            => $invitation->meta['rccm']            ?? null,
                        'vat_number'      => $invitation->meta['vat_number']      ?? null,
                        'meta'            => $invitation->meta                    ?? null,
                        // ✅ CORRIGÉ : on utilise le landlord_id résolu, pas le brut
                        'landlord_id'     => $resolvedLandlordId,
                        'invitation_id'   => $invitation->id,
                        'status'          => 'active',
                        'joined_at'       => now(),
                    ]
                );

                Log::info('setCoOwnerPassword: CoOwner créé/mis à jour', [
                    'co_owner_id'   => $coOwner->id,
                    'user_id'       => $user->id,
                    'landlord_id'   => $resolvedLandlordId,
                ]);

                // ─── 8. Marquer l'invitation comme acceptée ──────────────────────
                $invitation->accepted_at      = now();
                $invitation->co_owner_user_id = $user->id;  // ← toujours users.id ici
                $invitation->save();

                // ─── 9. Générer un token d'authentification ──────────────────────
                $token = $user->createToken('co-owner-login')->plainTextToken;

                Log::info('setCoOwnerPassword: token généré, envoi des emails', [
                    'user_id'    => $user->id,
                    'co_owner_id' => $coOwner->id,
                ]);

                // ─── 10. Emails ──────────────────────────────────────────────────
                // A) Bienvenue co-propriétaire
                $this->trySendMail(
                    $user->email,
                    "🎉 Bienvenue sur {$this->appName()}",
                    'Bienvenue ! Votre compte copropriétaire est activé ✅',
                    $ref,
                    $this->welcomeCoOwnerContentHtml($user, $coOwner)
                );

                // B) Notification au bailleur
                $landlordEmail = $this->resolveLandlordEmailFromCoOwnerInvitation($invitation);
                if ($landlordEmail) {
                    $this->trySendMail(
                        $landlordEmail,
                        "✅ Copropriétaire activé : {$user->email}",
                        'Copropriétaire activé ✅',
                        $ref,
                        $this->landlordCoOwnerActivatedContentHtml($invitation, $user, $coOwner)
                    );
                } else {
                    Log::warning('setCoOwnerPassword: email bailleur introuvable', [
                        'invitation_id' => $invitation->id,
                        'landlord_id'   => $invitation->landlord_id,
                    ]);
                }

                // ─── 11. Réponse ─────────────────────────────────────────────────
                return response()->json([
                    'message'  => 'Compte copropriétaire créé avec succès.',
                    'token'    => $token,
                    'user'     => [
                        'id'    => $user->id,
                        'email' => $user->email,
                        'roles' => method_exists($user, 'getRoleNames')
                            ? $user->getRoleNames()
                            : ['co_owner'],
                    ],
                    'co_owner' => $coOwner,
                ]);
            });

        } catch (ValidationException $e) {
            Log::warning('setCoOwnerPassword: erreur de validation', [
                'errors' => $e->errors(),
            ]);
            throw $e;

        } catch (QueryException $e) {
            if ($e->getCode() == '23000' && str_contains($e->getMessage(), 'users_phone_unique')) {
                Log::error('setCoOwnerPassword: téléphone en doublon', [
                    'error' => $e->getMessage(),
                ]);
                throw ValidationException::withMessages([
                    'phone' => ['Ce numéro de téléphone est déjà utilisé. Contactez le support si c\'est le vôtre.'],
                ]);
            }

            Log::error('setCoOwnerPassword: erreur SQL', [
                'error' => $e->getMessage(),
                'code'  => $e->getCode(),
            ]);
            throw ValidationException::withMessages([
                'database' => ['Erreur de base de données. Veuillez réessayer dans quelques instants.'],
            ]);

        } catch (\Exception $e) {
            Log::error('setCoOwnerPassword: erreur inattendue', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw ValidationException::withMessages([
                'general' => ['Une erreur est survenue. Veuillez réessayer.'],
            ]);
        }
    }

    /**
     * Résout l'email du bailleur depuis une CoOwnerInvitation.
     * Tente plusieurs stratégies car landlord_id peut être users.id ou landlords.id.
     */
    private function resolveLandlordEmailFromCoOwnerInvitation(CoOwnerInvitation $invitation): ?string
    {
        // Cas A : relation Eloquent -> landlord -> user -> email
        $email = $invitation->landlord?->user?->email ?? null;
        if ($email) return $email;

        // Cas B : landlord_id est directement un users.id
        if (!empty($invitation->landlord_id)) {
            $u = User::find($invitation->landlord_id);
            if ($u?->email) return $u->email;
        }

        // Cas C : landlord_id est un landlords.id -> retrouver via user_id
        if (!empty($invitation->landlord_id)) {
            $landlord = Landlord::find($invitation->landlord_id);
            if ($landlord && !empty($landlord->user_id)) {
                $u = User::find($landlord->user_id);
                if ($u?->email) return $u->email;
            }
        }

        // Cas D : email du landlord stocké dans les meta de l'invitation
        $metaLandlordId = $invitation->meta['landlord_id'] ?? null;
        if ($metaLandlordId) {
            $u = User::find($metaLandlordId);
            if ($u?->email) return $u->email;

            $landlord = Landlord::find($metaLandlordId);
            if ($landlord && !empty($landlord->user_id)) {
                $u = User::find($landlord->user_id);
                if ($u?->email) return $u->email;
            }
        }

        return null;
    }

    /**
     * Redirige le locataire vers le front avec token + email
     */
    public function acceptInvitation(Request $request, $invitationId)
    {
        $invitation = TenantInvitation::where('id', $invitationId)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        $frontendUrl = config('app.frontend_url', '' . config('app.frontend_url') . '');

        return redirect()->away(
            rtrim($frontendUrl, '/') .
            '/activation/locataire?token=' . urlencode($invitation->token) .
            '&email=' . urlencode($invitation->email)
        );
    }

    /**
     * Le locataire soumet son mot de passe depuis le front.
     */
    public function completeTenantRegistration(Request $request)
    {
        try {
            $data = $request->validate([
                'token'    => 'required|string',
                'email'    => 'required|email',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $invitation = TenantInvitation::where('token', $data['token'])
                ->where('email', $data['email'])
                ->whereNull('accepted_at')
                ->where('expires_at', '>', now())
                ->first();

            if (!$invitation) {
                throw ValidationException::withMessages([
                    'token' => ['Invitation invalide ou expirée.'],
                ]);
            }

            Log::info('Tenant invitation found:', [
                'id'           => $invitation->id,
                'email'        => $invitation->email,
                'meta'         => $invitation->meta,
                'phone_in_meta' => $invitation->meta['phone'] ?? 'null',
            ]);

            $ref = $this->invitationRef($invitation);

            return DB::transaction(function () use ($data, $invitation, $ref) {
                $user                = User::where('email', $data['email'])->first();
                $phoneFromInvitation = $invitation->meta['phone'] ?? null;

                if (!$user) {
                    if ($phoneFromInvitation && User::where('phone', $phoneFromInvitation)->exists()) {
                        throw ValidationException::withMessages([
                            'phone' => ['Ce numéro de téléphone est déjà utilisé par un autre compte.'],
                        ]);
                    }

                    $user = User::create([
                        'email'             => $invitation->email,
                        'password'          => Hash::make($data['password']),
                        'phone'             => $phoneFromInvitation,
                        'email_verified_at' => now(),
                    ]);

                    Log::info('New tenant user created:', ['id' => $user->id, 'phone' => $user->phone]);
                } else {
                    if (
                        $phoneFromInvitation &&
                        $user->phone !== $phoneFromInvitation &&
                        User::where('phone', $phoneFromInvitation)->where('id', '!=', $user->id)->exists()
                    ) {
                        throw ValidationException::withMessages([
                            'phone' => ['Ce numéro de téléphone est déjà utilisé par un autre compte.'],
                        ]);
                    }

                    $user->password          = Hash::make($data['password']);
                    $user->email_verified_at = $user->email_verified_at ?? now();
                    if ($phoneFromInvitation) {
                        $user->phone = $phoneFromInvitation;
                    }
                    $user->save();

                    Log::info('Existing tenant user updated:', ['id' => $user->id, 'phone' => $user->phone]);
                }

                if (method_exists($user, 'assignRole')) {
                    $user->assignRole('tenant');
                }

                $parts     = preg_split('/\s+/', (string) $invitation->name, 2);
                $firstName = $parts[0] ?? ($invitation->name ?? 'Locataire');
                $lastName  = $parts[1] ?? '';

                $tenant = Tenant::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'first_name'    => $firstName,
                        'last_name'     => $lastName,
                        'status'        => 'active',
                        'solvency_score' => 0,
                        'meta'          => [
                            'invitation_email' => $invitation->email,
                            'landlord_id'      => $invitation->landlord_id,
                            'invitation_id'    => $invitation->id,
                        ],
                    ]
                );

                $invitation->accepted_at    = now();
                $invitation->tenant_user_id = $user->id;
                $invitation->save();

                $token = $user->createToken('tenant-login')->plainTextToken;

                // Bienvenue locataire
                $this->trySendMail(
                    $user->email,
                    "🎉 Bienvenue sur {$this->appName()}",
                    'Bienvenue ! Votre compte est activé ✅',
                    $ref,
                    $this->welcomeTenantContentHtml($user, $tenant)
                );

                // Notification bailleur
                $landlordEmail = $this->resolveLandlordEmailFromInvitation($invitation);
                if ($landlordEmail) {
                    $this->trySendMail(
                        $landlordEmail,
                        "✅ Locataire activé : {$user->email}",
                        'Locataire activé ✅',
                        $ref,
                        $this->landlordTenantActivatedContentHtml($invitation, $user, $tenant)
                    );
                } else {
                    Log::warning('[auth-mail] landlord email missing (tenant activation)', [
                        'invitation_id' => $invitation->id,
                        'landlord_id'   => $invitation->landlord_id,
                    ]);
                }

                return response()->json([
                    'message' => 'Compte locataire créé avec succès.',
                    'token'   => $token,
                    'user'    => [
                        'id'    => $user->id,
                        'email' => $user->email,
                        'roles' => method_exists($user, 'getRoleNames')
                            ? $user->getRoleNames()
                            : ['tenant'],
                    ],
                    'tenant'  => $tenant,
                ]);
            });

        } catch (ValidationException $e) {
            throw $e;

        } catch (QueryException $e) {
            if ($e->getCode() == '23000' && str_contains($e->getMessage(), 'users_phone_unique')) {
                Log::error('Erreur téléphone dupliqué lors de la création de locataire', [
                    'email' => $data['email'] ?? null,
                    'error' => $e->getMessage(),
                ]);
                throw ValidationException::withMessages([
                    'phone' => ['Ce numéro de téléphone est déjà utilisé dans le système.'],
                ]);
            }

            Log::error('Erreur SQL lors de la création de locataire', [
                'email' => $data['email'] ?? null,
                'error' => $e->getMessage(),
            ]);
            throw ValidationException::withMessages([
                'database' => ['Erreur de base de données. Veuillez réessayer.'],
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la création de locataire', [
                'email' => $data['email'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw ValidationException::withMessages([
                'general' => ['Une erreur est survenue. Veuillez réessayer.'],
            ]);
        }
    }
}
