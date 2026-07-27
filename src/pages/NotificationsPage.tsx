import React from 'react';
import {
  Bell,
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle } from
'lucide-react';
import { Card, CardContent } from '../components/ui';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
export function NotificationsPage() {
  const { notifications, markRead } = useNotifications();
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated on your rescue activities.
        </p>
      </div>

      {notifications.length === 0 ?
      <Card className="bg-slate-50 border-dashed">
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              You don't have any notifications right now.
            </p>
          </CardContent>
        </Card> :

      <div className="space-y-3">
          {notifications.map((notif) =>
        <Card
          key={notif.id}
          className={`transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5 border-primary/20' : 'bg-white'}`}
          onClick={() => !notif.read && markRead(notif.id)}>
          
              <CardContent className="p-4 flex gap-4">
                <div className="mt-1 shrink-0">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4
                  className={`font-semibold ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                  
                      {notif.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(notif.created_at), {
                    addSuffix: true
                  })}
                    </span>
                  </div>
                  <p
                className={`text-sm mt-1 ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                
                    {notif.message}
                  </p>
                </div>
                {!notif.read &&
            <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
            }
              </CardContent>
            </Card>
        )}
        </div>
      }
    </div>);

}