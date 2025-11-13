'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCheck, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  message: string;
  type: string;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
  item_id: number | null;
  item_name: string | null;
  metadata: any;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = filter === 'unread' ? '/api/notifications?unread=true' : '/api/notifications';
      const response = await fetch(url);
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        toast.success('Notificação marcada como lida');
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Erro ao marcar como lida');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        );
        toast.success('Todas as notificações foram marcadas como lidas');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Erro ao marcar todas como lidas');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'printer_missing':
        return <Printer className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'printer_missing':
        return <Badge className="bg-red-100 text-red-700">Impressora</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700">Aviso</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Notificações
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie avisos e alertas do sistema
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter buttons */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              Não Lidas
            </Button>
          </div>

          {/* Mark all as read */}
          {notifications.some(n => !n.is_read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nenhuma notificação
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filter === 'unread' 
              ? 'Você não tem notificações não lidas' 
              : 'Não há notificações no momento'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`p-4 transition-all ${
                !notification.is_read 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
                  : 'bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getNotificationBadge(notification.type)}
                        {!notification.is_read && (
                          <Badge className="bg-orange-600 text-white text-xs">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-900 dark:text-gray-100">
                        {notification.message}
                      </p>
                      {notification.metadata && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {notification.metadata.table && (
                            <div>Mesa: {notification.metadata.table}</div>
                          )}
                          {notification.metadata.quantity && (
                            <div>Quantidade: {notification.metadata.quantity}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(notification.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>

                  {/* Actions */}
                  {!notification.is_read && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="gap-2"
                      >
                        <Check className="h-3 w-3" />
                        Marcar como lida
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}