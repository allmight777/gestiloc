@extends('layouts.co-owner')

@section('title', 'Gestion des paiements')

@section('content')
<div class="payment-management">
    <!-- Header -->
    <div class="page-header">
        <h1>Gestion des paiements</h1>
        <p class="subtitle">Créez et recevez/confirmez en quelques clics et en toute sécurité</p>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
        <div class="tabs">
            <button class="tab active" onclick="switchTab('active')">
                <span class="check-icon">✓</span>
                Actifs
                <span class="badge green">{{ $activeCount }}</span>
            </button>
            <button class="tab" onclick="switchTab('archived')">
                <span class="folder-icon">📁</span>
                Archives
                <span class="badge gray">{{ $archivedCount }}</span>
            </button>
        </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card">
        <h3>FILTRER - UTILISEZ LES OPTIONS CI-DESSOUS</h3>
        <div class="filters-grid">
            <div class="filter-group">
                <label>Bien</label>
                <select id="property-filter" onchange="applyFilters()">
                    <option value="all">Tous les biens</option>
                    @foreach($properties as $property)
                        <option value="{{ $property->id }}">{{ $property->name }}</option>
                    @endforeach
                </select>
            </div>
            <div class="filter-group">
                <label>Lignes par page</label>
                <select id="per-page" onchange="applyFilters()">
                    <option value="10">10 lignes</option>
                    <option value="25">25 lignes</option>
                    <option value="50">50 lignes</option>
                    <option value="100" selected>100 lignes</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Search & Display -->
    <div class="search-card">
        <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="search-input" placeholder="Rechercher" onkeyup="debounceSearch()">
        </div>
        <button class="btn-display">
            <span class="gear-icon">⚙️</span>
            Affichage
        </button>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
        <!-- Loyers attendus -->
        <div class="stat-card green-border">
            <div class="stat-header">
                <span class="stat-title">Loyers attendus</span>
                <span class="stat-icon money">💵</span>
            </div>
            <div class="stat-amount">{{ number_format($stats['expected_rent'], 0, ',', ' ') }} FCFA</div>
            <div class="stat-meta">{{ $stats['total_payments'] }} paiements ce mois</div>
        </div>

        <!-- Loyers reçus -->
        <div class="stat-card blue-border">
            <div class="stat-header">
                <span class="stat-title">Loyers reçus</span>
                <span class="stat-icon check">✅</span>
            </div>
            <div class="stat-amount">{{ number_format($stats['received_rent'], 0, ',', ' ') }} FCFA</div>
            <div class="stat-meta">{{ $stats['paid_count'] }} paiements ce mois</div>
        </div>

        <!-- En retard -->
        <div class="stat-card red-border">
            <div class="stat-header">
                <span class="stat-title">En retard</span>
                <span class="stat-icon warning">⚠️</span>
            </div>
            <div class="stat-amount">{{ number_format($stats['late_amount'], 0, ',', ' ') }} FCFA</div>
            <div class="stat-meta">
                {{ $payments->where('status', 'pending')->where('invoice.due_date', '<', now())->count() }} paiements en retard
            </div>
        </div>

        <!-- Taux de recouvrement -->
        <div class="stat-card orange-border">
            <div class="stat-header">
                <span class="stat-title">Taux de recouvrement</span>
                <span class="stat-icon chart">📊</span>
            </div>
            <div class="stat-amount">{{ $stats['recovery_rate'] }}%</div>
            <div class="stat-meta trend-up">+5% vs mois dernier</div>
        </div>
    </div>

    <!-- Action Buttons -->
    <div class="actions-bar">
        <a href="{{ route('co-owner.payments.create') }}" class="btn-primary" style="background-color: #0b7dda;">
            <span class="plus-icon">+</span>
            Enregistrer un paiement
        </a>
        <a href="{{ route('co-owner.payments.reminders') }}" class="btn-secondary">
            <span class="bell-icon">🔔</span>
            Rappels
        </a>
        <a href="{{ route('co-owner.quittances.index') }}" class="btn-secondary">
            Quittances
        </a>
        <button class="btn-secondary" onclick="exportData()">
            <span class="export-icon">📤</span>
            Exporter
        </button>
    </div>

    <!-- Payments Table -->
    <div class="table-container">
        <table class="payments-table">
            <thead>
                <tr>
                    <th>Locataire</th>
                    <th>Bien</th>
                    <th>Montant</th>
                    <th>Echéance</th>
                    <th>Statut</th>
                    <th>Date de paiement</th>
                    <th>Mode</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                @forelse($payments as $payment)
                <tr>
                    <td>
                        <div class="tenant-info">
                            <strong class="tenant-link">{{ $payment->lease->tenant->user->name ?? 'N/A' }}</strong>
                            <small>{{ $payment->lease->tenant->user->email ?? '' }}</small>
                        </div>
                    </td>
                    <td>
                        <div class="property-info">
                            <a href="{{ route('co-owner.properties.show', $payment->lease->property_id ?? '') }}" class="property-link">{{ $payment->lease->property->name ?? 'N/A' }}</a>
                            <small>{{ Str::limit($payment->lease->property->address ?? '', 30) }}</small>
                        </div>
                    </td>
                    <td class="amount">{{ number_format($payment->amount_total, 0, ',', ' ') }} FCFA</td>
                    <td>{{ $payment->invoice ? $payment->invoice->due_date->format('d M Y') : '-' }}</td>
                    <td>
                        @php
                            $statusClass = match($payment->status) {
                                'approved', 'success' => 'status-paid',
                                'pending', 'initiated' => 'status-pending',
                                'declined', 'failed' => 'status-late',
                                default => 'status-pending'
                            };
                            $statusLabel = match($payment->status) {
                                'approved', 'success' => 'Payé',
                                'pending', 'initiated' => 'En attente',
                                'declined', 'failed' => 'En retard',
                                default => 'En attente'
                            };
                        @endphp
                        <span class="status-badge {{ $statusClass }}">
                            @if($payment->status === 'approved')
                                <span class="status-icon">✓</span>
                            @elseif(in_array($payment->status, ['pending', 'initiated']))
                                <span class="status-icon">⏳</span>
                            @else
                                <span class="status-icon">⚠</span>
                            @endif
                            {{ $statusLabel }}
                        </span>
                    </td>
                    <td>{{ $payment->paid_at ? $payment->paid_at->format('d M Y') : '-' }}</td>
                    <td>
                        <span class="payment-mode">
                            {{ match($payment->provider) {
                                'manual' => 'Virement',
                                'fedapay' => 'Carte',
                                'mobile_money' => 'Mobile Money',
                                default => 'Virement'
                            } }}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <a href="{{ route('co-owner.payments.show', $payment->id) }}" class="btn-action view" title="Voir">
                                👁️
                            </a>
                            <a href="mailto:{{ $payment->lease->tenant->user->email ?? '' }}" class="btn-action email" title="Envoyer un email">
                                ✉️
                            </a>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="8" class="empty-state">
                        Aucun paiement trouvé
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-container">
        {{ $payments->links() }}
    </div>
</div>

<style>
.payment-management {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
}

.subtitle {
    color: #666;
    font-size: 1rem;
    margin-bottom: 2rem;
}

/* Tabs */
.tabs-container {
    margin-bottom: 2rem;
    border-bottom: 2px solid #e0e0e0;
}

.tabs {
    display: flex;
    gap: 2rem;
}

.tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #666;
    position: relative;
    transition: color 0.3s;
}

.tab.active {
    color: #182f96;
    font-weight: 600;
}

.tab.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background: #4c53af;
}

.badge {
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge.green {
    background: #4c4eaf;
    color: white;
}

.badge.gray {
    background: #9e9e9e;
    color: white;
}

/* Filters */
.filters-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.filters-card h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
    text-transform: uppercase;
}

.filters-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.filter-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.filter-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #4CAF50;
    border-radius: 8px;
    background: white;
    font-size: 0.9rem;
    color: #666;
    cursor: pointer;
}

/* Search */
.search-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-box {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #f5f5f5;
    border: 1px solid #4CAF50;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    max-width: 600px;
}

.search-box input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    outline: none;
}

.btn-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: 1px solid #4CAF50;
    border-radius: 8px;
    background: white;
    color: #333;
    cursor: pointer;
    font-weight: 500;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: #f5f5f5;
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
}

.green-border::before { background: #4CAF50; }
.blue-border::before { background: #2196F3; }
.red-border::before { background: #f44336; }
.orange-border::before { background: #FF9800; }

.stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.stat-title {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
}

.stat-icon {
    font-size: 1.5rem;
}

.stat-amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
}

.stat-meta {
    font-size: 0.8rem;
    color: #999;
}

.trend-up {
    color: #4CAF50;
}

/* Actions Bar - BOUTONS VERT */
.actions-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s;
}

.btn-primary:hover {
    background: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-secondary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: white;
    color: #333;
    border: 1px solid #4CAF50;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s;
}

.btn-secondary:hover {
    background: #f0f9f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

/* Table */
.table-container {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 2rem;
}

.payments-table {
    width: 100%;
    border-collapse: collapse;
}

.payments-table th {
    text-align: left;
    padding: 1rem;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e0e0e0;
    font-size: 0.9rem;
}

.payments-table td {
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
}

.tenant-info, .property-info {
    display: flex;
    flex-direction: column;
}

/* LIENS BLEU */
.tenant-link {
    color: #2196F3;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s;
}

.tenant-link:hover {
    color: #0b7dda;
    text-decoration: underline;
}

.property-link {
    color: #2196F3;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s;
}

.property-link:hover {
    color: #0b7dda;
    text-decoration: underline;
}

.tenant-info small, .property-info small {
    color: #999;
    font-size: 0.8rem;
}

.amount {
    font-weight: 600;
    color: #333;
}

/* Status Badges */
.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.status-paid {
    background: #4CAF50;
    color: white;
}

.status-pending {
    background: #FF9800;
    color: white;
}

.status-late {
    background: #f44336;
    color: white;
}

.payment-mode {
    color: #2196F3;
    font-weight: 500;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    color: #666;
    text-decoration: none;
    transition: all 0.3s;
    font-size: 1rem;
}

.btn-action:hover {
    background: #f5f5f5;
    border-color: #2196F3;
    color: #2196F3;
    transform: translateY(-2px);
}

.btn-action.view:hover {
    background: #e3f2fd;
    border-color: #2196F3;
}

.btn-action.email:hover {
    background: #e8f5e9;
    border-color: #4CAF50;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #999;
}

.pagination-container {
    display: flex;
    justify-content: center;
}

/* Pagination links - EN BLEU */
.pagination-container .pagination {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
}

.pagination-container .page-link {
    padding: 0.5rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    color: #2196F3;
    text-decoration: none;
    transition: all 0.3s;
}

.pagination-container .page-link:hover {
    background: #2196F3;
    color: white;
    border-color: #2196F3;
}

.pagination-container .page-item.active .page-link {
    background: #2196F3;
    color: white;
    border-color: #2196F3;
}

/* Responsive */
@media (max-width: 1200px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .filters-grid {
        grid-template-columns: 1fr;
    }

    .actions-bar {
        flex-wrap: wrap;
    }

    .actions-bar a,
    .actions-bar button {
        flex: 1;
        min-width: 200px;
        justify-content: center;
    }
}
</style>

<script>
let searchTimeout;

function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 500);
}

function applyFilters() {
    const propertyId = document.getElementById('property-filter').value;
    const perPage = document.getElementById('per-page').value;
    const search = document.getElementById('search-input').value;

    const params = new URLSearchParams();
    if (propertyId !== 'all') params.append('property_id', propertyId);
    if (perPage) params.append('per_page', perPage);
    if (search) params.append('search', search);

    window.location.href = '{{ route("co-owner.payments.index") }}?' + params.toString();
}

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.tab').classList.add('active');

    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    window.location.href = window.location.pathname + '?' + params.toString();
}

function showOptions(paymentId) {
    console.log('Options for payment:', paymentId);
}

function exportData() {
    window.location.href = '{{ route("co-owner.payments.export") }}?format=csv';
}
</script>
@endsection
