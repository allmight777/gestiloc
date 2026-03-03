<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Mail\LandlordInvitation;
use App\Mail\TenantInvitationMail;
use App\Models\TenantInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TenantInvitationController extends Controller
{
    /**
     * Envoyer une invitation au propriétaire
     */
    public function inviteLandlord(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'name' => 'required|string|max:255',
                'message' => 'required|string'
            ]);

            $user = auth()->user();

            if (!$user || !$user->hasRole('tenant')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            // Récupérer les infos du locataire depuis la table tenants
            $tenant = $user->tenant;

            // Créer un tableau avec les infos du locataire
            $tenantInfo = [
                'first_name' => $tenant->first_name ?? $user->first_name ?? 'Locataire',
                'last_name' => $tenant->last_name ?? $user->last_name ?? '',
                'email' => $user->email,
                'phone' => $tenant->phone ?? $user->phone ?? null,
            ];

            Log::info('Tentative d\'envoi d\'invitation', [
                'tenant_id' => $user->id,
                'tenant_name' => $tenantInfo['first_name'] . ' ' . $tenantInfo['last_name'],
                'landlord_email' => $request->email,
                'landlord_name' => $request->name
            ]);

            // Envoyer l'email avec les infos du locataire
            Mail::to($request->email)->send(new LandlordInvitation(
                $request->name,
                $request->message,
                $tenantInfo
            ));

            Log::info('Invitation envoyée avec succès', [
                'tenant_id' => $user->id,
                'landlord_email' => $request->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Invitation envoyée avec succès'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur envoi invitation propriétaire', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'tenant_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'invitation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Renvoyer une invitation de locataire (pour le propriétaire)
     */
    public function resendInvitation(Request $request, $invitationId)
    {
        try {
            $invitation = TenantInvitation::findOrFail($invitationId);

            // Vérifier que l'invitation n'a pas déjà été acceptée
            if ($invitation->accepted_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette invitation a déjà été acceptée'
                ], 400);
            }

            // Générer un nouveau token
            $invitation->token = TenantInvitation::makeToken();
            $invitation->expires_at = now()->addDays(7);
            $invitation->save();

            // Envoyer l'email d'invitation
            $signedUrl = route('api.auth.accept-invitation', ['invitationId' => $invitation->id]);
            $fullUrl = url($signedUrl . '?token=' . $invitation->token);

            // Vérifier si le mail class existe, sinon utiliser une alternative
            try {
                Mail::to($invitation->email)->send(new TenantInvitationMail(
                    $invitation->name,
                    $fullUrl,
                    $invitation->expires_at
                ));
            } catch (\Exception $e) {
                // Si le mail n'existe pas, envoyer un mail simple
                Log::warning('TenantInvitationMail non trouvé, utilisation alternative', [
                    'error' => $e->getMessage()
                ]);
                
                // Envoyer un mail basique
                $details = [
                    'title' => 'Invitation à créer votre compte',
                    'name' => $invitation->name,
                    'url' => $fullUrl,
                    'expires_at' => $invitation->expires_at->format('d/m/Y')
                ];
                
                // Utiliser un mail générique
                \Illuminate\Support\Facades\Mail::raw(
                    "Bonjour {$invitation->name},\n\n".
                    "Vous avez été invité à rejoindre GestiLoc. Cliquez sur le lien suivant pour créer votre compte: {$fullUrl}\n\n".
                    "Cette invitation expire le {$details['expires_at']}",
                    function ($message) use ($invitation) {
                        $message->to($invitation->email)
                                ->subject('Invitation GestiLoc - Créez votre compte');
                    }
                );
            }

            Log::info('Invitation renvoyée avec succès', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Invitation renvoyée avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur renvoi invitation', [
                'error' => $e->getMessage(),
                'invitation_id' => $invitationId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du renvoi de l\'invitation: ' . $e->getMessage()
            ], 500);
        }
    }
}
