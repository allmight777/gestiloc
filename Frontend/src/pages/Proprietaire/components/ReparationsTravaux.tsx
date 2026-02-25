import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';

interface Intervention {
    id: string;
    statutBadge: string;
    statutBadgeColor: string;
    titre: string;
    lieu: string;
    champ1Label: string; champ1Value: string;
    champ2Label: string; champ2Value: string;
    champ3Label: string; champ3Value: string;
    champ4Label: string; champ4Value: string;
    montantLabel: string; montantValue: string;
    dateBas: string;
}

const mockInterventions: Intervention[] = [
    { id: '1', statutBadge: '🚨 URGENT', statutBadgeColor: '#ef4444', titre: 'Fuite d\'eau salle de bain', lieu: 'Sophia Bernard • Paris 15ème', champ1Label: 'TYPE', champ1Value: 'Plomberie', champ2Label: 'PRIORITÉ', champ2Value: 'Urgente', champ3Label: 'DEMANDÉ LE', champ3Value: '05 Fev 2025', champ4Label: 'PRESTATAIRE', champ4Value: 'À affecter', montantLabel: 'DEVIS ESTIMÉ', montantValue: '350 €', dateBas: 'Créé le 05 Fev 2025' },
    { id: '2', statutBadge: '🔄 EN COURS', statutBadgeColor: '#f59e0b', titre: 'Remplacement chaudière', lieu: 'Montée Alba • Villeurbanne', champ1Label: 'TYPE', champ1Value: 'Chauffage', champ2Label: 'PRIORITÉ', champ2Value: 'Moyenne', champ3Label: 'DÉBUT TRAVAUX', champ3Value: '03 Fev 2025', champ4Label: 'PRESTATAIRE', champ4Value: 'Chauffage Pro', montantLabel: 'DEVIS ACCEPTÉ', montantValue: '2 800 €', dateBas: 'En progrès : 10 Fev 2025' },
    { id: '3', statutBadge: '📅 PLANIFIÉE', statutBadgeColor: '#3b82f6', titre: 'Révision annuelle chaudière', lieu: 'Jean-Pierre Roussel • La Rochelle', champ1Label: 'TYPE', champ1Value: 'Chauffage', champ2Label: 'PRIORITÉ', champ2Value: 'Faible', champ3Label: 'DÉBUT PRÉVU', champ3Value: '15 Fev 2025', champ4Label: 'PRESTATAIRE', champ4Value: 'Gaz Service Plus', montantLabel: 'DEVIS', montantValue: '125 €', dateBas: 'Planifié le 28 Jan 2025' },
    { id: '4', statutBadge: '🚨 URGENT', statutBadgeColor: '#ef4444', titre: 'Panne électrique cuisine', lieu: 'Martin Dupont • Boulogne-Billancourt', champ1Label: 'TYPE', champ1Value: 'Electricité', champ2Label: 'PRIORITÉ', champ2Value: 'Urgente', champ3Label: 'DEMANDÉ LE', champ3Value: '06 Fev 2025', champ4Label: 'PRESTATAIRE', champ4Value: 'Electro Express', montantLabel: 'DEVIS EN ATTENTE', montantValue: '—', dateBas: 'Intervention prévue aujourd\'hui' },
    { id: '5', statutBadge: '🔄 EN COURS', statutBadgeColor: '#f59e0b', titre: 'Réparation volets roulants', lieu: 'Thomas Moreau • Marseille', champ1Label: 'TYPE', champ1Value: 'Menuiserie', champ2Label: 'PRIORITÉ', champ2Value: 'Moyenne', champ3Label: 'DÉBUT TRAVAUX', champ3Value: '01 Fev 2025', champ4Label: 'PRESTATAIRE', champ4Value: 'Fermetures Plus', montantLabel: 'DEVIS ACCEPTÉ', montantValue: '580 €', dateBas: 'En progrès : 08 Fev 2025' },
    { id: '6', statutBadge: '✓ TERMINÉE', statutBadgeColor: '#83C757', titre: 'Changement serrure porte d\'entrée', lieu: 'Marie Lefevre • Lyon 6ème', champ1Label: 'TYPE', champ1Value: 'Serrurerie', champ2Label: 'DATE RÉALISATION', champ2Value: '30 Jan 2025', champ3Label: 'PRESTATAIRE', champ3Value: 'Serrure Service', champ4Label: 'FACTURE', champ4Value: 'Payée', montantLabel: 'COÛT FINAL', montantValue: '195 €', dateBas: 'Terminé le 30 Jan 2025' },
];

interface ReparationsTravProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ReparationsTravaux: React.FC<ReparationsTravProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const filters = ['Tous', 'Urgentes', 'En cours', 'Planifiées', 'Terminées'];
    const stats = [
        { label: 'INTERVENTIONS URGENTES', value: '3', color: '#ef4444' },
        { label: 'EN COURS', value: '5', color: '#f59e0b' },
        { label: 'PLANIFIÉES', value: '8', color: '#1a1a1a' },
        { label: 'COÛT TOTAL 2025', value: '12 450 €', color: '#83C757' },
    ];
    const filtered = mockInterventions.filter(i => i.titre.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .rt-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .rt-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .rt-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .rt-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; max-width: 550px; }
        .rt-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .rt-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.25rem; }
        .rt-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.2rem; }
        .rt-stat-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px 0; }
        .rt-stat-value { font-size: 1.15rem; font-weight: 800; margin: 0; }
        .rt-filters { display: flex; gap: 10px; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .rt-filter-btn { padding: 8px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .rt-filter-btn.active { background: #83C757; color: #fff; }
        .rt-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .rt-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .rt-filter-ttl { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .rt-filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 14px; }
        .rt-select { width: 100%; padding: 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; box-sizing: border-box; }
        .rt-search-wrap { position: relative; }
        .rt-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .rt-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .rt-search-input::placeholder { color: #83C757; font-weight: 600; }
        .rt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .rt-item { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
        .rt-item-top { padding: 1.1rem 1.3rem 0.7rem; }
        .rt-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .rt-item-titre { font-size: 0.92rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .rt-item-lieu { font-size: 0.75rem; color: #ef4444; font-weight: 500; margin: 0 0 14px 0; }
        .rt-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .rt-detail-label { font-size: 0.60rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .rt-detail-value { font-size: 0.78rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .rt-montant-label { font-size: 0.60rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin: 6px 0 2px 0; }
        .rt-montant-value { font-size: 1rem; font-weight: 800; color: #83C757; margin: 0; }
        .rt-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .rt-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .rt-footer-actions { display: flex; gap: 6px; }
        .rt-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; font-size: 0.85rem; }
        @media (max-width: 1400px) { .rt-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .rt-grid { grid-template-columns: repeat(2, 1fr); } .rt-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .rt-grid { grid-template-columns: 1fr; } .rt-stats { grid-template-columns: 1fr; } }
      `}</style>
            <div className="rt-page">
                <div className="rt-header">
                    <div>
                        <h1 className="rt-title">Répartitions et travaux</h1>
                        <p className="rt-subtitle">Gérez vos interventions, suivez les demandes de vos locataires et planifiez les travaux. Centralisez tous les devis, factures et suivis de chantier au même endroit.</p>
                    </div>
                    <button className="rt-add-btn" onClick={() => notify('Création intervention à venir', 'info')}><Plus size={15} /> Créer une intervention</button>
                </div>
                <div className="rt-stats">{stats.map(s => (<div className="rt-stat" key={s.label}><p className="rt-stat-label">{s.label}</p><p className="rt-stat-value" style={{ color: s.color }}>{s.value}</p></div>))}</div>
                <div className="rt-filters">{filters.map(f => (<button key={f} className={`rt-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>))}</div>
                <div className="rt-card">
                    <p className="rt-filter-ttl">FILTRE</p>
                    <div className="rt-filter-row"><select className="rt-select"><option>Tous les biens</option></select><select className="rt-select"><option>Toutes les années</option></select></div>
                    <div className="rt-search-wrap"><Search size={16} className="rt-search-icon" /><input className="rt-search-input" placeholder="Rechercher" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                </div>
                <div className="rt-grid">
                    {filtered.map(i => (
                        <div className="rt-item" key={i.id}>
                            <div className="rt-item-top">
                                <span className="rt-badge" style={{ background: i.statutBadgeColor + '20', color: i.statutBadgeColor }}>{i.statutBadge}</span>
                                <p className="rt-item-titre">{i.titre}</p>
                                <p className="rt-item-lieu">📍 {i.lieu}</p>
                                <div className="rt-detail-row"><div><p className="rt-detail-label">{i.champ1Label}</p><p className="rt-detail-value">{i.champ1Value}</p></div><div><p className="rt-detail-label">{i.champ2Label}</p><p className="rt-detail-value">{i.champ2Value}</p></div></div>
                                <div className="rt-detail-row"><div><p className="rt-detail-label">{i.champ3Label}</p><p className="rt-detail-value">{i.champ3Value}</p></div><div><p className="rt-detail-label">{i.champ4Label}</p><p className="rt-detail-value">{i.champ4Value}</p></div></div>
                                <p className="rt-montant-label">{i.montantLabel}</p>
                                <p className="rt-montant-value">{i.montantValue}</p>
                            </div>
                            <div className="rt-footer"><span className="rt-footer-date">{i.dateBas}</span><div className="rt-footer-actions"><button className="rt-icon-btn">👁️</button><button className="rt-icon-btn" style={{ color: '#83C757' }}>📥</button><button className="rt-icon-btn" style={{ color: '#f59e0b' }}>✏️</button></div></div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ReparationsTravaux;
