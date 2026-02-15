import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, Search, ArrowLeft, CheckSquare, Calendar } from 'lucide-react';
import { Card } from './ui/Card';

interface TasksProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  property?: string;
}

export const Tasks: React.FC<TasksProps> = ({ notify }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Renouveler l\'assurance habitation',
      description: 'Contacter l\'assureur avant expiration',
      dueDate: '2024-12-31',
      completed: false,
      priority: 'high',
      assignedTo: 'Moi',
      property: 'Appartement Paris 12',
    },
    {
      id: '2',
      title: 'Vérifier les filtres de la climatisation',
      description: 'Nettoyage mensuel requis',
      dueDate: '2024-12-15',
      completed: false,
      priority: 'medium',
      assignedTo: 'Moi',
      property: 'Studio Lyon 3',
    },
  ]);

  // View state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState('10');
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  // Form state
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    property: '',
  });

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    notify?.('Statut de la tâche mis à jour', 'success');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    notify?.('Tâche supprimée', 'success');
  };

  const handleCreateTask = () => {
    if (!newTask.title) {
      notify?.('Veuillez saisir un titre', 'error');
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title || '',
      description: newTask.description,
      dueDate: newTask.dueDate,
      completed: false,
      priority: newTask.priority || 'medium',
      property: newTask.property,
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', dueDate: '', priority: 'medium', property: '' });
    setShowCreateForm(false);
    notify?.('Tâche créée avec succès', 'success');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return priority;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'active') return !task.completed;
    if (filterStatus === 'completed') return task.completed;
    return true;
  }).filter(task => 
    searchQuery === '' || 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.property?.toLowerCase().includes(searchQuery.toLowerCase())
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
        Nouvelle tâche
      </button>
    </div>
  );

  // List view component
  const ListView = () => (
    <div className="space-y-4">
      {/* Top section with tabs and button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('active')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              filterStatus === 'active' 
                ? 'text-green-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className={filterStatus === 'active' ? 'text-green-600' : ''}>Actifs</span>
            <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
              {tasks.filter(t => !t.completed).length}
            </span>
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              filterStatus === 'completed' 
                ? 'text-green-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className={filterStatus === 'completed' ? 'text-green-600' : ''}>Terminés</span>
            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {tasks.filter(t => t.completed).length}
            </span>
          </button>
        </div>

        {/* New task button */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
          style={{ background: 'rgba(82, 157, 33, 0.82)' }}
        >
          <Plus size={18} />
          Une nouvelle tâche
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Assigné à</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Mis à jour</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">Échéance</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-700">État</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8">
                    <EmptyStateIllustration />
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {task.completed && <CheckSquare size={14} />}
                        </button>
                        <span className={task.completed ? 'line-through text-gray-400' : ''}>
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{task.property || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{task.assignedTo || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => deleteTask(task.id)}
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
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle tâche</h1>
        <p className="text-sm text-gray-600">Créez une nouvelle tâche à accomplir.</p>
      </div>

      {/* CREATE FORM */}
      <Card className="p-6">
        <div className="space-y-6 max-w-2xl">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              placeholder="Ex: Renouveler l'assurance habitation"
            />
          </div>

          {/* Property */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bien</label>
            <select
              value={newTask.property}
              onChange={(e) => setNewTask({ ...newTask, property: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="">Sélectionner un bien</option>
              <option value="Appartement Paris 12">Appartement Paris 12</option>
              <option value="Studio Lyon 3">Studio Lyon 3</option>
              <option value="Maison Bordeaux">Maison Bordeaux</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 min-h-[100px]"
              placeholder="Description de la tâche..."
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Priorité</label>
            <div className="flex gap-3">
              {['low', 'medium', 'high'].map((p) => (
                <button
                  key={p}
                  onClick={() => setNewTask({ ...newTask, priority: p as Task['priority'] })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newTask.priority === p
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={newTask.priority === p ? { background: 'rgba(82, 157, 33, 0.82)' } : {}}
                >
                  {getPriorityLabel(p)}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
              style={{ background: 'rgba(82, 157, 33, 0.82)' }}
            >
              Créer la tâche
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  return showCreateForm ? <CreateFormView /> : <ListView />;
};

export default Tasks;
