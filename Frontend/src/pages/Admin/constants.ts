import { User, UserStatus, Ticket, TicketStatus, TicketPriority, ActivityLog, RevenueData } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Dubois', email: 'alice@example.com', role: 'Manager', status: UserStatus.ACTIVE, lastActive: 'il y a 2 min', avatarUrl: 'https://picsum.photos/100/100?random=1' },
  { id: '2', name: 'Marc Leroy', email: 'marc@example.com', role: 'Tenant', status: UserStatus.INACTIVE, lastActive: 'il y a 5 jours', avatarUrl: 'https://picsum.photos/100/100?random=2' },
  { id: '3', name: 'Sophie Martin', email: 'sophie@example.com', role: 'Admin', status: UserStatus.ACTIVE, lastActive: 'À l\'instant', avatarUrl: 'https://picsum.photos/100/100?random=3' },
  { id: '4', name: 'Jean Dupont', email: 'jean@example.com', role: 'Tenant', status: UserStatus.PENDING, lastActive: 'il y a 1 jour', avatarUrl: 'https://picsum.photos/100/100?random=4' },
  { id: '5', name: 'Claire Petit', email: 'claire@example.com', role: 'Manager', status: UserStatus.WARNING, lastActive: 'il y a 3 heures', avatarUrl: 'https://picsum.photos/100/100?random=5' },
] as const;

export const MOCK_TICKETS: Ticket[] = [
  { id: 'T-1024', subject: 'Problème de chauffage Apt 4B', requester: 'Marc Leroy', status: TicketStatus.NEW, priority: TicketPriority.URGENT, created: '10:30', tags: ['Maintenance', 'Plomberie'] },
  { id: 'T-1025', subject: 'Demande renouvellement bail', requester: 'Alice Dubois', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.MEDIUM, created: 'Hier', tags: ['Admin'] },
  { id: 'T-1026', subject: 'Plainte bruit voisin', requester: 'Jean Dupont', status: TicketStatus.RESOLVED, priority: TicketPriority.LOW, created: 'il y a 2 jours', tags: ['Plainte'] },
  { id: 'T-1027', subject: 'Badge accès défectueux', requester: 'Sarah Connor', status: TicketStatus.NEW, priority: TicketPriority.HIGH, created: 'il y a 1h', tags: ['Sécurité'] },
];

export const MOCK_ACTIVITY: ActivityLog[] = [
  { id: '1', action: 'Nouveau locataire enregistré', user: 'Système', timestamp: '10:42', type: 'success' },
  { id: '2', action: 'Échec paiement Apt 4B', user: 'Marc Leroy', timestamp: '09:15', type: 'error' },
  { id: '3', action: 'Ticket maintenance mis à jour', user: 'Alice Dubois', timestamp: 'Hier', type: 'info' },
  { id: '4', action: 'Utilisation mémoire élevée', user: 'Serveur', timestamp: 'Hier', type: 'warning' },
];

export const REVENUE_DATA: RevenueData[] = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Fév', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 2000, expenses: 9800 },
  { month: 'Avr', revenue: 2780, expenses: 3908 },
  { month: 'Mai', revenue: 1890, expenses: 4800 },
  { month: 'Juin', revenue: 2390, expenses: 3800 },
  { month: 'Juil', revenue: 3490, expenses: 4300 },
];
