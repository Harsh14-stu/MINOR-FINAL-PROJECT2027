// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile'
  },
  BUSES: {
    ALL: '/api/buses',
    SINGLE: (id) => `/api/buses/${id}`,
    LOCATION: '/api/buses/location',
    ARRIVAL: '/api/buses/arrival'
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: '/api/admin/users',
    REPORTS: '/api/admin/reports'
  },
  DRIVER: {
    DASHBOARD: '/api/driver/dashboard',
    GPS: '/api/driver/gps-update',
    EMERGENCY: '/api/driver/emergency'
  },
  NOTIFICATIONS: {
    UNREAD: '/api/notifications/unread',
    MARK_READ: (id) => `/api/notifications/${id}/read`
  }
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DRIVER: 'driver',
  STUDENT: 'student',
  PARENT: 'parent'
};

// Bus Status
export const BUS_STATUS = {
  IDLE: 'idle',
  MOVING: 'moving',
  STOPPED: 'stopped',
  DELAYED: 'delayed'
};

// Notification Types & Priorities
export const NOTIFICATION_TYPES = {
  ARRIVAL: 'arrival',
  DELAY: 'delay',
  EMERGENCY: 'emergency',
  BOARDING: 'boarding',
  ALIGHTING: 'alighting'
};

export const PRIORITY_COLORS = {
  low: '#3B82F6',      // blue
  medium: '#F59E0B',   // amber
  high: '#F97316',     // orange
  critical: '#EF4444'  // red
};

// Notification Icons
export const NOTIFICATION_ICONS = {
  arrival: '🚌',
  delay: '⏰',
  emergency: '🚨',
  boarding: '✅',
  alighting: '👋',
  route_change: '🛣️'
};

// Route Stops (Demo Data)
export const DEMO_ROUTE_STOPS = [
  {
    id: 1,
    name: 'Pickup Point A',
    lat: 28.6139,
    lng: 77.2090,
    order: 1
  },
  {
    id: 2,
    name: 'Pickup Point B',
    lat: 28.6180,
    lng: 77.2120,
    order: 2
  },
  {
    id: 3,
    name: 'School Gate',
    lat: 28.6200,
    lng: 77.2150,
    order: 3
  }
];

// Bus Colors
export const BUS_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'
];

// Default Map Settings
export const MAP_CONFIG = {
  defaultZoom: 14,
  defaultCenter: { lat: 28.6139, lng: 77.2090 },
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Demo Users
export const DEMO_USERS = {
  admin: { email: 'admin@test.com', password: 'admin123' },
  driver: { email: 'driver@test.com', password: 'driver123' },
  student: { email: 'student@test.com', password: 'student123' },
  parent: { email: 'parent@test.com', password: 'parent123' }
};

// App Configuration
export const APP_CONFIG = {
  name: 'SmartBus',
  version: '1.0.0',
  company: 'College Project 2024'
};