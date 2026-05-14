import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const [busLocation, setBusLocation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const { user } = useAuth();

  // Connect/disconnect
  useEffect(() => {
    if (user) {
      socketService.connect();
      socketService.joinUserRoom(user.id);
      
      return () => {
        socketService.disconnect();
      };
    }
  }, [user]);

  // Connection status
  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    
    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);

  // Bus location listener
  useEffect(() => {
    const handleBusLocation = (data) => {
      setBusLocation(data);
    };

    window.addEventListener('busLocationUpdate', handleBusLocation);
    socketService.on('bus-location', handleBusLocation);

    return () => {
      window.removeEventListener('busLocationUpdate', handleBusLocation);
      socketService.off('bus-location', handleBusLocation);
    };
  }, []);

  // Notifications listener
  useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
      toast.info(`${notification.icon} ${notification.title}`);
    };

    window.addEventListener('newNotification', handleNewNotification);
    socketService.on('new-notification', handleNewNotification);

    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
      socketService.off('new-notification', handleNewNotification);
    };
  }, []);

  // Emergency alerts
  useEffect(() => {
    const handleEmergency = (alert) => {
      setEmergencyAlerts(prev => [alert, ...prev.slice(0, 9)]);
      // Critical alert sound/vibration
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      toast.error(`🚨 EMERGENCY: ${alert.message}`);
    };

    socketService.on('emergency-alert', handleEmergency);

    return () => {
      socketService.off('emergency-alert', handleEmergency);
    };
  }, []);

  // Join specific bus
  const joinBus = useCallback((busId) => {
    socketService.joinBus(busId);
  }, []);

  // Send GPS update (for drivers)
  const sendGPSUpdate = useCallback((data) => {
    return socketService.sendGPSUpdate(data);
  }, []);

  // Mark notification read
  const markNotificationRead = useCallback((notificationId) => {
    socketService.markNotificationRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, status: 'read' } : n)
    );
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    socket: socketService,
    connected,
    busLocation,
    notifications,
    emergencyAlerts,
    unreadCount: notifications.filter(n => n.status === 'unread').length,
    joinBus,
    sendGPSUpdate,
    markNotificationRead,
    clearNotifications
  };
};