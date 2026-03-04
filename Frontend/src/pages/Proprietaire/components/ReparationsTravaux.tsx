import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { maintenanceService, MaintenanceRequest } from '@/services/api';

interface RTProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ReparationsTravaux: React.FC<RTProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const filters = ['Tous', 'Urgentes', 'En cours', 'Planifiées', 'Terminées'];
    const navigate = useNavigate();
    
    // Données depuis l'API
    const [incidents, setIncidents] = useState<MaintenanceRequest[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Statistiques
    const [stats, setStats] = useState({
        urgent: 0,
        inProgress: 0,
        planned: 0,
        totalCost: 0
    });

    // Charger les interventions depuis l'API
    const fetchIncidents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await maintenanceService.listIncidents();
            setIncidents(data || []);
            
            // Calculer les statistiques
            const urgent = data.filter(i => i.priority === 'emergency' && i.status === 'open').length;
            const inProgress = data.filter(i => i.status === 'in_progress').length;
            const planned = data.filter(i => i.status === 'open' && i.priority !== 'emergency').length;
            
            setStats({
                urgent,
                inProgress,
                planned,
                totalCost: 0 // À implémenter si le backend renvoie le coût
            });
        } catch (err) {
            console.error("Erreur lors de la récupération des interventions:", err);
            setError("Erreur lors du chargement des interventions");
            notify?.("Erreur lors du chargement des interventions", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    // Filtrer les interventions
    const filteredIncidents = incidents.filter(incident => {
        if (activeFilter === 'Tous') return true;
        if (activeFilter === 'Urgentes') return incident.priority === 'emergency' && incident.status === 'open';
        if (activeFilter === 'En cours') return incident.status === 'in_progress';
        if (activeFilter === 'Planifiées') return incident.status === 'open' && incident.priority !== 'emergency';
        if (activeFilter === 'Terminées') return incident.status === 'resolved';
        return true;
    });

    // Mapper le statut backend vers le format affiché
    const getStatusInfo = (status: string, priority: string) => {
        switch (status) {
            case 'open':
                return priority === 'emergency' 
                    ? { label: 'URGENT', color: '#dc2626', bg: '#fef2f2' }
                    : { label: 'PLANIFIÉE', color: '#3b82f6', bg: '#eff6ff' };
            case 'in_progress':
                return { label: 'EN COURS', color: '#f59e0b', bg: '#fffbeb' };
            case 'resolved':
                return { label: 'TERMINÉE', color: '#16a34a', bg: '#f0fdf4' };
            case 'cancelled':
                return { label: 'ANNULÉE', color: '#6b7280', bg: '#f3f4f6' };
            default:
                return { label: status.toUpperCase(), color: '#6b7280', bg: '#f3f4f6' };
        }
    };

    // Mapper la catégorie
    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'plumbing': return 'Plomberie';
            case 'electricity': return 'Électricité';
            case 'heating': return 'Chauffage';
            case 'other': return 'Autre';
            default: return category;
        }
    };

    // Mapper la priorité
    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'low': return 'Faible';
            case 'medium': return 'Moyenne';
            case 'high': return 'Haute';
            case 'emergency': return 'Urgente';
            default: return priority;
        }
    };

    // Formater la date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .rt-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }

        /* Header */
        .rt-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 16px; }
        .rt-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 8px 0; }
        .rt-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; line-height: 1.5; max-width: 580px; }
        .rt-btn-create { display: inline-flex; align-items: center; gap: 8px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 12px 28px; font-family: 'Manrope', sans-serif; font-size: 0.88rem; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 0.15s; }
        .rt-btn-create:hover { background: #72b44a; }

        /* Stats */
        .rt-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 1.5rem; }
        .rt-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.3rem; border-left: 4px solid #83C757; }
        .rt-stat-label { font-size: 0.6rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 6px 0; }
        .rt-stat-value { font-size: 1.3rem; font-weight: 900; margin: 0; color: #83C757; }

        /* Filters */
        .rt-filters { display: flex; gap: 10px; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .rt-filter-btn { padding: 9px 26px; border-radius: 22px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .rt-filter-btn.active { background: #83C757; color: #fff; }
        .rt-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .rt-filter-btn:not(.active):hover { background: #e5e7eb; }

        /* Filter card */
        .rt-filter-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; }
        .rt-filter-ttl { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .rt-filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
        .rt-select { width: 100%; padding: 0.65rem 0.95rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.84rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; box-sizing: border-box; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
        .rt-search-wrap { position: relative; }
        .rt-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .rt-search-input { width: 100%; padding: 0.65rem 0.95rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #374151; background: #fff; outline: none; box-sizing: border-box; }
        .rt-search-input::placeholder { color: #83C757; font-weight: 600; }

        /* Grid */
        .rt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }

        /* Card */
        .rt-card { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
        .rt-card-body { padding: 1.2rem 1.3rem 0.8rem; flex: 1; }
        .rt-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 6px; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 10px; }
        .rt-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
        .rt-card-title { font-size: 0.95rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .rt-card-location { font-size: 0.75rem; color: #83C757; font-weight: 600; margin: 0 0 14px 0; display: flex; align-items: center; gap: 4px; }

        /* Detail rows */
        .rt-details { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 10px; }
        .rt-detail { padding: 6px 0; }
        .rt-detail-label { font-size: 0.58rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .rt-detail-value { font-size: 0.78rem; font-weight: 600; color: #374151; margin: 0; }

        /* Devis row */
        .rt-devis { padding-top: 8px; border-top: 1px solid #f3f4f6; margin-bottom: 0; }
        .rt-devis-label { font-size: 0.58rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .rt-devis-value { font-size: 1.05rem; font-weight: 800; margin: 0; }

        /* Progress bar */
        .rt-progress-row { margin-top: 4px; }
        .rt-progress-label { font-size: 0.58rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px 0; }
        .rt-progress-bar { width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
        .rt-progress-fill { height: 100%; background: #83C757; border-radius: 3px; }
        .rt-progress-pct { font-size: 0.72rem; font-weight: 700; color: #83C757; margin-top: 2px; }

        /* Footer */
        .rt-card-footer { padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; background: #fafafa; }
        .rt-footer-date { font-size: 0.7rem; color: #9ca3af; font-weight: 500; }
        .rt-footer-actions { display: flex; gap: 8px; }
        .rt-action-dot { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; cursor: pointer; border: none; }

        /* Loading & Error states */
        .rt-loading { display: flex; align-items: center; justify-content: center; padding: 3rem; color: #6b7280; }
        .rt-error { display: flex; align-items: center; justify-content: center; padding: 3rem; color: #ef4444; gap: 8px; }
        .rt-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: #6b7280; grid-column: 1 / -1; }
        .rt-empty-icon { font-size: 3rem; margin-bottom: 1rem; }

        /* Refresh button */
        .rt-refresh-btn { display: flex; align-items: center; gap: 6px; background: white; border: 1.5px solid #d1d5db; border-radius: 8px; padding: 8px 16px; font-size: 0.8rem; color: #6b7280; cursor: pointer; font-weight: 500; }
        .rt-refresh-btn:hover { background: #f9fafb; }

        /* Responsive */
        @media (max-width: 1400px) { .rt-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1100px) { .rt-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .rt-grid { grid-template-columns: 1fr; }
          .rt-stats { grid-template-columns: repeat(2, 1fr); }
          .rt-header { flex-direction: column; gap: 12px; }
          .rt-filter-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .rt-page { padding: 1rem 0.5rem 2rem; }
          .rt-stats { grid-template-columns: 1fr; }
          .rt-title { font-size: 1.3rem; }
          .rt-filters { gap: 6px; }
          .rt-filter-btn { padding: 7px 16px; font-size: 0.78rem; }
        }
      `}</style>

            <div className="rt-page">
                {/* Header */}
                <div className="rt-header">
                    <div>
                        <h1 className="rt-title">Répartitions et travaux</h1>
                        <p className="rt-subtitle">
                            Gérez vos interventions, suivez les demandes et planifiez les travaux.
                            Centralisez tous les devis, factures et suivis de chantier au même endroit.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="rt-refresh-btn" onClick={fetchIncidents}>
                            <RefreshCw size={14} /> Actualiser
                        </button>
                        <button className="rt-btn-create" onClick={() => navigate('/proprietaire/incidents/nouveau')}>
                            <Plus size={16} strokeWidth={3} /> Créer une intervention
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="rt-stats">
                    <div className="rt-stat">
                        <p className="rt-stat-label">INTERVENTIONS URGENTES</p>
                        <p className="rt-stat-value">{stats.urgent}</p>
                    </div>
                    <div className="rt-stat">
                        <p className="rt-stat-label">EN COURS</p>
                        <p className="rt-stat-value">{stats.inProgress}</p>
                    </div>
                    <div className="rt-stat">
                        <p className="rt-stat-label">PLANIFIÉES</p>
                        <p className="rt-stat-value">{stats.planned}</p>
                    </div>
                    <div className="rt-stat">
                        <p className="rt-stat-label">TOTAL INTERVENTIONS</p>
                        <p className="rt-stat-value">{incidents.length}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="rt-filters">
                    {filters.map(f => (
                        <button
                            key={f}
                            className={`rt-filter-btn ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Filter Card */}
                <div className="rt-filter-card">
                    <p className="rt-filter-ttl">FILTRE</p>
                    <div className="rt-filter-row">
                        <select className="rt-select"><option>Tous les biens</option></select>
                        <select className="rt-select"><option>Toutes les années</option></select>
                    </div>
                    <div className="rt-search-wrap">
                        <Search size={16} className="rt-search-icon" />
                        <input className="rt-search-input" placeholder="Rechercher" />
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="rt-loading">
                        <RefreshCw size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        Chargement des interventions...
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="rt-error">
                        {error}
                    </div>
                )}

                {/* Cards Grid */}
                {!isLoading && !error && (
                    <div className="rt-grid">
                        {filteredIncidents.length === 0 ? (
                            <div className="rt-empty">
                                <div className="rt-empty-icon">🔧</div>
                                <p>Aucune intervention trouvée</p>
                                <button 
                                    className="rt-btn-create" 
                                    style={{ marginTop: '1rem' }}
                                    onClick={() => navigate('/proprietaire/incidents/nouveau')}
                                >
                                    <Plus size={16} strokeWidth={3} /> Créer une intervention
                                </button>
                            </div>
                        ) : (
                            filteredIncidents.map((incident) => {
                                const statusInfo = getStatusInfo(incident.status, incident.priority);
                                return (
                                    <div className="rt-card" key={incident.id}>
                                        <div className="rt-card-body">
                                            {/* Badge */}
                                            <span className="rt-badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                                                <span className="rt-badge-dot" style={{ background: statusInfo.color }}></span>
                                                {statusInfo.label}
                                            </span>

                                            {/* Title & Location */}
                                            <p className="rt-card-title">{incident.title}</p>
                                            <p className="rt-card-location">
                                                📍 {incident.property?.address || 'Adresse non spécifiée'} · {incident.property?.city || ''}
                                            </p>

                                            {/* Details 2x2 */}
                                            <div className="rt-details">
                                                <div className="rt-detail">
                                                    <p className="rt-detail-label">TYPE</p>
                                                    <p className="rt-detail-value">{getCategoryLabel(incident.category)}</p>
                                                </div>
                                                <div className="rt-detail">
                                                    <p className="rt-detail-label">PRIORITÉ</p>
                                                    <p className="rt-detail-value">{getPriorityLabel(incident.priority)}</p>
                                                </div>
                                                <div className="rt-detail">
                                                    <p className="rt-detail-label">DEMANDÉ LE</p>
                                                    <p className="rt-detail-value">{formatDate(incident.created_at)}</p>
                                                </div>
                                                <div className="rt-detail">
                                                    <p className="rt-detail-label">PRESTATAIRE</p>
                                                    <p className="rt-detail-value">{incident.assigned_provider || 'À affecter'}</p>
                                                </div>
                                            </div>

                                            {/* Status for resolved */}
                                            {incident.status === 'resolved' && (
                                                <div className="rt-devis">
                                                    <p className="rt-devis-label">STATUT</p>
                                                    <p className="rt-devis-value" style={{ color: '#16a34a' }}>Terminé le {formatDate(incident.resolved_at || '')}</p>
                                                </div>
                                            )}

                                            {/* Progress bar for IN_PROGRESS */}
                                            {incident.status === 'in_progress' && (
                                                <div className="rt-progress-row">
                                                    <p className="rt-progress-label">AVANCEMENT</p>
                                                    <div className="rt-progress-bar">
                                                        <div className="rt-progress-fill" style={{ width: '60%' }}></div>
                                                    </div>
                                                    <p className="rt-progress-pct">60%</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="rt-card-footer">
                                            <span className="rt-footer-date">
                                                {incident.status === 'resolved' 
                                                    ? `Terminé le ${formatDate(incident.resolved_at || '')}`
                                                    : `Créé le ${formatDate(incident.created_at)}`
                                                }
                                            </span>
                                            <div className="rt-footer-actions">
                                                <span className="rt-action-dot" style={{ background: '#dcfce7' }}>🟢</span>
                                                <span className="rt-action-dot" style={{ background: '#eff6ff' }}>📊</span>
                                                <span className="rt-action-dot" style={{ background: incident.status === 'resolved' ? '#fef3c7' : '#f3f4f6' }}>
                                                    {incident.status === 'resolved' ? '🟠' : '✏️'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default ReparationsTravaux;
