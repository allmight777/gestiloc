import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Mail, Phone, Trash2, Edit } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input, Select } from './ui/Input';
import { MOCK_USERS } from '../constants';
import { User, UserStatus } from '../types';
import { useAppContext } from '../context/AppContext';

export const UserManagement: React.FC = () => {
  const { t, showToast } = useAppContext();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  
  // State for Add User Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Tenant', status: UserStatus.ACTIVE });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Delete User
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    if(!newUser.name || !newUser.email) return;
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...newUser,
        lastActive: 'Just now',
        avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`
      } as User;
      
      setUsers([user, ...users]);
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', role: 'Tenant', status: UserStatus.ACTIVE });
      showToast(t('users.userAdded'), 'success');
    }, 800);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setUsers(users.filter(u => u.id !== userToDelete));
    setUserToDelete(null);
    showToast(t('users.userDeleted'), 'info');
  };

  const getStatusVariant = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE: return 'success';
      case UserStatus.INACTIVE: return 'neutral';
      case UserStatus.PENDING: return 'info';
      case UserStatus.BANNED: return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="p-6 space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center animate-slide-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('users.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('users.subtitle')}</p>
        </div>
        <Button 
          className="mt-4 sm:mt-0"
          onClick={() => setIsAddModalOpen(true)}
        >
          {t('users.addUser')}
        </Button>
      </div>

      <Card className="p-4" delay={100}>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={t('users.searchPlaceholder')} 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-slate-400" />
            <select 
              className="bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="All">{t('users.allRoles')}</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Tenant">Tenant</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users.table.user')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users.table.role')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users.table.status')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users.table.lastActive')}</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('users.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-sm group-hover:scale-110 transition-transform duration-300"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{user.lastActive}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-full text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm">
                        <Mail size={16} />
                      </button>
                      <button onClick={() => setUserToDelete(user.id)} className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-full text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              {t('users.noUsers')}
            </div>
          )}
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('users.addModal.title')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAddUser} isLoading={isSubmitting}>{t('common.save')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label={t('users.addModal.name')}
            value={newUser.name}
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
          />
          <Input 
            label={t('users.addModal.email')}
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
          />
          <Select 
            label={t('users.addModal.role')}
            options={[
              { value: 'Tenant', label: 'Tenant' },
              { value: 'Manager', label: 'Manager' },
              { value: 'Admin', label: 'Admin' },
            ]}
            value={newUser.role}
            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
          />
           <Select 
            label={t('users.addModal.status')}
            options={[
              { value: UserStatus.ACTIVE, label: 'Active' },
              { value: UserStatus.INACTIVE, label: 'Inactive' },
              { value: UserStatus.PENDING, label: 'Pending' },
            ]}
            value={newUser.status}
            onChange={(e) => setNewUser({...newUser, status: e.target.value as UserStatus})}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title={t('common.confirm')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUserToDelete(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={handleDeleteUser}>{t('common.delete')}</Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-300">{t('users.deleteConfirm')}</p>
      </Modal>
    </div>
  );
};