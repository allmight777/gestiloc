export type Tab = 'home' | 'payments' | 'messages' | 'interventions' | 'documents' | 'lease' | 'property' | 'profile' | 'dashboard' | 'bureau' | 'properties' | 'biens' | 'lots' | 'immeubles' | 'properties-lots' | 'properties-buildings' | 'tenants' | 'locataires' | 'rentals' | 'locations' | 'inventory' | 'inventaires' | 'inspection' | 'etat-des-lieux' | 'finances' | 'finances-overview' | 'finances-loans' | 'finances-summary' | 'finances-tax' | 'my-documents' | 'e-signature' | 'letter-templates' | 'documents' | 'carnet' | 'notebook' | 'messages' | 'candidates' | 'candidats' | 'tools' | 'rent-review' | 'charge-regularization' | 'mail-sending' | 'ai-assistant' | 'trash' | 'corbeille' | 'plus' | 'settings' | 'onboarding' | 'gestion-locative' | 'ajouter-bien' | 'mes-biens' | 'coproprietaires' | 'nouvelle-location' | 'liste-locations';

export enum PaymentStatus {
  PAID = 'Payé',
  PENDING = 'En attente',
  LATE = 'En retard',
  UNPAID = 'Impayé'
}

export interface Payment {
  id: string;
  month: string;
  amount: number;
  status: PaymentStatus;
  datePaid?: string;
  dueDate: string;
}

export interface Message {
  id: string;
  sender: 'me' | 'owner' | 'agency';
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  unreadCount: number;
  avatar?: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Intervention {
  id: string;
  title: string;
  type: 'Plomberie' | 'Électricité' | 'Chauffage' | 'Autre';
  status: 'En cours' | 'Terminé' | 'Planifié';
  date: string;
  provider?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'diagnostic' | 'charge' | 'inventory';
  date: string;
  downloadUrl: string;
}

export interface Notification {
  id: string;
  type: 'critical' | 'important' | 'info';
  message: string;
  subtext?: string;
  isRead: boolean;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
