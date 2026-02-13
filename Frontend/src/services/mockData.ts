// Données mockées pour le frontend standalone
export const mockUserData = {
  id: 1,
  email: 'locataire@exemple.com',
  first_name: 'Jean',
  last_name: 'Dupont',
  phone: '+33 6 12 34 56 78',
  roles: ['tenant'],
  default_role: 'tenant',
  email_verified_at: '2024-01-15T10:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  last_login_at: '2024-01-15T09:30:00Z'
};

export const mockLease = {
  id: 1,
  property_id: 1,
  tenant_id: 1,
  rent_amount: 1200,
  charges_amount: 150,
  deposit_amount: 2400,
  start_date: '2024-01-01',
  end_date: '2025-12-31',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  property: {
    id: 1,
    name: 'Appartement T3 Paris 11ème',
    address: '123 Avenue de la République',
    city: 'Paris',
    postal_code: '75011',
    country: 'France',
    surface: 65,
    property_type: 'apartment'
  }
};

export const mockReceipts = [
  {
    id: 1,
    lease_id: 1,
    paid_month: '2024-01',
    amount_paid: 1350,
    payment_date: '2024-01-05',
    issued_date: '2024-01-05',
    status: 'paid'
  },
  {
    id: 2,
    lease_id: 1,
    paid_month: '2023-12',
    amount_paid: 1350,
    payment_date: '2023-12-05',
    issued_date: '2023-12-05',
    status: 'paid'
  }
];

export const mockInvoices = [
  {
    id: 1,
    lease_id: 1,
    amount: 1350,
    due_date: '2024-02-01',
    status: 'pending',
    type: 'rent',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockIncidents = [
  {
    id: 1,
    lease_id: 1,
    title: 'Fuite d\'eau dans la salle de bain',
    description: 'La douche fuit au niveau du robinet',
    status: 'open',
    priority: 'medium',
    created_at: '2024-01-10T10:00:00Z'
  }
];

export const mockNotices = [
  {
    id: 1,
    property_id: 1,
    tenant_id: 1,
    type: 'rent_increase',
    title: 'Augmentation de loyer',
    description: 'Augmentation de 3% prévue pour le prochain bail',
    status: 'pending',
    notice_date: '2024-01-15T00:00:00Z',
    end_date: '2025-01-01T00:00:00Z'
  }
];

export const mockLandlord = {
  id: 1,
  name: 'Gestion Immobilière ProLog',
  type: 'Agence immobilière',
  address: '123 Avenue de la République, 75011 Paris',
  phone: '+33 1 23 45 67 89',
  email: 'contact@prolog.fr',
  rating: 4.8,
  totalReviews: 127,
  responseTime: 'Moins de 2h',
  languages: ['Français', 'English', 'Español'],
  teamMembers: [
    {
      name: 'Marie Dubois',
      role: 'Gestionnaire de compte',
      email: 'm.dubois@prolog.fr',
      phone: '+33 1 23 45 67 90'
    },
    {
      name: 'Thomas Martin',
      role: 'Assistant technique',
      email: 't.martin@prolog.fr',
      phone: '+33 1 23 45 67 91'
    }
  ]
};
