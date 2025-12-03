import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, Users, CreditCard, AlertCircle, MapPin, Plus, Download } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { REVENUE_DATA } from '../constants';
import { useAppContext } from '../context/AppContext';
import styles from './Dashboard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  delay?: number;
  colorClass?: string;
}

const StatCard = ({ title, value, trend, icon: Icon, delay, colorClass }: StatCardProps) => (
  <Card delay={delay} className="p-6 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">{value}</h3>
      <div className="flex items-center text-xs font-medium">
        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded flex items-center">
          <ArrowUpRight size={14} className="mr-1" /> {trend}
        </span>
      </div>
    </div>
    {Icon && (
      <div className={`p-3 rounded-lg ${colorClass} shadow-sm`}>
        <Icon width={24} height={24} className="text-white" />
      </div>
    )}
  </Card>
);

export const Dashboard: React.FC = () => {
  const { t, showToast } = useAppContext();
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [newProperty, setNewProperty] = useState({ name: '', address: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = () => {
    showToast(t('common.success'), 'success');
  };

  const handleAddProperty = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAddPropertyModalOpen(false);
      showToast("Property added successfully", 'success');
      setNewProperty({ name: '', address: '' });
    }, 1000);
  };

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 animate-slide-in">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-violet-600 dark:from-blue-400 dark:to-violet-400 animate-gradient">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button variant="secondary" onClick={handleExport} icon={<Download size={16}/>}>
            {t('common.export')}
          </Button>
          <Button onClick={() => setIsAddPropertyModalOpen(true)} icon={<Plus size={16}/>}>
            {t('dashboard.newProperty')}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dashboard.totalProperties')} 
          value="124" 
          trend="+12.5%" 
          icon={MapPin} 
          delay={0} 
          colorClass="bg-blue-600"
        />
        <StatCard 
          title={t('dashboard.activeTenants')} 
          value="892" 
          trend="+5.2%" 
          icon={Users} 
          delay={100} 
          colorClass="bg-violet-600"
        />
        <StatCard 
          title={t('dashboard.monthlyRevenue')} 
          value="$48.2k" 
          trend="+18.2%" 
          icon={CreditCard} 
          delay={200} 
          colorClass="bg-emerald-500"
        />
        <StatCard 
          title={t('dashboard.pendingIssues')} 
          value="12" 
          trend="-2.4%" 
          icon={AlertCircle} 
          delay={300} 
          colorClass="bg-amber-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2 p-6 min-h-[400px]" delay={400}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t('dashboard.financialPerformance')}</h3>
            <select 
              title="Select time period"
              aria-label="Select time period"
              className="text-sm border-none bg-slate-50 dark:bg-slate-700 rounded-md px-3 py-1 text-slate-600 dark:text-slate-200 focus:ring-0 cursor-pointer"
            >
              <option>{t('dashboard.thisYear')}</option>
              <option>{t('dashboard.lastYear')}</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#fff',
                    color: '#1e293b'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 min-h-[400px]" delay={500}>
          <div className="mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t('dashboard.occupancyRate')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.liveStatus')}</p>
          </div>
          <div className="h-[320px] w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{ borderRadius: '8px', backgroundColor: '#fff', color: '#1e293b' }} 
                />
                <Bar dataKey="expenses" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Visual Map Placeholder Section */}
      <Card className="p-0 overflow-hidden relative h-[300px]" delay={600}>
        <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-white/50 dark:border-slate-600/50">
          <h3 className="font-bold text-slate-800 dark:text-white">{t('dashboard.propertyMap')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.liveLocation')}</p>
        </div>
        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 relative">
          {/* Abstract Map Pattern */}
          <div className={`absolute inset-0 opacity-20 ${styles.mapPattern}`}></div>
          
          {/* Animated Dots */}
          <div className="absolute top-1/3 left-1/4">
             <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping absolute"></div>
             <div className="w-4 h-4 bg-blue-500 rounded-full relative border-2 border-white dark:border-slate-800 shadow-lg"></div>
             <div className="absolute top-6 -left-10 bg-white dark:bg-slate-800 dark:text-white px-2 py-1 rounded text-xs shadow font-bold whitespace-nowrap">Paris District 1</div>
          </div>

           <div className="absolute bottom-1/3 right-1/4">
             <div className="w-4 h-4 bg-violet-500 rounded-full animate-ping absolute"></div>
             <div className="w-4 h-4 bg-violet-500 rounded-full relative border-2 border-white dark:border-slate-800 shadow-lg"></div>
             <div className="absolute top-6 -left-10 bg-white dark:bg-slate-800 dark:text-white px-2 py-1 rounded text-xs shadow font-bold whitespace-nowrap">Lyon Center</div>
          </div>
        </div>
      </Card>

      {/* Add Property Modal */}
      <Modal 
        isOpen={isAddPropertyModalOpen} 
        onClose={() => setIsAddPropertyModalOpen(false)}
        title={t('dashboard.addPropertyTitle')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddPropertyModalOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAddProperty} isLoading={isLoading}>{t('common.save')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label={t('dashboard.propertyName')} 
            placeholder="Ex: Residence Les Lilas" 
            value={newProperty.name}
            onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
          />
          <Input 
            label={t('dashboard.propertyAddress')} 
            placeholder="Ex: 123 rue de Paris" 
            value={newProperty.address}
            onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
          />
        </div>
      </Modal>
    </div>
  );
};