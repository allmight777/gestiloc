import React, { useState } from 'react';
import { FileText, Download, Search, Eye, Plus, ChevronDown, Check, ArrowUpDown, X, Camera, Calendar, Phone, Mail, MapPin, Briefcase, User } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { DocumentViewer } from './DocumentViewer';

interface DocumentsProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

interface Document {
  id: string;
  name: string;
  bien: string;
  description: string;
  sharedWith: string;
  size: string;
  date: string;
  type: 'actif' | 'archive';
}

const mockDocuments: Document[] = [
  { id: '1', name: 'Bail_signé.pdf', bien: 'Appartement Paris 12', description: 'Contrat de location', sharedWith: 'Propriétaire', size: '2.4 MB', date: '15/09/2024', type: 'actif' },
  { id: '2', name: 'Quittance_Nov.pdf', bien: 'Appartement Paris 12', description: 'Quittance de loyer', sharedWith: 'Propriétaire', size: '156 KB', date: '28/11/2025', type: 'actif' },
  { id: '3', name: 'DPE_2024.pdf', bien: 'Appartement Paris 12', description: 'Diagnostic DPE', sharedWith: 'Locataire', size: '3.2 MB', date: '01/08/2024', type: 'actif' },
];

const templates = [
  { name: 'Modèle attestation loyer', description: 'Pour demande de logement social' },
  { name: 'Modèle lettre de résiliation', description: 'Préavis de départ' },
  { name: 'Modèle état des lieux', description: 'Inventaire du logement' },
];

const typeOptions = [
  'Acte de vente', 'Bail', 'Quittance', 'DPE', 'Diagnostic', 'Autre'
];

const activityOptions = [
  'Salarié CDI', 'Salarié CDD', 'Gérant salarié', 'Non salarié', 
  'Fonctionnaire', 'Etudiant', 'Intermittent du spectacle', 
  'Intérimaire', 'Assistante maternelle', 'Retraité', 'Autre'
];

const paysOptions = ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada', 'Autre'];

const docTypeOptions = ['Acte de vente', 'Bail', 'Quittance', 'DPE', 'Diagnostic', 'Autre'];

const garantTypeOptions = ['Personne physique', 'Organisme ou société', 'Garantie bancaire', 'Autre'];

export const Documents: React.FC<DocumentsProps> = ({ notify }) => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'dossier'>('documents');
  const [activeFilter, setActiveFilter] = useState<'actifs' | 'archives' | 'templates'>('actifs');
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState('100');
  const [periode, setPeriode] = useState('');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [showPeriodeDropdown, setShowPeriodeDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  
  // Add document form state
  const [addDocForm, setAddDocForm] = useState({
    bien: '',
    location: '',
    type: '',
    description: '',
    shareDocument: true,
  });

  // Dossier form state
  const [dossierForm, setDossierForm] = useState({
    nom: '',
    prenoms: '',
    dateNaissance: '',
    aPropos: '',
    email: '',
    telephone: '',
    mobile: '',
    adresse: '',
    ville: '',
    pays: '',
    region: '',
    typeActivite: '',
    profession: '',
    revenusMensuels: '',
    hasGarant: false,
    garantType: '',
    garantDescription: '',
    docType: '',
    docDescription: '',
    shareDossier: true,
  });

  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [showPaysDropdown, setShowPaysDropdown] = useState(false);
  const [showDocTypeDropdown, setShowDocTypeDropdown] = useState(false);
  const [showGarantTypeDropdown, setShowGarantTypeDropdown] = useState(false);

  const filteredDocs = mockDocuments.filter(doc => {
    if (activeFilter === 'actifs') return doc.type === 'actif';
    if (activeFilter === 'archives') return doc.type === 'archive';
    return true;
  }).filter(doc => 
    searchQuery === '' || 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.bien.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (fileName: string) => {
    setSelectedDoc(fileName);
  };

  const handleDownload = (fileName: string) => {
    notify(`Téléchargement de ${fileName}...`, 'success');
  };

  const handleAddDocument = () => {
    if (!addDocForm.bien || !addDocForm.type) {
      notify('Veuillez remplir les champs obligatoires', 'error');
      return;
    }
    notify('Document ajouté avec succès !', 'success');
    setShowAddModal(false);
    setAddDocForm({
      bien: '',
      location: '',
      type: '',
      description: '',
      shareDocument: true,
    });
  };

  const handleSaveDossier = () => {
    notify('Dossier enregistré avec succès !', 'success');
  };

  // Empty state illustration component
  const EmptyStateIllustration = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <svg width="300" height="220" viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background blob */}
        <ellipse cx="150" cy="140" rx="100" ry="70" fill="#FFE4E1"/>
        
        {/* Calendar */}
        <rect x="110" y="40" width="80" height="70" rx="8" fill="#E3F2FD" stroke="#2196F3" strokeWidth="2"/>
        <rect x="120" y="52" width="60" height="8" rx="2" fill="#2196F3"/>
        <rect x="128" y="68" width="12" height="12" rx="2" fill="#2196F3"/>
        <rect x="144" y="68" width="12" height="12" rx="2" fill="#64B5F6"/>
        <rect x="160" y="68" width="12" height="12" rx="2" fill="#64B5F6"/>
        <rect x="128" y="86" width="12" height="12" rx="2" fill="#64B5F6"/>
        <rect x="144" y="86" width="12" height="12" rx="2" fill="#64B5F6"/>
        
        {/* Person 1 - Left */}
        <ellipse cx="70" cy="150" rx="25" ry="30" fill="#FFAB91"/>
        <circle cx="70" cy="120" r="18" fill="#FFAB91"/>
        <rect x="50" y="160" width="15" height="40" rx="7" fill="#5C6BC0"/>
        <rect x="75" y="160" width="15" height="40" rx="7" fill="#5C6BC0"/>
        {/* Shopping bag */}
        <rect x="35" y="120" width="20" height="25" rx="3" fill="#FF9800"/>
        <path d="M40 115 Q45 110 50 115" stroke="#FF9800" strokeWidth="2" fill="none"/>
        
        {/* Person 2 - Right */}
        <ellipse cx="230" cy="150" rx="25" ry="30" fill="#8D6E63"/>
        <circle cx="230" cy="120" r="18" fill="#8D6E63"/>
        <rect x="210" y="160" width="15" height="40" rx="7" fill="#EC407A"/>
        <rect x="235" y="160" width="15" height="40" rx="7" fill="#EC407A"/>
        {/* Folder */}
        <rect x="245" y="120" width="25" height="30" rx="3" fill="#FFC107"/>
        <rect x="250" y="115" width="15" height="5" rx="2" fill="#FFC107"/>
        
        {/* Decorative elements */}
        <circle cx="50" cy="60" r="8" fill="#E1BEE7"/>
        <circle cx="250" cy="60" r="10" fill="#B2DFDB"/>
        <rect x="40" y="180" width="12" height="12" rx="3" fill="#C5E1A5" transform="rotate(15 46 186)"/>
        
        {/* Dollar sign */}
        <circle cx="250" cy="90" r="15" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2"/>
        <text x="250" y="95" textAnchor="middle" fill="#FF9800" fontSize="16" fontWeight="bold">$</text>
      </svg>
      
      <button
        onClick={() => setShowAddModal(true)}
        className="mt-6 px-6 py-2.5 bg-[#7CB342] text-white font-medium rounded-lg hover:bg-[#689F38] transition-colors"
      >
        Ajouter un document
      </button>
    </div>
  );

  // Add Document Modal
  const AddDocumentModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Ajouter un document</h2>
          <button 
            onClick={() => setShowAddModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Information Banner */}
          <div className="bg-[#FFF8E7] border-l-4 border-[#FFB74D] p-4 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Information</h4>
            <p className="text-sm text-gray-600">
              Archivez vos documents scannés et partagez-les avec vos propriétaires.<br/>
              Formats acceptés : Word, Excel, PDF, Images (GIF, JPG, PNG). Taille maximale : 15 Mo.<br/>
              Pour numériser vos documents, vous pouvez :<br/>
              • Les prendre en photo mais il faut faire attention au cadrage et à la qualité de l'image. Vous pouvez utiliser certaines applications de Scan pour Smartphones.<br/>
              • A l'aide d'un Scanner. Une résolution de 150 à 200dpi suffit largement pour éviter d'avoir des tailles de fichiers trop élevées.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Bien */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bien</label>
              <input
                type="text"
                value={addDocForm.bien}
                onChange={(e) => setAddDocForm({...addDocForm, bien: e.target.value})}
                className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={addDocForm.location}
                onChange={(e) => setAddDocForm({...addDocForm, location: e.target.value})}
                className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
              />
            </div>

            {/* Type */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-[#7CB342] rounded-lg text-gray-700 bg-white hover:border-[#7CB342]/80 transition-colors"
              >
                <span className={addDocForm.type ? 'text-gray-900' : 'text-gray-400'}>
                  {addDocForm.type || 'Acte de vente...'}
                </span>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {typeOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => { setAddDocForm({...addDocForm, type}); setShowTypeDropdown(false); }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ajouter le fichier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter le fichier</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <Camera size={28} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Formats acceptés : Word, Excel, PDF, Images (GIF, JPG, PNG). Taille maximale : 15 Mo
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={addDocForm.description}
                onChange={(e) => setAddDocForm({...addDocForm, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342] resize-none"
              />
            </div>

            {/* Options de partage du document */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4">• Options de partage du document</h4>
              
              <div className="flex items-center justify-center gap-8">
                <span className="text-sm text-gray-600">Partager</span>
                
                {/* Toggle */}
                <button
                  onClick={() => setAddDocForm({...addDocForm, shareDocument: !addDocForm.shareDocument})}
                  className="relative w-16 h-8 rounded-full transition-colors"
                  style={{ backgroundColor: addDocForm.shareDocument ? '#7CB342' : '#E5E7EB' }}
                >
                  <div 
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform"
                    style={{ transform: addDocForm.shareDocument ? 'translateX(34px)' : 'translateX(4px)' }}
                  />
                </button>
                
                <span className="text-sm text-gray-600">Pas de partage</span>
              </div>

              {addDocForm.shareDocument && (
                <p className="text-center text-sm text-[#7CB342] mt-3">
                  Partager le document avec <span className="font-medium">Jeannot jonze</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl">
          <button
            onClick={() => setShowAddModal(false)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <X size={16} />
            Annuler
          </button>
          <button
            onClick={handleAddDocument}
            className="flex items-center justify-center px-4 sm:px-6 py-2 bg-[#7CB342] text-white font-medium rounded-lg hover:bg-[#689F38] transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );

  // Dossier Form
  const DossierForm = () => (
    <div className="w-full">
      {/* Information Banner */}
      <div className="bg-[#FFF8E7] border-l-4 border-[#FFB74D] p-4 rounded-r-lg mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">Informations</h4>
        <p className="text-sm text-gray-600">
          Créez votre dossier de candidature en ligne. Vous le partagez ensuite en un clic avec les propriétaires et agences immobilières de votre choix.
        </p>
      </div>

      {/* Section: Informations personnelles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
          Informations personnelles
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input
              type="text"
              value={dossierForm.nom}
              onChange={(e) => setDossierForm({...dossierForm, nom: e.target.value})}
              className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
              placeholder="DUPONT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prénoms</label>
            <input
              type="text"
              value={dossierForm.prenoms}
              onChange={(e) => setDossierForm({...dossierForm, prenoms: e.target.value})}
              className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
              placeholder="Jean"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={dossierForm.dateNaissance}
                onChange={(e) => setDossierForm({...dossierForm, dateNaissance: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
                placeholder="jj/mm/aaaa"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">A propos de vous</label>
            <textarea
              value={dossierForm.aPropos}
              onChange={(e) => setDossierForm({...dossierForm, aPropos: e.target.value})}
              rows={4}
              className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section: Informations de contact */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
          Informations de contact
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={dossierForm.email}
                onChange={(e) => setDossierForm({...dossierForm, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={dossierForm.telephone}
                onChange={(e) => setDossierForm({...dossierForm, telephone: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
                placeholder="0100000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={dossierForm.mobile}
                onChange={(e) => setDossierForm({...dossierForm, mobile: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
                placeholder="0100000000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Adresse */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
          Adresse
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
            <input
              type="text"
              value={dossierForm.adresse}
              onChange={(e) => setDossierForm({...dossierForm, adresse: e.target.value})}
              className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
            <input
              type="text"
              value={dossierForm.ville}
              onChange={(e) => setDossierForm({...dossierForm, ville: e.target.value})}
              className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
            <button
              onClick={() => setShowPaysDropdown(!showPaysDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-[#7CB342] rounded-lg text-gray-700 bg-white hover:border-[#7CB342]/80 transition-colors"
            >
              <span className={dossierForm.pays ? 'text-gray-900' : 'text-gray-400'}>
                {dossierForm.pays || 'Sélectionnez...'}
              </span>
              <ChevronDown size={18} className="text-gray-500" />
            </button>
            {showPaysDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {paysOptions.map((pays) => (
                  <button
                    key={pays}
                    onClick={() => { setDossierForm({...dossierForm, pays}); setShowPaysDropdown(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                  >
                    {pays}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
            <input
              type="text"
              value={dossierForm.region}
              onChange={(e) => setDossierForm({...dossierForm, region: e.target.value})}
              className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
            />
          </div>
        </div>
      </div>

      {/* Section: Situation professionnelle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
          Situation professionnelle
        </h3>
        
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d'activité</label>
            <button
              onClick={() => setShowActivityDropdown(!showActivityDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-[#7CB342] rounded-lg text-gray-700 bg-white hover:border-[#7CB342]/80 transition-colors"
            >
              <span className={dossierForm.typeActivite ? 'text-gray-900' : 'text-gray-400'}>
                {dossierForm.typeActivite || 'Sélectionnez...'}
              </span>
              <ChevronDown size={18} className="text-gray-500" />
            </button>
            {showActivityDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {activityOptions.map((activity) => (
                  <button
                    key={activity}
                    onClick={() => { setDossierForm({...dossierForm, typeActivite: activity}); setShowActivityDropdown(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                  >
                    {activity}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
            <input
              type="text"
              value={dossierForm.profession}
              onChange={(e) => setDossierForm({...dossierForm, profession: e.target.value})}
              className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Revenus mensuels</label>
            <input
              type="number"
              value={dossierForm.revenusMensuels}
              onChange={(e) => setDossierForm({...dossierForm, revenusMensuels: e.target.value})}
              className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342]"
              placeholder="€"
            />
          </div>
        </div>
      </div>

      {/* Section: Garants */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
          Garants
        </h3>
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-sm text-gray-600">J'ai un garant</span>
          
          {/* Toggle */}
          <button
            onClick={() => setDossierForm({...dossierForm, hasGarant: !dossierForm.hasGarant})}
            className="relative w-20 h-8 rounded-full transition-colors"
            style={{ backgroundColor: dossierForm.hasGarant ? '#7CB342' : '#EF4444' }}
          >
            <div 
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform"
              style={{ transform: dossierForm.hasGarant ? 'translateX(46px)' : 'translateX(4px)' }}
            />
          </button>
          
          <span className="text-sm text-gray-600">Je n'ai pas de garant</span>
        </div>

        <p className="text-center text-sm text-[#7CB342] mb-4">Choisissez votre case</p>

        {/* Info Banner for Garant */}
        <div className="bg-[#FFF8E7] border-l-4 border-[#FFB74D] p-4 rounded-r-lg mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Information</h4>
          <p className="text-xs text-gray-600">
            Voici la liste des documents essentiels à fournir :<br/>
            • Justificatif d'identité : passeport, carte nationale d'identité ou permis de conduire en cours de validité.<br/>
            • Justificatif de domicile : quittance de loyer récente, facture d'électricité/gaz/eau, attestation d'hébergement ou contrat de sous-location actuel.<br/>
            • Justificatif de situation professionnelle : contrat de travail, attestation de l'employeur, carte d'étudiant, justificatif de revenus pour les indépendants, certificat d'études pour les étudiants.<br/>
            • Justificatif de ressources : 3 derniers bulletins de salaire, déclaration d'impôts, avis d'imposition, justificatif de pension, ou autres revenus réguliers.
          </p>
        </div>

        {dossierForm.hasGarant && (
          <div className="mt-4 space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <button
                onClick={() => setShowGarantTypeDropdown(!showGarantTypeDropdown)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-[#7CB342] rounded-lg text-gray-700 bg-white hover:border-[#7CB342]/80 transition-colors"
              >
                <span className={dossierForm.garantType ? 'text-gray-900' : 'text-gray-400'}>
                  {dossierForm.garantType || 'Choisir'}
                </span>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
              {showGarantTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {garantTypeOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => { setDossierForm({...dossierForm, garantType: type}); setShowGarantTypeDropdown(false); }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={dossierForm.garantDescription}
                onChange={(e) => setDossierForm({...dossierForm, garantDescription: e.target.value})}
                rows={4}
                className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342] resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section: Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
          Documents
        </h3>
        
        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={() => setShowDocTypeDropdown(!showDocTypeDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-[#7CB342] rounded-lg text-gray-700 bg-white hover:border-[#7CB342]/80 transition-colors"
            >
              <span className={dossierForm.docType ? 'text-gray-900' : 'text-gray-400'}>
                {dossierForm.docType || 'Sélectionnez le type de document...'}
              </span>
              <ChevronDown size={18} className="text-gray-500" />
            </button>
            {showDocTypeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {docTypeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => { setDossierForm({...dossierForm, docType: type}); setShowDocTypeDropdown(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={dossierForm.docDescription}
              onChange={(e) => setDossierForm({...dossierForm, docDescription: e.target.value})}
              rows={3}
              className="w-full px-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter le fichier</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer flex flex-col items-center justify-center">
              <Camera size={32} className="text-gray-400 mb-2" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Formats acceptés : Word, Excel, PDF, Images (GIF, JPG, PNG). Taille maximale : 15 Mo
            </p>
          </div>
        </div>
      </div>

      {/* Section: Options de partage du dossier */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
          Options de partage du dossier
        </h3>
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-sm text-gray-600">Visible au public</span>
          
          {/* Toggle */}
          <button
            onClick={() => setDossierForm({...dossierForm, shareDossier: !dossierForm.shareDossier})}
            className="relative w-16 h-8 rounded-full transition-colors"
            style={{ backgroundColor: dossierForm.shareDossier ? '#7CB342' : '#E5E7EB' }}
          >
            <div 
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform"
              style={{ transform: dossierForm.shareDossier ? 'translateX(34px)' : 'translateX(4px)' }}
            />
          </button>
          
          <span className="text-sm text-gray-600">Pas visible au public</span>
        </div>

        <p className="text-center text-sm text-[#7CB342]">
          L'adresse URL ci-dessous sera visible aux destinataires.
        </p>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mb-8">
        <button
          onClick={() => setActiveTab('documents')}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          <X size={16} />
          Annuler
        </button>
        <button
          onClick={handleSaveDossier}
          className="flex items-center justify-center px-6 py-2.5 bg-[#7CB342] text-white font-medium rounded-lg hover:bg-[#689F38] transition-colors"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );

  return (
    <>
      <DocumentViewer 
        isOpen={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        fileName={selectedDoc || ''} 
        fileType="pdf"
        notify={notify}
      />

      {/* Add Document Modal */}
      {showAddModal && (
        <AddDocumentModal />
      )}

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-3 px-6 text-sm font-medium rounded-l-lg transition-colors ${
              activeTab === 'documents' 
                ? 'bg-[#FFB74D] text-white' 
                : 'bg-[#FFF3E0] text-gray-700 hover:bg-[#FFE0B2]'
            }`}
          >
            MES DOCUMENTS
          </button>
          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex-1 py-3 px-6 text-sm font-medium rounded-r-lg transition-colors ${
              activeTab === 'dossier' 
                ? 'bg-[#FFB74D] text-white' 
                : 'bg-[#FFF3E0] text-gray-700 hover:bg-[#FFE0B2]'
            }`}
          >
            MON DOSSIER
          </button>
        </div>

        {activeTab === 'dossier' ? (
          <DossierForm />
        ) : (
          <>
            {/* Header with filters and add button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveFilter('actifs')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    activeFilter === 'actifs' ? 'text-[#7CB342]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Check size={16} className={activeFilter === 'actifs' ? 'text-[#7CB342]' : 'text-gray-400'}/>
                  Actifs <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">0</span>
                </button>
                <button
                  onClick={() => setActiveFilter('archives')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    activeFilter === 'archives' ? 'text-[#7CB342]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText size={16} className={activeFilter === 'archives' ? 'text-[#7CB342]' : 'text-gray-400'}/>
                  Archivages <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">0</span>
                </button>
                <button
                  onClick={() => setActiveFilter('templates')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    activeFilter === 'templates' ? 'text-[#7CB342]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText size={16} className={activeFilter === 'templates' ? 'text-[#7CB342]' : 'text-gray-400'}/>
                  Templates
                </button>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#7CB342] text-white font-medium rounded-lg hover:bg-[#689F38] transition-colors"
              >
                <Plus size={18} />
                Un nouveau document
              </button>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Filtrer les paiements</h2>
              
              <div className="flex flex-col gap-4">
                {/* First row - Dropdowns */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Items per page */}
                  <div className="relative sm:w-48">
                    <button
                      onClick={() => setShowItemsDropdown(!showItemsDropdown)}
                      className="w-full flex items-center justify-between px-4 py-2.5 border border-[#7CB342] rounded-lg text-gray-700 hover:border-[#7CB342]/80 transition-colors bg-white"
                    >
                      <span>{itemsPerPage} lignes</span>
                      <ChevronDown size={18} className="text-gray-500" />
                    </button>
                    {showItemsDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {['10', '25', '50', '100'].map((n) => (
                          <button
                            key={n}
                            onClick={() => { setItemsPerPage(n); setShowItemsDropdown(false); }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {n} lignes
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Period */}
                  <div className="relative sm:w-48">
                    <button
                      onClick={() => setShowPeriodeDropdown(!showPeriodeDropdown)}
                      className="w-full flex items-center justify-between px-4 py-2.5 border border-[#7CB342] rounded-lg text-gray-700 hover:border-[#7CB342]/80 transition-colors bg-white"
                    >
                      <span>{periode || 'Période'}</span>
                      <ChevronDown size={18} className="text-gray-500" />
                    </button>
                    {showPeriodeDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {['Tous', 'Janvier 2024', 'Février 2024', 'Mars 2024', 'Avril 2024', 'Mai 2024'].map((p) => (
                          <button
                            key={p}
                            onClick={() => { setPeriode(p === 'Tous' ? '' : p); setShowPeriodeDropdown(false); }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Second row - Search and Total */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Search */}
                  <div className="flex-1 relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-[#7CB342]" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#7CB342] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342] bg-white"
                    />
                  </div>

                  {/* Total */}
                  <div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
                    Total: {activeFilter === 'templates' ? templates.length : filteredDocs.length} {activeFilter === 'templates' ? 'Template' : 'Document'}{filteredDocs.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {activeFilter === 'templates' ? (
                // Templates view
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Nom du template</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Description</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {templates.map((template, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                          <td className="px-6 py-4 text-sm text-gray-900">{template.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{template.description}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => notify(`Téléchargement de ${template.name}...`, 'success')}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Download size={18} className="text-[#7CB342]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : filteredDocs.length === 0 ? (
                <EmptyStateIllustration />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900 flex items-center gap-1">
                          Fichier <ArrowUpDown size={14} className="text-gray-400"/>
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Bien</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Description</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Partagé avec</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Taille</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map((doc) => (
                        <tr key={doc.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                          <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-2">
                            <FileText size={16} className="text-[#FFB74D]"/>
                            {doc.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{doc.bien}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{doc.description}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{doc.sharedWith}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{doc.size}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{doc.date}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handlePreview(doc.name)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Eye size={18} className="text-gray-500" />
                              </button>
                              <button
                                onClick={() => handleDownload(doc.name)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Download size={18} className="text-[#7CB342]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer */}
              {(activeFilter !== 'templates' || filteredDocs.length > 0) && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={() => setSelectAll(!selectAll)}
                        className="w-4 h-4 border-gray-300 rounded text-[#7CB342] focus:ring-[#7CB342]"
                      />
                      Tout
                    </label>
                    <button
                      onClick={() => notify('Export en cours...', 'success')}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#7CB342] transition-colors"
                    >
                      <ArrowUpDown size={14} />
                      Export
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-[#7CB342] text-white font-medium rounded-lg hover:bg-[#689F38] transition-colors"
                  >
                    Ajouter un document
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};