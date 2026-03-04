import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { documentArchiveService, ArchiveDocument, ArchiveStats } from '@/services/api';

interface ArchiveDocsProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ArchivageDocs: React.FC<ArchiveDocsProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [archives, setArchives] = useState<ArchiveDocument[]>([]);
    const [stats, setStats] = useState<ArchiveStats>({
        total_documents: 0,
        baux_termines: 0,
        edl_archives: 0,
        quittances_archives: 0,
        total_size: '0 KB',
    });

    const filters = ['Tous', 'Contrat de baux', 'Etats des lieux', 'Quittances', 'Autres documents'];

    // Charger les données depuis l'API
    useEffect(() => {
        const fetchArchives = async () => {
            try {
                setLoading(true);
                const response = await documentArchiveService.getArchives();
                setArchives(response.archives);
                setStats(response.stats);
            } catch (error) {
                console.error('Erreur lors du chargement des archives:', error);
                notify('Erreur lors du chargement des archives', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchArchives();
    }, [notify]);

    // Filtrer les archives selon le filtre actif et la recherche
    const filtered = archives.filter(d => {
        // Filtre par catégorie
        const matchesFilter = activeFilter === 'Tous' || d.typeCategory === activeFilter;
        // Filtre par recherche
        const matchesSearch = d.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           d.bien.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Formater les stats pour l'affichage
    const displayStats = [
        { label: 'DOCUMENTS ARCHIVÉS', value: stats.total_documents.toString(), color: '#1a1a1a' },
        { label: 'BAUX TERMINÉS', value: stats.baux_termines.toString(), color: '#1a1a1a' },
        { label: 'EDL ARCHIVÉS', value: stats.edl_archives.toString(), color: '#1a1a1a' },
        { label: 'ESPACE UTILISÉ', value: stats.total_size, color: '#1a1a1a' },
    ];

    if (loading) {
        return (
            <div className="ar-page">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
                    .ar-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
                    .ar-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; }
                    .ar-loading-spinner { width: 50px; height: 50px; border: 4px solid #e5e7eb; border-top-color: #83C757; border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                    .ar-loading-text { margin-top: 1rem; color: #6b7280; font-size: 0.9rem; }
                `}</style>
                <div className="ar-loading">
                    <div className="ar-loading-spinner"></div>
                    <p className="ar-loading-text">Chargement des archives...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .ar-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .ar-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .ar-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .ar-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; max-width: 550px; }
        .ar-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .ar-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.25rem; }
        .ar-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.2rem; }
        .ar-stat-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px 0; }
        .ar-stat-value { font-size: 1.15rem; font-weight: 800; margin: 0; }
        .ar-filters { display: flex; gap: 10px; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .ar-filter-btn { padding: 8px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .ar-filter-btn.active { background: #83C757; color: #fff; }
        .ar-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .ar-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .ar-filter-ttl { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .ar-filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 14px; }
        .ar-select { width: 100%; padding: 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; box-sizing: border-box; }
        .ar-search-wrap { position: relative; }
        .ar-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .ar-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .ar-search-input::placeholder { color: #83C757; font-weight: 600; }
        .ar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ar-item { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
        .ar-item-top { padding: 1.1rem 1.3rem 0.7rem; }
        .ar-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.60rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .ar-item-titre { font-size: 0.92rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .ar-item-bien { font-size: 0.75rem; color: #ef4444; font-weight: 500; margin: 0 0 14px 0; }
        .ar-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .ar-detail-label { font-size: 0.60rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .ar-detail-value { font-size: 0.78rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .ar-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .ar-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .ar-footer-actions { display: flex; gap: 6px; }
        .ar-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; font-size: 0.85rem; }
        .ar-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; text-align: center; }
        .ar-empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
        .ar-empty-title { font-size: 1.1rem; font-weight: 700; color: #374151; margin: 0 0 0.5rem 0; }
        .ar-empty-text { font-size: 0.85rem; color: #6b7280; margin: 0; }
        @media (max-width: 1400px) { .ar-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .ar-grid { grid-template-columns: repeat(2, 1fr); } .ar-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .ar-grid { grid-template-columns: 1fr; } .ar-stats { grid-template-columns: 1fr; } .ar-filter-row { grid-template-columns: 1fr; } .ar-header { flex-direction: column; gap: 12px; } }
        @media (max-width: 480px) { .ar-page { padding: 1rem 0.5rem 2rem; } .ar-title { font-size: 1.3rem; } .ar-filters { gap: 6px; } .ar-filter-btn { padding: 6px 14px; font-size: 0.75rem; } }
      `}</style>
            <div className="ar-page">
                <div className="ar-header">
                    <div>
                        <h1 className="ar-title">Archivage de documents</h1>
                        <p className="ar-subtitle">Retrouvez tous vos documents archivés : anciens baux, états des lieux terminés, quittances passées. Gardez un historique complet de votre gestion locative.</p>
                    </div>
                    <button className="ar-add-btn" onClick={() => notify('Ajout document à venir', 'info')}><Plus size={15} /> Ajouter un document</button>
                </div>
                <div className="ar-stats">{displayStats.map(s => (<div className="ar-stat" key={s.label}><p className="ar-stat-label">{s.label}</p><p className="ar-stat-value" style={{ color: s.color }}>{s.value}</p></div>))}</div>
                <div className="ar-filters">{filters.map(f => (<button key={f} className={`ar-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>))}</div>
                <div className="ar-card">
                    <p className="ar-filter-ttl">FILTRE</p>
                    <div className="ar-filter-row"><select className="ar-select"><option>Tous les biens</option></select><select className="ar-select"><option>Toutes les années</option></select></div>
                    <div className="ar-search-wrap"><Search size={16} className="ar-search-icon" /><input className="ar-search-input" placeholder="Rechercher" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                </div>
                
                {filtered.length === 0 ? (
                    <div className="ar-empty">
                        <div className="ar-empty-icon">📂</div>
                        <h3 className="ar-empty-title">Aucun document archivé</h3>
                        <p className="ar-empty-text">
                            {searchTerm 
                                ? 'Aucun résultat ne correspond à votre recherche.'
                                : 'Les documents de plus de 2 mois apparaîtront ici automatiquement.'}
                        </p>
                    </div>
                ) : (
                    <div className="ar-grid">
                        {filtered.map(d => (
                            <div className="ar-item" key={d.id}>
                                <div className="ar-item-top">
                                    <span className="ar-badge" style={{ background: d.typeBadgeColor + '20', color: d.typeBadgeColor }}>{d.typeBadge}</span>
                                    <p className="ar-item-titre">{d.titre}</p>
                                    <p className="ar-item-bien">📍 {d.bien}</p>
                                    <div className="ar-detail-row"><div><p className="ar-detail-label">{d.champ1Label}</p><p className="ar-detail-value">{d.champ1Value}</p></div><div><p className="ar-detail-label">{d.champ2Label}</p><p className="ar-detail-value">{d.champ2Value}</p></div></div>
                                    <div className="ar-detail-row"><div><p className="ar-detail-label">{d.champ3Label}</p><p className="ar-detail-value">{d.champ3Value}</p></div>{d.champ4Label && <div><p className="ar-detail-label">{d.champ4Label}</p><p className="ar-detail-value">{d.champ4Value}</p></div>}</div>
                                </div>
                                <div className="ar-footer"><span className="ar-footer-date">{d.dateBas}</span><div className="ar-footer-actions"><button className="ar-icon-btn">👁️</button><button className="ar-icon-btn" style={{ color: '#83C757' }}>📥</button><button className="ar-icon-btn" style={{ color: '#f59e0b' }}>✏️</button></div></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default ArchivageDocs;
