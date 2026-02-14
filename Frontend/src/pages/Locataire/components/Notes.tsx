import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, Search, ArrowLeft, StickyNote, Calendar } from 'lucide-react';
import { Card } from './ui/Card';

interface NotesProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  property?: string;
  location?: string;
  shared?: boolean;
  shareWith?: string;
}

export const Notes: React.FC<NotesProps> = ({ notify }) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Contact plombier',
      content: 'M. Dupont - 06 12 34 56 78. Disponible les weekends.',
      createdAt: '2024-11-15',
      property: 'Appartement Paris 12',
      location: 'Location #1',
      shared: false,
    },
    {
      id: '2',
      title: 'Numéro voisin',
      content: 'Appartement 3B - Mme Martin. Gardien des clés en cas d\'absence.',
      createdAt: '2024-11-10',
      property: 'Studio Lyon 3',
      location: 'Location #2',
      shared: true,
      shareWith: 'Jean LENOIR',
    },
  ]);

  // View state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    property: '',
    location: '',
    shared: false,
    shareWith: '',
  });

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    notify?.('Note supprimée', 'success');
  };

  const handleCreateNote = () => {
    if (!newNote.title) {
      notify?.('Veuillez saisir un titre', 'error');
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title || '',
      content: newNote.content || '',
      createdAt: new Date().toISOString(),
      property: newNote.property,
      location: newNote.location,
      shared: newNote.shared,
      shareWith: newNote.shareWith,
    };

    setNotes([...notes, note]);
    setNewNote({ title: '', content: '', property: '', location: '', shared: false, shareWith: '' });
    setShowCreateForm(false);
    notify?.('Note créée avec succès', 'success');
  };

  const filteredNotes = notes.filter(note => 
    searchQuery === '' || 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.property?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Empty state illustration component
  const EmptyStateIllustration = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
        <circle cx="100" cy="80" r="60" fill="#FFF5F5"/>
        <circle cx="70" cy="60" r="8" fill="#FFB6B6"/>
        <circle cx="130" cy="50" r="6" fill="#FFD6D6"/>
        <circle cx="140" cy="90" r="4" fill="#FFE6E6"/>
        <rect x="85" y="40" width="30" height="40" rx="4" fill="#7CB342" opacity="0.8"/>
        <rect x="80" y="50" width="40" height="30" rx="3" fill="#8BC34A"/>
        <rect x="90" y="45" width="20" height="25" rx="2" fill="#AED581"/>
        <circle cx="100" cy="100" r="25" fill="#FFCCBC" opacity="0.6"/>
        <path d="M85 95 Q100 85 115 95" stroke="#8D6E63" strokeWidth="2" fill="none"/>
        <circle cx="92" cy="90" r="3" fill="#5D4037"/>
        <circle cx="108" cy="90" r="3" fill="#5D4037"/>
        <ellipse cx="100" cy="98" rx="4" ry="3" fill="#5D4037"/>
        <rect x="75" y="110" width="12" height="25" rx="6" fill="#FFCCBC"/>
        <rect x="113" y="110" width="12" height="25" rx="6" fill="#FFCCBC"/>
        <rect x="70" y="100" width="15" height="20" rx="7" fill="#FFAB91"/>
        <rect x="115" y="100" width="15" height="20" rx="7" fill="#FFAB91"/>
        <path d="M60 70 Q55 60 65 55" stroke="#8BC34A" strokeWidth="2" fill="none"/>
        <circle cx="65" cy="55" r="3" fill="#8BC34A"/>
        <path d="M140 75 Q145 65 135 60" stroke="#8BC34A" strokeWidth="2" fill="none"/>
        <circle cx="135" cy="60" r="3" fill="#8BC34A"/>
      </svg>
      <button
        onClick={() => setShowCreateForm(true)}
        className="px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
        style={{ background: 'rgba(82, 157, 33, 0.82)' }}
      >
        Nouvelle note
      </button>
    </div>
  );

  // List view component
  const ListView = () => (
    <div className="space-y-4">
      {/* Top button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
          style={{ background: 'rgba(82, 157, 33, 0.82)' }}
        >
          <Plus size={18} />
          Une nouvelle note
        </button>
      </div>

      {/* Filter Card */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Filtre</h3>
        
        <div className="flex flex-col gap-3">
          {/* Items per page dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowItemsDropdown(!showItemsDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-gray-700 bg-white hover:border-gray-400 transition-colors text-sm"
              style={{ borderColor: 'rgba(82, 157, 33, 0.5)' }}
            >
              <span className="text-gray-400">{itemsPerPage} lignes</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            {showItemsDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {['10', '25', '50', '100'].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setItemsPerPage(n); setShowItemsDropdown(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-sm"
                  >
                    {n} lignes
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{ borderColor: 'rgba(82, 157, 33, 0.5)' }}
            />
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden">
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Sujet</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Bien</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Partage</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8">
                    <EmptyStateIllustration />
                  </td>
                </tr>
              ) : (
                filteredNotes.map((note) => (
                  <tr key={note.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <StickyNote size={16} className="text-gray-400" />
                        {note.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{note.property || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {note.shared ? (
                        <span className="text-green-600">Partagé avec {note.shareWith}</span>
                      ) : (
                        <span className="text-gray-400">Non partagé</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} className="text-gray-500 hover:text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with checkbox */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
          <input type="checkbox" className="rounded border-gray-300" />
          <span className="text-sm text-gray-700">Tout</span>
        </div>
      </Card>
    </div>
  );

  // Create form view
  const CreateFormView = () => (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowCreateForm(false)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
      </div>

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle note</h1>
        <p className="text-sm text-gray-600">Créez une nouvelle note pour votre bien.</p>
      </div>

      {/* Information Card */}
      <Card className="p-4 border-l-4 border-l-orange-300 bg-orange-50">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Information</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          J'envoie mes documents scannés et partagés. Ils sont authentifiés numériquement.<br/>
          Formats acceptés: Word, Excel, PDF, images (GIF, JPG, PNG). Taille maximale: 15 Mo.<br/>
          Pour un fichier en plusieurs parties: ajoutez plusieurs fichiers.<br/>
          <br/>
          A noter: photo d'un document: une résolution de 150 à 300 dpi suffit largement pour éviter des tailles de fichiers trop élevés.
        </p>
      </Card>

      {/* CREATE FORM */}
      <Card className="p-6">
        <div className="space-y-6 max-w-2xl">
          {/* Property */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bien</label>
            <select
              value={newNote.property}
              onChange={(e) => setNewNote({ ...newNote, property: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="">Sélectionner un bien</option>
              <option value="Appartement Paris 12">Appartement Paris 12</option>
              <option value="Studio Lyon 3">Studio Lyon 3</option>
              <option value="Maison Bordeaux">Maison Bordeaux</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={newNote.location}
              onChange={(e) => setNewNote({ ...newNote, location: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="">Sélectionner une location</option>
              <option value="Location #1">Location #1</option>
              <option value="Location #2">Location #2</option>
              <option value="Location #3">Location #3</option>
            </select>
          </div>

          {/* Note Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 min-h-[120px]"
              placeholder="Contenu de votre note..."
            />
          </div>

          {/* Sharing Options */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">• Options de partage du document</h4>
            
            <div className="space-y-4">
              {/* Share toggle */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shareOption"
                    checked={newNote.shared}
                    onChange={() => setNewNote({ ...newNote, shared: true })}
                    className="w-4 h-4"
                    style={{ accentColor: 'rgba(82, 157, 33, 0.82)' }}
                  />
                  <span className="text-sm text-gray-700">Partage</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shareOption"
                    checked={!newNote.shared}
                    onChange={() => setNewNote({ ...newNote, shared: false })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Pas de partage</span>
                </label>
              </div>

              {/* Share description */}
              <p className="text-sm text-gray-600">Partager le document avec un propriétaire</p>

              {/* Share with dropdown */}
              {newNote.shared && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sélectionner le propriétaire</label>
                  <select
                    value={newNote.shareWith}
                    onChange={(e) => setNewNote({ ...newNote, shareWith: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  >
                    <option value="">Sélectionner un propriétaire</option>
                    <option value="Jean LENOIR">Jean LENOIR</option>
                    <option value="Marie DUBOIS">Marie DUBOIS</option>
                    <option value="Pierre MARTIN">Pierre MARTIN</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              × Annuler
            </button>
            <button
              onClick={handleCreateNote}
              className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
              style={{ background: 'rgba(82, 157, 33, 0.82)' }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  return showCreateForm ? <CreateFormView /> : <ListView />;
};

export default Notes;
