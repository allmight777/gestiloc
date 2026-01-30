<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Models\Property;
use App\Models\CoOwner;
use App\Models\Delegation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class PropertyController extends Controller
{
    /* =========================
     * Helpers (mail)
     * ========================= */

    private function appName(): string
    {
        return config('app.name', 'Gestiloc');
    }

    private function frontendUrl(): string
    {
        return rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');
    }

    private function propertyRef(Property $property): string
    {
        return 'PROP-' . str_pad((string) $property->id, 6, '0', STR_PAD_LEFT);
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
              <div style="font-size:20px;font-weight:700;line-height:1.2;margin-top:6px;">{$title}</div>
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
<a href="{$u}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:700;font-size:14px;">
  {$l}
</a>
HTML;
    }

    private function propertyCardHtml(Property $property): string
    {
        $name = e((string) ($property->name ?? '—'));
        $address = e((string) ($property->address ?? '—'));
        $city = e((string) ($property->city ?? ''));
        $status = e((string) ($property->status ?? '—'));
        $type = e((string) ($property->type ?? '—'));
        $refCode = e((string) ($property->reference_code ?? '—'));

        $full = trim($address . ($city ? ', ' . $city : ''));

        return <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px 14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:800;color:#111827;">Bien</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">{$name}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">{$full}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Référence</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$refCode}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Type</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$type}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Statut</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$status}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
HTML;
    }

    private function sendHtmlEmail(string $to, string $subject, string $html): void
    {
        Mail::html($html, function ($message) use ($to, $subject) {
            $message->to($to)->subject($subject);
        });

        Log::info('[property-mail] sent', ['to' => $to, 'subject' => $subject]);
    }

    private function trySendPropertyMail(string $to, string $subject, string $title, string $ref, string $contentHtml): void
    {
        try {
            $html = $this->mailLayoutHtml($title, e($ref), $contentHtml);
            $this->sendHtmlEmail($to, $subject, $html);
        } catch (\Throwable $e) {
            Log::error('[property-mail] failed', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function landlordEmail(Request $request): ?string
    {
        return $request->user()?->email ?: null;
    }

    private function computeDiffLines(array $old, array $new): string
    {
        $keys = [
            'name', 'address', 'city', 'status', 'type', 'reference_code',
            'rooms', 'surface', 'floor', 'description'
        ];

        $lines = [];
        foreach ($keys as $k) {
            if (!array_key_exists($k, $new)) continue;

            $before = $old[$k] ?? null;
            $after  = $new[$k] ?? null;

            if (is_string($before)) $before = trim($before);
            if (is_string($after))  $after  = trim($after);

            if ($before === $after) continue;

            $label = ucfirst(str_replace('_', ' ', $k));
            $lines[] = "<li style=\"margin:6px 0;\"><strong>" . e($label) . " :</strong> "
                . "<span style=\"color:#6b7280;\">" . e((string)($before ?? '—')) . "</span>"
                . " → <span style=\"color:#111827;font-weight:700;\">" . e((string)($after ?? '—')) . "</span>"
                . "</li>";
        }

        if (empty($lines)) {
            return '<div style="font-size:13px;color:#6b7280;">(Aucun changement détecté sur les champs principaux.)</div>';
        }

        return '<ul style="margin:10px 0 0 18px;padding:0;font-size:13px;color:#374151;line-height:1.6;">' . implode('', $lines) . '</ul>';
    }

    // ✅ Nouvelle méthode pour résoudre les URLs des photos
    private function getPhotoUrls(Property $property): array
    {
        $photos = $property->photos ?? [];
        $urls = [];

        foreach ($photos as $photo) {
            if (empty($photo)) continue;

            // Si c'est déjà une URL complète
            if (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')) {
                $urls[] = $photo;
            }
            // Si c'est un chemin relatif
            else {
                // Nettoyer le chemin
                $cleanPath = str_replace('\\', '/', $photo);
                $cleanPath = ltrim($cleanPath, '/');

                // Vérifier si le fichier existe
                if (Storage::disk('public')->exists($cleanPath)) {
                    $urls[] = Storage::disk('public')->url($cleanPath);
                } else {
                    Log::warning('Photo not found in storage', ['path' => $cleanPath, 'property_id' => $property->id]);
                }
            }
        }

        return $urls;
    }

    /* =========================
     * Actions
     * ========================= */

    /**
     * GET /api/properties
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $properties = Property::latest()->paginate(20);
            // Ajouter les URLs des photos
            $properties->getCollection()->transform(function ($property) {
                $property->photo_urls = $this->getPhotoUrls($property);
                return $property;
            });
            return response()->json($properties);
        }

        if ($user->isLandlord()) {
            $landlord = $user->landlord;

            if (! $landlord) {
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ]);
            }

            $properties = $landlord->properties()->latest()->paginate(20);
            // Ajouter les URLs des photos
            $properties->getCollection()->transform(function ($property) {
                $property->photo_urls = $this->getPhotoUrls($property);
                return $property;
            });
            return response()->json($properties);
        }

        // ✅ Vérifier si c'est un co-owner
        if ($user->isCoOwner()) {
            $coOwner = CoOwner::where('user_id', $user->id)->first();

            if (!$coOwner) {
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ]);
            }

            // Récupérer les propriétés via les délégations
            $propertyIds = $coOwner->delegations()->pluck('property_id')->toArray();

            if (empty($propertyIds)) {
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ]);
            }

            $properties = Property::whereIn('id', $propertyIds)->latest()->paginate(20);
            // Ajouter les URLs des photos
            $properties->getCollection()->transform(function ($property) {
                $property->photo_urls = $this->getPhotoUrls($property);
                return $property;
            });
            return response()->json($properties);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    /**
     * POST /api/properties
     */
    public function store(StorePropertyRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (! $landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        $data = $request->validated();

        // Gestion des photos
        if (isset($data['photos']) && is_array($data['photos'])) {
            // S'assurer que ce sont des chemins valides
            $data['photos'] = array_filter($data['photos'], function($photo) {
                return !empty($photo);
            });
        }

        // Sécurité serveur
        $data['landlord_id'] = $landlord->id;
        $data['user_id'] = $user->id;

        $property = Property::create($data);

        // ✅ Ajouter les URLs des photos à la réponse
        $property->photo_urls = $this->getPhotoUrls($property);

        // ✅ Mail confirmation au bailleur
        $to = $this->landlordEmail($request);
        if ($to) {
            $ref = $this->propertyRef($property);
            $title = 'Bien créé avec succès ✅';
            $subject = "✅ Bien créé : {$ref}";

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre bien a été créé avec succès et est maintenant disponible dans votre espace.
</div>
<div style="height:14px"></div>
{$this->propertyCardHtml($property)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir le dashboard', $this->frontendUrl())}
HTML;

            $this->trySendPropertyMail($to, $subject, $title, $ref, $content);
        } else {
            Log::warning('[property-mail] landlord email missing', ['property_id' => $property->id]);
        }

        return response()->json($property, 201);
    }

    /**
     * GET /api/properties/{id}
     */
    public function show(Request $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $user = $request->user();

        // Vérifier les permissions
        $canView = false;

        if ($user->isAdmin()) {
            $canView = true;
        } elseif ($user->isLandlord()) {
            if ($user->landlord && $property->landlord_id === $user->landlord->id) {
                $canView = true;
            }
        } elseif ($user->isCoOwner()) {
            $coOwner = CoOwner::where('user_id', $user->id)->first();
            if ($coOwner) {
                // Vérifier si ce co-owner a une délégation pour cette propriété
                $hasDelegation = $coOwner->delegations()
                    ->where('property_id', $property->id)
                    ->exists();
                $canView = $hasDelegation;
            }
        }

        if (!$canView) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // ✅ Ajouter les URLs des photos à la réponse
        $property->photo_urls = $this->getPhotoUrls($property);

        return response()->json($property);
    }

    /**
     * PUT /api/properties/{id}
     */
    public function update(StorePropertyRequest $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $user = $request->user();

        // Vérifier les permissions
        $canUpdate = false;

        if ($user->isAdmin()) {
            $canUpdate = true;
        } elseif ($user->isLandlord()) {
            if ($user->landlord && $property->landlord_id === $user->landlord->id) {
                $canUpdate = true;
            }
        } elseif ($user->isCoOwner()) {
            $coOwner = CoOwner::where('user_id', $user->id)->first();
            if ($coOwner) {
                // ✅ CORRECTION IMPORTANTE: Vérifier le co_owner_type dans la table delegations
                $delegation = Delegation::where('co_owner_id', $coOwner->id)
                    ->where('property_id', $property->id)
                    ->first();

                // Si c'est une agence (co_owner_type = "agency" dans la délégation) : lecture seule
                if ($delegation && $delegation->co_owner_type === 'agency') {
                    return response()->json(['message' => 'Forbidden - Les agences ont uniquement un accès en lecture'], 403);
                }

                // Vérifier si ce co-owner a une délégation pour cette propriété
                $hasDelegation = $coOwner->delegations()
                    ->where('property_id', $property->id)
                    ->exists();
                $canUpdate = $hasDelegation;
            }
        }

        if (!$canUpdate) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $before = $property->toArray();

        $data = $request->validated();

        // Gestion des photos
        if (isset($data['photos']) && is_array($data['photos'])) {
            // S'assurer que ce sont des chemins valides
            $data['photos'] = array_filter($data['photos'], function($photo) {
                return !empty($photo);
            });
        }

        // 🔒 Protection anti-mass assignment
        unset($data['landlord_id'], $data['user_id']);

        $property->update($data);

        $propertyFresh = $property->fresh();
        $after = $propertyFresh->toArray();

        // ✅ Ajouter les URLs des photos à la réponse
        $propertyFresh->photo_urls = $this->getPhotoUrls($propertyFresh);

        // ✅ Mail modification au bailleur
        $to = $this->landlordEmail($request);
        if ($to) {
            $ref = $this->propertyRef($propertyFresh);
            $title = 'Bien mis à jour ✨';
            $subject = "✨ Bien mis à jour : {$ref}";

            $diffHtml = $this->computeDiffLines($before, $after);

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Les informations de votre bien ont été mises à jour.
</div>
<div style="height:14px"></div>
{$this->propertyCardHtml($propertyFresh)}
<div style="height:14px"></div>
<div style="font-size:14px;font-weight:800;color:#111827;">Changements</div>
{$diffHtml}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir le dashboard', $this->frontendUrl())}
HTML;

            $this->trySendPropertyMail($to, $subject, $title, $ref, $content);
        } else {
            Log::warning('[property-mail] landlord email missing', ['property_id' => $propertyFresh->id]);
        }

        return response()->json($propertyFresh);
    }

    /**
     * DELETE /api/properties/{id}
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $user = $request->user();

        if (! $user->isAdmin()) {
            if (! $user->isLandlord()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            if (! $user->landlord || $property->landlord_id !== $user->landlord->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        // snapshot pour l'email
        $propertySnapshot = clone $property;

        $property->delete();

        // ✅ Mail suppression au bailleur
        $to = $this->landlordEmail($request);
        if ($to) {
            $ref = $this->propertyRef($propertySnapshot);
            $title = 'Bien supprimé 🗑️';
            $subject = "🗑️ Bien supprimé : {$ref}";

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre bien a été supprimé avec succès.
</div>
<div style="height:14px"></div>
{$this->propertyCardHtml($propertySnapshot)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir le dashboard', $this->frontendUrl())}
HTML;

            $this->trySendPropertyMail($to, $subject, $title, $ref, $content);
        } else {
            Log::warning('[property-mail] landlord email missing', ['property_id' => $propertySnapshot->id]);
        }

        return response()->json(['message' => 'Property deleted']);
    }
}
