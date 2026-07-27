import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { Notification } from '../types';

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.user_id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/notifications?userId=${user.user_id}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return await res.json();
    },
    enabled: !!user,
    refetchInterval: 15000 // Poll every 15s
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('Failed to mark notification as read');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', user?.user_id]
      });
    }
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: markReadMutation.mutate
  };
};