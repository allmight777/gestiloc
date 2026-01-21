import React, { useEffect, useState } from 'react'
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Trash2,
  Eye,
  X,
} from 'lucide-react'

import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { Input, Select } from './ui/Input'

import { useAppContext } from '../context/AppContext'
import { administratorService } from '@/services/administrator'

import { UserDetail } from './UserDetail'

import {
  AdminUser,
  AdminUserFilters,
  AdminUserType,
} from '@/pages/Admin/types'

/**
 * ============================
 * ADMIN — USER MANAGEMENT
 * ============================
 */
export const UserManagement: React.FC = () => {
  const { t, showToast } = useAppContext()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    per_page: 15,
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<AdminUserType | 'All'>('All')

  const [loading, setLoading] = useState(false)
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)

  /* ============================
   * FETCH USERS
   * ============================ */
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await administratorService.listUsers({
        ...filters,
        search: searchTerm || undefined,
        type: filterRole !== 'All' ? filterRole : undefined,
      })
      setUsers(data.data)
    } catch {
      showToast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filters, searchTerm, filterRole])

  /* ============================
   * HELPERS UI
   * ============================ */
  const getUserName = (user: AdminUser) => {
    if (user.tenant)
      return `${user.tenant.first_name} ${user.tenant.last_name}`

    if (user.landlord)
      return (
        user.landlord.company_name ??
        `${user.landlord.first_name ?? ''} ${user.landlord.last_name ?? ''}`
      )

    if (user.agency) return user.agency.company_name

    return user.email
  }

  const getRoleLabel = (type: AdminUserType) => {
    switch (type) {
      case 'admin':
        return 'Admin'
      case 'tenant':
        return 'Locataire'
      case 'landlord':
        return 'Propriétaire'
      case 'co_owner':
        return 'Co-propriétaire'
      case 'agency':
        return 'Agence'
      case 'co_owner_agency':
        return 'Agence copro'
      default:
        return '—'
    }
  }

  const getStatusVariant = (status: AdminUser['status']) =>
    status === 'active' ? 'success' : 'danger'

  /* ============================
   * ACTIONS
   * ============================ */
  const handleSuspendUser = async (user: AdminUser) => {
    try {
      await administratorService.suspendUser(user.id)
      showToast(t('users.suspended'), 'success')
      fetchUsers()
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  const handleReactivateUser = async (user: AdminUser) => {
    try {
      await administratorService.reactivateUser(user.id)
      showToast(t('users.reactivated'), 'success')
      fetchUsers()
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  const handleImpersonateUser = async (user: AdminUser) => {
    try {
      await administratorService.impersonateUser(user.id)
      showToast(t('users.impersonating'), 'info')
      // Redirection vers le dashboard de l'utilisateur impersonné
      window.location.href = '/dashboard'
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    // suppression réelle à implémenter côté API
    showToast(t('users.userDeleted'), 'info')
    setUserToDelete(null)
  }

  /* ============================
   * RENDER
   * ============================ */
  return (
    <div className="p-6 space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center animate-slide-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t('users.title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t('users.subtitle')}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="p-4" delay={100}>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-slate-400" />
            <select
              className="bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm"
              value={filterRole}
              onChange={(e) =>
                setFilterRole(e.target.value as AdminUserType | 'All')
              }
            >
              <option value="All">{t('users.allRoles')}</option>
              <option value="admin">Admin</option>
              <option value="tenant">Locataire</option>
              <option value="landlord">Propriétaire</option>
              <option value="co_owner">Co-propriétaire</option>
              <option value="agency">Agence</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase">
                  {t('users.table.user')}
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase">
                  {t('users.table.role')}
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase">
                  {t('users.table.status')}
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase">
                  {t('users.table.lastActive')}
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase">
                  {t('users.table.actions')}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <p className="text-sm font-semibold">
                      {getUserName(user)}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>

                  <td className="py-4 px-4">
                    <span className="text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {getRoleLabel(user.user_type)}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <Badge variant={getStatusVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </td>

                  <td className="py-4 px-4 text-sm text-slate-500">
                    {user.last_activity_at
                      ? new Date(user.last_activity_at).toLocaleDateString()
                      : '—'}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Action: Voir détails */}
                      <button 
                        onClick={() => {
                          setSelectedUserId(user.id)
                          setShowUserDetailsModal(true)
                        }}
                        className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-full text-blue-500"
                        title="Voir les détails"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Action: Impersonner */}
                      <button 
                        onClick={() => handleImpersonateUser(user)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-full text-blue-500"
                        title="Impersonner"
                      >
                        <Mail size={16} />
                      </button>

                      {/* Action: Suspendre/Réactiver */}
                      {user.status === 'active' ? (
                        <button 
                          onClick={() => handleSuspendUser(user)}
                          className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-full text-amber-500"
                          title="Suspendre"
                        >
                          <Filter size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleReactivateUser(user)}
                          className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-full text-green-500"
                          title="Réactiver"
                        >
                          <Filter size={16} />
                        </button>
                      )}

                      {/* Action: Supprimer */}
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-full text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    {t('users.noUsers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DELETE MODAL */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title={t('common.confirm')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUserToDelete(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-300">
          {t('users.deleteConfirm')}
        </p>
      </Modal>

      {/* USER DETAILS MODAL */}
      <Modal
        isOpen={showUserDetailsModal && selectedUserId !== null}
        onClose={() => {
          setShowUserDetailsModal(false)
          setSelectedUserId(null)
        }}
        title={t('users.userDetails')}
        size="lg"
        footer={null}
      >
        {selectedUserId && (
          <UserDetail
            userId={selectedUserId}
            onBack={() => {
              setShowUserDetailsModal(false)
              setSelectedUserId(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
