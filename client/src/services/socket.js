import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { getFromLocalStorage } from '../utils/helpers';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Initialize connection
  connect() {
    const token = getFromLocalStorage('token');
    const user = getFromLocalStorage('user');
    
    if (!token || !user) {
      console.warn('No auth token, skipping socket connection');
      return;
    }

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      
      // Join user room
      this.joinRoom(`user_${user.id}`);
      
      // Emit ready event
      this.emit('ready', { userId: user.id, role: user.role });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection lost. Retrying...');
    });

    // Global event listeners
    this.setupGlobalListeners();
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join room
  joinRoom(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', roomId);
      console.log(`Joined room: ${roomId}`);
    }
  }

  // Leave room
  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId);
    }
  }

  // Emit event
  emit(event, data = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
      return true;
    }
    return false;
  }

  // Listen to event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
      return () => this.off(event);
    }
  }

  // Remove listener
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      const callback = this.listeners.get(event);
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }

  // Setup global listeners
  setupGlobalListeners() {
    // Real-time bus location updates
    this.on('bus-location', (data) => {
      console.log('📍 Bus location update:', data);
      // Dispatch to Redux or context
      window.dispatchEvent(new CustomEvent('busLocationUpdate', { detail: data }));
    });

    // New notifications
    this.on('new-notification', (notification) => {
      toast.info(`${notification.icon} ${notification.title}`);
      window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
    });

    // Emergency alerts
    this.on('emergency-alert', (alert) => {
      toast.error(`🚨 ${alert.message}`);
      // Play sound or vibrate
      if (Notification.permission === 'granted') {
        new Notification('Emergency Alert', { 
          body: alert.message,
          icon: '/emergency.png'
        });
      }
    });

    // Connection status
    this.on('connection-status', (status) => {
      console.log('Connection:', status);
    });
  }

  // Bus-specific methods
  joinBus(busId) {
    this.joinRoom(`bus_${busId}`);
  }

  // User-specific room
  joinUserRoom(userId) {
    this.joinRoom(`user_${userId}`);
  }

  // GPS Update (Driver)
  sendGPSUpdate(data) {
    return this.emit('gps-update', data);
  }

  // Send emergency
  sendEmergency(data) {
    return this.emit('emergency', data);
  }

  // Mark notification read
  markNotificationRead(notificationId) {
    return this.emit('mark-read', notificationId);
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;