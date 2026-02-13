import React, { useState } from 'react';
import { Search, MoreVertical, ChevronDown, X, MapPin, Building2, CreditCard, FileText, User } from 'lucide-react';

interface LandlordProps {
  notify: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface Proprietaire {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  avatar: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  banque?: string;
  iban?: string;
  autresInfos?: string;
}

const proprietairesData: Proprietaire[] = [
  {
    id: '1',
    nom: 'Jeannot',
    prenom: 'Jonz',
    telephone: '07 83 20 00 01',
    email: 'mcjeannot@gmail.com',
    avatar: 'JJ',
    adresse: '288 avenue des gresillons',
    ville: 'Asnieres sur Seine',
    codePostal: '92600',
    pays: 'France',
    banque: 'Société Générale',
    iban: 'FR76 3000 3030 3000 3000 3000 300',
    autresInfos: 'Propriétaire depuis 2020, gestion active'
  }
];

export const Landlord: React.FC<LandlordProps> = ({ notify }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('100');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProprietaire, setSelectedProprietaire] = useState<Proprietaire | null>(null);

  const filteredProprietaires = proprietairesData.filter(p =>
    `${p.prenom} ${p.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telephone.includes(searchTerm)
  );

  const openModal = (proprietaire: Proprietaire) => {
    setSelectedProprietaire(proprietaire);
  };

  const closeModal = () => {
    setSelectedProprietaire(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Modal Informations Propriétaire */}
      {selectedProprietaire && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
              <h2 className="text-xl font-bold text-gray-900">Informations</h2>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Profil header */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {selectedProprietaire.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedProprietaire.prenom} {selectedProprietaire.nom}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Mobile: <span className="text-[#529D21] font-medium">{selectedProprietaire.telephone}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      E-mail: <span className="text-[#529D21] font-medium">{selectedProprietaire.email}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Adresse */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={18} className="text-gray-400" />
                    <h4 className="font-semibold text-gray-900">Adresse</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Adresse:</span> <span className="text-gray-700">{selectedProprietaire.adresse}</span></p>
                    <p><span className="text-gray-500">Ville:</span> <span className="text-gray-700">{selectedProprietaire.ville}</span></p>
                    <p><span className="text-gray-500">Code postal:</span> <span className="text-gray-700">{selectedProprietaire.codePostal}</span></p>
                    <p><span className="text-gray-500">Pays:</span> <span className="text-gray-700">{selectedProprietaire.pays}</span></p>
                  </div>
                </div>

                {/* Baux */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={18} className="text-gray-400" />
                    <h4 className="font-semibold text-gray-900">Baux</h4>
                  </div>
                  <p className="text-sm text-gray-500">Aucun bail actif</p>
                </div>

                {/* Banque */}
                {selectedProprietaire.banque && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard size={18} className="text-gray-400" />
                      <h4 className="font-semibold text-gray-900">Banque</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Banque:</span> <span className="text-gray-700">{selectedProprietaire.banque}</span></p>
                      {selectedProprietaire.iban && (
                        <p><span className="text-gray-500">IBAN:</span> <span className="text-gray-700">{selectedProprietaire.iban}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {/* Autres informations */}
                {selectedProprietaire.autresInfos && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User size={18} className="text-gray-400" />
                      <h4 className="font-semibold text-gray-900">Autres informations</h4>
                    </div>
                    <p className="text-sm text-gray-700">{selectedProprietaire.autresInfos}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-[#529D21] text-white rounded-lg hover:bg-[#529D21]/90 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* En-tête avec filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrer les propriétaires</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Dropdown lignes */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-40 flex items-center justify-between px-4 py-2.5 border border-[#529D21] rounded-lg text-gray-700 hover:border-[#529D21]/80 transition-colors"
            >
              <span>{itemsPerPage} lignes</span>
              <ChevronDown size={18} className="text-gray-500" />
            </button>
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {['10', '25', '50', '100'].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setItemsPerPage(n); setShowDropdown(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {n} lignes
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-[#529D21]" />
            </div>
            <input
              type="text"
              placeholder="Rechercher"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#529D21] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#529D21]/20 focus:border-[#529D21]"
            />
          </div>

          {/* Total */}
          <div className="flex items-center text-sm text-gray-600">
            Total: {filteredProprietaires.length} propriétaire{filteredProprietaires.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Tableau des propriétaires */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Propriétaire</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Téléphone</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Email</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProprietaires.map((proprietaire) => (
                <tr key={proprietaire.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-semibold text-sm">
                        {proprietaire.avatar}
                      </div>
                      <span className="font-medium text-gray-900">
                        {proprietaire.prenom} {proprietaire.nom}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#529D21] font-medium">{proprietaire.telephone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#529D21] font-medium">{proprietaire.email}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openModal(proprietaire)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} className="text-blue-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProprietaires.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucun propriétaire trouvé
          </div>
        )}
      </div>
    </div>
  );
};
