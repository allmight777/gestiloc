<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Créer un préavis - Co-propriétaire</title>
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

        .lease-info { background: rgba(102,126,234,.08); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.5rem; border: 2px solid rgba(102,126,234,.20); }
        .lease-info h3 { font-size: 1rem; font-weight: 950; color: var(--indigo); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .lease-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 0.75rem; }
        .detail-item { font-size: 0.9rem; }
        .detail-label { font-weight: 850; color: var(--muted); }
        .detail-value { color: var(--ink); font-weight: 700; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i data-lucide="file-plus"></i> Créer un préavis</h1>
            <p>Créez un préavis de départ pour un locataire</p>
        </div>

        <div class="actions">
            <a href="{{ route('co-owner.notices.index') }}" class="button button-secondary">
                <i data-lucide="arrow-left"></i> Retour à la liste
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

        <form method="POST" action="{{ route('co-owner.notices.store') }}" class="form-card">
            @csrf

            <!-- Sélection du bail -->
            <div class="form-group">
                <label class="form-label">
                    <i data-lucide="file-text"></i> Bail concerné *
                </label>
                <select name="lease_id" id="leaseSelect" class="form-control form-select" required onchange="updateLeaseInfo(this.value)">
                    <option value="">Sélectionnez un bail</option>
                    @foreach($leases as $lease)
                        <option value="{{ $lease->id }}" data-lease="{{ json_encode($lease->toArray()) }}">
                            {{ $lease->property->address ?? 'Bien sans nom' }} - {{ $lease->tenant->user->name ?? 'Locataire' }}
                        </option>
                    @endforeach
                </select>
            </div>

            <!-- Informations du bail sélectionné -->
            <div id="leaseInfo" class="lease-info" style="display: none;">
                <h3><i data-lucide="info"></i> Informations du bail</h3>
                <div id="leaseDetails" class="lease-details"></div>
            </div>

            <!-- Type de préavis -->
            <div class="form-group">
                <label class="form-label">
                    <i data-lucide="user"></i> Type de préavis *
                </label>
                <select name="type" class="form-control form-select" required>
                    <option value="">Sélectionnez le type</option>
                    <option value="landlord">Préavis bailleur</option>
                    <option value="tenant">Préavis locataire</option>
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
                               value="{{ old('notice_date', date('Y-m-d')) }}" required>
                    </div>
                    <div>
                        <label class="form-label">
                            <i data-lucide="calendar"></i> Date de fin *
                        </label>
                        <input type="date" name="end_date" class="form-control"
                               value="{{ old('end_date', date('Y-m-d', strtotime('+3 months'))) }}" required>
                    </div>
                </div>
            </div>

            <!-- Motif -->
            <div class="form-group">
                <label class="form-label">
                    <i data-lucide="message-square"></i> Motif *
                </label>
                <textarea name="reason" class="form-control form-textarea"
                          placeholder="Détaillez le motif du préavis..." required>{{ old('reason') }}</textarea>
            </div>

            <!-- Notes -->
            <div class="form-group">
                <label class="form-label">
                    <i data-lucide="file-text"></i> Notes additionnelles
                </label>
                <textarea name="notes" class="form-control form-textarea"
                          placeholder="Informations complémentaires...">{{ old('notes') }}</textarea>
            </div>

            <!-- Boutons -->
            <div class="form-group" style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button type="submit" class="button button-primary">
                    <i data-lucide="check"></i> Créer le préavis
                </button>
                <a href="{{ route('co-owner.notices.index') }}" class="button button-secondary">
                    <i data-lucide="x"></i> Annuler
                </a>
            </div>
        </form>
    </div>

    <script>
        lucide.createIcons();

        const leases = @json($leases->keyBy('id')->toArray());

        function updateLeaseInfo(leaseId) {
            const infoDiv = document.getElementById('leaseInfo');
            const detailsDiv = document.getElementById('leaseDetails');

            if (!leaseId) {
                infoDiv.style.display = 'none';
                return;
            }

            const lease = leases[leaseId];
            if (!lease) {
                infoDiv.style.display = 'none';
                return;
            }

            detailsDiv.innerHTML = `
                <div class="detail-item">
                    <div class="detail-label">Bien</div>
                    <div class="detail-value">${lease.property?.address || 'Non spécifié'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Locataire</div>
                    <div class="detail-value">${lease.tenant?.user?.name || 'Non spécifié'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Loyer mensuel</div>
                    <div class="detail-value">${lease.monthly_rent ? lease.monthly_rent + ' €' : 'Non spécifié'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Début du bail</div>
                    <div class="detail-value">${lease.start_date || 'Non spécifié'}</div>
                </div>
            `;

            infoDiv.style.display = 'block';
        }

        // Initialiser avec la valeur précédente
        document.addEventListener('DOMContentLoaded', function() {
            const selectedLeaseId = document.querySelector('select[name="lease_id"]').value;
            if (selectedLeaseId) {
                updateLeaseInfo(selectedLeaseId);
            }
        });
    </script>
</body>
</html>
