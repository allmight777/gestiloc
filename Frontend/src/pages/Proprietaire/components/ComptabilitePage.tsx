import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { accountingService, AccountingStats, AccountingTransaction, propertyService, Property } from '@/services/api';

ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend);

interface ComptaProps { notify: (msg: string, type: 'success' | 'info' | 'error') => void; }

const ComptabilitePage: React.FC<ComptaProps> = ({ notify }) => {
    const navigate = useNavigate();
    const barRef = useRef<HTMLCanvasElement>(null);
    const donutRef = useRef<HTMLCanvasElement>(null);
    const barInst = useRef<ChartJS | null>(null);
    const donutInst = useRef<ChartJS | null>(null);
    const [activeFilter, setActiveFilter] = useState('Toutes les transactions');
    const filters = ['Toutes les transactions', 'Revenus', 'Charges', 'Janvier', 'Février'];
    
    // Données réelles depuis l'API
    const [stats, setStats] = useState<AccountingStats | null>(null);
    const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentYear = new Date().getFullYear();

    // Charger les données depuis l'API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Charger les stats comptables
                const statsResponse = await accountingService.getStats(currentYear);
                setStats(statsResponse);

                // Charger les transactions
                const transactionsResponse = await accountingService.getTransactions();
                setTransactions(transactionsResponse);

                // Charger les propriétés pour les filtres
                const propsResponse = await propertyService.listProperties();
                if (propsResponse.data) {
                    setProperties(propsResponse.data);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
                notify?.('Erreur lors du chargement des données comptables', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentYear, notify]);

    // Graphique des revenus
    useEffect(() => {
        if (!barRef.current) return;
        if (barInst.current) barInst.current.destroy();
        
        // Utiliser les données réelles ou des données par défaut
        const revenus = stats?.revenus || 0;
        const expectedRevenus = stats?.revenus || 5000;
        
        barInst.current = new ChartJS(barRef.current, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                datasets: [
                    { label: 'Loyers reçus', data: [revenus * 0.8, revenus * 0.9, revenus, revenus * 0.7, revenus * 0.85, revenus * 0.95], backgroundColor: '#4CAF50', borderRadius: 3, borderSkipped: false, barPercentage: 0.4, categoryPercentage: 0.8 },
                    { label: 'Loyers attendus', data: Array(6).fill(expectedRevenus), backgroundColor: '#FF9800', borderRadius: 3, borderSkipped: false, barPercentage: 0.4, categoryPercentage: 0.8 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, border: { display: false } }, y: { beginAtZero: true, max: expectedRevenus * 1.2, grid: { color: '#efefef' }, border: { display: false } } } }
        });
        return () => { if (barInst.current) barInst.current.destroy(); };
    }, [stats]);

    // Graphique d'occupation
    useEffect(() => {
        if (!donutRef.current) return;
        if (donutInst.current) donutInst.current.destroy();
        
        const occupied = stats?.occupied || 0;
        const vacant = stats?.vacant || 0;
        
        donutInst.current = new ChartJS(donutRef.current, {
            type: 'doughnut',
            data: { labels: ['Occupés', 'Vacants'], datasets: [{ data: [occupied || 12, vacant || 3], backgroundColor: ['#4CAF50', '#FF9800'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } } as any
        });
        return () => { if (donutInst.current) donutInst.current.destroy(); };
    }, [stats]);

    // Données格式化ées
    const summaryRevenu = stats?.revenus_par_categorie ? Object.entries(stats.revenus_par_categorie).map(([label, value]) => ({ label, value: `${value.toLocaleString()} €` })) : [];
    if (summaryRevenu.length > 0) {
        const total = summaryRevenu.reduce((sum, r) => sum + (parseFloat(r.value.replace(/[^0-9]/g, '')) || 0), 0);
        summaryRevenu.push({ label: 'Total revenus', value: `+ ${total.toLocaleString()} €`, isTotal: true });
    }

    const summaryCharge = stats?.charges_par_categorie ? Object.entries(stats.charges_par_categorie).map(([label, value]) => ({ label, value: `${value.toLocaleString()} €` })) : [];
    if (summaryCharge.length > 0) {
        const total = summaryCharge.reduce((sum, r) => sum + (parseFloat(r.value.replace(/[^0-9]/g, '')) || 0), 0);
        summaryCharge.push({ label: 'Total charges', value: `${total.toLocaleString()} €`, isTotal: true });
    }

    const summaryBien = stats?.repartition_par_bien ? Object.entries(stats.repartition_par_bien).map(([label, data]: [string, any]) => ({ label, value: `${data.resultat > 0 ? '+' : ''}${data.resultat.toLocaleString()} €` })) : [];

    // Formatter les transactions pour l'affichage
    const formatTransactionDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
    };

    const formatAmount = (amount: number, type: string) => {
        const formatted = amount.toLocaleString('fr-FR') + ' €';
        return type === 'REVENU' ? '+' + formatted : '-' + formatted;
    };

    if (isLoading) {
        return (
            <div className="cp-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Chargement des données comptables...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cp-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
                .cp-page { padding: 1.5rem 1.5rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; max-width: 1400px; margin: 0 auto; box-sizing: border-box; }
                .cp-header { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }
                @media (min-width: 768px) { .cp-header { flex-direction: row; align-items: flex-start; justify-content: space-between; } }
                
                .cp-title { font-family: 'Merriweather', serif; font-size: clamp(1.4rem, 4vw, 1.8rem); font-weight: 900; margin: 0 0 8px 0; color: #111; }
                .cp-subtitle { font-size: 0.85rem; font-weight: 500; color: #6b7280; margin: 0; line-height: 1.6; max-width: 600px; }
                .cp-header-btns { display: flex; gap: 0.75rem; width: 100%; }
                @media (min-width: 768px) { .cp-header-btns { width: auto; } }
                
                .cp-btn-export, .cp-btn-add { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 14px; padding: 12px 24px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
                .cp-btn-export { background: #fee2e2; color: #ef4444; }
                .cp-btn-export:hover { background: #fecaca; }
                .cp-btn-add { background: #83C757; color: #fff; box-shadow: 0 4px 12px rgba(131,199,87,0.2); }
                .cp-btn-add:hover { background: #72b44a; transform: translateY(-1px); }

                .cp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
                .cp-stat { background: #fff; border: 1.5px solid #eef2ee; border-radius: 20px; padding: 1.5rem; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .cp-stat:hover { transform: translateY(-2px); border-color: #d6e4d6; }
                .cp-stat-label { font-size: 0.65rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 10px 0; }
                .cp-stat-value { font-size: 1.4rem; font-weight: 850; margin: 0; }
                .cp-stat-sub { font-size: 0.75rem; font-weight: 600; color: #6b7280; margin: 6px 0 0 0; }

                .cp-charts { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                @media (min-width: 1024px) { .cp-charts { grid-template-columns: 2fr 1fr; } }
                
                .cp-chart-card { background: #fff; border: 1.5px solid #eef2ee; border-radius: 24px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
                .cp-chart-title { font-family: 'Merriweather', serif; font-size: 1rem; font-weight: 800; margin: 0; color: #1a1a1a; }
                .cp-chart-wrap { height: 260px; width: 100%; position: relative; }
                
                .cp-summaries { display: grid; grid-template-columns: 1fr; gap: 1.25rem; margin-bottom: 2rem; }
                @media (min-width: 768px) { .cp-summaries { grid-template-columns: repeat(3, 1fr); } }
                
                .cp-summary { background: #fff; border: 1.5px solid #eef2ee; border-radius: 20px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .cp-summary-title { font-size: 0.75rem; font-weight: 800; color: #9ca3af; display: flex; align-items: center; gap: 10px; margin: 0 0 1.5rem 0; text-transform: uppercase; letter-spacing: 0.05em; }
                .cp-summary-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 0.82rem; font-weight: 600; color: #4b5563; }
                .cp-summary-row.total { border-top: 1.5px dashed #f3f4f6; margin-top: 10px; padding-top: 15px; font-weight: 850; color: #111; }

                .cp-filters { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 6px; -webkit-overflow-scrolling: touch; }
                .cp-filter-btn { flex-shrink: 0; padding: 10px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .cp-filter-btn.active { background: #83C757; color: #fff; box-shadow: 0 4px 10px rgba(131,199,87,0.2); }
                .cp-filter-btn:not(.active) { background: #f3f4f6; color: #6b7280; }

                .cp-filter-card { background: #fff; border: 1.5px solid #eef2ee; border-radius: 24px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
                .cp-filter-row { display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1rem; }
                @media (min-width: 640px) { .cp-filter-row { grid-template-columns: repeat(2, 1fr); } }
                
                .cp-select { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1.5px solid #eef2ee; background: transparent; font-family: 'Manrope', sans-serif; font-size: 0.85rem; color: #374151; outline: none; box-sizing: border-box; cursor: pointer; }
                .cp-select:focus { border-color: #83C757; }
                .cp-select option { background: white; color: #374151; }
                
                .cp-table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 20px; border: 1.5px solid #eef2ee; background: #fff; }
                .cp-table { width: 100%; border-collapse: collapse; min-width: 850px; }
                .cp-table th { text-align: left; font-size: 0.65rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; padding: 16px; border-bottom: 1px solid #f9fafb; background: #fafbfc; }
                .cp-table td { padding: 16px; font-size: 0.85rem; border-bottom: 1px solid #f9fafb; color: #4b5563; }
                .cp-table tr:hover { background: #fdfdfd; }
                .cp-type-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                
                .cp-donut-data { display: flex; justify-content: center; gap: 24px; margin-top: 20px; }
                .cp-donut-item { text-align: center; }
                .cp-donut-v { font-size: 1.2rem; font-weight: 850; margin: 0; }
                .cp-donut-l { font-size: 0.7rem; color: #9ca3af; margin: 0; font-weight: 700; }
                
                .cp-search { width: 100%; padding: 12px 16px; borderRadius: 12px; border: 1.5px solid #83C757; background: transparent; color: #374151; font-weight: 600; outline: none; box-sizing: border-box; }
                .cp-search::placeholder { color: #83C757; opacity: 0.7; }

                .spinner { width: 40px; height: 40px; border: 3px solid #eef2ee; border-top-color: #83C757; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="cp-header">
                <div>
                    <h1 className="cp-title">Comptabilité et travaux</h1>
                    <p className="cp-subtitle">Suivez vos revenus et dépenses locatives en temps réel. Exportez vos données comptables et générez vos déclarations fiscales.</p>
                </div>
                <div className="cp-header-btns">
                    <button className="cp-btn-export" onClick={() => notify('Export à venir', 'info')}><Download size={15} /> Exporter</button>
                    <button className="cp-btn-add" onClick={() => navigate('/proprietaire/comptabilite/nouveau')}><Plus size={15} /> Ajouter une transaction</button>
                </div>
            </div>

            <div className="cp-stats">
                <div className="cp-stat" style={{ borderLeftColor: '#83C757' }}><p className="cp-stat-label">RÉSULTAT NET</p><p className="cp-stat-value" style={{ color: '#83C757' }}>+ {stats?.resultat_net?.toLocaleString() || 0} €</p></div>
                <div className="cp-stat" style={{ borderLeftColor: '#3b82f6' }}><p className="cp-stat-label">REVENUS LOCATIFS</p><p className="cp-stat-value">{stats?.revenus?.toLocaleString() || 0} €</p><p className="cp-stat-sub">{stats?.total_properties || 0} biens en location</p></div>
                <div className="cp-stat" style={{ borderLeftColor: '#ef4444' }}><p className="cp-stat-label">CHARGES TOTALES</p><p className="cp-stat-value" style={{ color: '#ef4444' }}>{stats?.charges?.toLocaleString() || 0} €</p><p className="cp-stat-sub">{Object.keys(stats?.charges_par_categorie || {}).length} catégories</p></div>
                <div className="cp-stat" style={{ borderLeftColor: '#f59e0b' }}><p className="cp-stat-label">TAUX DE RENTABILITÉ</p><p className="cp-stat-value">{stats?.rentabilite || 0}%</p><p className="cp-stat-sub">Net annuel</p></div>
            </div>

            <div className="cp-charts">
                <div className="cp-chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <p className="cp-chart-title">Loyers</p>
                        <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700 }}>{currentYear} ▼</span>
                    </div>
                    <div className="cp-chart-wrap"><canvas ref={barRef}></canvas></div>
                </div>
                <div className="cp-chart-card">
                    <p className="cp-chart-title" style={{ marginBottom: 16 }}>Taux d'occupation</p>
                    <div className="cp-chart-wrap" style={{ height: 180 }}><canvas ref={donutRef}></canvas></div>
                    <div className="cp-donut-data">
                        <div className="cp-donut-item"><p className="cp-donut-v" style={{ color: '#4CAF50' }}>{stats?.occupied || 0}</p><p className="cp-donut-l">Occupés</p></div>
                        <div className="cp-donut-item"><p className="cp-donut-v" style={{ color: '#FF9800' }}>{stats?.vacant || 0}</p><p className="cp-donut-l">Vacants</p></div>
                    </div>
                </div>
            </div>

            <div className="cp-summaries">
                <div className="cp-summary">
                    <p className="cp-summary-title">🟢 Revenus par catégorie</p>
                    {summaryRevenu.length > 0 ? summaryRevenu.map(r => (<div className={`cp-summary-row ${(r as any).isTotal ? 'total' : ''}`} key={r.label}><span>{r.label}</span><span style={{ color: (r as any).isTotal ? '#83C757' : 'inherit' }}>{r.value}</span></div>)) : (
                        <div className="cp-summary-row"><span>Aucune donnée</span><span>0 €</span></div>
                    )}
                </div>
                <div className="cp-summary">
                    <p className="cp-summary-title">🔴 Charges par catégorie</p>
                    {summaryCharge.length > 0 ? summaryCharge.map(r => (<div className={`cp-summary-row ${(r as any).isTotal ? 'total' : ''}`} key={r.label}><span>{r.label}</span><span style={{ color: (r as any).isTotal ? '#ef4444' : 'inherit' }}>{r.value}</span></div>)) : (
                        <div className="cp-summary-row"><span>Aucune donnée</span><span>0 €</span></div>
                    )}
                </div>
                <div className="cp-summary">
                    <p className="cp-summary-title">🔵 Répartition par bien</p>
                    {summaryBien.length > 0 ? summaryBien.map(r => (<div className="cp-summary-row" key={r.label}><span>{r.label}</span><span>{r.value}</span></div>)) : (
                        <div className="cp-summary-row"><span>Aucun bien</span><span>0 €</span></div>
                    )}
                </div>
            </div>

            <div className="cp-filters">
                {filters.map(f => (<button key={f} className={`cp-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>))}
            </div>

            <div className="cp-filter-card">
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Filtrer les transactions</p>
                <div className="cp-filter-row">
                    <select className="cp-select">
                        <option value="">Tous les biens</option>
                        {properties.map(prop => (
                            <option key={prop.id} value={prop.id}>{prop.name || prop.address}</option>
                        ))}
                    </select>
                    <select className="cp-select">
                        <option value="">Toutes les catégories</option>
                        <option value="loyer">Loyer</option>
                        <option value="charge">Charge</option>
                        <option value="travaux">Travaux</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input className="cp-search" placeholder="Rechercher une transaction..." />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>{transactions.length} transactions trouvées</span>
                </div>
            </div>

            <h2 className="cp-title" style={{ fontSize: '1.2rem', marginBottom: 16 }}>Dernières transactions</h2>
            <div className="cp-table-container">
                <table className="cp-table">
                    <thead><tr><th>DATE</th><th>TYPE</th><th>DESCRIPTION</th><th>BIEN</th><th>CATÉGORIE</th><th>MONTANT</th></tr></thead>
                    <tbody>
                        {transactions.length > 0 ? transactions.map((t) => (
                            <tr key={t.id}>
                                <td>{formatTransactionDate(t.date)}</td>
                                <td><span className="cp-type-badge" style={{ background: t.type === 'REVENU' ? '#83C75715' : '#ef444415', color: t.type === 'REVENU' ? '#83C757' : '#ef4444' }}>{t.type}</span></td>
                                <td style={{ fontWeight: 700, color: '#111' }}>{t.description}</td>
                                <td style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.property_name}</td>
                                <td style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.category}</td>
                                <td style={{ fontWeight: 850, color: t.type === 'REVENU' ? '#83C757' : '#ef4444' }}>{formatAmount(t.amount, t.type)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Aucune transaction trouvée
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComptabilitePage;
