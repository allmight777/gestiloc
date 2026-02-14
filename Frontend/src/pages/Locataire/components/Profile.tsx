import React, { useState, useEffect } from 'react';
import { Save, FileText, MessageSquare, Receipt, CheckCircle, Home } from 'lucide-react';
import { Card } from './ui/Card';

interface UserData {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  landline_phone: string | null;
  birth_date: string | null;
  birth_place: string | null;
  roles: string[];
  default_role: string;
  role: string;
  address?: string;
  address_complement?: string;
  postal_code?: string;
  city?: string;
  country?: string;
}

interface ProfileProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
  onLogout?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ notify }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Personal info
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    landline_phone: '',
    birth_date: '',
    birth_place: ''
  });

  // Address
  const [address, setAddress] = useState({
    street: '',
    complement: '',
    postal_code: '',
    city: '',
    country: ''
  });

  // Professional info
  const [professional, setProfessional] = useState({
    profession: '',
    employer: '',
    employer_address: ''
  });

  // Emergency contact
  const [emergency, setEmergency] = useState({
    full_name: '',
    relationship: '',
    phone: '',
    email: ''
  });

  // Stats
  const [stats] = useState({
    rentsPaid: 12,
    documents: 24,
    messages: 8
  });

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        
        setPersonalInfo({
          first_name: userObj.first_name || 'Jean',
          last_name: userObj.last_name || 'Dupont',
          email: userObj.email || 'jean.dupont@email.com',
          phone: userObj.phone || '+33 6 12 34 56 78',
          landline_phone: userObj.landline_phone || '+33 X XX XX XX XX',
          birth_date: userObj.birth_date || '1990-05-15',
          birth_place: userObj.birth_place || 'Paris, France'
        });

        setAddress({
          street: userObj.address || '12 Rue de la Paix',
          complement: userObj.address_complement || 'Appartement 3B',
          postal_code: userObj.postal_code || '75002',
          city: userObj.city || 'Paris',
          country: userObj.country || 'France'
        });

        setProfessional({
          profession: userObj.profession || 'Ingénieur logiciel',
          employer: userObj.employer || 'TechCorp SAS',
          employer_address: userObj.employer_address || '45 Avenue Saint michel, 75006 Cotonou'
        });

        setEmergency({
          full_name: userObj.emergency_name || 'Marie Dupont',
          relationship: userObj.emergency_relationship || 'Épouse',
          phone: userObj.emergency_phone || '+229 01 56 00 00 00',
          email: userObj.emergency_email || 'marie.dupont@email.com'
        });
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleSavePersonal = () => {
    const updatedUser = { ...user, ...personalInfo };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    notify('Informations personnelles enregistrées', 'success');
  };

  const handleSaveAddress = () => {
    const updatedUser = { 
      ...user, 
      address: address.street,
      address_complement: address.complement,
      postal_code: address.postal_code,
      city: address.city,
      country: address.country
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    notify('Adresse enregistrée', 'success');
  };

  const handleSaveProfessional = () => {
    const updatedUser = { 
      ...user, 
      profession: professional.profession,
      employer: professional.employer,
      employer_address: professional.employer_address
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    notify('Informations professionnelles enregistrées', 'success');
  };

  const handleSaveEmergency = () => {
    const updatedUser = { 
      ...user, 
      emergency_name: emergency.full_name,
      emergency_relationship: emergency.relationship,
      emergency_phone: emergency.phone,
      emergency_email: emergency.email
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    notify("Contact d'urgence enregistré", 'success');
  };

  const cancelPersonal = () => {
    if (user) {
      setPersonalInfo({
        first_name: user.first_name || 'Jean',
        last_name: user.last_name || 'Dupont',
        email: user.email || 'jean.dupont@email.com',
        phone: user.phone || '+33 6 12 34 56 78',
        landline_phone: user.landline_phone || '+33 X XX XX XX XX',
        birth_date: user.birth_date || '1990-05-15',
        birth_place: user.birth_place || 'Paris, France'
      });
    }
  };

  const cancelAddress = () => {
    if (user) {
      setAddress({
        street: user.address || '12 Rue de la Paix',
        complement: user.address_complement || 'Appartement 3B',
        postal_code: user.postal_code || '75002',
        city: user.city || 'Paris',
        country: user.country || 'France'
      });
    }
  };

  const cancelProfessional = () => {
    if (user) {
      setProfessional({
        profession: user.profession || 'Ingénieur logiciel',
        employer: user.employer || 'TechCorp SAS',
        employer_address: user.employer_address || '45 Avenue Saint michel, 75006 Cotonou'
      });
    }
  };

  const cancelEmergency = () => {
    if (user) {
      setEmergency({
        full_name: user.emergency_name || 'Marie Dupont',
        relationship: user.emergency_relationship || 'Épouse',
        phone: user.emergency_phone || '+229 01 56 00 00 00',
        email: user.emergency_email || 'marie.dupont@email.com'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const initials = `${personalInfo.first_name[0] || 'J'}${personalInfo.last_name[0] || 'D'}`.toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header Banner */}
      <div 
        className="rounded-xl p-6 text-white"
        style={{ background: 'rgba(82, 157, 33, 0.82)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/30">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{personalInfo.first_name} {personalInfo.last_name}</h1>
            <p className="text-white/80 text-sm">{personalInfo.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs">
                <CheckCircle size={12} />
                Locataire vérifié
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs">
                <Home size={12} />
                1 location active
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs">
                <CheckCircle size={12} />
                Membre depuis 2024
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-green-50 flex items-center justify-center">
            <Receipt className="text-green-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.rentsPaid}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Loyers payés</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.documents}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Documents</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-purple-50 flex items-center justify-center">
            <MessageSquare className="text-purple-600" size={24} />
          </div>
          <div className="text-3xl font-bold text-purple-600">{stats.messages}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Messages envoyés</div>
        </Card>
      </div>

      {/* Personal Information */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
          <p className="text-sm text-gray-500">Vos informations de contact et identité</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              value={personalInfo.first_name}
              onChange={(e) => setPersonalInfo({ ...personalInfo, first_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={personalInfo.last_name}
              onChange={(e) => setPersonalInfo({ ...personalInfo, last_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={personalInfo.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Utilisé pour la connexion et les notifications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone mobile</label>
            <input
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone fixe</label>
            <input
              type="tel"
              value={personalInfo.landline_phone}
              onChange={(e) => setPersonalInfo({ ...personalInfo, landline_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <input
              type="date"
              value={personalInfo.birth_date}
              onChange={(e) => setPersonalInfo({ ...personalInfo, birth_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
            <input
              type="text"
              value={personalInfo.birth_place}
              onChange={(e) => setPersonalInfo({ ...personalInfo, birth_place: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSavePersonal}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: 'rgba(82, 157, 33, 0.82)' }}
          >
            <Save size={16} />
            Enregistrer les modifications
          </button>
          <button
            onClick={cancelPersonal}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </Card>

      {/* Current Address */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Adresse actuelle</h2>
          <p className="text-sm text-gray-500">Votre adresse de location actuelle</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complément</label>
            <input
              type="text"
              value={address.complement}
              onChange={(e) => setAddress({ ...address, complement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
            <input
              type="text"
              value={address.postal_code}
              onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
          <input
            type="text"
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveAddress}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: 'rgba(82, 157, 33, 0.82)' }}
          >
            <Save size={16} />
            Enregistrer
          </button>
          <button
            onClick={cancelAddress}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </Card>

      {/* Professional Information */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Informations professionnelles</h2>
          <p className="text-sm text-gray-500">Vos informations d'emploi (optionnel)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
            <input
              type="text"
              value={professional.profession}
              onChange={(e) => setProfessional({ ...professional, profession: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employeur</label>
            <input
              type="text"
              value={professional.employer}
              onChange={(e) => setProfessional({ ...professional, employer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de l'employeur</label>
          <input
            type="text"
            value={professional.employer_address}
            onChange={(e) => setProfessional({ ...professional, employer_address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveProfessional}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: 'rgba(82, 157, 33, 0.82)' }}
          >
            <Save size={16} />
            Enregistrer
          </button>
          <button
            onClick={cancelProfessional}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Contact d'urgence</h2>
          <p className="text-sm text-gray-500">Personne à contacter en cas d'urgence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={emergency.full_name}
              onChange={(e) => setEmergency({ ...emergency, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien de parenté</label>
            <input
              type="text"
              value={emergency.relationship}
              onChange={(e) => setEmergency({ ...emergency, relationship: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={emergency.phone}
              onChange={(e) => setEmergency({ ...emergency, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={emergency.email}
              onChange={(e) => setEmergency({ ...emergency, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveEmergency}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: 'rgba(82, 157, 33, 0.82)' }}
          >
            <Save size={16} />
            Enregistrer
          </button>
          <button
            onClick={cancelEmergency}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </Card>
    </div>
  );
};
