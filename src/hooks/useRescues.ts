import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RescueRequest } from '../types';

export const useRescues = () => {
  const queryClient = useQueryClient();

  const { data: rescues = [], isLoading } = useQuery({
    queryKey: ['rescues'],
    queryFn: async () => {
      const res = await fetch('/api/rescues');
      if (!res.ok) throw new Error('Failed to fetch rescues');
      const data: RescueRequest[] = await res.json();
      return data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    refetchInterval: 5000
  });

  const createRescueMutation = useMutation({
    mutationFn: async (
      newRescue: Omit<RescueRequest, 'id' | 'status' | 'priority_score' | 'created_at'>
    ) => {
      const res = await fetch('/api/rescues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRescue)
      });
      if (!res.ok) throw new Error('Failed to create rescue request');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const updateRescueMutation = useMutation({
    mutationFn: async (updates: Partial<RescueRequest> & { id: string }) => {
      const res = await fetch(`/api/rescues/${updates.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update rescue');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
    }
  });

  return {
    rescues,
    isLoading,
    createRescue: createRescueMutation.mutateAsync,
    updateRescue: updateRescueMutation.mutateAsync
  };
};

export const useRescueTracking = (id: string) => {
  return useQuery({
    queryKey: ['rescue', id],
    queryFn: async () => {
      const res = await fetch(`/api/rescues/${id}`);
      if (!res.ok) throw new Error('Rescue not found');
      return await res.json();
    },
    refetchInterval: 5000 // Poll every 5s
  });
};