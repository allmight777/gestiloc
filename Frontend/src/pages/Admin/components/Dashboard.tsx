import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ArrowUpRight, Users, CreditCard, AlertCircle, MapPin, Plus, Download } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { useAppContext } from '../context/AppContext'
import { administratorService } from '../../../services/administrator';
import styles from './Dashboard.module.css'
import { DashboardStatsResponse } from '@/pages/Admin/types'

interface StatCardProps {
  title: string
  value: string | number
  trend?: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  delay?: number
  colorClass?: string
}

const StatCard = ({ title, value, trend, icon: Icon, delay, colorClass }: StatCardProps) => (
  <Card delay={delay} className="p-6 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">{value}</h3>
      {trend && (
        <div className="flex items-center text-xs font-medium">
          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded flex items-center">
            <ArrowUpRight size={14} className="mr-1" /> {trend}
          </span>
        </div>
      )}
    </div>
    {Icon && <div className={`p-3 rounded-lg ${colorClass} shadow-sm`}><Icon width={24} height={24} className="text-white" /></div>}
  </Card>
)

export default function Dashboard() {
  const { t, showToast } = useAppContext()
  const [dashboardData, setDashboardData] = useState<DashboardStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false)
  const [newProperty, setNewProperty] = useState({ name: '', address: '' })
  
  // Ref pour éviter les doubles appels en dev (React StrictMode)
  const fetchedRef = useRef(false)

  // Chargement des données du dashboard
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchDashboard = async () => {
      try {
        console.log('🚀 [DASHBOARD] Starting dashboard data fetch...');
        setIsLoading(true)
        const response = await administratorService.getDashboardStats()
        console.log('📊 [DASHBOARD] Raw API response:', response);
        console.log('📈 [DASHBOARD] Dashboard data set:', response.data.data);
        setDashboardData(response.data.data)
      } catch (error) {
        console.error('💥 [DASHBOARD] Error fetching dashboard:', error);
        showToast(t('dashboard.fetchError'), 'error')
      } finally {
        console.log('✅ [DASHBOARD] Dashboard fetch completed');
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [t, showToast])

  const handleExport = () => {
    showToast(t('common.success'), 'success')
  }

  const handleAddProperty = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsAddPropertyModalOpen(false)
      showToast(t('dashboard.propertyAdded'), 'success')
      setNewProperty({ name: '', address: '' })
    }, 1000)
  }

if (!dashboardData?.kpi || !dashboardData?.financial) {
  return <p className="text-center mt-10">{t('dashboard.loading')}</p>
}
   

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 animate-slide-in">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-violet-600 dark:from-blue-400 dark:to-violet-400 animate-gradient">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button variant="secondary" onClick={handleExport} icon={<Download size={16} />}>
            {t('common.export')}
          </Button>
          <Button onClick={() => setIsAddPropertyModalOpen(true)} icon={<Plus size={16} />}>
            {t('dashboard.newProperty')}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dashboard.totalUsers')} 
          value={dashboardData.kpi.total_users} 
          trend={`+${dashboardData.kpi.new_users_this_month}`} 
          icon={Users} 
          delay={0} 
          colorClass="bg-blue-600"
        />
        <StatCard 
          title={t('dashboard.totalLandlords')} 
          value={dashboardData.kpi.total_landlords} 
          trend={`${dashboardData.kpi.user_growth_rate}%`} 
          icon={Users} 
          delay={100} 
          colorClass="bg-violet-600"
        />
        <StatCard 
          title={t('dashboard.totalTenants')} 
          value={dashboardData.kpi.total_tenants} 
          trend={`+${dashboardData.kpi.new_users_this_month}`} 
          icon={Users} 
          delay={200} 
          colorClass="bg-emerald-500"
        />
        <StatCard 
          title={t('dashboard.onlineUsers')} 
          value={dashboardData.kpi.online_users} 
          trend={`${dashboardData.kpi.online_percentage}%`} 
          icon={Users} 
          delay={300} 
          colorClass="bg-green-500"
        />
      </div>

      {/* Stats Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dashboard.totalProperties')} 
          value={dashboardData.properties.total_properties} 
          trend={`+${dashboardData.properties.new_properties_this_month}`} 
          icon={MapPin} 
          delay={400} 
          colorClass="bg-blue-600"
        />
        <StatCard 
          title={t('dashboard.occupancyRate')} 
          value={`${dashboardData.properties.global_occupancy_rate}%`} 
          trend={`${dashboardData.properties.properties_with_leases} occupied`} 
          icon={MapPin} 
          delay={500} 
          colorClass="bg-purple-600"
        />
        <StatCard 
          title={t('dashboard.totalLeases')} 
          value={dashboardData.leases.total_leases} 
          trend={`${dashboardData.leases.active_leases} active`} 
          icon={CreditCard} 
          delay={600} 
          colorClass="bg-orange-500"
        />
        <StatCard 
          title={t('dashboard.pendingIssues')} 
          value={dashboardData.maintenance.open_requests} 
          trend={`${dashboardData.maintenance.in_progress_requests} in progress`} 
          icon={AlertCircle} 
          delay={700} 
          colorClass="bg-red-500"
        />
      </div>

      {/* Financial Overview & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Financial Summary Card */}
        <Card className="p-6" delay={800}>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">{t('dashboard.financialOverview')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.expectedRent')}</span>
              <span className="font-semibold">${dashboardData.financial.monthly_expected_rent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.collectedRent')}</span>
              <span className="font-semibold text-green-600">${dashboardData.financial.monthly_collected_rent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.collectionRate')}</span>
              <span className="font-semibold">{dashboardData.financial.collection_rate}%</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.totalPayments')}</span>
              <span className="font-semibold">{dashboardData.payments.total_payments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.fedapayConversion')}</span>
              <span className="font-semibold">{dashboardData.payments.fedapay_conversion_rate}%</span>
            </div>
          </div>
        </Card>

        {/* Documents Summary Card */}
        <Card className="p-6" delay={900}>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">{t('dashboard.documents')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.rentReceipts')}</span>
              <span className="font-semibold">{dashboardData.documents.rent_receipts_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.conditionReports')}</span>
              <span className="font-semibold">{dashboardData.documents.property_condition_reports_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.contracts')}</span>
              <span className="font-semibold">{dashboardData.documents.contracts_count}</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.totalDocuments')}</span>
              <span className="font-semibold text-blue-600">{dashboardData.documents.total_documents}</span>
            </div>
          </div>
        </Card>

        {/* Maintenance Summary Card */}
        <Card className="p-6" delay={1000}>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">{t('dashboard.maintenance')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.totalRequests')}</span>
              <span className="font-semibold">{dashboardData.maintenance.total_requests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.openRequests')}</span>
              <span className="font-semibold text-red-600">{dashboardData.maintenance.open_requests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.inProgressRequests')}</span>
              <span className="font-semibold text-yellow-600">{dashboardData.maintenance.in_progress_requests}</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.resolvedRequests')}</span>
              <span className="font-semibold text-green-600">{dashboardData.maintenance.resolved_requests}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Revenue Chart */}
        <Card className="p-6 min-h-[400px]" delay={1100}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t('dashboard.financialPerformance')}</h3>
            <select className="text-sm border-none bg-slate-50 dark:bg-slate-700 rounded-md px-3 py-1 text-slate-600 dark:text-slate-200 focus:ring-0 cursor-pointer">
              <option>{t('dashboard.thisYear')}</option>
              <option>{t('dashboard.lastYear')}</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.charts?.revenue_trend || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month_label" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff', color: '#1e293b' }} />
                <Area type="monotone" dataKey="collected_rent" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Collection Rate Chart */}
        <Card className="p-6 min-h-[400px]" delay={1200}>
          <div className="mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t('dashboard.collectionRate')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.monthlyOverview')}</p>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.charts?.revenue_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month_label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', backgroundColor: '#fff', color: '#1e293b' }} />
                <Bar dataKey="collection_rate" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="p-6 mt-6" delay={1300}>
        <div className="mb-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t('dashboard.recentActivity')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.latestActivities')}</p>
        </div>
        <div className="space-y-4">
          {dashboardData.recent_activity?.length > 0 ? (
            dashboardData.recent_activity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'user_registered' ? 'bg-green-500' :
                    activity.type === 'payment_failed' ? 'bg-red-500' :
                    activity.type === 'ticket_updated' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{activity.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.property && `${activity.property} • `}
                      {activity.tenant && `${activity.tenant} • `}
                      {activity.landlord && `${activity.landlord}`}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>{t('dashboard.noRecentActivity')}</p>
            </div>
          )}
        </div>
      </Card>

      {/* ... Map + AddPropertyModal restent inchangés ... */}
    </div>
  )
}
