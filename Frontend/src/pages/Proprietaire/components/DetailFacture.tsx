import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Mail, Loader2, Check, AlertTriangle, Clock } from 'lucide-react';
import { invoiceService, Invoice } from '@/services/api';

interface DetailFactureProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const DetailFacture: React.FC<DetailFactureProps> = ({ notify }) => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const invoices = await invoiceService.listInvoices();
                const found = invoices.find(inv => inv.id === Number(id));
                if (found) {
                    setInvoice(found);
                } else {
                    notify('Facture non trouvée', 'error');
                    navigate('/proprietaire/factures');
                }
            } catch (error) {
                console.error('Erreur lors du chargement de la facture:', error);
                notify('Erreur lors du chargement de la facture', 'error');
                navigate('/proprietaire/factures');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [id, navigate, notify]);

    const handleDownload = async () => {
        if (!invoice?.id) return;
        setDownloading(true);
        try {
            const blob = await invoiceService.downloadInvoice(invoice.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `facture_${invoice.invoice_number || invoice.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            notify('Facture téléchargée avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            notify('Erreur lors du téléchargement de la facture', 'error');
        } finally {
            setDownloading(false);
        }
    };

    const handleSendEmail = () => {
        if (invoice?.lease?.tenant?.email) {
            window.location.href = `mailto:${invoice.lease.tenant.email}?subject=Facture ${invoice.invoice_number || '#' + invoice.id}`;
            notify('Email ouvert avec succès', 'success');
        } else {
            notify('Email du locataire non disponible', 'error');
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatAmount = (amount?: number) => {
        if (amount === undefined || amount === null) return '—';
        return `${amount.toLocaleString('fr-FR')} €`;
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'paid':
                return { label: 'PAYÉE', color: '#22c55e', bg: '#dcfce7', icon: <Check size={14} /> };
            case 'pending':
                return { label: 'EN ATTENTE', color: '#f59e0b', bg: '#fef3c7', icon: <Clock size={14} /> };
            case 'overdue':
                return { label: 'EN RETARD', color: '#ef4444', bg: '#fee2e2', icon: <AlertTriangle size={14} /> };
            case 'partially_paid':
                return { label: 'PARTIEL', color: '#3b82f6', bg: '#dbeafe', icon: <Clock size={14} /> };
            default:
                return { label: status?.toUpperCase() || '—', color: '#6b7280', bg: '#f3f4f6', icon: null };
        }
    };

    const getTypeLabel = (type?: string) => {
        switch (type) {
            case 'rent': return 'Loyer';
            case 'charge': return 'Charges';
            case 'deposit': return 'Dépôt de garantie';
            case 'repair': return 'Réparation';
            default: return type || 'Facture';
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Chargement des détails...</p>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#6b7280' }}>Facture non trouvée</p>
                <button 
                    onClick={() => navigate('/proprietaire/factures')}
                    style={{ marginTop: '1rem', padding: '10px 20px', background: '#83C757', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Retour aux factures
                </button>
            </div>
        );
    }

    const statusInfo = getStatusBadge(invoice.status);

    return (
        <div style={{ padding: '1.5rem 2rem 3rem', fontFamily: "'Manrope', sans-serif", color: '#1a1a1a', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <button 
                        onClick={() => navigate('/proprietaire/factures')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '0.85rem', fontWeight: 600, color: '#374151', cursor: 'pointer', marginBottom: '1rem' }}
                    >
                        <ArrowLeft size={18} /> Retour
                    </button>
                    <h1 style={{ fontSize: '1.55rem', fontWeight: 900, margin: '0 0 6px 0' }}>Détails de la facture</h1>
                    <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0 }}>{invoice.invoice_number || `Facture #${invoice.id}`}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={handleSendEmail}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '10px', padding: '10px 18px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', background: '#fff', border: '1.5px solid #d1d5db', color: '#374151' }}
                    >
                        <Mail size={16} /> Envoyer par email
                    </button>
                    <button 
                        onClick={handleDownload}
                        disabled={downloading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '10px', padding: '10px 18px', fontSize: '0.85rem', fontWeight: 600, cursor: downloading ? 'not-allowed' : 'pointer', background: '#83C757', border: 'none', color: '#fff' }}
                    >
                        {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Télécharger PDF
                    </button>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4b5563', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Statut</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, background: statusInfo.bg, color: statusInfo.color }}>
                    {statusInfo.icon}
                    {statusInfo.label}
                </div>
            </div>

            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4b5563', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Informations générales</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Type de facture</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{getTypeLabel(invoice.type)}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Numéro</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{invoice.invoice_number || `FAC-${invoice.id}`}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Échéance</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{formatDate(invoice.due_date)}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Création</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{formatDate(invoice.created_at)}</p>
                    </div>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4b5563', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Montant</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Total</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#83C757' }}>{formatAmount(invoice.amount_total)}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Payé</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{formatAmount(invoice.amount_paid)}</p>
                    </div>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4b5563', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Locataire</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Nom</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{invoice.lease?.tenant?.first_name} {invoice.lease?.tenant?.last_name}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Email</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{invoice.lease?.tenant?.email || '—'}</p>
                    </div>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4b5563', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bien</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Adresse</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{invoice.lease?.property?.address || 'Adresse non disponible'}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Ville</p>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{invoice.lease?.property?.city || '—'}</p>
                    </div>
                </div>
            </div>

            {invoice.period_start && invoice.period_end && (
                <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4b5563', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Période</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Début</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{formatDate(invoice.period_start || undefined)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Fin</p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{formatDate(invoice.period_end || undefined)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailFacture;
