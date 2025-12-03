import React, { useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'actif' | 'archive';
}

interface DocumentsManagerProps {
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const DocumentsManager: React.FC<DocumentsManagerProps> = ({ notify }) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Bail de location',
      type: 'PDF',
      uploadDate: '15/09/2024',
      size: '2.4 MB',
      status: 'actif'
    },
    {
      id: '2',
      name: 'Quittance de loyer',
      type: 'PDF',
      uploadDate: '28/11/2025',
      size: '156 KB',
      status: 'actif'
    }
  ]);

  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [formData, setFormData] = useState({
    documentType: 'nouveau',
    fileType: '',
    fichier: null as File | null
  });

  const handleAddDocument = () => {
    setShowNewDocForm(true);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    notify('Document supprimé', 'success');
  };

  const handleSaveDocument = () => {
    if (!formData.fileType || !formData.fichier) {
      notify('Veuillez remplir tous les champs', 'error');
      return;
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      name: formData.fichier.name,
      type: formData.fileType,
      uploadDate: new Date().toLocaleDateString('fr-FR'),
      size: `${(formData.fichier.size / 1024).toFixed(1)} KB`,
      status: 'actif'
    };

    setDocuments([...documents, newDoc]);
    setShowNewDocForm(false);
    setFormData({ documentType: 'nouveau', fileType: '', fichier: null });
    notify('Document ajouté avec succès', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, fichier: e.target.files[0] });
    }
  };

  if (showNewDocForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewDocForm(false)}
            className="text-slate-600 hover:text-slate-900"
          >
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Ajouter un document</h1>
        </div>

        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-slate-700">
            Vous pouvez ajouter plusieurs documents. Ces documents seront sauvegardés dans la rubrique Documents.
          </p>
        </div>

        {/* Modal Nouveau Document */}
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-lg shadow-xl bg-white border border-gray-200 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900">Nouveau document</h3>
              <button
                onClick={() => setShowNewDocForm(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-light"
              >
                ×
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2563eb #e0e7ff' }}>
              <style>{`
                div::-webkit-scrollbar { width: 10px; }
                div::-webkit-scrollbar-track { background: #e0e7ff; border-radius: 5px; }
                div::-webkit-scrollbar-thumb { background: #2563eb; border-radius: 5px; }
                div::-webkit-scrollbar-thumb:hover { background: #1d4ed8; }
              `}</style>

              {/* Document Section - Buttons */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Document <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, documentType: 'nouveau' })}
                    className={`flex-1 border rounded-md px-3 py-1.5 text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                      formData.documentType === 'nouveau'
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    📄 Nouveau
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, documentType: 'existant' })}
                    className={`flex-1 border rounded-md px-3 py-1.5 text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                      formData.documentType === 'existant'
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    📋 Déjà existant
                  </button>
                </div>
              </div>

              {/* Fichier Section */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Fichier <span className="text-red-500">*</span></label>
                {formData.documentType === 'nouveau' ? (
                  <div className="border border-dashed border-gray-300 rounded-md p-3 bg-gray-50 text-center">
                    <input
                      type="file"
                      title="Sélectionner un fichier"
                      onChange={handleFileChange}
                      className="w-full text-xs"
                    />
                    <p className="text-xs text-gray-600 mt-1.5">
                      Formats acceptés: Word, Excel, PDF, Images (GIF, JPG, PNG). Taille maximale: 15 Mo
                    </p>
                    {formData.fichier && (
                      <p className="text-xs text-green-600 mt-2">✓ {formData.fichier.name}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      title="Choisir un fichier"
                      value={formData.fileType}
                      onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Choisir</option>
                      <option value="bail">Bail de location</option>
                      <option value="quittance">Quittance de loyer</option>
                      <option value="justificatif">Justificatif</option>
                      <option value="autre">Autre</option>
                    </select>
                    <p className="text-xs text-gray-600">
                      Choisissez parmi les fichiers déjà existants dans la rubrique Mes Documents.
                    </p>
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Description</label>
                <textarea
                  placeholder="Description du document"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>

            {/* Footer - Buttons */}
            <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setShowNewDocForm(false)}
                className="text-gray-700 hover:text-gray-900 text-xs font-medium px-4 py-1.5"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveDocument}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-4 py-1.5 rounded"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500 mt-1">Gérez vos documents importants</p>
        </div>
        <button
          onClick={handleAddDocument}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          Ajouter un document
        </button>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-slate-700">
          Vous pouvez ajouter plusieurs documents. Ces documents seront sauvegardés dans la rubrique Documents.
        </p>
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-600">{doc.uploadDate} • {doc.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-slate-200 rounded-lg bg-white">
          <div className="mb-4">
            <FileText size={48} className="mx-auto text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun document pour le moment</h3>
          <p className="text-slate-600 mb-6">
            Commencez par ajouter votre premier document en cliquant sur le bouton ci-dessus.
          </p>
          <button
            onClick={handleAddDocument}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={16} />
            Ajouter un document
          </button>
        </div>
      )}
    </div>
  );
};
