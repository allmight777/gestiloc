import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Home,
  DollarSign,
  Wrench,
  Users,
  Activity,
  Shield,
  User,
  Edit,
  Trash2,
  Power,
  RefreshCw,
} from 'lucide-react'

import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

import { useAppContext } from '../context/AppContext'
import { administratorService } from '@/services/administrator'

import {
  AdminUser,
  AdminUserDetailsResponse,
  AdminUserType,
} from '@/pages/Admin/types'

interface UserDetailProps {
  userId: number
  onBack: () => void
}

/**
 * ============================
 * USER DETAIL — ADMIN
 * ============================
 */
export const UserDetail: React.FC<UserDetailProps> = ({ userId, onBack }) => {
  const { t, showToast } = useAppContext()

  const [userDetails, setUserDetails] = useState<AdminUserDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionModal, setActionModal] = useState<{
    type: 'suspend' | 'reactivate' | 'delete' | null
    user: AdminUser | null
  }>({ type: null, user: null })

  /* ============================
   * FETCH USER DETAILS
   * ============================ */
  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      const { data } = await administratorService.getUser(userId)
      setUserDetails(data)
    } catch {
      showToast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  /* ============================
   * ACTIONS
   * ============================ */
  const handleSuspendUser = async () => {
    if (!actionModal.user) return
    try {
      await administratorService.suspendUser(actionModal.user.id)
      showToast(t('users.suspended'), 'success')
      setActionModal({ type: null, user: null })
      fetchUserDetails()
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  const handleReactivateUser = async () => {
    if (!actionModal.user) return
    try {
      await administratorService.reactivateUser(actionModal.user.id)
      showToast(t('users.reactivated'), 'success')
      setActionModal({ type: null, user: null })
      fetchUserDetails()
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  const handleDeleteUser = async () => {
    if (!actionModal.user) return
    try {
      // À implémenter côté API
      showToast(t('users.userDeleted'), 'info')
      setActionModal({ type: null, user: null })
      onBack()
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  const handleImpersonateUser = async (user: AdminUser) => {
    try {
      await administratorService.impersonateUser(user.id)
      showToast(t('users.impersonating'), 'info')
      window.location.href = '/dashboard'
    } catch {
      showToast(t('common.error'), 'error')
    }
  }

  /* ============================
   * HELPERS
   * ============================ */
  const getUserDisplayName = (user: AdminUser): string => {
    if (user.tenant) {
      return `${user.tenant.first_name} ${user.tenant.last_name}`.trim()
    }

    if (user.landlord) {
      if (user.landlord.company_name) {
        return user.landlord.company_name
      }
      return `${user.landlord.first_name ?? ''} ${user.landlord.last_name ?? ''}`.trim()
    }

    if (user.agency) {
      return user.agency.company_name || user.email
    }

    return user.email
  }

  const getRoleLabel = (type: AdminUserType): string => {
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

  const renderSummaryItem = (icon: React.ReactNode, label: string, value: string | number) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="text-slate-400">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-semibold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  )

  const renderActivityItem = (activity: any) => (
    <div key={activity.type} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-white">{activity.label}</p>
        {activity.date && (
          <p className="text-xs text-slate-500">
            {new Date(activity.date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">{t('users.userNotFound')}</p>
      </div>
    )
  }

  const { user, summary, activity } = userDetails

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {getUserDisplayName(user)}
            </h1>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(user.status)}>
            {user.status}
          </Badge>
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">
            {getRoleLabel(user.user_type)}
          </span>
        </div>
      </div>

      {/* USER INFO */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User size={20} />
          Informations Utilisateur
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="text-slate-400" size={20} />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center gap-3">
              <Phone className="text-slate-400" size={20} />
              <div>
                <p className="text-xs text-slate-500">Téléphone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="text-slate-400" size={20} />
            <div>
              <p className="text-xs text-slate-500">Créé le</p>
              <p className="font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {user.last_activity_at && (
            <div className="flex items-center gap-3">
              <Activity className="text-slate-400" size={20} />
              <div>
                <p className="text-xs text-slate-500">Dernière activité</p>
                <p className="font-medium">
                  {new Date(user.last_activity_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* BUSINESS SUMMARY */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} />
          Synthèse Métier
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* TENANT SUMMARY */}
          {summary.role === 'tenant' && (
            <>
              {renderSummaryItem(<Home size={20} />, 'Baux actifs', summary.active_leases || 0)}
              {renderSummaryItem(<DollarSign size={20} />, 'Total payé', `${summary.total_paid || 0}€`)}
              {renderSummaryItem(<Wrench size={20} />, 'Demandes maintenance', summary.maintenance_requests || 0)}
            </>
          )}

          {/* LANDLORD SUMMARY */}
          {(summary.role === 'landlord' || summary.role === 'co_owner') && (
            <>
              {renderSummaryItem(<Building size={20} />, 'Propriétés', summary.properties || 0)}
              {renderSummaryItem(<Home size={20} />, 'Baux actifs', summary.active_leases || 0)}
              {renderSummaryItem(<DollarSign size={20} />, 'Revenus totaux', `${summary.total_revenue || 0}€`)}
              {renderSummaryItem(<Wrench size={20} />, 'Demandes maintenance', summary.maintenance_requests || 0)}
            </>
          )}

          {/* AGENCY SUMMARY */}
          {summary.role === 'agency' && (
            <>
              {renderSummaryItem(<Building size={20} />, 'Propriétés gérées', summary.managed_properties || 0)}
              {renderSummaryItem(<Users size={20} />, 'Délégations', summary.delegations || 0)}
            </>
          )}

          {/* ADMIN SUMMARY */}
          {summary.role === 'admin' && (
            <>
              {renderSummaryItem(<Shield size={20} />, 'Rôle', 'Administrateur')}
              {renderSummaryItem(<Users size={20} />, 'Permissions', 'Accès complet')}
            </>
          )}
        </div>
      </Card>

      {/* RECENT ACTIVITY */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} />
          Activité Récente (30 jours)
        </h2>

        <div className="space-y-2">
          {activity.length > 0 ? (
            activity.map(renderActivityItem)
          ) : (
            <p className="text-center text-slate-500 py-8">
              Aucune activité récente
            </p>
          )}
        </div>
      </Card>

      {/* ACTIONS */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Edit size={20} />
          Actions Administrateur
        </h2>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handleImpersonateUser(user)}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Impersonner
          </Button>

          {user.status === 'active' ? (
            <Button
              variant="secondary"
              onClick={() => setActionModal({ type: 'suspend', user })}
              className="flex items-center gap-2"
            >
              <Power size={16} />
              Suspendre
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setActionModal({ type: 'reactivate', user })}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Réactiver
            </Button>
          )}

          <Button
            variant="danger"
            onClick={() => setActionModal({ type: 'delete', user })}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            Supprimer
          </Button>
        </div>
      </Card>

      {/* ACTION MODAL */}
      <Modal
        isOpen={!!actionModal.type}
        onClose={() => setActionModal({ type: null, user: null })}
        title={t('common.confirm')}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setActionModal({ type: null, user: null })}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (actionModal.type === 'suspend') handleSuspendUser()
                else if (actionModal.type === 'reactivate') handleReactivateUser()
                else if (actionModal.type === 'delete') handleDeleteUser()
              }}
            >
              {actionModal.type === 'suspend' && 'Suspendre'}
              {actionModal.type === 'reactivate' && 'Réactiver'}
              {actionModal.type === 'delete' && 'Supprimer'}
            </Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-300">
          {actionModal.type === 'suspend' && 'Êtes-vous sûr de vouloir suspendre cet utilisateur ?'}
          {actionModal.type === 'reactivate' && 'Êtes-vous sûr de vouloir réactiver cet utilisateur ?'}
          {actionModal.type === 'delete' && 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.'}
        </p>
      </Modal>
    </div>
  )
}
