import axios from 'axios';

// Configuration mode standalone/backend
const IS_STANDALONE = false; // Mettre 'false' pour utiliser le backend Laravel

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'locataire' | 'proprietaire' | 'admin';
  email_verified_at?: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    access_token: string;
    token_type: string;
    user: {
      id: number;
      email: string;
      first_name: string | null;
      last_name: string | null;
      phone: string;
      roles: string[];
      default_role: string | null;
    };
  };
}

export interface Landlord {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface ApiError {
  response?: {
    status?: number;
    statusText?: string;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message?: string;
}

export interface RegisterPayload {
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

export interface RegisterResponse {
  status: string;
  message: string;
  data?: {
    token: string;
    user: User;
    landlord?: Landlord;
  };
  token?: string;
  user?: User;
}

/**
 * Modèle Property aligné avec App\Models\Property
 */
export interface Property {
  id: number;
  uuid: string;
  landlord_id: number;
  type: string;
  name: string;
  description: string | null;
  reference_code: string | null;

  address: string;
  district: string | null;
  city: string;
  state: string | null;
  zip_code: string | null;
  latitude: string | null;
  longitude: string | null;

  surface: string | null;
  room_count: number | null;
  bedroom_count: number | null;
  bathroom_count: number | null;

  rent_amount: string | null;
  charges_amount: string | null;
  caution: string | null;
  status: string;

  amenities: string[] | null;
  photos: string[] | null;
  meta: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Payload pour la création / mise à jour d'un bien
 * (adapté à StorePropertyRequest côté Laravel)
 */
export interface CreatePropertyPayload {
  type: string;

  // On garde name pour coller à la colonne "name" en base
  name?: string | null;

  // On garde title tant que ton StorePropertyRequest le demande
  title: string;

  description?: string | null;

  address: string;
  district?: string | null;
  city: string;
  state?: string | null;
  zip_code?: string | null;
  latitude?: string | null;
  longitude?: string | null;

  surface?: number | null;
  room_count?: number | null;        // Nombre de pièces
  bedroom_count?: number | null;     // Nombre de chambres
  bathroom_count?: number | null;    // Nombre de salles de bain

  rent_amount?: number | null;
  charges_amount?: number | null;
  caution?: number | null;
  status: string;

  reference_code?: string | null;
  amenities?: string[] | null;
  photos?: string[] | null;
  meta?: {
    terrace?: boolean;           // Terrasse
    balcony?: boolean;           // Balcon
    garden?: boolean;            // Jardin
    parking?: boolean;           // Parking
    floor?: number;             // Étage
    elevator?: boolean;          // Ascenseur
    furnished?: boolean;         // Meublé
    heating_type?: string;       // Type de chauffage
    energy_class?: string;       // Classe énergétique
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// 🔹 baseURL = https://gestiloc-backend.onrender.com/api
const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://gestiloc-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// ================= CSRF / SANCTUM =================

const getCsrfToken = async () => {
  if (IS_STANDALONE) {
    // Mode standalone : pas de backend, on simule le succès
    console.log('Mode standalone : CSRF token simulation (pas d\'appel backend)');
    return true;
  }
  
  // Mode backend : appel réel au serveur Laravel
  try {
    await axios.get(`${import.meta.env.VITE_API_URL || 'https://gestiloc-backend.onrender.com'}/sanctum/csrf-cookie`, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    return true;
  } catch (error) {
    console.error('Erreur CSRF:', error);
    return false;
  }
};

let csrfTokenInitialized = false;

const initializeCsrfToken = async () => {
  if (!csrfTokenInitialized) {
    csrfTokenInitialized = true;
    return await getCsrfToken();
  }
  return true;
};

// Initialisation CSRF automatique (seulement en mode backend)
if (!IS_STANDALONE) {
  initializeCsrfToken().catch(console.error);
}

// Intercepteur réponses (CSRF 419)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = error as ApiError;
    const originalRequest = error.config;

    if (apiError.response?.status === 419 && !(originalRequest as Record<string, unknown>)._retry) {
      (originalRequest as Record<string, unknown>)._retry = true;
      await getCsrfToken();
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Intercepteur requêtes (Bearer token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= AUTH SERVICE =================

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      await initializeCsrfToken();

      const response = await api.post<LoginResponse>(
        '/auth/login',
        {
          email: email.toLowerCase().trim(),
          password,
          device_name: 'web-browser',
        },
        {
          withCredentials: true,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );

      // 1️⃣ Cas : backend renvoie { status, message, data: { access_token, user } }
      if (response.data?.data?.access_token) {
        const token = response.data.data.access_token;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      // 2️⃣ Cas fallback : backend renvoie { token, user } à la racine
      if ('token' in response.data && response.data.token) {
        const fallbackData = response.data as LoginResponse & { token?: string; user?: typeof response.data.data.user };
        if (fallbackData.token) {
          localStorage.setItem('token', fallbackData.token);
        }
        if (fallbackData.user) {
          localStorage.setItem('user', JSON.stringify(fallbackData.user));
        }
      }

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Login error:', error);

      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      } else if (apiError.response?.data?.errors) {
        const validationErrors = Object.values(
          apiError.response.data.errors
        ).flat();
        throw new Error(validationErrors[0] || 'Erreur de validation');
      } else {
        throw new Error(
          apiError.message || 'Une erreur est survenue lors de la connexion'
        );
      }
    }
  },

  register: async (userData: RegisterPayload): Promise<RegisterResponse> => {
    try {
      await initializeCsrfToken();

      // Déterminer le bon endpoint selon le rôle
      const role = userData.role || 'proprietaire';
      const endpoint = role === 'agence' 
        ? '/auth/register/co-owner' 
        : '/auth/register/landlord';

      // Prepare request data based on role
      const requestData = role === 'agence' 
        ? {
            email: userData.email || '',
            phone: userData.phone || '',
            password: userData.password || '',
            password_confirmation: userData.password_confirmation || '',
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            is_professional: true,
          }
        : {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            password: userData.password || '',
            password_confirmation: userData.password_confirmation || '',
          };

      console.log('📤 Register request data:', requestData);
      console.log('📤 Register endpoint:', endpoint);

      const response = await api.post<RegisterResponse>(
        endpoint,
        requestData
      );

    const responseData = response.data;

    // ✅ stock token/user si présent (2 formats possibles)
    const token = responseData.token || responseData.data?.token;
    const user = responseData.user || responseData.data?.user;

    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));

      return responseData;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('API - Register error:', error);

      if (apiError.response) {
        if (apiError.response.data) {
          if (apiError.response.data.errors) {
            const validationErrors = Object.values(
              apiError.response.data.errors
            ).flat();
            const errorMessage =
              validationErrors && validationErrors.length > 0
                ? (validationErrors as string[]).join('\n')
                : 'Une erreur de validation est survenue';
            const errorWithResponse = new Error(errorMessage);
            (errorWithResponse as ApiError).response = apiError.response;
            throw errorWithResponse;
          }
          if (apiError.response.data.message) {
            const errorWithResponse = new Error(apiError.response.data.message);
            (errorWithResponse as ApiError).response = apiError.response;
            throw errorWithResponse;
          }
        }

        const statusError = new Error(
          `Erreur ${apiError.response.status}: ${apiError.response.statusText}`
        );
        (statusError as ApiError).response = apiError.response;
        throw statusError;
      }

    throw error;
  }
},

  logout: async () => {
    try {
      await api.post(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await api.get<User>('/auth/user');

      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },
};

// ================= PROPERTIES SERVICE =================

export const propertyService = {
  createProperty: async (
    payload: CreatePropertyPayload
  ): Promise<Property> => {
    try {
      await initializeCsrfToken();

      // Sécurité côté front : éviter `null` explicite sur charges_amount
      const safePayload: CreatePropertyPayload = {
        ...payload,
        charges_amount:
          payload.charges_amount === null || payload.charges_amount === undefined
            ? 0
            : payload.charges_amount,
      };

      const response = await api.post<Property>('/properties', safePayload);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API createProperty:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  listProperties: async (status?: string): Promise<PaginatedResponse<Property>> => {
    const params = status ? { status } : {};
    const response = await api.get<PaginatedResponse<Property>>('/properties', { params });
    return response.data;
  },

  // Nouvelle méthode pour récupérer les biens disponibles pour les baux
  listAvailableProperties: async (): Promise<PaginatedResponse<Property>> => {
    return propertyService.listProperties('available');
  },

  getProperty: async (id: number | string): Promise<Property> => {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
  },

  // 🔹 Update d’un bien (utilisé par la modale d’édition)
  updateProperty: async (
    id: number | string,
    payload: Partial<CreatePropertyPayload>
  ): Promise<Property> => {
    try {
      await initializeCsrfToken();

      const safePayload: Partial<CreatePropertyPayload> = {
        ...payload,
      };

      const response = await api.put<Property>(
        `/properties/${id}`,
        safePayload
      );
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API updateProperty:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  // 🔹 Suppression (soft delete côté backend si tu as SoftDeletes)
  deleteProperty: async (id: number | string): Promise<void> => {
    try {
      await initializeCsrfToken();
      await api.delete(`/properties/${id}`);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API deleteProperty:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },
};

// ================= UPLOAD SERVICE =================

export const uploadService = {
  uploadPhoto: async (
    file: File
  ): Promise<{ path: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<{ path: string; url: string }>(
        '/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API uploadPhoto:', apiError.response?.data || error);
      throw error;
    }
  },
};

// ================= TENANT SERVICE =================

export interface InviteTenantPayload {
  // Informations de base
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  
  // Informations personnelles
  tenant_type?: string;
  birth_date?: string;
  birth_place?: string;
  marital_status?: string;
  
  // Adresse
  address?: string;
  city?: string;
  zip_code?: string;
  country?: string;
  
  // Situation professionnelle
  profession?: string;
  employer?: string;
  contract_type?: string;
  monthly_income?: string;
  annual_income?: string;
  
  // Contact d'urgence
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_email?: string;
  
  // Notes
  notes?: string;
  
  // Garant
  has_guarantor?: boolean;
  guarantor_name?: string;
  guarantor_phone?: string;
  guarantor_email?: string;
  guarantor_profession?: string;
  guarantor_monthly_income?: string;
  guarantor_annual_income?: string;
  guarantor_address?: string;
  guarantor_birth_date?: string;
  guarantor_birth_place?: string;

  // Documents
  document_type?: string;
  document_name?: string;
}

export interface CompleteTenantRegistrationPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Types pour /tenants (index bailleur)

export interface TenantApiProperty {
  id: number;
  name: string | null;
  address: string;
  city: string | null;
  role?: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
  is_active?: boolean;
}

export interface TenantApiLease {
  id: number;
  uuid: string | null;
  status: string;
}

export interface TenantApiInvitation {
  id: number | null;
  sent_at: string | null;
  accepted_at: string | null;
  is_pending: boolean;
  is_accepted: boolean;
}

export interface TenantApi {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone?: string | null;
  status?: string | null;       // Statut du tenant (candidate, active, inactive)
  tenant_status?: string | null; // Statut brut du tenant
  solvency_score?: number | null;
  property?: TenantApiProperty | null;
  lease?: TenantApiLease | null;
  // Nouveaux champs du backend
  properties?: TenantApiProperty[];
  active_property?: TenantApiProperty | null;
}

export interface TenantInvitationApi {
  id: number;
  email: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  tenant_id?: number | null; // ID du locataire associé à l'invitation
  expires_at: string;
  created_at: string;
}

export interface TenantIndexResponse {
  tenants: TenantApi[];
  invitations: TenantInvitationApi[];
}

export const tenantService = {
  inviteTenant: async (payload: InviteTenantPayload): Promise<{
    message: string;
    invitation: {
      id: number;
      email: string;
      expires_at: string;
    };
  }> => {
    try {
      await initializeCsrfToken();

      console.log('🚀 Frontend tenantService.inviteTenant payload:', payload);
      console.log('📞 Phone in payload:', payload.phone);
      console.log('📦 Full payload structure:', JSON.stringify(payload, null, 2));

      const response = await api.post('/tenants/invite', payload);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API inviteTenant:', error);

      if (apiError.response?.data) {
        throw apiError.response.data;
      }
      throw error;
    }
  },

  listTenants: async (): Promise<TenantIndexResponse> => {
    try {
      await initializeCsrfToken();

      const response = await api.get<TenantIndexResponse>('/tenants');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API listTenants:', error);

      if (apiError.response?.data) {
        throw apiError.response.data;
      }
      throw error;
    }
  },

  /**
   * Upload documents for a tenant
   */
  uploadTenantDocuments: async (
    tenantId: number,
    documents: File[],
    documentTypes: string[]
  ): Promise<{ message: string; documents: any[]; total_documents: number }> => {
    try {
      await initializeCsrfToken();

      const formData = new FormData();
      documents.forEach((file) => {
        formData.append('documents[]', file);
      });
      documentTypes.forEach((type) => {
        formData.append('document_types[]', type);
      });

      const response = await api.post(`/tenants/${tenantId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API uploadTenantDocuments:', error);

      if (apiError.response?.data) {
        throw apiError.response.data;
      }
      throw error;
    }
  },

  completeTenantRegistration: async (
    payload: CompleteTenantRegistrationPayload
  ): Promise<{
    message: string;
    token: string;
    user: User;
  }> => {
    try {
      await initializeCsrfToken();

      const response = await api.post(
        '/auth/tenant/complete-registration',
        payload
      );

      // On stocke le token comme au login
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API completeTenantRegistration:', error);

      if (apiError.response?.data) {
        throw apiError.response.data;
      }
      throw error;
    }
  },

  // GET /api/landlord/tenants/{id} - Détails d'un locataire
  getTenant: async (id: number): Promise<TenantApi> => {
    try {
      await initializeCsrfToken();
      const response = await api.get<TenantApi>(`/tenants/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API getTenant:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  // PUT /api/tenants/{tenant}/properties/{property} - Mise à jour assigns property
  updateTenantProperty: async (
    tenantId: number,
    propertyId: number,
    payload: { status?: string }
  ): Promise<{ message: string }> => {
    try {
      await initializeCsrfToken();
      const response = await api.put(`/tenants/${tenantId}/properties/${propertyId}`, payload);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API updateTenantProperty:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },
};

// ================= LEASES SERVICE =================

export interface Lease {
  tenant: any;
  property: any;
  id: number;
  uuid: string;
  property_id: number;
  tenant_id: number;

  start_date: string;         // 'YYYY-MM-DD'
  end_date: string | null;

  rent_amount: string;        // Laravel renvoie souvent en string
  deposit: string | null;

  type: string;               // 'nu' | 'meuble'
  status: string;             // 'pending' | 'active' | 'terminated'

  terms: string[] | null;     // <-- tableau de strings côté backend

  created_at: string;
  updated_at: string;
}

export interface CreateLeasePayload {
  property_id: number;
  tenant_id: number;
  start_date: string;            // format 'YYYY-MM-DD'
  end_date?: string | null;

  rent_amount: number;
  deposit?: number | null;

  type: "nu" | "meuble";
  status?: "pending" | "active" | "terminated";
  terms?: string[];              // <-- array comme dans StoreLeaseRequest
}

export const leaseService = {
  createLease: async (payload: CreateLeasePayload): Promise<Lease> => {
    try {
      await initializeCsrfToken();

      const response = await api.post<Lease>('/leases', payload);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API createLease:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  listLeases: async (): Promise<Lease[]> => {
    try {
      const response = await api.get<Lease[]>('/leases');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API listLeases:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  getLease: async (id: number | string): Promise<Lease> => {
    try {
      const response = await api.get<Lease>(`/leases/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API getLease:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  terminateLease: async (uuid: string): Promise<Lease> => {
    try {
      await initializeCsrfToken();

      const response = await api.post<Lease>(`/leases/${uuid}/terminate`, {});
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API terminateLease:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  updateLease: async (uuid: string, payload: Partial<CreateLeasePayload>): Promise<Lease> => {
    try {
      await initializeCsrfToken();

      const response = await api.put<Lease>(`/leases/${uuid}`, payload);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API updateLease:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },
};

// ================= ETATS DES LIEUX (PROPERTY CONDITION REPORTS) =================

// Statut de condition d’une photo
export type ConditionStatus = 'good' | 'satisfactory' | 'poor' | 'damaged';

export interface PropertyConditionPhoto {
  id: number;
  report_id: number;
  path: string;
  original_filename: string | null;
  mime_type: string | null;
  size: number;
  condition_status: ConditionStatus | null;
  condition_notes?: string | null;
  taken_at: string;
  caption?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyConditionReport {
  id: number;
  property_id: number;
  lease_id: number;
  created_by: number;
  type: 'entry' | 'exit' | 'intermediate';
  report_date: string;
  notes?: string | null;
  signature_data?: string | null;
  signed_by?: string | null;
  signed_at?: string | null;
  created_at?: string;

  photos?: PropertyConditionPhoto[];
  lease?: Lease | null;
  property?: Property | null;
}

// Item photo côté form
export type CreateConditionReportPhotoItem = {
  file: File;
  condition_status?: ConditionStatus; // (info front pour UI)
  condition_notes?: string;           // (info front pour UI)
  caption?: string;                   // ✅ si tu veux l’envoyer au backend
  taken_at?: string;                  // optionnel : sinon on utilise report_date
};

export interface CreateConditionReportPayload {
  lease_id: number;
  type: 'entry' | 'exit' | 'intermediate';
  report_date: string; // 'YYYY-MM-DD'
  notes?: string | null;
  photos: CreateConditionReportPhotoItem[];
  signature_data?: string;
  signed_by?: string; // ✅ requis si signature_data est présent côté backend
}

export const conditionReportService = {
  /**
   * GET /api/condition-reports
   * Get all condition reports for the current landlord
   */
  listAll: async (): Promise<PropertyConditionReport[]> => {
    await initializeCsrfToken();

    const response = await api.get<PropertyConditionReport[]>(
      `/condition-reports`
    );

    return response.data;
  },

  /**
   * GET /properties/{property}/condition-reports
   * Backend renvoie un tableau direct
   */
  listForProperty: async (
    propertyId: number | string
  ): Promise<PropertyConditionReport[]> => {
    await initializeCsrfToken();

    const response = await api.get<PropertyConditionReport[]>(
      `/properties/${propertyId}/condition-reports`
    );

    return response.data;
  },

  /**
   * GET /properties/{property}/condition-reports/{report}
   * Pour ouvrir le détail (photos + lease + tenant...)
   */
  getForProperty: async (
    propertyId: number | string,
    reportId: number | string
  ): Promise<PropertyConditionReport> => {
    await initializeCsrfToken();

    const response = await api.get<PropertyConditionReport>(
      `/properties/${propertyId}/condition-reports/${reportId}`
    );

    return response.data;
  },

  /**
   * POST /properties/{property}/condition-reports
   * Champs attendus backend (store):
   * - lease_id
   * - type
   * - report_date
   * - notes (nullable)
   * - photos[] (required array)
   * - photo_dates[] (required array, same size)
   * - photo_captions[] (optional)
   * - signature_data (optional) + signed_by (required_with)
   */
  createForProperty: async (
    propertyId: number | string,
    payload: CreateConditionReportPayload
  ): Promise<PropertyConditionReport> => {
    await initializeCsrfToken();

    const formData = new FormData();

    formData.append('lease_id', String(payload.lease_id));
    formData.append('type', payload.type);
    formData.append('report_date', payload.report_date);

    if (payload.notes) formData.append('notes', payload.notes);

    if (payload.signature_data) {
      formData.append('signature_data', payload.signature_data);
      // ⚠️ backend: signed_by required_with signature_data
      formData.append('signed_by', payload.signed_by || 'Signature');
    }

    payload.photos.forEach((p, index) => {
      if (!(p?.file instanceof File)) {
        throw new Error(`Photo invalide à l’index ${index} (file manquant).`);
      }

      // ✅ Laravel: photos.* => image
      formData.append(`photos[${index}]`, p.file);

      // ✅ Laravel: photo_dates required array size = photos count
      formData.append(
        `photo_dates[${index}]`,
        (p.taken_at || payload.report_date) as string
      );

      // ✅ optionnel si tu veux l’utiliser côté backend
      if (p.caption) {
        formData.append(`photo_captions[${index}]`, p.caption);
      }
    });

    const response = await api.post<{ message: string; report: PropertyConditionReport } | PropertyConditionReport>(
      `/properties/${propertyId}/condition-reports`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    // ton store renvoie { message, report }
    const data = response.data as { message?: string; report?: PropertyConditionReport } | PropertyConditionReport;
    return (data && 'report' in data ? data.report : data) as PropertyConditionReport;
  },

  /**
   * POST /properties/{property}/condition-reports/{report}/photos
   * Pour ajouter des photos plus tard (optionnel).
   * Backend attend:
   * - photos[]
   * - photo_dates[]
   * - photo_captions[] (optional)
   * - condition_status[] (optional, selon ton controller)
   * - condition_notes[] (optional)
   */
  addPhotos: async (
    propertyId: number | string,
    reportId: number | string,
    items: CreateConditionReportPhotoItem[],
    defaultDate?: string
  ): Promise<{ message: string; photos: PropertyConditionPhoto[] }> => {
    await initializeCsrfToken();

    const formData = new FormData();

    items.forEach((p, index) => {
      if (!(p?.file instanceof File)) {
        throw new Error(`Photo invalide à l’index ${index} (file manquant).`);
      }

      formData.append(`photos[${index}]`, p.file);
      formData.append(`photo_dates[${index}]`, p.taken_at || defaultDate || new Date().toISOString().slice(0, 10));

      if (p.caption) formData.append(`photo_captions[${index}]`, p.caption);
      if (p.condition_status) formData.append(`condition_status[${index}]`, p.condition_status);
      if (p.condition_notes) formData.append(`condition_notes[${index}]`, p.condition_notes);
    });

    const response = await api.post(
      `/properties/${propertyId}/condition-reports/${reportId}/photos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  },

};

// ================= CONTRACT SERVICE =================

export interface RentalContractData {
  landlord: {
    name: string;
    address: string;
    phone: string;
    email: string;
    id_type: string;
    id_number: string;
  };
  tenant: {
    name: string;
    address: string;
    phone: string;
    email: string;
    id_type: string;
    id_number: string;
  };
  property: {
    address: string;
    floor?: string;
    type: string;
    area: string;
    rooms: string;
    has_parking: boolean;
    equipment?: string[];
  };
  contract: {
    start_date: string;
    end_date: string | null;
    rent_amount: number;
    deposit_amount: number;
    included_charges?: string[];
    payment_frequency?: "monthly" | "quarterly";
    payment_method?: "cash" | "bank_transfer" | "mobile_money";
    notice_period?: number;
    duration?: string;
  };
}

export const contractService = {
  /**
   * ✅ NOUVEAU (recommandé) :
   * Télécharge le contrat généré côté backend à partir du UUID du bail
   * Route: GET /api/pdf/contrat-bail/{uuid}
   */
  async downloadLeaseContract(uuid: string): Promise<Blob> {
    try {
      const response = await api.get(`/pdf/contrat-bail/${uuid}`, {
        responseType: "blob",
      });

      return new Blob([response.data], { type: "application/pdf" });
    } catch (error) {
      console.error("Erreur lors du téléchargement du contrat (UUID):", error);
      throw error;
    }
  },

  /**
   * (optionnel) Compat : ton endpoint existant qui génère un contrat depuis un JSON
   * Route: POST /api/pdf/generate-rental-contract
   */
  async generateRentalContract(data: RentalContractData): Promise<Blob> {
    try {
      const response = await api.post("/pdf/generate-rental-contract", data, {
        responseType: "blob",
      });

      return new Blob([response.data], { type: "application/pdf" });
    } catch (error) {
      console.error("Erreur lors de la génération du contrat (JSON):", error);
      throw error;
    }
  },

  /**
   * Télécharge un fichier Blob (PDF) dans le navigateur
   */
  downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};

// ================= LANDLORD DASHBOARD SERVICE =================

// Types pour le dashboard propriétaire
export interface LandlordDashboardStats {
  total_properties: number;
  occupied_properties: number;
  vacant_properties: number;
  total_tenants: number;
  active_leases: number;
  pending_invoices: number;
  total_rent_expected: number;
  total_rent_collected: number;
  occupancy_rate: number;
  recent_documents?: Array<{
    id: number;
    type: string;
    name: string;
    created_at: string;
  }>;
  monthly_rent_data?: Array<{
    month: string;
    expected: number;
    collected: number;
  }>;
}

export const landlordDashboardService = {
  // GET /api/dashboard - Statistiques du dashboard propriétaire
  getStats: async (): Promise<LandlordDashboardStats> => {
    try {
      await initializeCsrfToken();
      const response = await api.get<LandlordDashboardStats>('/dashboard');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API landlordDashboardService.getStats:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  // GET /api/occupation-stats - Stats d'occupation
  getOccupationStats: async (): Promise<{
    occupied: number;
    vacant: number;
    total: number;
    rate: number;
  }> => {
    try {
      await initializeCsrfToken();
      const response = await api.get('/landlord/occupation-stats');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API landlordDashboardService.getOccupationStats:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },
};

export interface Notice {
  id: number;
  property_id: number;
  landlord_id: number;
  tenant_id: number;
  type: "landlord" | "tenant";
  reason: string;
  notice_date: string;
  end_date: string;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string | null;
  created_at: string;

  property?: {
    id: number;
    address: string;
  };

  tenant?: {
    id: number;
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export interface CreateNoticePayload {
  property_id: number;
  lease_id?: number; // ✅ recommandé
  tenant_id?: number; // optionnel (si tu veux forcer)
  type: "landlord" | "tenant";
  reason: string;
  notice_date: string;
  end_date: string;
  notes?: string;
}

export const noticeService = {
  list: async (): Promise<Notice[]> => {
    const response = await api.get<Notice[]>("/notices");
    return response.data;
  },

  create: async (payload: CreateNoticePayload): Promise<Notice> => {
    const response = await api.post<Notice>("/notices", payload);
    return response.data;
  },

  update: async (
    id: number,
    payload: Partial<Pick<Notice, "status" | "notes">>
  ): Promise<Notice> => {
    const response = await api.put<Notice>(`/notices/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/notices/${id}`);
  },
};

// ================= RENT RECEIPTS (QUITTANCES) SERVICE =================

export type RentReceiptType = "independent" | "invoice";

export interface RentReceipt {
  id: number;
  lease_id: number;
  property_id: number;
  landlord_id: number;
  tenant_id: number;

  type: RentReceiptType;
  status: "issued" | "draft";

  paid_month: string;   // YYYY-MM
  issued_date: string;  // YYYY-MM-DD

  amount_paid: number;
  month?: number;
  year?: number;
  reference?: string;
  currency?: string | null;
  notes?: string | null;
  pdf_path?: string | null;

  created_at: string;

  lease?: {
    id: number;
    rent_amount: number;
    charges_amount?: number;
    tenant?: {
      id: number;
      first_name?: string | null;
      last_name?: string | null;
      email?: string;
    };
  };
  property?: { 
    id: number; 
    name?: string;
    address: string; 
    city?: string | null 
  };
  tenant?: { 
    id: number; 
    first_name?: string | null; 
    last_name?: string | null; 
    email?: string | null 
  };
}

export interface CreateRentReceiptPayload {
  lease_id: number;
  paid_month: string;    // "2025-12"
  issued_date?: string;  // optionnel
  notes?: string | null;
}

export const rentReceiptService = {
  // ✅ liste uniquement les quittances indépendantes
  listIndependent: async (): Promise<RentReceipt[]> => {
    await initializeCsrfToken();
    const response = await api.get<RentReceipt[]>("/rent-receipts", {
      params: { type: "independent" },
    });
    return response.data;
  },

  // ✅ création quittance indépendante
  createIndependent: async (payload: CreateRentReceiptPayload): Promise<RentReceipt> => {
    await initializeCsrfToken();
    const response = await api.post<RentReceipt>("/rent-receipts", {
      ...payload,
      type: "independent",
    });
    return response.data;
  },

  // ✅ PDF quittance indépendante
  downloadPdf: async (id: number): Promise<Blob> => {
    await initializeCsrfToken();
    const response = await api.get(`/quittance-independent/${id}`, {
      responseType: "blob",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

};

// ================= INVOICES SERVICE =================

export interface CreateInvoicePayload {
  lease_id: number;
  type: 'rent' | 'deposit' | 'charge' | 'repair';
  due_date: string;
  period_start?: string;
  period_end?: string;
  amount_total: number;
  payment_method?: string;
}

export interface Invoice {
  id?: number;
  lease_id: number;
  type: 'rent' | 'deposit' | 'charge' | 'repair';
  due_date: string;
  period_start?: string | null;
  period_end?: string | null;
  amount_total: number;
  amount_paid?: number;
  status?: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'failed' | 'draft';
  invoice_number?: string;
  created_at?: string;
  updated_at?: string;
  paid_at?: string | null;
  payment_method?: string;
  
  // Relations
  lease?: {
    id: number;
    rent_amount: number;
    charges_amount?: number;
    tenant?: {
      id: number;
      first_name?: string | null;
      last_name?: string | null;
      email?: string;
    };
    property?: {
      id: number;
      name?: string;
      address?: string;
      city?: string;
      zip_code?: string;
      surface?: number;
    };
  };
}

export interface TenantInvoice {
  id: number;
  lease_id: number;
  type: 'rent' | 'deposit' | 'charge' | 'repair';
  due_date: string;
  amount_total: number;
  paid_amount?: number;
  status: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'failed';
  paid_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentConfirmation {
  id: number;
  invoice_id: number;
  transaction_id: string;
  amount_paid: number;
  payment_method: string;
  paid_at: string;
  receipt_url?: string;
  status: 'success' | 'failed' | 'pending';
}

export const invoiceService = {
  createInvoice: async (payload: CreateInvoicePayload): Promise<Invoice> => {
    try {
      await initializeCsrfToken();

      const response = await api.post('/invoices', payload);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API createInvoice:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  listInvoices: async (): Promise<Invoice[]> => {
    try {
      const response = await api.get('/invoices');
      // Gérer les structures possibles : tableau direct ou objet avec data
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API listInvoices:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  // Télécharger la facture en PDF
  downloadInvoice: async (id: number | string): Promise<Blob> => {
    try {
      await initializeCsrfToken();
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API downloadInvoice:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },
};

// ================= MAINTENANCE (INTERVENTIONS) SERVICE =================

export interface MaintenanceRequest {
  id: number;
  property_id: number;
  tenant_id?: number | null;
  landlord_id: number;
  title: string;
  category: string;
  description?: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  preferred_slots?: Array<{ date: string; from?: string; to?: string }> | null;
  photos?: string[] | null;
  assigned_provider?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    address: string;
    city?: string | null;
    name?: string | null;
  };
  tenant?: {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string;
  } | null;
}

export interface CreateMaintenanceRequestPayload {
  property_id: number;
  title: string;
  category: 'plumbing' | 'electricity' | 'heating' | 'other';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  description?: string;
  preferred_slots?: Array<{ date: string; from?: string; to?: string }>;
  photos?: string[];
  assigned_provider?: string;
}

export const maintenanceService = {
  // Liste des interventions pour le landlord
  listIncidents: async (): Promise<MaintenanceRequest[]> => {
    try {
      await initializeCsrfToken();
      const response = await api.get('/incidents');
      // Gérer les structures possibles : tableau direct ou objet avec data
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API listIncidents:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  // Créer une nouvelle intervention
  createIncident: async (payload: CreateMaintenanceRequestPayload): Promise<MaintenanceRequest> => {
    try {
      await initializeCsrfToken();
      const response = await api.post('/incidents', payload);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API createIncident:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  // Mettre à jour une intervention (statut, prestataire)
  updateIncident: async (id: number, payload: { status?: string; assigned_provider?: string }): Promise<MaintenanceRequest> => {
    try {
      await initializeCsrfToken();
      const response = await api.put(`/incidents/${id}`, payload);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API updateIncident:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  // Détail d'une intervention
  getIncident: async (id: number): Promise<MaintenanceRequest> => {
    try {
      await initializeCsrfToken();
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API getIncident:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },
};

// ================= ACCOUNTING SERVICE =================

// Types pour la comptabilité
export interface AccountingStats {
  resultat_net: number;
  resultat_net_formatted: string;
  revenus: number;
  revenus_formatted: string;
  charges: number;
  charges_formatted: string;
  rentabilite: number;
  active_properties: number;
  transactions_count: number;
  occupancy_rate: number;
  occupied: number;
  vacant: number;
  total_properties: number;
  revenus_par_categorie: Record<string, number>;
  charges_par_categorie: Record<string, number>;
  repartition_par_bien: Record<string, { revenus: number; charges: number; resultat: number }>;
  variation: string;
}

export interface AccountingTransaction {
  id: string;
  date: string;
  type: 'REVENU' | 'CHARGE';
  description: string;
  amount: number;
  category: string;
  property_name: string;
  property_id: number;
  currency: string;
}

export const accountingService = {
  // Récupérer les statistiques comptables
  getStats: async (year?: number): Promise<AccountingStats> => {
    try {
      await initializeCsrfToken();
      const params = year ? { year } : {};
      const response = await api.get('/accounting/stats', { params });
      return response.data;
    } catch (error) {
      // En cas d'erreur, retourner des stats vides
      console.error('Erreur API getStats:', error);
      return {
        resultat_net: 0,
        resultat_net_formatted: '0 €',
        revenus: 0,
        revenus_formatted: '0 €',
        charges: 0,
        charges_formatted: '0 €',
        rentabilite: 0,
        active_properties: 0,
        transactions_count: 0,
        occupancy_rate: 0,
        occupied: 0,
        vacant: 0,
        total_properties: 0,
        revenus_par_categorie: {},
        charges_par_categorie: {},
        repartition_par_bien: {},
        variation: '0%',
      };
    }
  },

  // Récupérer les transactions
  getTransactions: async (filters?: { property_id?: string; category?: string; year?: number }): Promise<AccountingTransaction[]> => {
    try {
      await initializeCsrfToken();
      const response = await api.get('/accounting/transactions', { params: filters });
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API getTransactions:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },

  // Créer une transaction (revenu via quittance ou charge via facture)
  createTransaction: async (payload: {
    type: 'revenu' | 'charge';
    property_id: number;
    lease_id?: number;
    category: string;
    description: string;
    amount: number;
    payment_date: string;
    payment_method?: string;
  }): Promise<{ message: string }> => {
    try {
      await initializeCsrfToken();

      if (payload.type === 'revenu') {
        // Pour un revenu, créer une quittance
        const receiptPayload = {
          lease_id: payload.lease_id,
          paid_month: payload.payment_date.substring(0, 7), // YYYY-MM
          issued_date: payload.payment_date,
          notes: payload.description,
        };
        const response = await api.post('/rent-receipts', receiptPayload);
        return { message: 'Quittance créée avec succès' };
      } else {
        // Pour une charge, créer une facture
        const invoicePayload = {
          lease_id: payload.lease_id,
          type: payload.category === 'travaux' ? 'repair' : 'charge',
          due_date: payload.payment_date,
          amount_total: payload.amount,
          payment_method: payload.payment_method || 'especes',
        };
        const response = await api.post('/invoices', invoicePayload);
        return { message: 'Facture créée avec succès' };
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API createTransaction:', error);
      if (apiError.response?.data) throw apiError.response.data;
      throw error;
    }
  },
};

// ================= DOCUMENT ARCHIVES SERVICE =================

export interface ArchiveDocument {
  id: string;
  type: string;
  typeBadge: string;
  typeBadgeColor: string;
  typeCategory: string;
  titre: string;
  bien: string;
  champ1Label: string;
  champ1Value: string;
  champ2Label: string;
  champ2Value: string;
  champ3Label: string;
  champ3Value: string;
  champ4Label: string;
  champ4Value: string;
  dateBas: string;
  date_archive: string;
  property_id: number;
  lease_id?: number;
}

export interface ArchiveStats {
  total_documents: number;
  baux_termines: number;
  edl_archives: number;
  quittances_archives: number;
  total_size: string;
}

export interface ArchiveResponse {
  archives: ArchiveDocument[];
  stats: ArchiveStats;
}

export const documentArchiveService = {
  // Récupérer les archives de documents
  getArchives: async (): Promise<ArchiveResponse> => {
    try {
      await initializeCsrfToken();
      const response = await api.get<ArchiveResponse>('/archives');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API getArchives:', error);
      // En cas d'erreur, retourner une réponse vide
      return {
        archives: [],
        stats: {
          total_documents: 0,
          baux_termines: 0,
          edl_archives: 0,
          quittances_archives: 0,
          total_size: '0 KB',
        },
      };
    }
  },

  // Récupérer les statistiques des archives
  getStats: async (): Promise<ArchiveStats> => {
    try {
      await initializeCsrfToken();
      const response = await api.get<ArchiveStats>('/archives/stats');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API getArchiveStats:', error);
      return {
        total_documents: 0,
        baux_termines: 0,
        edl_archives: 0,
        quittances_archives: 0,
        total_size: '0 KB',
      };
    }
  },
};

// ================= LANDLORD SETTINGS SERVICE =================

// Types pour les paramètres utilisateur
interface UserSecurity {
  two_factor_enabled: boolean;
  last_password_change: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
}

interface UserPreferences {
  language: string;
  timezone: string;
  date_format: string;
  currency: string;
  dark_mode: boolean;
}

interface UserNotifications {
  payment_received: boolean;
  payment_reminder: boolean;
  lease_expiry: boolean;
  maintenance_request: boolean;
  monthly_report: boolean;
  email_notifications: boolean;
}

interface UserPrivacy {
  data_sharing: boolean;
}

export interface UserSettings {
  user: {
    id: number;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    created_at: string;
  };
  security: UserSecurity;
  preferences: UserPreferences;
  notifications: UserNotifications;
  privacy: UserPrivacy;
}

export const landlordSettingsService = {
  // Récupérer les paramètres
  getSettings: async (): Promise<UserSettings> => {
    try {
      await initializeCsrfToken();
      const response = await api.get<UserSettings>('/settings');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API getSettings:', error);
      throw apiError.response?.data || error;
    }
  },

  // Mettre à jour le profil
  updateProfile: async (data: { first_name?: string; last_name?: string; phone?: string }): Promise<{ message: string }> => {
    try {
      await initializeCsrfToken();
      const response = await api.put('/settings/profile', data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API updateProfile:', error);
      throw apiError.response?.data || error;
    }
  },

  // Changer le mot de passe
  updatePassword: async (data: { current_password: string; new_password: string; confirm_password: string }): Promise<{ message: string }> => {
    try {
      await initializeCsrfToken();
      const response = await api.put('/settings/password', data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API updatePassword:', error);
      throw apiError.response?.data || error;
    }
  },

  // Mettre à jour les préférences
  updatePreferences: async (data: Partial<UserPreferences>): Promise<{ message: string; preferences: UserPreferences }> => {
    try {
      await initializeCsrfToken();
      const response = await api.put('/settings/preferences', data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API updatePreferences:', error);
      throw apiError.response?.data || error;
    }
  },

  // Mettre à jour les notifications
  updateNotifications: async (data: Partial<UserNotifications>): Promise<{ message: string; notifications: UserNotifications }> => {
    try {
      await initializeCsrfToken();
      const response = await api.put('/settings/notifications', data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API updateNotifications:', error);
      throw apiError.response?.data || error;
    }
  },

  // Mettre à jour la confidentialité
  updatePrivacy: async (data: UserPrivacy): Promise<{ message: string; privacy: UserPrivacy }> => {
    try {
      await initializeCsrfToken();
      const response = await api.put('/settings/privacy', data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API updatePrivacy:', error);
      throw apiError.response?.data || error;
    }
  },

  // Activer 2FA
  enableTwoFactor: async (): Promise<{ secret: string; recovery_codes: string[] }> => {
    try {
      await initializeCsrfToken();
      const response = await api.post('/settings/2fa/enable');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API enableTwoFactor:', error);
      throw apiError.response?.data || error;
    }
  },

  // Désactiver 2FA
  disableTwoFactor: async (): Promise<{ message: string }> => {
    try {
      await initializeCsrfToken();
      const response = await api.post('/settings/2fa/disable');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API disableTwoFactor:', error);
      throw apiError.response?.data || error;
    }
  },

  // Télécharger les données
  downloadData: async (): Promise<any> => {
    try {
      await initializeCsrfToken();
      const response = await api.get('/settings/download-data');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API downloadData:', error);
      throw apiError.response?.data || error;
    }
  },

  // Supprimer le compte
  deleteAccount: async (): Promise<{ message: string }> => {
    try {
      await initializeCsrfToken();
      const response = await api.delete('/settings/account');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API deleteAccount:', error);
      throw apiError.response?.data || error;
    }
  },
};

// ================= LANDLORD NOTIFICATIONS SERVICE =================

// Types pour les notifications du propriétaire
export interface LandlordNotification {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  subtext?: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  icon?: string;
}

export const landlordNotificationsService = {
  // Récupérer toutes les notifications
  getNotifications: async (): Promise<LandlordNotification[]> => {
    try {
      await initializeCsrfToken();
      const response = await api.get<LandlordNotification[]>('/notifications');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API getNotifications:', error);
      return [];
    }
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId: number): Promise<{ message: string }> => {
    try {
      await initializeCsrfToken();
      const response = await api.post<{ message: string }>(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API markAsRead:', error);
      throw apiError.response?.data || error;
    }
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async (): Promise<{ message: string }> => {
    try {
      await initializeCsrfToken();
      const response = await api.post<{ message: string }>('/notifications/read-all');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erreur API markAllAsRead:', error);
      throw apiError.response?.data || error;
    }
  },
};

// Export apiService as an object with all services
export const apiService = {
  ...authService,
  ...propertyService,
  ...uploadService,
  ...tenantService,
  ...leaseService,
  ...conditionReportService,
  ...contractService,
  ...noticeService,
  ...rentReceiptService,
  ...invoiceService,
  ...landlordDashboardService,
  ...maintenanceService,
  ...accountingService,
  ...documentArchiveService,
  ...landlordSettingsService,
  ...landlordNotificationsService,
  getLeases: leaseService.listLeases,
  createInvoice: invoiceService.createInvoice,
  listIncidents: maintenanceService.listIncidents,
  createIncident: maintenanceService.createIncident,
  updateIncident: maintenanceService.updateIncident,
};


export default api;
