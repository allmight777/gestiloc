import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, Eye, Edit, Trash2, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { invoiceService, Invoice } from '@/services/api';
import { landlordPayments } from '@/services/landlordPayments';

interface FacturesDocsProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const typeLabels: Record<string, { label: string; color: string }> = {
    rent: { label: 'LOYER', color: '#83C757' },
    charge: { label: 'CHARGES', color: '#3b82f6' },
    deposit: { label: 'DÉPÔT', color: '#f59e0b' },
    repair: { label: 'RÉPARATION', color: '#ef4444' },
};

const FacturesDocs: React.FC<FacturesDocsProps> = ({ notify }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [sendingReminder, setSendingReminder] = useState<number | null>(null);
    const navigate = useNavigate();
    const filters = ['Tous', 'Loyer', 'Charges', 'Dépôt', 'Réparation'];

    // Charger les factures depuis l'API
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setIsLoading(true);
                const data = await invoiceService.listInvoices();
                setInvoices(data || []);
            } catch (error) {
                console.error('Erreur lors du chargement des factures:', error);
                notify?.('Erreur lors du chargement des factures', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoices();
    }, [notify]);

    // Voir les détails d'une facture
    const handleView = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setShowModal(true);
    };

    // Télécharger la facture en PDF
    const handleDownload = async (invoice: Invoice) => {
        try {
            notify?.('Génération du PDF en cours...', 'info');
            
            // Appeler l'API pour générer le PDF
            const response = await invoiceService.downloadInvoice(invoice.id);
            
            // Créer un blob et télécharger
            const blob = new Blob([response as any], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `facture_${invoice.invoice_number || invoice.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            notify?.('Facture téléchargée avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            notify?.('Erreur lors du téléchargement de la facture', 'error');
        }
    };

    // Modifier la facture
    const handleEdit = (invoice: Invoice) => {
        navigate(`/proprietaire/factures/${invoice.id}/modifier`);
    };

    // Fermer le modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedInvoice(null);
    };

    // Envoyer un rappel de paiement
    const handleSendReminder = async (invoice: Invoice) => {
        if (!invoice.id) return;
        setSendingReminder(invoice.id);
        try {
            await landlordPayments.sendInvoiceReminder(invoice.id);
            notify?.('Rappel envoyé avec succès!', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'envoi du rappel:', error);
            notify?.('Erreur lors de l\'envoi du rappel', 'error');
        } finally {
            setSendingReminder(null);
        }
    };

    // Filtrer les factures
    const getTypeFilter = (filter: string): string | null => {
        switch (filter) {
            case 'Loyer': return 'rent';
            case 'Charges': return 'charge';
            case 'Dépôt': return 'deposit';
            case 'Réparation': return 'repair';
            default: return null;
        }
    };

    const filtered = invoices.filter(inv => {
        const typeFilter = getTypeFilter(activeFilter);
        
        // Filtre par type
        if (typeFilter && inv.type !== typeFilter) {
            return false;
        }

        // Filtre par recherche
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const matchesTitle = inv.lease?.property?.address?.toLowerCase().includes(search);
            const matchesTenant = inv.lease?.tenant?.first_name?.toLowerCase().includes(search) ||
                                inv.lease?.tenant?.last_name?.toLowerCase().includes(search);
            const matchesInvoiceNumber = inv.invoice_number?.toLowerCase().includes(search);
            return matchesTitle || matchesTenant || matchesInvoiceNumber;
        }

        return true;
    });

    // Statistiques
    const totalDocuments = invoices.length;
    const thisMonthInvoices = invoices.filter(inv => {
        const createdAt = new Date(inv.created_at || '');
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && 
               createdAt.getFullYear() === now.getFullYear();
    }).length;
    
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount_total || 0), 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;

    const stats = [
        { label: 'TOTAL FACTURES', value: totalDocuments.toString(), color: '#1a1a1a' },
        { label: 'CE MOIS', value: thisMonthInvoices.toString(), color: '#1a1a1a' },
        { label: 'MONTANT TOTAL', value: `${totalAmount.toLocaleString('fr-FR')} €`, color: '#83C757' },
        { label: 'EN ATTENTE', value: pendingInvoices.toString(), color: pendingInvoices > 0 ? '#f59e0b' : '#1a1a1a' },
    ];

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatAmount = (amount?: number) => {
        if (amount === undefined || amount === null) return '—';
        return `${amount.toLocaleString('fr-FR')} €`;
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'paid': return { label: 'PAYÉE', color: '#22c55e' };
            case 'pending': return { label: 'EN ATTENTE', color: '#f59e0b' };
            case 'overdue': return { label: 'EN RETARD', color: '#ef4444' };
            case 'partially_paid': return { label: 'PARTIEL', color: '#3b82f6' };
            default: return { label: status?.toUpperCase() || '—', color: '#6b7280' };
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        .fd-page { padding: 1.5rem 1rem 3rem; font-family: 'Manrope', sans-serif; color: #1a1a1a; width: 100%; box-sizing: border-box; }
        .fd-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .fd-title { font-family: 'Merriweather', serif; font-size: 1.55rem; font-weight: 900; margin: 0 0 6px 0; }
        .fd-subtitle { font-size: 0.82rem; font-weight: 500; color: #6b7280; margin: 0; font-style: italic; max-width: 600px; }
        .fd-add-btn { display: inline-flex; align-items: center; gap: 6px; background: #83C757; color: #fff; border: none; border-radius: 12px; padding: 10px 22px; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .fd-add-btn:hover { background: #72b44a; }
        .fd-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.25rem; }
        .fd-stat { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1rem 1.2rem; }
        .fd-stat-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px 0; }
        .fd-stat-value { font-size: 1.15rem; font-weight: 800; margin: 0; }
        .fd-filters { display: flex; gap: 10px; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .fd-filter-btn { padding: 8px 22px; border-radius: 20px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
        .fd-filter-btn.active { background: #83C757; color: #fff; }
        .fd-filter-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .fd-card { background: #fff; border: 1.5px solid #d6e4d6; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .fd-filter-title { font-size: 0.72rem; font-weight: 800; color: #4b5563; letter-spacing: 0.06em; margin: 0 0 14px 0; }
        .fd-filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 14px; }
        .fd-select { width: 100%; padding: 0.6rem 2.2rem 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.82rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #6b7280; background: #fff; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; box-sizing: border-box; }
        .fd-search-wrap { position: relative; }
        .fd-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #83C757; pointer-events: none; }
        .fd-search-input { width: 100%; padding: 0.65rem 0.85rem 0.65rem 2.6rem; border: 1.5px solid #83C757; border-radius: 10px; font-size: 0.85rem; font-family: 'Manrope', sans-serif; font-weight: 500; color: #83C757; background: #fff; outline: none; box-sizing: border-box; }
        .fd-search-input::placeholder { color: #83C757; font-weight: 600; }
        .fd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .fd-item { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
        .fd-item-top { padding: 1.1rem 1.3rem 0.7rem; }
        .fd-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.60rem; font-weight: 800; letter-spacing: 0.04em; margin-bottom: 10px; }
        .fd-item-titre { font-size: 0.92rem; font-weight: 800; color: #1a1a1a; margin: 0 0 4px 0; }
        .fd-item-lieu { font-size: 0.75rem; color: #6b7280; font-weight: 500; display: flex; align-items: center; gap: 4px; margin: 0 0 14px 0; }
        .fd-detail-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
        .fd-detail-label { font-size: 0.60rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 2px 0; }
        .fd-detail-value { font-size: 0.78rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .fd-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 1.3rem; border-top: 1px solid #f3f4f6; margin-top: auto; }
        .fd-footer-date { font-size: 0.72rem; color: #9ca3af; font-weight: 500; }
        .fd-footer-actions { display: flex; gap: 6px; }
        .fd-icon-btn { background: none; border: none; cursor: pointer; padding: 4px; font-size: 0.85rem; color: #9ca3af; }
        .fd-icon-btn.green { color: #83C757; }
        .fd-icon-btn.orange { color: #f59e0b; }
        .fd-empty { text-align: center; padding: 3rem 1rem; color: #6b7280; }
        .fd-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .fd-loading { text-align: center; padding: 3rem 1rem; color: #6b7280; }
        @media (max-width: 1400px) { .fd-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1024px) { .fd-grid { grid-template-columns: repeat(2, 1fr); } .fd-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) {
          .fd-grid { grid-template-columns: 1fr; }
          .fd-stats { grid-template-columns: repeat(2, 1fr); }
          .fd-filter-row { grid-template-columns: 1fr; }
          .fd-header { flex-direction: column; gap: 12px; }
          .fd-add-btn { width: 100%; justify-content: center; }
          .fd-card { padding: 1rem; }
          .fd-filters { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
          .fd-filter-btn { flex-shrink: 0; }
        }
        @media (max-width: 480px) {
          .fd-page { padding: 1rem 0.5rem 2rem; }
          .fd-title { font-size: 1.2rem; }
          .fd-stats { grid-template-columns: 1fr; }
          .fd-filter-btn { padding: 6px 14px; font-size: 0.75rem; }
        }
      `}</style>

            <div className="fd-page">
                <div className="fd-header">
                    <div>
                        <h1 className="fd-title">Factures et documents divers</h1>
                        <p className="fd-subtitle">Gérez vos factures de loyer, charges, dépôts et réparations. Suivez vos paiements et téléchargez vos documents.</p>
                    </div>
                    <button className="fd-add-btn" onClick={() => navigate('/proprietaire/factures/nouveau')}>
                        <Plus size={15} /> Nouvelle facture
                    </button>
                </div>

                <div className="fd-stats">
                    {stats.map(s => (
                        <div className="fd-stat" key={s.label}>
                            <p className="fd-stat-label">{s.label}</p>
                            <p className="fd-stat-value" style={{ color: s.color }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="fd-filters">
                    {filters.map(f => (
                        <button key={f} className={`fd-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
                    ))}
                </div>

                <div className="fd-card">
                    <p className="fd-filter-title">RECHERCHER</p>
                    <div className="fd-search-wrap">
                        <Search size={16} className="fd-search-icon" />
                        <input className="fd-search-input" placeholder="Rechercher par bien, locataire ou numéro..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {isLoading ? (
                    <div className="fd-loading">Chargement des factures...</div>
                ) : filtered.length === 0 ? (
                    <div className="fd-empty">
                        <div className="fd-empty-icon">📄</div>
                        <p>Aucune facture trouvée</p>
                        {searchTerm && <p>Essayez avec d'autres termes de recherche</p>}
                    </div>
                ) : (
                    <div className="fd-grid">
                        {filtered.map(inv => {
                            const typeInfo = typeLabels[inv.type || ''] || { label: 'FACTURE', color: '#6b7280' };
                            const statusInfo = getStatusBadge(inv.status);
                            
                            return (
                                <div className="fd-item" key={inv.id}>
                                    <div className="fd-item-top">
                                        <span className="fd-badge" style={{ background: typeInfo.color + '20', color: typeInfo.color }}>{typeInfo.label}</span>
                                        <p className="fd-item-titre">{inv.invoice_number || `Facture #${inv.id}`}</p>
                                        <p className="fd-item-lieu">📍 {inv.lease?.property?.address || 'Adresse non disponible'}</p>
                                        <div className="fd-detail-row">
                                            <div>
                                                <p className="fd-detail-label">Locataire</p>
                                                <p className="fd-detail-value">
                                                    {inv.lease?.tenant?.first_name} {inv.lease?.tenant?.last_name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="fd-detail-label">Échéance</p>
                                                <p className="fd-detail-value">{formatDate(inv.due_date)}</p>
                                            </div>
                                        </div>
                                        <div className="fd-detail-row">
                                            <div>
                                                <p className="fd-detail-label">Montant</p>
                                                <p className="fd-detail-value" style={{ color: '#83C757' }}>{formatAmount(inv.amount_total)}</p>
                                            </div>
                                            <div>
                                                <p className="fd-detail-label">Statut</p>
                                                <p className="fd-detail-value" style={{ color: statusInfo.color }}>{statusInfo.label}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="fd-footer">
                                        <span className="fd-footer-date">Créée le {formatDate(inv.created_at)}</span>
                                        <div className="fd-footer-actions">
                                            <button className="fd-icon-btn" title="Voir" onClick={() => handleView(inv)}><Eye /></button>
                                            <button 
                                                className="fd-icon-btn" 
                                                title="Envoyer un rappel" 
                                                onClick={() => handleSendReminder(inv)}
                                                disabled={sendingReminder === inv.id || inv.status === 'paid'}
                                                style={{ color: sendingReminder === inv.id ? '#83C757' : (inv.status === 'paid' ? '#d1d5db' : '#f59e0b') }}
                                            >
                                                {sendingReminder === inv.id ? <Loader2 size={16} className="animate-spin" /> : <Mail />}
                                            </button>
                                            <button className="fd-icon-btn green" title="Télécharger" onClick={() => handleDownload(inv)}><Download /></button>
                                            <button className="fd-icon-btn orange" title="Modifier" onClick={() => handleEdit(inv)}><Edit /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default FacturesDocs;
