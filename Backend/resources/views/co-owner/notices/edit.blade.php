<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modifier le préavis - Co-propriétaire</title>
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

        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
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

        .form-card { background: white; border-radius: 18px; padding: 2rem; border: 2px solid rgba(102,126,234,.15); box-shadow: 0 12px 40px rgba(0,0,0,.08); }
        .form-group { margin-bottom: 1.5rem; }
        .form-label { display: block; font-size: 0.9rem; font-weight: 950; color: var(--ink); margin-bottom: 0.5rem; }
        .form-control { width: 100%; padding: 0.9rem 1rem; border-radius: 12px; border: 2px solid rgba(148,163,184,.25); font-size: 0.95rem; transition: all 0.2s ease; background: rgba(255,255,255,.92); }
        .form-control:focus { outline: none; border-color: var(--indigo); box-shadow: 0 0 0 3px rgba(79,70,229,.15); }
        .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 16px; padding-right: 2.5rem; }
        .form-textarea { min-height: 120px; resize: vertical; }

        .notice-info { background: rgba(102,126,234,.08); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.5rem; border: 2px solid rgba(102,126,234,.20); }
        .notice-info h3 { font-size: 1rem; font-weight: 950; color: var(--indigo); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .notice-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 0.75rem; }
        .detail-item { font-size: 0.9rem; }
        .detail-label { font-weight: 850; color: var(--muted); }
        .detail-value { color: var(--ink); font-weight: 700; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i data-lucide="edit"></i> Modifier le préavis</h1>
            <p>Préavis #NOTICE-{{ str_pad($notice->id, 6, '0', STR_PAD_LEFT) }}</p>
        </div>

        <div class="actions">
            <a href="{{ route('co-owner.notices.show', $notice) }}" class="button button-secondary">
                <i data-lucide="arrow-left"></i> Retour au détail
            </a>
        </div>

        @if($errors->any())
            <div class="alert alert-error">
                <i data-lucide="alert-circle"></i>
                <div>
                    <strong>Erreurs de validation</strong>
                    <ul style="margin-top: 8px; padding-left: 1rem; font-weight: 650; font-size: 0.9rem;">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            </div>
        @endif

        <!-- Informations non modifiables -->
        <div class="notice-info">
            <h3><i data-lucide="info"></i> Informations du préavis</h3>
            <div class="notice-details">
                <div class="detail-item">
                    <div class="detail-label">Bien</div>
                    <div class="detail-value">{{ $notice->property->address ?? 'Non spécifié' }}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Locataire</div>
                    <div class="detail-value">{{ $notice->tenant->user->name ?? 'Non spécifié' }}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Statut</div>
                    <div class="detail-value">
                        @if($notice->status == 'pending')
                            <span style="color: #92400e;"><i data-lucide="clock"></i> En attente</span>
                        @elseif($notice->status == 'confirmed')
                            <span style="color: #166534;"><i data-lucide="check-circle"></i> Confirmé</span>
                        @else
                            <span style="color: #475569;"><i data-lucide="x-circle"></i> Annulé</span>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <form method="POST" action="{{ route('co-owner.notices.update', $notice) }}" class="form-card">
            @csrf
            @method('PUT')

            <!-- Type de préavis -->
            <div class="form-group">
                <label class="form-label">
                    <i data-lucide="user"></i> Type de préavis *
                </label>
                <select name="type" class="form-control form-select" required>
                    <option value="landlord" {{ old('type', $notice->type) == 'landlord' ? 'selected' : '' }}>Préavis bailleur</option>
                    <option value="tenant" {{ old('type', $notice->type) == 'tenant' ? 'selected' : '' }}>Préavis locataire</option>
                </select>
            </div>

            <!-- Dates -->
            <div class="form-group">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label class="form-label">
                            <i data-lucide="calendar"></i> Date du préavis *
                        </label>
                        <input type="date" name="notice_date" class="form-control"
                               value="{{ old('notice_date', $notice->notice_date->format('Y-m-d')) }}" required>
                    </div>
                    <div>
                        <label class="form-label">
                            <i data-lucide="calendar"></i> Date de fin *
                        </label>
                        <input type="date" name="end_date" class="form-control"
                               value="{{ old('end_date', $notice->end_date->format('Y-m-d')) }}" required>
                    </div>
                </div>
            </div>

            <!-- Motif -->
            <div class="form-group">
                <label class="form-label">
                    <i data-lucide="message-square"></i> Motif *
                </label>
                <textarea name="reason" class="form-control form-textarea"
                          placeholder="Détaillez le motif du préavis..." required>{{ old('reason', $notice->reason) }}</textarea>
            </div>

            <!-- Notes -->
            <div class="form-group">
                <label class="form-label">
                    <i data-lucide="file-text"></i> Notes additionnelles
                </label>
                <textarea name="notes" class="form-control form-textarea"
                          placeholder="Informations complémentaires...">{{ old('notes', $notice->notes) }}</textarea>
            </div>

            <!-- Boutons -->
            <div class="form-group" style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button type="submit" class="button button-primary">
                    <i data-lucide="save"></i> Enregistrer les modifications
                </button>
                <a href="{{ route('co-owner.notices.show', $notice) }}" class="button button-secondary">
                    <i data-lucide="x"></i> Annuler
                </a>
            </div>
        </form>
    </div>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>
