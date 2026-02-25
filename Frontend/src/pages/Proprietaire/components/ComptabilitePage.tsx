import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend);

interface Transaction {
    date: string; type: string; typeColor: string; description: string; bien: string; categorie: string; montant: string; montantColor: string;
}

const transactions: Transaction[] = [
    { date: '06 Fev 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Février 2025 - Montée Alba', bien: 'Villeurbanne', categorie: 'Loyer', montant: '+695 €', montantColor: '#83C757' },
    { date: '05 Fev 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Réparation chaudière', bien: 'Villeurbanne', categorie: 'Travaux', montant: '-365 €', montantColor: '#ef4444' },
    { date: '03 Fev 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Février 2025 - Thomas Moreau', bien: 'Marseille', categorie: 'Loyer', montant: '+1 250 €', montantColor: '#83C757' },
    { date: '02 Fev 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Assurance PNO 2025', bien: 'Paris 15ème', categorie: 'Assurance', montant: '-420 €', montantColor: '#ef4444' },
    { date: '01 Fev 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Février 2025 - Sophie Bernard', bien: 'Paris 15ème', categorie: 'Loyer', montant: '+1 380 €', montantColor: '#83C757' },
    { date: '30 Jan 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Février 2025 - Jean-Pierre Roussel', bien: 'La Rochelle', categorie: 'Loyer', montant: '+1 060 €', montantColor: '#83C757' },
    { date: '28 Jan 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Relève électricité Janvier', bien: 'Villeurbanne', categorie: 'Charges', montant: '-88 €', montantColor: '#ef4444' },
    { date: '25 Jan 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Réparation gouttière', bien: 'Marseille', categorie: 'Travaux', montant: '-245 €', montantColor: '#ef4444' },
    { date: '20 Jan 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Taxe foncière 2024', bien: 'La Rochelle', categorie: 'Taxes', montant: '-1 280 €', montantColor: '#ef4444' },
    { date: '15 Jan 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Assurance GLI 2025', bien: 'Boulogne-Bil.', categorie: 'Assurance', montant: '-280 €', montantColor: '#ef4444' },
    { date: '15 Jan 2025', type: 'CHARGE', typeColor: '#ef4444', description: 'Diagnostic DPE', bien: 'Boulogne-Bil.', categorie: 'Diagnostics', montant: '-85 €', montantColor: '#ef4444' },
    { date: '05 Jan 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Janvier 2025 - Marie Lefevre', bien: 'Lyon 6ème', categorie: 'Loyer', montant: '+1 120 €', montantColor: '#83C757' },
    { date: '03 Jan 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Janvier 2025 - Thomas Moreau', bien: 'Marseille', categorie: 'Loyer', montant: '+1 250 €', montantColor: '#83C757' },
    { date: '02 Jan 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Janvier 2025 - Montée Alba', bien: 'Villeurbanne', categorie: 'Loyer', montant: '+695 €', montantColor: '#83C757' },
    { date: '01 Jan 2025', type: 'REVENU', typeColor: '#83C757', description: 'Loyer Janvier 2025 - Sophie Bernard', bien: 'Paris 15ème', categorie: 'Loyer', montant: '+1 380 €', montantColor: '#83C757' },
];

interface ComptaProps { notify: (msg: string, type: 'success' | 'info' | 'error') => void; }

const ComptabilitePage: React.FC<ComptaProps> = ({ notify }) => {
    const barRef = useRef<HTMLCanvasElement>(null);
    const donutRef = useRef<HTMLCanvasElement>(null);
    const barInst = useRef<ChartJS | null>(null);
    const donutInst = useRef<ChartJS | null>(null);
    const [activeFilter, setActiveFilter] = useState('Toutes les transactions');
    const filters = ['Toutes les transactions', 'Revenus', 'Charges', 'Janvier 2025', 'Février 2025'];

    useEffect(() => {
        if (!barRef.current) return;
        if (barInst.current) barInst.current.destroy();
        barInst.current = new ChartJS(barRef.current, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], datasets: [
                    { label: 'Loyers reçus', data: [4200, 3800, 4500, 4100, 4800, 4600], backgroundColor: '#4CAF50', borderRadius: 3, borderSkipped: false, barPercentage: 0.4, categoryPercentage: 0.8 },
                    { label: 'Loyers attendus', data: [5000, 5000, 5000, 5000, 5000, 5000], backgroundColor: '#FF9800', borderRadius: 3, borderSkipped: false, barPercentage: 0.4, categoryPercentage: 0.8 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, border: { display: false } }, y: { beginAtZero: true, max: 6000, grid: { color: '#efefef' }, border: { display: false } } } }
        });
        return () => { if (barInst.current) barInst.current.destroy(); };
    }, []);

    useEffect(() => {
        if (!donutRef.current) return;
        if (donutInst.current) donutInst.current.destroy();
        donutInst.current = new ChartJS(donutRef.current, {
            type: 'doughnut',
            data: { labels: ['Occupés', 'Vacants'], datasets: [{ data: [12, 3], backgroundColor: ['#4CAF50', '#FF9800'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } } as any
        });
        return () => { if (donutInst.current) donutInst.current.destroy(); };
    }, []);

    const summaryRevenu = [
        { label: 'Loyers perçus', value: '45 780 €' },
        { label: 'Charges récupérées', value: '3 240 €' },
        { label: 'Autres revenus', value: '450 €' },
        { label: 'Total revenus', value: '+49 470 €', isTotal: true },
    ];
    const summaryCharge = [
        { label: 'Travaux et réparations', value: '5 960 €' },
        { label: 'Charges non récupérables', value: '2 450 €' },
        { label: 'Assurances', value: '1 080 €' },
        { label: 'Taxe foncière', value: '2 960 €' },
        { label: 'Total charges', value: '12 450 €', isTotal: true },
    ];
    const summaryBien = [
        { label: 'Paris 15ème', value: '+18 840 €' },
        { label: 'La Rochelle', value: '+9 780 €' },
        { label: 'Lyon 6ème', value: '+5 980 €' },
        { label: 'Autres biens (6)', value: '+17 980 €' },
        { label: 'Résultat total', value: '+19 355 €', isTotal: true },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .cp-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .cp-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 16px; }
        .cp-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .cp-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; max-width: 550px; }
        .cp-header-btns { display: flex; gap: 10px; flex-shrink: 0; }
        .cp-btn-export { display: inline-flex; align-items: center; gap: 6px; background: #ef4444; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .cp-btn-add { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .cp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.5rem; }
        .cp-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.2rem; border-left: 4px solid transparent; }
        .cp-stat.green { border-left-color: #83C757; }
        .cp-stat.blue { border-left-color: #3b82f6; }
        .cp-stat.red { border-left-color: #ef4444; }
        .cp-stat.orange { border-left-color: #f59e0b; }
        .cp-stat-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin: 0 0 4px 0; }
        .cp-stat-value { font-size: 1.15rem; font-weight: 800; margin: 0; }
        .cp-stat-sub { font-size: 0.68rem; color: #9ca3af; margin: 2px 0 0 0; }
        .cp-charts { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 1.5rem; }
        .cp-chart-card { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1.2rem; }
        .cp-chart-title { font-size: 0.85rem; font-weight: 800; margin: 0 0 12px 0; }
        .cp-chart-wrap { height: 200px; }
        .cp-legend { display: flex; gap: 16px; margin-top: 10px; }
        .cp-legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 600; color: #6b7280; }
        .cp-legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .cp-donut-center { display: flex; justify-content: center; gap: 24px; margin-top: 10px; }
        .cp-donut-stat { text-align: center; }
        .cp-donut-val { font-size: 1.2rem; font-weight: 800; margin: 0; }
        .cp-donut-lbl { font-size: 0.68rem; color: #9ca3af; margin: 0; }
        .cp-summaries { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 1.5rem; }
        .cp-summary { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1.2rem; }
        .cp-summary-title { font-size: 0.72rem; font-weight: 800; color: #9ca3af; display: flex; align-items: center; gap: 6px; margin: 0 0 12px 0; }
        .cp-summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.78rem; color: #374151; }
        .cp-summary-row.total { border-top: 1px solid #e5e7eb; margin-top: 6px; padding-top: 8px; font-weight: 800; }
        .cp-summary-row .val { font-weight: 700; }
        .cp-summary-row .val.green { color: #83C757; }
        .cp-summary-row .val.red { color: #ef4444; }
        .cp-filters { display: flex; gap: 10px; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .cp-filter-btn { padding: 8px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .cp-filter-btn.active { background: #83C757; color: #fff; }
        .cp-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .cp-filter-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .cp-filter-ttl { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .cp-filter-row { display: flex; gap: 1.5rem; margin-bottom: 14px; align-items: center; }
        .cp-select { flex: 1; padding: 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; box-sizing: border-box; }
        .cp-search-wrap { position: relative; flex: 2; }
        .cp-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .cp-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .cp-search-input::placeholder { color: #83C757; font-weight: 600; }
        .cp-tx-count { font-size: 0.82rem; font-weight: 700; color: #374151; white-space: nowrap; }
        .cp-tx-title { font-family: 'Merriweather', serif; font-size: 1.1rem; font-weight: 800; margin: 0 0 12px 0; }
        .cp-table { width: 100%; border-collapse: collapse; }
        .cp-table th { text-align: left; font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .cp-table td { padding: 10px 0; font-size: 0.78rem; border-bottom: 1px solid #f3f4f6; }
        .cp-type-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.62rem; font-weight: 800; }
        @media (max-width: 1024px) { .cp-charts { grid-template-columns: 1fr; } .cp-summaries { grid-template-columns: 1fr; } .cp-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
            <div className="cp-page">
                <div className="cp-header">
                    <div><h1 className="cp-title">Comptabilité et travaux</h1><p className="cp-subtitle">Suivez vos revenus et dépenses locatives en temps réel. Exportez vos données comptables et générez vos déclarations fiscales.</p></div>
                    <div className="cp-header-btns">
                        <button className="cp-btn-export" onClick={() => notify('Export à venir', 'info')}><Download size={15} /> Exporter</button>
                        <button className="cp-btn-add" onClick={() => notify('Ajout transaction à venir', 'info')}><Plus size={15} /> Ajouter une transaction</button>
                    </div>
                </div>

                <div className="cp-stats">
                    <div className="cp-stat green"><p className="cp-stat-label">RÉSULTAT NET</p><p className="cp-stat-value" style={{ color: '#83C757' }}>+ 33 330 €</p></div>
                    <div className="cp-stat blue"><p className="cp-stat-label">REVENUS LOCATIFS</p><p className="cp-stat-value">45 780 €</p><p className="cp-stat-sub">6 biens en location</p></div>
                    <div className="cp-stat red"><p className="cp-stat-label">CHARGES TOTALES</p><p className="cp-stat-value" style={{ color: '#ef4444' }}>12 450 €</p><p className="cp-stat-sub">5 catégories</p></div>
                    <div className="cp-stat orange"><p className="cp-stat-label">TAUX DE RENTABILITÉ</p><p className="cp-stat-value">5.8%</p><p className="cp-stat-sub">Net annuel</p></div>
                </div>

                <div className="cp-charts">
                    <div className="cp-chart-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <p className="cp-chart-title">Loyers</p>
                            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Cette année ▼</span>
                        </div>
                        <div className="cp-chart-wrap"><canvas ref={barRef}></canvas></div>
                        <div className="cp-legend">
                            <span className="cp-legend-item"><span className="cp-legend-dot" style={{ background: '#4CAF50' }}></span> Loyers reçus</span>
                            <span className="cp-legend-item"><span className="cp-legend-dot" style={{ background: '#FF9800' }}></span> Loyers attendus</span>
                        </div>
                    </div>
                    <div className="cp-chart-card">
                        <p className="cp-chart-title">Taux d'occupation</p>
                        <div className="cp-chart-wrap" style={{ height: 160 }}><canvas ref={donutRef}></canvas></div>
                        <div className="cp-donut-center">
                            <div className="cp-donut-stat"><p className="cp-donut-val" style={{ color: '#4CAF50' }}>12</p><p className="cp-donut-lbl">Occupés</p></div>
                            <div className="cp-donut-stat"><p className="cp-donut-val" style={{ color: '#FF9800' }}>3</p><p className="cp-donut-lbl">Vacants</p></div>
                        </div>
                    </div>
                </div>

                <div className="cp-summaries">
                    <div className="cp-summary">
                        <p className="cp-summary-title">🟢 Revenus par catégorie</p>
                        {summaryRevenu.map(r => (<div className={`cp-summary-row ${r.isTotal ? 'total' : ''}`} key={r.label}><span>{r.label}</span><span className={`val ${r.isTotal ? 'green' : ''}`}>{r.value}</span></div>))}
                    </div>
                    <div className="cp-summary">
                        <p className="cp-summary-title">🔴 Charges par catégorie</p>
                        {summaryCharge.map(r => (<div className={`cp-summary-row ${r.isTotal ? 'total' : ''}`} key={r.label}><span>{r.label}</span><span className={`val ${r.isTotal ? 'red' : ''}`}>{r.value}</span></div>))}
                    </div>
                    <div className="cp-summary">
                        <p className="cp-summary-title">🔵 Répartition par bien</p>
                        {summaryBien.map(r => (<div className={`cp-summary-row ${r.isTotal ? 'total' : ''}`} key={r.label}><span>{r.label}</span><span className={`val ${r.isTotal ? 'green' : ''}`}>{r.value}</span></div>))}
                    </div>
                </div>

                <div className="cp-filters">{filters.map(f => (<button key={f} className={`cp-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>))}</div>

                <div className="cp-filter-card">
                    <p className="cp-filter-ttl">FILTRER LES TRANSACTIONS</p>
                    <div className="cp-filter-row">
                        <select className="cp-select"><option>Tous les biens</option></select>
                        <select className="cp-select"><option>Toutes les catégories</option></select>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div className="cp-search-wrap" style={{ flex: 1 }}>
                            <input className="cp-search-input" placeholder="Rechercher une transaction" style={{ paddingLeft: '0.85rem' }} />
                        </div>
                        <span className="cp-tx-count">142 transactions</span>
                    </div>
                </div>

                <h2 className="cp-tx-title">Dernières transactions</h2>
                <table className="cp-table">
                    <thead><tr><th>DATE</th><th>TYPE</th><th>DESCRIPTION</th><th>BIEN</th><th>CATÉGORIE</th><th>MONTANT</th></tr></thead>
                    <tbody>
                        {transactions.map((t, i) => (
                            <tr key={i}>
                                <td>{t.date}</td>
                                <td><span className="cp-type-badge" style={{ background: t.typeColor + '20', color: t.typeColor }}>{t.type}</span></td>
                                <td style={{ fontWeight: 600 }}>{t.description}</td>
                                <td>{t.bien}</td>
                                <td>{t.categorie}</td>
                                <td style={{ fontWeight: 700, color: t.montantColor }}>{t.montant}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ComptabilitePage;
