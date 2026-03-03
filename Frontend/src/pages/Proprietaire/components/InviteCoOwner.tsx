import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Building,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  UserCheck,
  Building2,
} from 'lucide-react';
import api from '@/services/api';
import '@/styles/invite-co-owner.css';

interface InviteCoOwnerProps {
  notify: (msg: string, type: "success" | "info" | "error") => void;
}

interface InviteForm {
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
  is_professional: boolean;
  license_number?: string;
  address_billing?: string;
  ifu?: string;
  rccm?: string;
  vat_number?: string;
  invitation_type: 'co_owner' | 'agency';
}

export const InviteCoOwner: React.FC<InviteCoOwnerProps> = ({ notify }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showTypeSelection, setShowTypeSelection] = useState(true);
  const [formData, setFormData] = useState<InviteForm>({
    email: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    is_professional: false,
    license_number: '',
    address_billing: '',
    ifu: '',
    rccm: '',
    vat_number: '',
    invitation_type: 'co_owner'
  });

  const handleInputChange = (field: keyof InviteForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.email && formData.first_name && formData.last_name;
      case 2:
        if (formData.invitation_type === 'agency') {
          return formData.ifu && formData.rccm;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) {
      const message = formData.invitation_type === 'agency' 
        ? 'Veuillez remplir l\'IFU et le RCCM pour l\'agence'
        : 'Veuillez remplir tous les champs obligatoires';
      notify(message, 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/co-owners/invite', formData);

      if (response.data) {
        const successMessage = formData.invitation_type === 'agency'
          ? 'Agence invitée avec succès!'
          : 'Co-propriétaire invité avec succès!';
        notify(successMessage, 'success');
        
        setFormData({
          email: '',
          first_name: '',
          last_name: '',
          company_name: '',
          phone: '',
          is_professional: false,
          license_number: '',
          address_billing: '',
          ifu: '',
          rccm: '',
          vat_number: '',
          invitation_type: 'co_owner'
        });
        setStep(1);
        setShowTypeSelection(true);
      } else {
        throw new Error('Erreur lors de l\'envoi de l\'invitation');
      }
    } catch (error: unknown) {
      console.error('Erreur:', error);
      let errorMessage = 'Erreur lors de l\'envoi de l\'invitation';
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      notify(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectInvitationType = (type: 'co_owner' | 'agency') => {
    setFormData(prev => ({
      ...prev,
      invitation_type: type,
      is_professional: type === 'agency'
    }));
    setShowTypeSelection(false);
    setStep(1);
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      const message = formData.invitation_type === 'agency'
        ? 'Veuillez remplir l\'IFU et le RCCM pour l\'agence'
        : 'Veuillez remplir tous les champs obligatoires';
      notify(message, 'error');
    }
  };

  const prevStep = () => {
    if (step === 1) {
      setShowTypeSelection(true);
    } else {
      setStep(step - 1);
    }
  };

  const tabs = [
    { key: 1, label: "Informations de base" },
    { key: 2, label: formData.invitation_type === 'agency' ? "Informations agence" : "Complément" },
    { key: 3, label: "Confirmation" },
  ];

  const tabIndex = step - 1;

  // Écran de sélection du type d'invitation
  if (showTypeSelection) {
    return (
      <div className="ico-page">
        <h1 className="ico-title">Inviter un gestionnaire</h1>
        <p className="ico-subtitle">Choisissez le type de gestionnaire que vous souhaitez inviter</p>

        <div className="ico-grid-cards">
          <div className="ico-type-card" onClick={() => selectInvitationType('co_owner')}>
            <div className="ico-type-card-title">Co-propriétaire</div>
            <p className="ico-type-card-desc">
              Invitez un co-propriétaire à gérer vos biens ensemble. Peut être un particulier ou un professionnel.
            </p>
            <div className="ico-type-card-list">
              <div className="ico-type-card-item">
                <CheckCircle size={14} color="#22c55e" />
                <span>Gestion conjointe des biens</span>
              </div>
              <div className="ico-type-card-item">
                <CheckCircle size={14} color="#22c55e" />
                <span>Permissions contrôlées</span>
              </div>
              <div className="ico-type-card-item">
                <CheckCircle size={14} color="#22c55e" />
                <span>Particulier ou Professionnel</span>
              </div>
            </div>
            <button
              type="button"
              className="ico-type-card-btn"
              onClick={(e) => {
                e.stopPropagation();
                selectInvitationType('co_owner');
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                Choisir <ChevronRight size={14} style={{ marginLeft: 6 }} />
              </span>
            </button>
          </div>

          <div className="ico-type-card" onClick={() => selectInvitationType('agency')}>
            <div className="ico-type-card-title">Agence Immobilière</div>
            <p className="ico-type-card-desc">
              Invitez une agence professionnelle pour gérer vos biens. Documents professionnels obligatoires.
            </p>
            <div className="ico-type-card-list">
              <div className="ico-type-card-item">
                <CheckCircle size={14} color="#22c55e" />
                <span>Gestion professionnelle</span>
              </div>
              <div className="ico-type-card-item">
                <CheckCircle size={14} color="#22c55e" />
                <span>Documents légaux requis (IFU, RCCM)</span>
              </div>
              <div className="ico-type-card-item">
                <CheckCircle size={14} color="#22c55e" />
                <span>Facturation professionnelle</span>
              </div>
            </div>
            <button
              type="button"
              className="ico-type-card-btn"
              onClick={(e) => {
                e.stopPropagation();
                selectInvitationType('agency');
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                Choisir <ChevronRight size={14} style={{ marginLeft: 6 }} />
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ico-page">
      {/* En-tête dynamique */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 className="ico-title">
          {formData.invitation_type === 'agency' ? 'Inviter une agence' : 'Inviter un co-propriétaire'}
        </h1>
        <p className="ico-subtitle">
          {formData.invitation_type === 'agency' 
            ? 'Invitez une agence immobilière professionnelle pour gérer vos biens'
            : 'Invitez un co-propriétaire à gérer vos biens ensemble avec des permissions contrôlées'
          }
        </p>
        
        <button
          type="button"
          className="ico-change-type"
          onClick={() => setShowTypeSelection(true)}
        >
          ← Changer de type d'invitation
        </button>
      </div>

      {/* Step indicators */}
      <div className="ico-steps">
        {tabs.map((tab, i) => {
          const isActive = step === tab.key;
          const isCompleted = i < tabIndex;
          return (
            <button
              key={tab.key}
              className={`ico-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
              onClick={() => setStep(tab.key)}
              type="button"
            >
              <span className="ico-step-dot" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ÉTAPE 1: Informations de base */}
      {step === 1 && (
        <div className="ico-card">
          <h2 className="ico-section-label" style={{ marginTop: 0 }}>Informations de base</h2>
          
          <div className="ico-grid-2">
            <div className="ico-field">
              <label className="ico-label">Prénom *</label>
              <div className="ico-input-icon">
                <span className="ico-icon"><UserCheck size={15} /></span>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="ico-input"
                  placeholder={formData.invitation_type === 'agency' ? "Gérant prénom" : "Prénom"}
                  required
                />
              </div>
            </div>
            <div className="ico-field">
              <label className="ico-label">Nom *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="ico-input"
                placeholder={formData.invitation_type === 'agency' ? "Gérant nom" : "Nom"}
                required
              />
            </div>
          </div>

          <div className="ico-grid-2">
            <div className="ico-field">
              <label className="ico-label">Email *</label>
              <div className="ico-input-icon">
                <span className="ico-icon"><Mail size={15} /></span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="ico-input"
                  placeholder={formData.invitation_type === 'agency' ? "contact@agence.com" : "email@exemple.com"}
                  required
                />
              </div>
            </div>
            <div className="ico-field">
              <label className="ico-label">Téléphone</label>
              <div className="ico-input-icon">
                <span className="ico-icon"><Phone size={15} /></span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="ico-input"
                  placeholder="+229 00 00 00 00"
                />
              </div>
            </div>
          </div>

          <div className="ico-actions">
            <button type="button" className="ico-btn-next" onClick={nextStep}>
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 2: Informations spécifiques */}
      {step === 2 && (
        <div className="ico-card">
          {formData.invitation_type === 'agency' ? (
            <>
              <h2 className="ico-section-label" style={{ marginTop: 0 }}>Informations de l'agence</h2>
              
              <div className="ico-alert ico-alert-purple">
                <AlertCircle size={18} color="#9333ea" />
                <p style={{ fontSize: '0.85rem', color: '#6b21a8', margin: 0 }}>
                  Pour une agence, les documents légaux sont obligatoires (IFU et RCCM)
                </p>
              </div>
              
              <div className="ico-grid-2">
                <div className="ico-field">
                  <label className="ico-label">Nom de l'agence</label>
                  <div className="ico-input-icon">
                    <span className="ico-icon"><Building2 size={15} /></span>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className="ico-input"
                      placeholder="Immobilier Excellence"
                    />
                  </div>
                </div>
                <div className="ico-field">
                  <label className="ico-label">IFU *</label>
                  <input
                    type="text"
                    value={formData.ifu}
                    onChange={(e) => handleInputChange('ifu', e.target.value)}
                    className="ico-input"
                    placeholder="1234567890123"
                    required
                  />
                </div>
              </div>

              <div className="ico-grid-2">
                <div className="ico-field">
                  <label className="ico-label">RCCM *</label>
                  <input
                    type="text"
                    value={formData.rccm}
                    onChange={(e) => handleInputChange('rccm', e.target.value)}
                    className="ico-input"
                    placeholder="BJ-1234-5678-BJ-2023"
                    required
                  />
                </div>
                <div className="ico-field">
                  <label className="ico-label">Numéro TVA</label>
                  <input
                    type="text"
                    value={formData.vat_number}
                    onChange={(e) => handleInputChange('vat_number', e.target.value)}
                    className="ico-input"
                    placeholder="BJ123456789"
                  />
                </div>
              </div>

              <div className="ico-field">
                <label className="ico-label">Adresse de facturation</label>
                <div className="ico-input-icon">
                  <span className="ico-icon"><Building size={15} /></span>
                  <input
                    type="text"
                    value={formData.address_billing}
                    onChange={(e) => handleInputChange('address_billing', e.target.value)}
                    className="ico-input"
                    placeholder="123 Rue du Commerce, Cotonou"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="ico-section-label" style={{ marginTop: 0 }}>Informations complémentaires</h2>
              
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <UserPlus size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Le co-propriétaire est un particulier. Aucune information supplémentaire requise.
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Vous pouvez passer directement à l'étape de confirmation
                </p>
              </div>
            </>
          )}

          <div className="ico-actions">
            <button type="button" className="ico-btn-prev" onClick={prevStep}>Précédent</button>
            {formData.invitation_type === 'co_owner' ? (
              <button type="button" className="ico-btn-submit" onClick={nextStep}>
                Confirmer
              </button>
            ) : (
              <button type="button" className="ico-btn-next" onClick={nextStep}>
                Suivant
              </button>
            )}
          </div>
        </div>
      )}

      {/* ÉTAPE 3: Confirmation */}
      {step === 3 && (
        <div className="ico-card">
          <h2 className="ico-section-label" style={{ marginTop: 0 }}>Confirmation de l'invitation</h2>
          
          <div className={`ico-confirm-card ${formData.invitation_type === 'agency' ? 'ico-confirm-card-purple' : 'ico-confirm-card-blue'}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <CheckCircle size={18} color={formData.invitation_type === 'agency' ? '#9333ea' : '#22c55e'} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {formData.invitation_type === 'agency' ? 'Agence à inviter:' : 'Co-propriétaire à inviter:'}
              </span>
            </div>
            
            <div className="ico-confirm-row">
              <div>
                <span className="ico-confirm-label">Nom complet:</span>
                <p className="ico-confirm-value">{formData.first_name} {formData.last_name}</p>
              </div>
              <div>
                <span className="ico-confirm-label">Email:</span>
                <p className="ico-confirm-value">{formData.email}</p>
              </div>
              {formData.phone && (
                <div>
                  <span className="ico-confirm-label">Téléphone:</span>
                  <p className="ico-confirm-value">{formData.phone}</p>
                </div>
              )}
              <div>
                <span className="ico-confirm-label">Type:</span>
                <p className="ico-confirm-value">
                  {formData.invitation_type === 'agency' ? 'Agence Immobilière' : 'Co-propriétaire Particulier'}
                </p>
              </div>
            </div>

            {(formData.invitation_type === 'agency' && (formData.company_name || formData.ifu || formData.rccm)) && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Informations de l'agence:</p>
                <div className="ico-confirm-row">
                  {formData.company_name && (
                    <div>
                      <span className="ico-confirm-label">Agence:</span>
                      <p className="ico-confirm-value">{formData.company_name}</p>
                    </div>
                  )}
                  {formData.ifu && (
                    <div>
                      <span className="ico-confirm-label">IFU:</span>
                      <p className="ico-confirm-value">{formData.ifu}</p>
                    </div>
                  )}
                  {formData.rccm && (
                    <div>
                      <span className="ico-confirm-label">RCCM:</span>
                      <p className="ico-confirm-value">{formData.rccm}</p>
                    </div>
                  )}
                  {formData.vat_number && (
                    <div>
                      <span className="ico-confirm-label">Numéro TVA:</span>
                      <p className="ico-confirm-value">{formData.vat_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={`ico-alert ${formData.invitation_type === 'agency' ? 'ico-alert-purple' : 'ico-alert-blue'}`}>
            <AlertCircle size={18} color={formData.invitation_type === 'agency' ? '#9333ea' : '#2563eb'} />
            <p style={{ fontSize: '0.85rem', margin: 0, color: formData.invitation_type === 'agency' ? '#6b21a8' : '#1e40af' }}>
              Un email d'invitation sera envoyé à {formData.email}. 
              {formData.invitation_type === 'agency' 
                ? ' L\'agence pourra créer son compte et commencer à gérer vos biens.' 
                : ' Le co-propriétaire pourra créer son compte et commencer à gérer vos biens.'}
            </p>
          </div>

          <div className="ico-actions">
            <button type="button" className="ico-btn-prev" onClick={prevStep}>Précédent</button>
            <button
              type="button"
              className="ico-btn-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="ico-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail size={14} />
                  {formData.invitation_type === 'agency' ? 'Inviter l\'agence' : 'Inviter le co-propriétaire'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
