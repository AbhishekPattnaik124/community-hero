import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '@store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

let socket = null;

export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const handlersRef = useRef({});

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    if (!socket || !socket.connected) {
      socket = io('/', {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
      socket.on('connect_error', (err) => console.error('Socket error:', err.message));
      socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));

      // Real-time issue events
      socket.on('issue:created', () => queryClient.invalidateQueries({ queryKey: ['issues'] }));
      socket.on('issue:updated', () => queryClient.invalidateQueries({ queryKey: ['issues'] }));
      socket.on('issue:status-changed', (issue) => {
        queryClient.invalidateQueries({ queryKey: ['issue', issue._id] });
        queryClient.invalidateQueries({ queryKey: ['issues'] });
      });
      socket.on('comment:added', () => queryClient.invalidateQueries({ queryKey: ['comments'] }));

      // Notifications
      socket.on('notification', (notif) => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        toast(notif.title, {
          icon: '🔔',
          duration: 5000,
          style: {
            background: 'rgba(19,19,31,0.95)',
            color: '#e2e8f0',
            border: '1px solid rgba(99,102,241,0.3)',
          },
        });
      });
    }

    return () => {
      // Don't disconnect on unmount – keep singleton alive
    };
  }, [isAuthenticated, accessToken]);

  const joinCity = useCallback((city) => socket?.emit('join:city', city), []);
  const joinIssue = useCallback((issueId) => socket?.emit('join:issue', issueId), []);
  const leaveIssue = useCallback((issueId) => socket?.emit('leave:issue', issueId), []);
  const startTyping = useCallback((issueId) => socket?.emit('typing:start', { issueId }), []);
  const stopTyping = useCallback((issueId) => socket?.emit('typing:stop', { issueId }), []);

  return { socket, joinCity, joinIssue, leaveIssue, startTyping, stopTyping };
}
