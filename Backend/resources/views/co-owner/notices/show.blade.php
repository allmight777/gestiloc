@extends('layouts.co-owner')

@section('title', 'Détails du préavis - Co-propriétaire')

@section('content')
<div class="content-container">
    <div class="content-card">
        <div class="content-header">
            <h1>
                <i data-lucide="file-text" style="width: 32px; height: 32px;"></i>
                Détails du préavis
            </h1>
            <p>Préavis #NOTICE-{{ str_pad($notice->id, 6, '0', STR_PAD_LEFT) }}</p>
        </div>

        <div class="content-body">
            <div class="top-actions">
                <a href="{{ route('co-owner.notices.index') }}" class="button button-secondary">
                    <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
                    Retour à la liste
                </a>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="{{ route('co-owner.notices.edit', $notice) }}" class="button button-secondary">
                        <i data-lucide="edit" style="width: 16px; height: 16px;"></i>
                        Modifier
                    </a>
                    <form action="{{ route('co-owner.notices.destroy', $notice) }}" method="POST" onsubmit="return confirm('Supprimer définitivement ce préavis ?');" style="display: inline;">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="button button-danger">
                            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                            Supprimer
                        </button>
                    </form>
                </div>
            </div>

            @if(session('success'))
                <div class="alert-box alert-success">
                    <i data-lucide="check-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
                    <div>
                        <strong>Succès</strong>
                        <p style="margin-top: 4px; font-weight: 650; font-size: 0.9rem;">{{ session('success') }}</p>
                    </div>
                </div>
            @endif

            @if(session('error'))
                <div class="alert-box alert-error">
                    <i data-lucide="alert-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
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
                            <i data-lucide="clock" style="width: 14px; height: 14px;"></i> En attente
                        @elseif($notice->status == 'confirmed')
                            <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Confirmé
                        @else
                            <i data-lucide="x-circle" style="width: 14px; height: 14px;"></i> Annulé
                        @endif
                    </span>
                </div>

                <div class="info-grid">
                    <!-- Informations générales -->
                    <div class="info-section">
                        <h3><i data-lucide="info" style="width: 16px; height: 16px;"></i> Informations générales</h3>
                        <div class="info-item">
                            <div class="info-label">Type de préavis</div>
                            <div class="info-value">
                                @if($notice->type == 'landlord')
                                    <i data-lucide="home" style="width: 14px; height: 14px;"></i> Préavis bailleur
                                @else
                                    <i data-lucide="user" style="width: 14px; height: 14px;"></i> Préavis locataire
                                @endif
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Date du préavis</div>
                            <div class="info-value">
                                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i> {{ \Carbon\Carbon::parse($notice->notice_date)->format('d/m/Y') }}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Date de fin</div>
                            <div class="info-value">
                                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i> {{ \Carbon\Carbon::parse($notice->end_date)->format('d/m/Y') }}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Créé le</div>
                            <div class="info-value">
                                <i data-lucide="clock" style="width: 14px; height: 14px;"></i> {{ $notice->created_at->format('d/m/Y H:i') }}
                            </div>
                        </div>
                    </div>

                    <!-- Informations du bien -->
                    <div class="info-section">
                        <h3><i data-lucide="home" style="width: 16px; height: 16px;"></i> Informations du bien</h3>
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
                        <h3><i data-lucide="user" style="width: 16px; height: 16px;"></i> Locataire concerné</h3>
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
                        <h3><i data-lucide="shield" style="width: 16px; height: 16px;"></i> Propriétaire principal</h3>
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
                        <i data-lucide="message-square" style="width: 16px; height: 16px;"></i> Motif du préavis
                    </h3>
                    <div style="background: rgba(102,126,234,.05); border-radius: 12px; padding: 1.25rem; border: 1px solid rgba(102,126,234,.15);">
                        <div style="font-size: 0.95rem; line-height: 1.6; color: var(--ink); white-space: pre-line;">{{ $notice->reason }}</div>
                    </div>
                </div>

                <!-- Notes -->
                @if($notice->notes)
                    <div style="margin-top: 2rem;">
                        <h3 style="font-size: 1rem; font-weight: 950; color: var(--indigo); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="file-text" style="width: 16px; height: 16px;"></i> Notes additionnelles
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
                            <i data-lucide="settings" style="width: 16px; height: 16px;"></i> Gérer le statut
                        </h3>
                        <div class="status-actions">
                            <form action="{{ route('co-owner.notices.update-status', $notice) }}" method="POST" class="status-form">
                                @csrf
                                <input type="hidden" name="status" value="confirmed">
                                <button type="submit" class="button button-primary" onclick="return confirm('Confirmer ce préavis ?')">
                                    <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i> Confirmer le préavis
                                </button>
                            </form>
                            <form action="{{ route('co-owner.notices.update-status', $notice) }}" method="POST" class="status-form">
                                @csrf
                                <input type="hidden" name="status" value="cancelled">
                                <button type="submit" class="button button-danger" onclick="return confirm('Annuler ce préavis ?')">
                                    <i data-lucide="x-circle" style="width: 16px; height: 16px;"></i> Annuler le préavis
                                </button>
                            </form>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<style>
    /* Styles spécifiques à la page de détails du préavis */
    :root {
        --gradA: #667eea;
        --gradB: #764ba2;
        --indigo: #4f46e5;
        --violet: #7c3aed;
        --emerald: #10b981;
        --yellow: #f59e0b;
        --red: #ef4444;
        --ink: #0f172a;
        --muted: #64748b;
        --muted2: #94a3b8;
        --line: rgba(15,23,42,.10);
        --line2: rgba(15,23,42,.08);
        --shadow: 0 22px 70px rgba(0,0,0,.18);
    }

    .content-container {
        min-height: 100vh;
        background: #ffffff;
        padding: 2rem;
        position: relative;
    }

<<<<<<< HEAD
    .content-container::before {
        content: "";
        position: fixed;
        inset: 0;
        background:
            radial-gradient(900px 520px at 12% -8%, rgba(102,126,234,.16) 0%, rgba(102,126,234,0) 62%),
            radial-gradient(900px 520px at 92% 8%, rgba(118,75,162,.14) 0%, rgba(118,75,162,0) 64%),
            radial-gradient(700px 420px at 40% 110%, rgba(16,185,129,.10) 0%, rgba(16,185,129,0) 60%);
        pointer-events: none;
        z-index: -2;
    }
=======
            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }
>>>>>>> origin/main

    .content-card {
        max-width: 1500px;
        margin: 0 auto;
        background: rgba(255,255,255,.92);
        border-radius: 22px;
        box-shadow: var(--shadow);
        overflow: hidden;
        border: 1px solid rgba(102,126,234,.18);
        position: relative;
        backdrop-filter: blur(10px);
    }

    .content-header {
        background: linear-gradient(135deg, var(--gradA) 0%, var(--gradB) 100%);
        padding: 2.5rem;
        color: white;
        position: relative;
        overflow: hidden;
        z-index: 1;
    }

    .content-header h1 {
        font-size: 2rem;
        font-weight: 900;
        margin: 0 0 0.6rem 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        letter-spacing: -0.02em;
    }

    .content-header p {
        opacity: 0.9;
        font-weight: 650;
        font-size: 0.95rem;
    }

    .content-body {
        padding: 2.5rem;
        position: relative;
        z-index: 1;
    }

    .top-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .alert-box {
        border-radius: 14px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        border: 1px solid;
        font-weight: 850;
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }

<<<<<<< HEAD
    .alert-success {
        background: rgba(240,253,244,.92);
        border-color: rgba(74,222,128,.30);
        color: #166534;
    }

    .alert-error {
        background: rgba(254,242,242,.92);
        border-color: rgba(248,113,113,.30);
        color: #991b1b;
    }
=======
            if (!token) {
                alert('Session expirée, veuillez vous reconnecter');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
                return;
            }

            const baseUrl = 'https://wheat-skunk-120710.hostingersite.com';
            let fullUrl = baseUrl + path;
>>>>>>> origin/main

    .button {
        padding: 0.9rem 1.35rem;
        border-radius: 14px;
        font-weight: 950;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-family: inherit;
        white-space: nowrap;
        text-decoration: none;
    }

    .button-primary {
        background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
        color: #fff;
        box-shadow: 0 14px 30px rgba(79,70,229,.22);
    }

    .button-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 18px 34px rgba(79,70,229,.28);
    }

    .button-secondary {
        background: rgba(255,255,255,.92);
        color: #4338ca;
        border: 2px solid rgba(67,56,202,.20);
    }

    .button-secondary:hover {
        background: rgba(67,56,202,.06);
    }

    .button-danger {
        background: rgba(239,68,68,.10);
        color: var(--red);
        border: 2px solid rgba(239,68,68,.20);
    }

    .button-danger:hover {
        background: rgba(239,68,68,.15);
    }

    .notice-card {
        background: white;
        border-radius: 18px;
        padding: 2rem;
        border: 2px solid rgba(102,126,234,.15);
        box-shadow: 0 12px 40px rgba(0,0,0,.08);
        margin-bottom: 2rem;
    }

<<<<<<< HEAD
    .notice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
=======
        // Logout
        function logout() {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
            }
        }
>>>>>>> origin/main

    .notice-title {
        font-size: 1.5rem;
        font-weight: 950;
        color: var(--ink);
    }

    .notice-ref {
        font-size: 0.9rem;
        color: var(--muted);
        font-weight: 850;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
    }

    .info-section h3 {
        font-size: 1rem;
        font-weight: 950;
        color: var(--indigo);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .info-item {
        margin-bottom: 1rem;
    }

    .info-label {
        font-size: 0.85rem;
        font-weight: 850;
        color: var(--muted);
        margin-bottom: 0.25rem;
    }

    .info-value {
        font-size: 1rem;
        font-weight: 700;
        color: var(--ink);
    }

    .badge {
        padding: 0.4rem 1rem;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 850;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .badge-pending {
        background: rgba(245,158,11,.15);
        color: #92400e;
        border: 1px solid rgba(245,158,11,.25);
    }

    .badge-confirmed {
        background: rgba(34,197,94,.15);
        color: #166534;
        border: 1px solid rgba(34,197,94,.25);
    }

    .badge-cancelled {
        background: rgba(148,163,184,.15);
        color: #475569;
        border: 1px solid rgba(148,163,184,.25);
    }

    .status-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
        flex-wrap: wrap;
    }

    .status-form {
        display: inline;
    }
</style>

<script>
<<<<<<< HEAD
    // Scripts spécifiques à cette page
=======
    // Initialiser les icônes
    lucide.createIcons();

    // Navigation vers React (8080)
    function goToReact(path) {
        const token = localStorage.getItem('token') || getUrlParam('api_token');

        if (!token) {
            alert('Session expirée, veuillez vous reconnecter');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
            return;
        }

        const baseUrl = 'http://localhost:8080';
        let fullUrl = baseUrl + path;

        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

        console.log('Navigation React vers:', fullUrl);
        window.location.href = fullUrl;
    }

    // Navigation vers Laravel (8000)
    function navigateTo(path) {
        const token = localStorage.getItem('token') || getUrlParam('api_token');

        if (!token) {
            alert('Session expirée, veuillez vous reconnecter');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/login';
            return;
        }

        const baseUrl = 'https://wheat-skunk-120710.hostingersite.com';
        let fullUrl = baseUrl + path;

        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl += `${separator}api_token=${encodeURIComponent(token)}`;

        console.log('Navigation Laravel vers:', fullUrl);
        window.location.href = fullUrl;
    }

    // Helper pour récupérer un paramètre d'URL
    function getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Gestion des sous-menus
    function toggleSubmenu(menuId) {
        const submenu = document.getElementById(menuId);
        const parent = document.querySelector(`[onclick="toggleSubmenu('${menuId}')"]`);

        if (submenu.style.display === 'none' || !submenu.style.display) {
            submenu.style.display = 'block';
            parent.classList.add('active');
        } else {
            submenu.style.display = 'none';
            parent.classList.remove('active');
        }
    }

    // Gestion de la sidebar mobile
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');

        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    // Logout
    function logout() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'https://wheat-skunk-120710.hostingersite.com/logout';
        }
    }

    // Au chargement
    function checkMobile() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (window.innerWidth <= 768) {
            mobileBtn.style.display = 'block';
        } else {
            mobileBtn.style.display = 'none';
        }
    }

    window.addEventListener('resize', checkMobile);
    checkMobile();

    // Ajouter le token à la page actuelle si présent dans l'URL
    const urlToken = getUrlParam('api_token');
    if (urlToken) {
        localStorage.setItem('token', urlToken);
    }

    // Marquer le menu actif en fonction de la page courante
>>>>>>> origin/main
    document.addEventListener('DOMContentLoaded', function() {
        // Initialiser les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });
</script>
@endsection
