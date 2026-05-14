import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import socketService from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getFromLocalStorage } from '../utils/helpers';

const SocketContext = createContext();

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
};

// Socket Provider
export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const notificationsRef = useRef([]);
  const emergencyRef = useRef([]);
  const busUpdatesRef = useRef({});

  // Connection state management
  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketService.disconnect();
      return;
    }

    // Connect with user context
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  // Global socket event handlers
  useEffect(() => {
    // Connection events
    const handleConnect = () => {
      console.log('✅ Socket connected:', socketService.socket?.id);
      setConnected(true);
      setReconnecting(false);
      setConnectionQuality('excellent');
      
      // Re-join rooms on reconnect
      if (user) {
        socketService.joinUserRoom(user.id);
      }
    };

    const handleDisconnect = (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setConnected(false);
    };

    const handleReconnectAttempt = (attempt) => {
      console.log(`🔄 Reconnecting... (attempt ${attempt})`);
      setReconnecting(true);
      setConnectionQuality('poor');
    };

    const handleReconnectError = (error) => {
      console.error('Reconnection failed:', error);
      setConnectionQuality('failed');
    };

    const handleReconnectFailed = () => {
      console.error('Reconnection failed permanently');
      toast.error('Connection lost. Please refresh the page.');
    };

    // Register listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('reconnect_attempt', handleReconnectAttempt);
    socketService.on('reconnect_error', handleReconnectError);
    socketService.on('reconnect_failed', handleReconnectFailed);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('reconnect_attempt', handleReconnectAttempt);
      socketService.off('reconnect_error', handleReconnectError);
      socketService.off('reconnect_failed', handleReconnectFailed);
    };
  }, [user]);

  // Bus tracking events
  useEffect(() => {
    const handleBusLocation = (data) => {
      busUpdatesRef.current[data.busId] = {
        ...busUpdatesRef.current[data.busId],
        location: data.location,
        speed: data.speed,
        timestamp: Date.now(),
        updatedAt: new Date().toISOString()
      };
      
      // Trigger custom event for other components
      window.dispatchEvent(new CustomEvent('busLocationUpdate', { 
        detail: { busId: data.busId, ...data } 
      }));
    };

    const handleAllBuses = (buses) => {
      // Update multiple buses
      Object.keys(buses).forEach(busId => {
        busUpdatesRef.current[busId] = buses[busId];
      });
    };

    socketService.on('bus-location', handleBusLocation);
    socketService.on('all-buses', handleAllBuses);

    return () => {
      socketService.off('bus-location', handleBusLocation);
      socketService.off('all-buses', handleAllBuses);
    };
  }, []);

  // Notification events
  useEffect(() => {
    const handleNewNotification = (notification) => {
      notificationsRef.current = [
        notification,
        ...notificationsRef.current.slice(0, 49) // Keep last 50
      ];
      
      // Show toast
      toast.info(
        `${notification.icon || '📱'} ${notification.title}`,
        {
          onClick: () => markNotificationRead(notification._id)
        }
      );
      
      // Trigger custom event
      window.dispatchEvent(new CustomEvent('newNotification', { 
        detail: notification 
      }));
    };

    const handleNotificationRead = (notificationId) => {
      notificationsRef.current = notificationsRef.current.map(notif =>
        notif._id === notificationId
          ? { ...notif, status: 'read' }
          : notif
      );
    };

    socketService.on('new-notification', handleNewNotification);
    socketService.on('notification-read', handleNotificationRead);

    return () => {
      socketService.off('new-notification', handleNewNotification);
      socketService.off('notification-read', handleNotificationRead);
    };
  }, []);

  // Emergency alerts
  useEffect(() => {
    const handleEmergencyAlert = (alert) => {
      emergencyRef.current = [
        alert,
        ...emergencyRef.current.slice(0, 9)
      ];
      
      // Critical notification
      if (Notification.permission === 'granted') {
        new Notification('🚨 Emergency Alert', {
          body: alert.message,
          icon: '/icons/emergency.png',
          badge: '/icons/badge.png',
          vibrate: [200, 100, 200, 100, 200]
        });
      }
      
      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      
      toast.error(`🚨 EMERGENCY: ${alert.message}`, {
        autoClose: false,
        position: 'top-center'
      });
      
      window.dispatchEvent(new CustomEvent('emergencyAlert', { detail: alert }));
    };

    socketService.on('emergency-alert', handleEmergencyAlert);

    return () => {
      socketService.off('emergency-alert', handleEmergencyAlert);
    };
  }, []);

  // Room management
  const joinRoom = useCallback((roomId) => {
    socketService.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId) => {
    socketService.leaveRoom(roomId);
  }, []);

  // Bus specific
  const joinBus = useCallback((busId) => {
    socketService.joinBus(busId);
  }, []);

  const leaveBus = useCallback((busId) => {
    socketService.leaveRoom(`bus_${busId}`);
  }, []);

  // Send GPS (Driver)
  const sendGPSUpdate = useCallback((data) => {
    return socketService.sendGPSUpdate(data);
  }, []);

  // Notifications
  const markNotificationRead = useCallback((notificationId) => {
    socketService.markNotificationRead(notificationId);
  }, []);

  const markAllRead = useCallback(() => {
    socketService.emit('mark-all-read');
  }, []);

  const clearNotifications = useCallback(() => {
    notificationsRef.current = [];
  }, []);

  // Emergency
  const sendEmergency = useCallback((data) => {
    return socketService.sendEmergency(data);
  }, []);

  const value = {
    // Connection
    connected,
    reconnecting,
    connectionQuality,
    
    // Data refs (stable)
    notifications: notificationsRef.current,
    unreadCount: notificationsRef.current.filter(n => n.status === 'unread').length,
    emergencyAlerts: emergencyRef.current,
    busUpdates: busUpdatesRef.current,
    
    // Actions
    joinRoom,
    leaveRoom,
    joinBus,
    leaveBus,
    sendGPSUpdate,
    sendEmergency,
    markNotificationRead,
    markAllRead,
    clearNotifications,
    
    // Socket instance
    socket: socketService
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};