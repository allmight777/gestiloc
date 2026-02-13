import React, { useState } from 'react';
import { Search, ChevronDown, Building, User, DollarSign, Clock, MoreHorizontal, X, Mail, UserPlus } from 'lucide-react';

interface LocationProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const Location: React.FC<LocationProps> = ({ notify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [locations, setLocations] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    nom: '',
    message: 'Bonjour,\n\nJe voudrais vous faire découvrir le site https://www.rentlila.com\n\nC\'est un logiciel en ligne gratuit de gestion locative immobilière. Vous pouvez l\'essayer (c\'est gratuit) et m\'ajouter comme votre locataire.\n\nCordialement'
  });

  const handleSendInvite = () => {
    if (!inviteForm.email || !inviteForm.nom) {
      notify?.('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    notify?.('Invitation envoyée avec succès !', 'success');
    setShowInviteModal(false);
    setInviteForm({
      email: '',
      nom: '',
      message: 'Bonjour,\n\nJe voudrais vous faire découvrir le site https://www.rentlila.com\n\nC\'est un logiciel en ligne gratuit de gestion locative immobilière. Vous pouvez l\'essayer (c\'est gratuit) et m\'ajouter comme votre locataire.\n\nCordialement'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modal Invitation Propriétaire */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Invitez votre propriétaire</h2>
            </div>

            {/* Information Banner */}
            <div className="mx-6 mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <h3 className="font-semibold text-blue-800 mb-1">Information</h3>
              <p className="text-sm text-blue-700">
                Faites découvrir Rentlila.com à votre bailleur en lui envoyant une invitation par <span className="font-semibold underline">email</span> à rejoindre notre site.
              </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-800 mb-4">Invitation</h3>
              
              {/* Email */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-32 text-sm font-medium text-gray-700">
                  EMAIL DU BAILLEUR <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@exemple.com"
                />
              </div>

              {/* Nom */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-32 text-sm font-medium text-gray-700">
                  NOM DU BAILLEUR <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inviteForm.nom}
                  onChange={(e) => setInviteForm({...inviteForm, nom: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom du propriétaire"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="sm:w-32 text-sm font-medium text-gray-700 pt-2">
                  INVITATION <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
                  rows={6}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSendInvite}
                className="px-6 py-2 bg-[#529D21] text-white rounded hover:bg-[#529D21]/90 transition-colors"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className="border rounded-xl mx-4 mt-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrer les locations</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Rows per page selector */}
          <div className="relative md:w-48">
            <select 
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="w-full px-4 py-2 border border-green-500 rounded-lg appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={10}>10 lignes</option>
              <option value={25}>25 lignes</option>
              <option value={50}>50 lignes</option>
              <option value={100}>100 lignes</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>

          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Total counter */}
          <div className="flex items-center text-sm text-gray-600">
            <span>Total: <span className="font-semibold">{locations.length}</span> Locations</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-xl mx-4 mt-4 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <Building size={16} className="text-gray-500" />
            Bien
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            Propriétaire
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-gray-500" />
            Loyer
          </div>
          <div>Solde</div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            Durée
          </div>
          <div>Action</div>
        </div>

        {/* Table Body - Empty State */}
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            {/* Illustration */}
            <div className="mb-6">
              <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Building */}
                <rect x="60" y="40" width="80" height="90" rx="4" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
                <rect x="70" y="55" width="20" height="15" rx="2" fill="#FDE68A"/>
                <rect x="110" y="55" width="20" height="15" rx="2" fill="#FDE68A"/>
                <rect x="70" y="80" width="20" height="15" rx="2" fill="#FDE68A"/>
                <rect x="110" y="80" width="20" height="15" rx="2" fill="#FDE68A"/>
                <rect x="90" y="110" width="20" height="20" rx="2" fill="#D97706"/>
                {/* Calendar */}
                <rect x="120" y="20" width="50" height="50" rx="4" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
                <rect x="125" y="28" width="40" height="8" rx="1" fill="#3B82F6"/>
                <rect x="130" y="42" width="8" height="8" rx="1" fill="#60A5FA"/>
                <rect x="142" y="42" width="8" height="8" rx="1" fill="#60A5FA"/>
                <rect x="154" y="42" width="8" height="8" rx="1" fill="#60A5FA"/>
                <rect x="130" y="54" width="8" height="8" rx="1" fill="#60A5FA"/>
                <rect x="142" y="54" width="8" height="8" rx="1" fill="#60A5FA"/>
                {/* People silhouettes */}
                <circle cx="45" cy="95" r="12" fill="#FBCFE8"/>
                <path d="M35 115 Q45 105 55 115 L55 130 L35 130 Z" fill="#FBCFE8"/>
                <circle cx="155" cy="95" r="12" fill="#A7F3D0"/>
                <path d="M145 115 Q155 105 165 115 L165 130 L145 130 Z" fill="#A7F3D0"/>
                {/* Dollar sign */}
                <circle cx="160" cy="35" r="15" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
                <text x="160" y="42" textAnchor="middle" fill="#D97706" fontSize="16" fontWeight="bold">$</text>
              </svg>
            </div>

            {/* Button */}
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-colors shadow-md"
            >
              Inviter votre propriétaire
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {locations.map((location, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">{location.property?.name || '-'}</div>
                <div className="text-gray-600">{location.landlord?.name || '-'}</div>
                <div className="text-gray-900 font-medium">{location.rent || '-'}</div>
                <div className="text-gray-600">{location.balance || '-'}</div>
                <div className="text-gray-600">{location.duration || '-'}</div>
                <div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Location;
