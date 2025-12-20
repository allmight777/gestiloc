import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Bell, Save, LogOut } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface UserData {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  roles: string[];
  default_role: string;
  role: string;
}

interface ProfileProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
    onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ notify, onLogout }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  // Charger les données utilisateur depuis le localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setFormData({
        first_name: userObj.first_name || '',
        last_name: userObj.last_name || '',
        email: userObj.email || '',
        phone: userObj.phone || ''
      });
      
      // Mettre à jour le nom dans le layout
      updateLayoutName(userObj);
    }
  }, []);

  const updateLayoutName = (userData: UserData) => {
    // Mettre à jour le nom dans le layout
    const nameElement = document.querySelector('.user-name');
    if (nameElement && (userData.first_name || userData.last_name)) {
      const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
      nameElement.textContent = fullName || userData.email;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      // Mettre à jour les données dans le localStorage
      const updatedUser = {
        ...user,
        ...formData
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      updateLayoutName(updatedUser);
      setIsEditing(false);
      notify('Profil mis à jour avec succès', 'success');
    }
  };
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>

      {!user ? (
        <div className="text-center py-8">
          <p>Chargement des informations du profil...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                <User size={32} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {user.first_name || user.last_name 
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
                  : user.email}
              </h2>
              <p className="text-slate-500 capitalize">{user.role || 'Utilisateur'}</p>
              <div className="mt-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                  Compte actif
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <Card title="Informations Personnelles">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Détails du compte</h3>
                {!isEditing ? (
                  <Button type="button" variant="outline" size="sm" onClick={toggleEdit}>
                    Modifier
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" size="sm">
                      Enregistrer
                    </Button>
                  </div>
                )}
              </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm"
                  disabled
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Sécurité">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-slate-500"/>
                <div>
                  <p className="text-sm font-medium text-slate-900">Mot de passe</p>
                  <p className="text-xs text-slate-500">Mettez à jour votre mot de passe régulièrement</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" type="button" onClick={() => notify('Fonctionnalité à venir', 'info')}>
                Modifier
              </Button>
            </div>
          </div>
        </Card>

            <div className="pt-4">
              <Button 
                variant="danger" 
                type="button" 
                onClick={onLogout} 
                icon={<LogOut size={18}/>}
                className="w-full sm:w-auto"
              >
                Se déconnecter
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
