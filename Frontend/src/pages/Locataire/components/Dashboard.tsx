import React, { useState, useEffect } from 'react';
import { FileText, ArrowUpRight, CheckCircle, Calendar, Wrench, Clock, Activity } from 'lucide-react';
import { Button } from './ui/Button';
import { Skeleton } from './ui/Skeleton';
import { Tab } from '../types';
import { PaymentModal } from './PaymentModal';

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
  notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, notify }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickPay = () => {
    setIsPaymentModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-2">
             <Skeleton className="h-10 w-64 rounded-xl" />
             <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
          <div className="flex gap-3">
             <Skeleton className="h-12 w-32 rounded-xl" />
             <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
        </div>

        {/* Widgets Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <Skeleton key={i} className="h-56 w-full rounded-3xl" />
           ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-80 w-full rounded-3xl" />
              <Skeleton className="h-40 w-full rounded-3xl" />
           </div>
           <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        amount={850.00} 
        notify={notify}
      />

      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black animate-slide-in-right">Bonjour, Jean 👋</h1>
              <p className="text-gray-700 mt-2 font-medium">Tout est en ordre pour la <span className="text-blue-600 font-bold">Résidence Les Hortensias</span>.</p>
          </div>
          <div className="flex gap-3">
              <Button variant="secondary" icon={<FileText size={18}/>} onClick={() => onNavigate('documents')}>Quittances</Button>
              <Button variant="primary" icon={<ArrowUpRight size={18}/>} onClick={handleQuickPay}>Payer maintenant</Button>
          </div>
        </div>

        {/* Main Status Grid - "Modern SaaS Style" */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Rent Status Card - Hero */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-blue-200 relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                            <CheckCircle size={28} />
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">À jour</span>
                    </div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Loyer de Novembre</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-black tracking-tight">850<span className="text-2xl">.00</span></span>
                        <span className="text-xl text-gray-500">€</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-600 mt-4 flex items-center gap-1">
                    <CheckCircle size={12} /> Payé par virement le 28/11
                  </p>
              </div>
          </div>

          {/* Next Due Card */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-blue-200 relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                            <Calendar size={28} />
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">À venir</span>
                    </div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Prochaine Échéance</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-black tracking-tight">01 Déc</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-600 mt-4 flex items-center gap-1">
                    <Activity size={12} /> Prélèvement auto activé
                  </p>
              </div>
          </div>

          {/* Incident/Action Card */}
          <div 
              className="bg-blue-700 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform border border-blue-600"
              onClick={() => onNavigate('interventions')}
          >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/30 blur-3xl rounded-full"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                      <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                          <Wrench size={28} className="text-orange-400" />
                      </div>
                      <span className="bg-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-400/30">1 En cours</span>
                  </div>
                  <div className="mt-6">
                      <h3 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Maintenance</h3>
                      <p className="text-xl font-bold leading-tight">Fuite robinet cuisine</p>
                      <div className="flex items-center gap-2 mt-3 text-xs font-medium text-white/60 bg-black/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
                          <Clock size={12} />
                          <span>En attente artisan</span>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity / Messages */}
          <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between px-1">
                  <h3 className="font-bold text-xl text-black">Derniers Messages</h3>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate('messages')}>Tout voir</Button>
               </div>
               
               <div className="bg-white rounded-3xl border border-blue-200 shadow-md overflow-hidden">
                  {[1, 2].map((_, idx) => (
                      <div key={idx} className="p-5 border-b border-blue-100 last:border-0 hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-5 group">
                          <div className="relative">
                              <img src={`https://i.pravatar.cc/150?img=${idx + 5}`} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300" />
                              {idx === 0 && <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-bold text-black text-sm">{idx === 0 ? 'M. Dupont (Propriétaire)' : 'Agence Immobilière'}</h4>
                                  <span className="text-xs font-medium text-gray-500">{idx === 0 ? '10:30' : 'Hier'}</span>
                              </div>
                              <p className="text-sm text-gray-700 truncate group-hover:text-blue-600 transition-colors">
                                  {idx === 0 ? 'Bonjour, avez-vous pu vérifier le radiateur du salon ?' : 'Votre quittance de loyer pour le mois d\'Octobre est disponible.'}
                              </p>
                          </div>
                          <div className="text-gray-400">
                             <ArrowUpRight size={18} />
                          </div>
                      </div>
                  ))}
               </div>

               {/* Documents Quick Access Banner */}
               <div className="bg-gradient-to-r from-blue-50 to-white rounded-3xl p-6 border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl"></div>
                  
                  <div className="flex items-center gap-5 relative z-10">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-600/10 border border-blue-200">
                          <FileText size={28} />
                      </div>
                      <div>
                          <h4 className="font-bold text-lg text-black">Espace Documents</h4>
                          <p className="text-sm text-gray-700">Retrouvez vos baux, états des lieux et quittances.</p>
                      </div>
                  </div>
                  <Button variant="primary" className="relative z-10" onClick={() => onNavigate('documents')}>Accéder</Button>
               </div>
          </div>

          {/* Property Info Side Widget */}
          <div className="bg-white rounded-3xl border border-blue-200 shadow-md p-6 flex flex-col h-full">
              <h3 className="font-bold text-xl text-black mb-5">Mon Logement</h3>
              
              <div className="mb-6 relative h-48 rounded-2xl overflow-hidden group cursor-pointer" onClick={() => onNavigate('property')}>
                  <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=500" alt="Property" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-lg">Résidence Les Hortensias</p>
                      <p className="text-white/80 text-xs font-medium mt-0.5">Apt 42 • Paris 2e</p>
                  </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                  <div className="flex justify-between items-center text-sm p-3 bg-blue-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Surface</span>
                      <span className="font-bold text-black">45 m²</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-3 bg-blue-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Type</span>
                      <span className="font-bold text-black">2 Pièces (T2)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-3 bg-blue-50 rounded-xl">
                      <span className="text-gray-600 font-medium">DPE</span>
                      <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-lg">C</span>
                  </div>
              </div>

              <Button variant="secondary" className="w-full" onClick={() => onNavigate('property')}>Détails complets</Button>
          </div>
        </div>
      </div>
    </>
  );
};