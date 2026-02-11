@extends('layouts.co-owner')

@section('title', 'États des lieux')

@section('content')
<style>
    .condition-reports-container {
        padding: 2rem 0;
    }

    .header-section {
        margin-bottom: 2rem;
    }

    .header-section h1 {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 0.5rem;
    }

    .header-description {
        color: #6b7280;
        font-size: 1rem;
        line-height: 1.5;
    }

    .create-btn {
        background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: 1rem;
        font-weight: 600;
        font-size: 1rem;
        border: none;
        box-shadow: 0 10px 25px rgba(132, 204, 22, 0.3);
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .create-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 35px rgba(132, 204, 22, 0.4);
    }

    .tabs-container {
        background: #f9fafb;
        border-radius: 1rem;
        padding: 0.5rem;
        display: inline-flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    .tab-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        border: none;
        background: transparent;
        color: #6b7280;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.2s ease;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .tab-btn.active {
        background: #84cc16;
        color: white;
        box-shadow: 0 4px 12px rgba(132, 204, 22, 0.3);
    }

    .tab-btn:not(.active):hover {
        background: rgba(132, 204, 22, 0.1);
        color: #84cc16;
    }

    .filter-section {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 1.5rem;
        padding: 2rem;
        margin-bottom: 2rem;
    }

    .filter-title {
        font-size: 0.875rem;
        font-weight: 700;
        color: #374151;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .filter-row {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 1rem;
        align-items: end;
    }

    .search-input-wrapper {
        position: relative;
    }

    .search-input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 3rem;
        border: 2px solid #84cc16;
        border-radius: 1rem;
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    .search-input:focus {
        outline: none;
        border-color: #65a30d;
        box-shadow: 0 0 0 4px rgba(132, 204, 22, 0.1);
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #84cc16;
        width: 20px;
        height: 20px;
    }

    .display-btn {
        padding: 0.875rem 1.5rem;
        border: 2px solid #84cc16;
        background: white;
        color: #65a30d;
        border-radius: 1rem;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.2s ease;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
    }

    .display-btn:hover {
        background: rgba(132, 204, 22, 0.05);
    }

    .property-select {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 1rem;
        font-size: 1rem;
        color: #9ca3af;
        margin-bottom: 1rem;
        transition: all 0.2s ease;
    }

    .property-select:focus {
        outline: none;
        border-color: #84cc16;
        box-shadow: 0 0 0 4px rgba(132, 204, 22, 0.1);
    }

    .reports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 1.5rem;
    }

    .report-card {
        background: white;
        border-radius: 1.5rem;
        overflow: hidden;
        transition: all 0.3s ease;
        border: 3px solid transparent;
    }

    .report-card.entry {
        border-left-color: #84cc16;
    }

    .report-card.exit {
        border-left-color: #ef4444;
    }

    .report-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .report-header {
        padding: 1.5rem;
        border-bottom: 2px solid #f3f4f6;
    }

    .report-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.75rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 1rem;
    }

    .report-badge.entry {
        background: rgba(132, 204, 22, 0.1);
        color: #65a30d;
    }

    .report-badge.exit {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
    }

    .report-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.5rem;
    }

    .report-location {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #6b7280;
        font-size: 0.95rem;
    }

    .report-body {
        padding: 1.5rem;
    }

    .report-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .info-value {
        font-size: 0.95rem;
        font-weight: 600;
        color: #111827;
    }

    .status-value {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .status-check {
        color: #10b981;
        font-weight: 700;
    }

    .photo-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: #f9fafb;
        border-radius: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .photo-icon {
        color: #6b7280;
    }

    .report-footer {
        padding: 1rem 1.5rem;
        background: #f9fafb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .creation-date {
        font-size: 0.875rem;
        color: #6b7280;
    }

    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .action-btn {
        width: 36px;
        height: 36px;
        border-radius: 0.5rem;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .action-btn.download {
        background: #377DF4;
        color: white;
    }

    .action-btn.download:hover {
        background: #2563eb;
        transform: scale(1.05);
    }

    .action-btn.edit {
        background: #fbbf24;
        color: white;
    }

    .action-btn.edit:hover {
        background: #f59e0b;
        transform: scale(1.05);
    }

    .action-btn.more {
        background: #e5e7eb;
        color: #6b7280;
    }

    .action-btn.more:hover {
        background: #d1d5db;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 1.5rem;
        border: 2px dashed #e5e7eb;
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .empty-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.5rem;
    }

    .empty-description {
        color: #6b7280;
        margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
        .reports-grid {
            grid-template-columns: 1fr;
        }

        .filter-row {
            grid-template-columns: 1fr;
        }

        .report-info-grid {
            grid-template-columns: 1fr;
        }
    }
</style>

<div class="condition-reports-container">
    <!-- Header -->
    <div class="header-section d-flex justify-content-between align-items-start">
        <div>
            <h1>États des lieux</h1>
            <p class="header-description">
                Documentez l'état de vos biens avec photos et descriptions détaillées.<br>
                Générez des PDF professionnels en quelques clics.
            </p>
        </div>
        <a href="{{ route('co-owner.condition-reports.create') }}" class="create-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Créer un nouvel état de lieu
        </a>
    </div>

    @if(isset($noProperties) && $noProperties)
        <div class="empty-state">
            <div class="empty-icon">🏠</div>
            <h4 class="empty-title">Aucun bien délégué</h4>
            <p class="empty-description">Vous n'avez actuellement aucun bien délégué pour gérer les états des lieux.</p>
        </div>
    @else
        <!-- Tabs -->
        <div class="tabs-container">
            <button class="tab-btn {{ !request('type') ? 'active' : '' }}" onclick="filterByType('')">
                Tous
            </button>
            <button class="tab-btn {{ request('type') == 'entry' ? 'active' : '' }}" onclick="filterByType('entry')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Entrée
            </button>
            <button class="tab-btn {{ request('type') == 'exit' ? 'active' : '' }}" onclick="filterByType('exit')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Sortie
            </button>
        </div>

        <!-- Filters -->
        <div class="filter-section">
            <h3 class="filter-title">Filtrer par bien</h3>

            <form id="filterForm" action="{{ route('co-owner.condition-reports.index') }}" method="GET">
                <input type="hidden" name="type" id="typeInput" value="{{ request('type') }}">

                <select name="property_id" class="property-select" onchange="this.form.submit()">
                    <option value="">Tous les biens</option>
                    @foreach(\App\Models\Property::whereIn('id', \App\Models\PropertyDelegation::where('co_owner_id', \App\Models\CoOwner::where('user_id', auth()->id())->first()?->id)->where('status', 'accepted')->pluck('property_id'))->get() as $property)
                        <option value="{{ $property->id }}" {{ request('property_id') == $property->id ? 'selected' : '' }}>
                            {{ $property->name }}
                        </option>
                    @endforeach
                </select>

                <div class="filter-row">
                    <div class="search-input-wrapper">
                        <svg class="search-icon" viewBox="0 0 20 20" fill="none">
                            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <input type="text" name="search" class="search-input" placeholder="Rechercher" value="{{ request('search') }}">
                    </div>
                    <button type="button" class="display-btn">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                            <path d="M2 10h3M15 10h3M10 2v3M10 15v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Affichage
                    </button>
                </div>
            </form>
        </div>

        <!-- Reports Grid -->
        @if($reports->isEmpty())
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h4 class="empty-title">Aucun état des lieux trouvé</h4>
                <p class="empty-description">Commencez par créer votre premier état des lieux.</p>
                <a href="{{ route('co-owner.condition-reports.create') }}" class="create-btn">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Créer un état des lieux
                </a>
            </div>
        @else
            <div class="reports-grid">
                @foreach($reports as $report)
                <div class="report-card {{ $report->type }}">
                    <!-- Header -->
                    <div class="report-header">
                        <div class="report-badge {{ $report->type }}">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M6 2V10M2 6H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            @if($report->type == 'entry')
                                État des lieux d'entrée
                            @else
                                État des lieux de sortie
                            @endif
                        </div>
                        <h3 class="report-title">EDL - {{ $report->lease->tenant->full_name ?? 'N/A' }}</h3>
                        <div class="report-location">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                                <path d="M8 1C5.5 1 3.5 3 3.5 5.5c0 3.5 4.5 9 4.5 9s4.5-5.5 4.5-9C12.5 3 10.5 1 8 1z" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                            {{ $report->property->name ?? 'Bien #' . $report->property_id }}
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="report-body">
                        <div class="report-info-grid">
                            <div class="info-item">
                                <span class="info-label">Locataire</span>
                                <span class="info-value">{{ $report->lease->tenant->full_name ?? 'N/A' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Date</span>
                                <span class="info-value">{{ $report->report_date->format('d M Y') }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">État général</span>
                                <span class="info-value">
                                    @if($report->photos->avg('condition_status') >= 0.8)
                                        Excellent
                                    @elseif($report->photos->avg('condition_status') >= 0.5)
                                        Très bon
                                    @else
                                        Bon
                                    @endif
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Signé</span>
                                <span class="info-value status-value">
                                    @if($report->signed_at)
                                        <span class="status-check">✓</span> Oui
                                    @else
                                        <span class="status-check">✓</span> Oui
                                    @endif
                                </span>
                            </div>
                        </div>

                        <div class="photo-count">
                            <svg class="photo-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                                <circle cx="7" cy="9" r="1.5" fill="currentColor"/>
                                <path d="M18 13l-4-4-4 4-2-2-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            <span style="font-weight: 600; color: #111827;">{{ $report->photos->count() }} photos</span>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="report-footer">
                        <span class="creation-date">Créé le {{ $report->created_at->format('d M Y') }}</span>
                        <div class="action-buttons">
                            <a href="{{ route('co-owner.condition-reports.download', $report->id) }}" class="action-btn download" title="Télécharger PDF">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 1v10M8 11l-3-3M8 11l3-3M2 15h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                            </a>
                            <a href="{{ route('co-owner.condition-reports.show', $report->id) }}" class="action-btn edit" title="Voir/Modifier">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                            </a>
                            <button class="action-btn more" title="Plus d'options">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="3" r="1" fill="currentColor"/>
                                    <circle cx="8" cy="8" r="1" fill="currentColor"/>
                                    <circle cx="8" cy="13" r="1" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            <!-- Pagination -->
            <div class="mt-4">
                {{ $reports->links() }}
            </div>
        @endif
    @endif
</div>

<script>
function filterByType(type) {
    document.getElementById('typeInput').value = type;
    document.getElementById('filterForm').submit();
}
</script>
@endsection
