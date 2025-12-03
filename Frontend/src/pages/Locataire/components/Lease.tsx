import React from 'react';
import { FileSignature, Calendar, DollarSign, UserCheck, Clock, Shield, Download } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface LeaseProps {
    notify: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const Lease: React.FC<LeaseProps> = ({ notify }) => {
  
  const handleDownload = () => {
    notify('Votre bail a été téléchargé avec succès', 'success');
  };

  return (
    <div className="space-y-8 animate-slide-up">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon Bail</h1>
            <p className="text-slate-500 text-sm">Contrat N° BL-2024-042 • Signé électroniquement</p>
         </div>
         <Button icon={<Download size={18} />} onClick={handleDownload}>Télécharger le PDF</Button>
      </div>

      {/* Timeline Visuelle */}
      <Card className="relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
         <div className="p-2">
             <h3 className="text-lg font-bold mb-6 pl-2">Chronologie du contrat</h3>
             <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-8 md:gap-0">
                 {/* Line connector */}
                 <div className="hidden md:block absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10 transform translate-y-2"></div>
                 
                 {/* Steps */}
                 <div className="flex md:flex-col items-center gap-4 md:gap-2 bg-white md:bg-transparent pr-4 md:pr-0 z-10">
                     <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-4 border-white shadow-sm">
                         <FileSignature size={18} />
                     </div>
                     <div className="text-left md:text-center">
                         <p className="font-bold text-sm text-slate-900">Signature</p>
                         <p className="text-xs text-slate-500">15 Sept 2024</p>
                     </div>
                 </div>

                 <div className="flex md:flex-col items-center gap-4 md:gap-2 bg-white md:bg-transparent pr-4 md:pr-0 z-10">
                     <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-4 border-white shadow-lg ring-4 ring-blue-50">
                         <UserCheck size={18} />
                     </div>
                     <div className="text-left md:text-center">
                         <p className="font-bold text-sm text-blue-600">Entrée</p>
                         <p className="text-xs text-slate-500">01 Oct 2024</p>
                     </div>
                 </div>

                 <div className="flex md:flex-col items-center gap-4 md:gap-2 bg-white md:bg-transparent pr-4 md:pr-0 z-10">
                     <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white">
                         <Clock size={18} />
                     </div>
                     <div className="text-left md:text-center">
                         <p className="font-bold text-sm text-slate-400">Renouvellement</p>
                         <p className="text-xs text-slate-500">01 Oct 2027</p>
                     </div>
                 </div>
             </div>
         </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Conditions Financières">
             <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={18}/></div>
                        <span className="text-slate-600 font-medium">Loyer Mensuel HC</span>
                    </div>
                    <span className="font-bold text-slate-900">800,00 €</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Calendar size={18}/></div>
                        <span className="text-slate-600 font-medium">Charges (Provision)</span>
                    </div>
                    <span className="font-bold text-slate-900">50,00 €</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-slate-50 px-3 rounded-lg">
                    <span className="text-slate-800 font-bold">Total Mensuel</span>
                    <span className="font-bold text-primary text-lg">850,00 €</span>
                </div>
                <div className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Shield size={18}/></div>
                        <span className="text-slate-600 font-medium">Dépôt de garantie</span>
                    </div>
                    <Badge variant="success">Payé (800€)</Badge>
                </div>
             </div>
          </Card>

          <Card title="Informations Complémentaires">
             <ul className="space-y-4">
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></span>
                    <div>
                        <p className="font-medium text-slate-800 text-sm">Durée du bail</p>
                        <p className="text-slate-500 text-xs">3 ans (Location nue)</p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></span>
                    <div>
                        <p className="font-medium text-slate-800 text-sm">Date de paiement</p>
                        <p className="text-slate-500 text-xs">Exigible le 1er de chaque mois</p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></span>
                    <div>
                        <p className="font-medium text-slate-800 text-sm">Révision du loyer</p>
                        <p className="text-slate-500 text-xs">Annuelle, indice IRL (Indice de Référence des Loyers)</p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></span>
                    <div>
                        <p className="font-medium text-slate-800 text-sm">Colocation</p>
                        <p className="text-slate-500 text-xs">Non autorisée sans accord écrit</p>
                    </div>
                </li>
             </ul>
          </Card>
      </div>
    </div>
  );
};
