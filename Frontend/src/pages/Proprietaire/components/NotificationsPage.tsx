import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { landlordNotificationsService, LandlordNotification } from '../../../services/api';

interface NotificationsPageProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate?: (tab: string) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ 
  notify = () => {}, 
  onNavigate 
}) => {
  const [notifications, setNotifications] = useState<LandlordNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await landlordNotificationsService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      notify('Erreur lors du chargement des notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await landlordNotificationsService.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      notify('Notification marquée comme lue', 'success');
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await landlordNotificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      notify('Toutes les notifications ont été marquées comme lues', 'success');
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50/50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50';
      case 'error':
        return 'border-l-red-500 bg-red-50/50';
      default:
        return 'border-l-blue-500 bg-blue-50/50';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 
                  ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Aucune notification non lue'
                }
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500 mr-2">Filtrer :</span>
          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  filter === f
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f === 'all' ? 'Toutes' : f === 'unread' ? 'Non lues' : 'Lues'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' 
                ? 'Aucune notification' 
                : filter === 'unread' 
                  ? 'Aucune notification non lue' 
                  : 'Aucune notification lue'
              }
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Vous n\'avez pas encore de notifications.' 
                : 'Vous avez tout lu !'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 p-4 hover:shadow-md transition-shadow cursor-pointer ${
                getNotificationColor(notification.type)
              } ${!notification.is_read ? 'ring-1 ring-green-200' : ''}`}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold ${
                      !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  
                  {notification.subtext && (
                    <p className="text-xs text-gray-500 mt-2">
                      {notification.subtext}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    {!notification.is_read && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Non lue
                      </span>
                    )}
                    
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 ml-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Voir plus
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                
                {!notification.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Marquer comme lu"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
