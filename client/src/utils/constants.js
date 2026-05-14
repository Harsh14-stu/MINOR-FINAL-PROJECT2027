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

// CDGI Indore Route Data
export const SHARED_ROUTE_COORDINATES = [
  [22.6888, 75.8679], // Bhawarkuan
  [22.6800, 75.8640], // Rajiv Gandhi Chauraha
  [22.6650, 75.8450], // Path
  [22.6450, 75.8250], // Path
  [22.6393, 75.8197], // Rau Circle
  [22.6300, 75.8100], // Path
  [22.6268, 75.8063]  // CDGI Campus
];

export const SHARED_BUS_STOPS = [
  { id: 1, name: 'Bhawarkuan', lat: 22.6888, lng: 75.8679, status: 'passed', eta: 'Passed' },
  { id: 2, name: 'Rajiv Gandhi', lat: 22.6800, lng: 75.8640, status: 'passed', eta: 'Passed' },
  { id: 3, name: 'Rau Circle', lat: 22.6393, lng: 75.8197, status: 'upcoming', eta: '5 Mins' },
  { id: 4, name: 'CDGI Campus', lat: 22.6268, lng: 75.8063, status: 'destination', eta: '12 Mins' }
];

// Bus Colors
export const BUS_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'
];

// Default Map Settings
export const MAP_CONFIG = {
  defaultZoom: 13,
  defaultCenter: { lat: 22.6500, lng: 75.8400 },
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