<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Préavis - Co-propriétaire</title>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
        :root {
            --gradA: #667eea;
            --gradB: #764ba2;
            --indigo: #4f46e5;
            --violet: #7c3aed;
            --emerald: #10b981;
            --ink: #0f172a;
            --muted: #64748b;
            --line: rgba(15,23,42,.10);
            --shadow: 0 22px 70px rgba(0,0,0,.18);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; }

        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%); padding: 2.5rem; border-radius: 22px; color: white; margin-bottom: 2rem; }
        .header h1 { font-size: 2rem; font-weight: 900; display: flex; align-items: center; gap: 0.75rem; }
        .header p { opacity: 0.9; font-weight: 650; font-size: 0.95rem; }

        .actions { display: flex; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .button { padding: 0.9rem 1.35rem; border-radius: 14px; font-weight: 950; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; border: none; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .button-primary { background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%); color: #fff; box-shadow: 0 14px 30px rgba(79,70,229,.22); }
        .button-primary:hover { transform: translateY(-1px); box-shadow: 0 18px 34px rgba(79,70,229,.28); }
        .button-secondary { background: rgba(255,255,255,.92); color: #4338ca; border: 2px solid rgba(67,56,202,.20); }
        .button-secondary:hover { background: rgba(67,56,202,.06); }

        .alert { border-radius: 14px; padding: 1.25rem; margin-bottom: 1.5rem; border: 1px solid; font-weight: 850; display: flex; align-items: flex-start; gap: 10px; }
        .alert-success { background: rgba(240,253,244,.92); border-color: rgba(74,222,128,.30); color: #166534; }
        .alert-error { background: rgba(254,242,242,.92); border-color: rgba(248,113,113,.30); color: #991b1b; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { background: rgba(255,255,255,.95); border: 2px solid rgba(102,126,234,.15); border-radius: 16px; padding: 1.75rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,.05); }
        .stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-icon.blue { background: rgba(59,130,246,.15); color: #1d4ed8; }
        .stat-info { flex: 1; }
        .stat-value { font-size: 1.8rem; font-weight: 950; color: var(--ink); line-height: 1; margin-bottom: 0.25rem; }
        .stat-label { font-size: 0.9rem; font-weight: 850; color: var(--muted); }

        .notices-list { display: grid; gap: 1rem; }
        .notice-card { background: rgba(255,255,255,.95); border: 2px solid rgba(148,163,184,.15); border-radius: 16px; padding: 1.5rem; display: grid; grid-template-columns: 2fr 1fr auto; gap: 1rem; align-items: center; transition: all 0.3s ease; }
        @media (max-width: 768px) { .notice-card { grid-template-columns: 1fr; } }
        .notice-card:hover { border-color: rgba(102,126,234,.35); box-shadow: 0 10px 30px rgba(102,126,234,.15); transform: translateY(-2px); }
        .notice-info { display: flex; flex-direction: column; gap: 0.5rem; }
        .notice-title { font-size: 1.1rem; font-weight: 950; color: var(--ink); display: flex; align-items: center; gap: 0.5rem; }
        .notice-meta { display: flex; gap: 1rem; font-size: 0.85rem; color: var(--muted); font-weight: 650; flex-wrap: wrap; }
        .notice-meta-item { display: flex; align-items: center; gap: 0.25rem; }
        .notice-actions { display: flex; gap: 0.5rem; }

        .empty-state { text-align: center; padding: 3rem; border: 2px dashed rgba(148,163,184,.35); border-radius: 16px; background: rgba(255,255,255,.72); }
        .empty-state-icon { margin: 0 auto 1rem; width: 64px; height: 64px; color: #94a3b8; }
        .empty-state-title { font-size: 1.1rem; font-weight: 950; color: #475569; margin-bottom: 0.5rem; }
        .empty-state-text { color: #64748b; font-weight: 650; margin-bottom: 1.5rem; }

        .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 850; }
        .badge-pending { background: rgba(245,158,11,.15); color: #92400e; border: 1px solid rgba(245,158,11,.25); }
        .badge-confirmed { background: rgba(34,197,94,.15); color: #166534; border: 1px solid rgba(34,197,94,.25); }
        .badge-cancelled { background: rgba(148,163,184,.15); color: #475569; border: 1px solid rgba(148,163,184,.25); }

        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }
        .modal.active { display: flex; }
        .modal-content { background: white; border-radius: 16px; padding: 2rem; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i data-lucide="bell"></i> Gestion des préavis</h1>
            <p>Gérez les préavis de départ pour les biens qui vous sont délégués</p>
        </div>

        <div class="actions">
            <button onclick="history.back()" class="button button-secondary">
                <i data-lucide="arrow-left"></i> Retour
            </button>
            <a href="{{ route('co-owner.notices.create') }}" class="button button-primary">
                <i data-lucide="plus"></i> Nouveau préavis
            </a>
        </div>

        @if(session('error'))
            <div class="alert alert-error">
                <i data-lucide="alert-circle"></i>
                <div>
                    <strong>Erreur</strong>
                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('error') }}</p>
                </div>
            </div>
        @endif

        @if(session('success'))
            <div class="alert alert-success">
                <i data-lucide="check-circle"></i>
                <div>
                    <strong>Succès</strong>
                    <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('success') }}</p>
                </div>
            </div>
        @endif

        <!-- Statistiques -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue"><i data-lucide="bell"></i></div>
                <div class="stat-info">
                    <div class="stat-value">{{ $notices->count() }}</div>
                    <div class="stat-label">Préavis</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue"><i data-lucide="clock"></i></div>
                <div class="stat-info">
                    <div class="stat-value">{{ $notices->where('status', 'pending')->count() }}</div>
                    <div class="stat-label">En attente</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue"><i data-lucide="home"></i></div>
                <div class="stat-info">
                    <div class="stat-value">{{ $leases->count() }}</div>
                    <div class="stat-label">Baux actifs</div>
                </div>
            </div>
        </div>

        <!-- Liste des préavis -->
        @if($notices->isEmpty())
            <div class="empty-state">
                <i data-lucide="bell" class="empty-state-icon"></i>
                <h3 class="empty-state-title">Aucun préavis</h3>
                <p class="empty-state-text">Créez votre premier préavis en cliquant sur "Nouveau préavis".</p>
            </div>
        @else
            <div class="notices-list">
                @foreach($notices as $notice)
                    <div class="notice-card">
                        <div class="notice-info">
                            <div class="notice-title">
                                <i data-lucide="home"></i>
                                {{ $notice->property->name ?? 'Bien sans nom' }}
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
                            <div class="notice-meta">
                                <span class="notice-meta-item">
                                    <i data-lucide="user"></i>
                                    {{ $notice->tenant->user->name ?? 'Locataire' }}
                                </span>
                                <span class="notice-meta-item">
                                    <i data-lucide="calendar"></i>
                                    Départ le {{ \Carbon\Carbon::parse($notice->end_date)->format('d/m/Y') }}
                                </span>
                                <span class="notice-meta-item">
                                    <i data-lucide="file-text"></i>
                                    {{ $notice->type == 'landlord' ? 'Bailleur' : 'Locataire' }}
                                </span>
                            </div>
                        </div>
                        <div class="notice-meta">
                            <div><strong>Motif:</strong> {{ Str::limit($notice->reason, 50) }}</div>
                        </div>
                        <div class="notice-actions">
                            <a href="{{ route('co-owner.notices.show', $notice) }}" class="button button-secondary">
                                <i data-lucide="eye"></i> Voir
                            </a>
                            <form action="{{ route('co-owner.notices.destroy', $notice) }}" method="POST" onsubmit="return confirm('Supprimer ce préavis ?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="button" style="background: rgba(239,68,68,.10); color: #dc2626; border: 2px solid rgba(239,68,68,.20);">
                                    <i data-lucide="trash-2"></i> Supprimer
                                </button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </div>

    <script>
        lucide.createIcons();

        function navigateTo(path) {
            const token = localStorage.getItem('token') || new URLSearchParams(window.location.search).get('api_token');
            if (!token) {
                alert('Session expirée');
                window.location.href = 'http://localhost:8000/login';
                return;
            }
            window.location.href = `http://localhost:8000${path}?api_token=${token}`;
        }
    </script>
</body>
</html>
