import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../utils/constants';
import { handleApiError } from '../utils/helpers';

// Base API configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      toast.error('Session expired. Please login again.');
    }
    
    // Handle other errors
    handleApiError(error);
    return Promise.reject(error);
  }
);

// ==============================
// AUTH SERVICE
// ==============================
export const authService = {
  // Login user
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  
  // Get current user profile
  getProfile: () => api.get(API_ENDPOINTS.AUTH.PROFILE),
  
  // Update profile
  updateProfile: (data) => api.put(API_ENDPOINTS.AUTH.PROFILE, data),
  
  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }
};

// ==============================
// BUS SERVICE
// ==============================
export const busService = {
  // Get all buses
  getAllBuses: () => api.get(API_ENDPOINTS.BUSES.ALL),
  
  // Get single bus
  getBus: (id) => api.get(API_ENDPOINTS.BUSES.SINGLE(id)),
  
  // Update bus location (Driver)
  updateLocation: (data) => api.post(API_ENDPOINTS.BUSES.LOCATION, data),
  
  // Mark arrival at stop
  markArrival: (data) => api.post('/api/driver/arrival', data),
  
  // Get live buses
  getLiveBuses: () => api.get('/api/buses/live')
};

// ==============================
// ADMIN SERVICE
// ==============================
export const adminService = {
  // Dashboard analytics
  getDashboard: () => api.get(API_ENDPOINTS.ADMIN.DASHBOARD),
  
  // Manage users
  getUsers: (params) => api.get(API_ENDPOINTS.ADMIN.USERS, { params }),
  createUser: (userData) => api.post(API_ENDPOINTS.ADMIN.USERS, userData),
  updateUser: (id, userData) => api.put(`${API_ENDPOINTS.ADMIN.USERS}/${id}`, userData),
  deleteUser: (id) => api.delete(`${API_ENDPOINTS.ADMIN.USERS}/${id}`),
  
  // Manage buses
  createBus: (busData) => api.post(API_ENDPOINTS.BUSES.ALL, busData),
  updateBus: (id, busData) => api.put(API_ENDPOINTS.BUSES.SINGLE(id), busData),
  deleteBus: (id) => api.delete(API_ENDPOINTS.BUSES.SINGLE(id)),
  
  // Reports
  getReports: () => api.get(API_ENDPOINTS.ADMIN.REPORTS)
};

// ==============================
// DRIVER SERVICE
// ==============================
export const driverService = {
  // Dashboard
  getDashboard: () => api.get('/api/driver/dashboard'),
  
  // GPS Updates
  updateGPS: (locationData) => api.post('/api/driver/gps-update', locationData),
  
  // Passenger management
  updatePassengers: (data) => api.post('/api/driver/passengers', data),
  
  // Emergency
  sendEmergency: (data) => api.post('/api/driver/emergency', data)
};

// ==============================
// NOTIFICATION SERVICE
// ==============================
export const notificationService = {
  // Get notifications
  getNotifications: (params) => api.get('/api/notifications', { params }),
  
  // Get unread count
  getUnreadCount: () => api.get('/api/notifications/unread/count'),
  
  // Mark single as read
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
  
  // Mark all as read
  markAllRead: () => api.put('/api/notifications/read-all')
};

// ==============================
// UTILITY METHODS
// ==============================
export const utils = {
  // Health check
  healthCheck: () => api.get('/health'),
  
  // Upload file
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// ==============================
// PARENT API
// ==============================
export const parentService = {
  getBusInfo: (studentId) => api.get(`/api/parent/bus/${studentId}`),
  getLocation: (driverId) => api.get(`/api/parent/location/${driverId}`),
  getAttendance: (studentId) => api.get(`/api/parent/attendance/${studentId}`),
  getNotifications: (studentId) => api.get(`/api/parent/notifications/${studentId}`),
  getRoute: (driverId) => api.get(`/api/parent/route/${driverId}`),
  getFees: (studentId) => api.get(`/api/parent/fees/${studentId}`),
  sendMessage: (data) => api.post('/api/parent/message', data),
  sendSOS: (data) => api.post('/api/parent/sos', data)
};

export default api;