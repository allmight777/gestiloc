<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Détails du préavis - Co-propriétaire</title>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
        :root {
            --gradA: #667eea;
            --gradB: #764ba2;
            --indigo: #4f46e5;
            --violet: #7c3aed;
            --emerald: #10b981;
            --red: #ef4444;
            --ink: #0f172a;
            --muted: #64748b;
            --line: rgba(15,23,42,.10);
            --shadow: 0 22px 70px rgba(0,0,0,.18);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; }

        .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
        .header { background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%); padding: 2.5rem; border-radius: 22px; color: white; margin-bottom: 2rem; }
        .header h1 { font-size: 2rem; font-weight: 900; display: flex; align-items: center; gap: 0.75rem; }
        .header p { opacity: 0.9; font-weight: 650; font-size: 0.95rem; }

        .actions { display: flex; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .button { padding: 0.9rem 1.35rem; border-radius: 14px; font-weight: 950; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; border: none; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .button-primary { background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%); color: #fff; box-shadow: 0 14px 30px rgba(79,70,229,.22); }
        .button-primary:hover { transform: translateY(-1px); box-shadow: 0 18px 34px rgba(79,70,229,.28); }
        .button-secondary { background: rgba(255,255,255,.92); color: #4338ca; border: 2px solid rgba(67,56,202,.20); }
        .button-secondary:hover { background: rgba(67,56,202,.06); }
        .button-danger { background: rgba(239,68,68,.10); color: var(--red); border: 2px solid rgba(239,68,68,.20); }
        .button-danger:hover { background: rgba(239,68,68,.15); }

        .alert { border-radius: 14px; padding: 1.25rem; margin-bottom: 1.5rem; border: 1px solid; font-weight: 850; display: flex; align-items: flex-start; gap: 10px; }
        .alert-success { background: rgba(240,253,244,.92); border-color: rgba(74,222,128,.30); color: #166534; }
        .alert-error { background: rgba(254,242,242,.92); border-color: rgba(248,113,113,.30); color: #991b1b; }

        .notice-card { background: white; border-radius: 18px; padding: 2rem; border: 2px solid rgba(102,126,234,.15); box-shadow: 0 12px 40px rgba(0,0,0,.08); margin-bottom: 2rem; }
        .notice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .notice-title { font-size: 1.5rem; font-weight: 950; color: var(--ink); }
        .notice-ref { font-size: 0.9rem; color: var(--muted); font-weight: 850; }

        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .info-section h3 { font-size: 1rem; font-weight: 950; color: var(--indigo); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .info-item { margin-bottom: 1rem; }
        .info-label { font-size: 0.85rem; font-weight: 850; color: var(--muted); margin-bottom: 0.25rem; }
        .info-value { font-size: 1rem; font-weight: 700; color: var(--ink); }

        .badge { padding: 0.4rem 1rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 850; display: inline-flex; align-items: center; gap: 0.5rem; }
        .badge-pending { background: rgba(245,158,11,.15); color: #92400e; border: 1px solid rgba(245,158,11,.25); }
        .badge-confirmed { background: rgba(34,197,94,.15); color: #166534; border: 1px solid rgba(34,197,94,.25); }
        .badge-cancelled { background: rgba(148,163,184,.15); color: #475569; border: 1px solid rgba(148,163,184,.25); }

        .status-actions { display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; }
        .status-form { display: inline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i data-lucide="file-text"></i> Détails du préavis</h1>
            <p>Préavis #NOTICE-{{ str_pad($notice->id, 6, '0', STR_PAD_LEFT) }}</p>
        </div>

        <div class="actions">
            <a href="{{ route('co-owner.notices.index') }}" class="button button-secondary">
                <i data-lucide="arrow-left"></i> Retour à la liste
            </a>
            <div style="display: flex; gap: 0.5rem;">
                <a href="{{ route('co-owner.notices.edit', $notice) }}" class="button button-secondary">
                    <i data-lucide="edit"></i> Modifier
                </a>
                <form action="{{ route('co-owner.notices.destroy', $notice) }}" method="POST" onsubmit="return confirm('Supprimer définitivement ce préavis ?');" style="display: inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="button button-danger">
                        <i data-lucide="trash-2"></i> Supprimer
                    </button>
                </form>
            </div>
        </div>

        @if(session('success'))
            <div class="alert alert-success">
                <i data-lucide="check-circle"></i>
                <div>
                    <strong>Succès</strong>
                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('success') }}</p>
                </div>
            </div>
        @endif

        @if(session('error'))
            <div class="alert alert-error">
                <i data-lucide="alert-circle"></i>
                <div>
                    <strong>Erreur</strong>
                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('error') }}</p>
                </div>
            </div>
        @endif

        <div class="notice-card">
            <div class="notice-header">
                <div>
                    <div class="notice-title">{{ $notice->property->address ?? 'Bien sans nom' }}</div>
                    <div class="notice-ref">Référence : NOTICE-{{ str_pad($notice->id, 6, '0', STR_PAD_LEFT) }}</div>
                </div>
                <span class="badge badge-{{ $notice->status }}">
                    @if($notice->status == 'pending')
                        <i data-lucide="clock"></i> En attente
                    @elseif($notice->status == 'confirmed')
                        <i data-lucide="check-circle"></i> Confirmé
                    @else
                        <i data-lucide="x-circle"></i> Annulé
                    @endif
                </span>
            </div>

            <div class="info-grid">
                <!-- Informations générales -->
                <div class="info-section">
                    <h3><i data-lucide="info"></i> Informations générales</h3>
                    <div class="info-item">
                        <div class="info-label">Type de préavis</div>
                        <div class="info-value">
                            @if($notice->type == 'landlord')
                                <i data-lucide="home"></i> Préavis bailleur
                            @else
                                <i data-lucide="user"></i> Préavis locataire
                            @endif
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date du préavis</div>
                        <div class="info-value">
                            <i data-lucide="calendar"></i> {{ \Carbon\Carbon::parse($notice->notice_date)->format('d/m/Y') }}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date de fin</div>
                        <div class="info-value">
                            <i data-lucide="calendar"></i> {{ \Carbon\Carbon::parse($notice->end_date)->format('d/m/Y') }}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Créé le</div>
                        <div class="info-value">
                            <i data-lucide="clock"></i> {{ $notice->created_at->format('d/m/Y H:i') }}
                        </div>
                    </div>
                </div>

                <!-- Informations du bien -->
                <div class="info-section">
                    <h3><i data-lucide="home"></i> Informations du bien</h3>
                    <div class="info-item">
                        <div class="info-label">Adresse</div>
                        <div class="info-value">{{ $notice->property->address ?? 'Non spécifié' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Ville</div>
                        <div class="info-value">{{ $notice->property->city ?? 'Non spécifié' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Code postal</div>
                        <div class="info-value">{{ $notice->property->postal_code ?? 'Non spécifié' }}</div>
                    </div>
                </div>

                <!-- Informations du locataire -->
                <div class="info-section">
                    <h3><i data-lucide="user"></i> Locataire concerné</h3>
                    <div class="info-item">
                        <div class="info-label">Nom</div>
                        <div class="info-value">{{ $notice->tenant->user->name ?? 'Non spécifié' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">{{ $notice->tenant->user->email ?? 'Non spécifié' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Téléphone</div>
                        <div class="info-value">{{ $notice->tenant->phone ?? 'Non spécifié' }}</div>
                    </div>
                </div>

                <!-- Propriétaire principal -->
                <div class="info-section">
                    <h3><i data-lucide="shield"></i> Propriétaire principal</h3>
                    <div class="info-item">
                        <div class="info-label">Nom</div>
                        <div class="info-value">{{ $notice->landlord->name ?? 'Non spécifié' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">{{ $notice->landlord->email ?? 'Non spécifié' }}</div>
                    </div>
                </div>
            </div>

            <!-- Motif -->
            <div style="margin-top: 2rem;">
                <h3 style="font-size: 1rem; font-weight: 950; color: var(--indigo); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="message-square"></i> Motif du préavis
                </h3>
                <div style="background: rgba(102,126,234,.05); border-radius: 12px; padding: 1.25rem; border: 1px solid rgba(102,126,234,.15);">
                    <div style="font-size: 0.95rem; line-height: 1.6; color: var(--ink); white-space: pre-line;">{{ $notice->reason }}</div>
                </div>
            </div>

            <!-- Notes -->
            @if($notice->notes)
                <div style="margin-top: 2rem;">
                    <h3 style="font-size: 1rem; font-weight: 950; color: var(--indigo); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="file-text"></i> Notes additionnelles
                    </h3>
                    <div style="background: rgba(148,163,184,.05); border-radius: 12px; padding: 1.25rem; border: 1px solid rgba(148,163,184,.15);">
                        <div style="font-size: 0.95rem; line-height: 1.6; color: var(--ink); white-space: pre-line;">{{ $notice->notes }}</div>
                    </div>
                </div>
            @endif

            <!-- Actions sur le statut -->
            @if($notice->status == 'pending')
                <div style="margin-top: 2.5rem; padding-top: 2rem; border-top: 2px solid rgba(148,163,184,.15);">
                    <h3 style="font-size: 1rem; font-weight: 950; color: var(--indigo); margin-bottom: 1rem;">
                        <i data-lucide="settings"></i> Gérer le statut
                    </h3>
                    <div class="status-actions">
                        <form action="{{ route('co-owner.notices.update-status', $notice) }}" method="POST" class="status-form">
                            @csrf
                            <input type="hidden" name="status" value="confirmed">
                            <button type="submit" class="button button-primary" onclick="return confirm('Confirmer ce préavis ?')">
                                <i data-lucide="check-circle"></i> Confirmer le préavis
                            </button>
                        </form>
                        <form action="{{ route('co-owner.notices.update-status', $notice) }}" method="POST" class="status-form">
                            @csrf
                            <input type="hidden" name="status" value="cancelled">
                            <button type="submit" class="button button-danger" onclick="return confirm('Annuler ce préavis ?')">
                                <i data-lucide="x-circle"></i> Annuler le préavis
                            </button>
                        </form>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>
