import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationServiceClient } from '../services/api/notificationService';
import { useState } from 'react';

export const useNotifications = (params?: {
  page?: number;
  limit?: number;
  status?: 'unread' | 'read' | 'all';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const result = await notificationServiceClient.getNotifications(params);
      setLastUpdate(new Date());
      return result;
    },
    staleTime: 30 * 1000, // Data is considered fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 1,
  });

  return {
    data: data || { notifications: [], total: 0, page: 1, limit: 50 },
    isLoading,
    error: error ? error.message : null,
    lastUpdate,
    refresh: refetch,
  };
};

export const useUnreadCount = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      return await notificationServiceClient.getUnreadCount();
    },
    staleTime: 30 * 1000, // Data is considered fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 1,
  });

  return {
    count: data || 0,
    isLoading,
    error: error ? error.message : null,
    refresh: refetch,
  };
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationServiceClient.markAsRead(notificationId);
    },
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await notificationServiceClient.markAllAsRead();
    },
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationServiceClient.deleteNotification(notificationId);
    },
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });
};
