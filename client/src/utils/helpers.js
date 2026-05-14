import { toast } from 'react-toastify';
import { BUS_STATUS, PRIORITY_COLORS, NOTIFICATION_ICONS } from './constants';

// Format time
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format distance
export const formatDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

// Calculate ETA
export const calculateETA = (distanceKm, speedKmh = 40) => {
  const timeMinutes = Math.round((distanceKm / speedKmh) * 60);
  return timeMinutes < 1 ? 'Now' : `${timeMinutes}min`;
};

// Get bus status color
export const getStatusColor = (status) => {
  const colors = {
    idle: '#6B7280',      // gray
    moving: '#10B981',    // green
    stopped: '#F59E0B',   // yellow
    delayed: '#EF4444'    // red
  };
  return colors[status] || '#6B7280';
};

// Get priority badge
export const getPriorityBadge = (priority) => {
  return (
    <span 
      className="px-2 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: PRIORITY_COLORS[priority], color: 'white' }}
    >
      {priority.toUpperCase()}
    </span>
  );
};

// Get notification icon
export const getNotificationIcon = (type) => {
  return NOTIFICATION_ICONS[type] || '📱';
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  } catch (err) {
    toast.error('Failed to copy');
  }
};

// Validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Phone number formatter
export const formatPhone = (phone) => {
  return phone.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
};

// Truncate text
export const truncate = (text, maxLength = 50) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

// Get initials
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Random color
export const getRandomColor = () => {
  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Local storage helpers
export const setToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage Error:', e);
  }
};

export const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      // If it's a raw string (like a JWT), return it as is
      return item;
    }
  } catch (e) {
    console.error('LocalStorage Error:', e);
    return null;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('LocalStorage Error:', e);
  }
};

// Date formatter
export const formatDate = (date, format = 'short') => {
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  };
  return new Date(date).toLocaleDateString('en-US', options[format]);
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// API Error Handler
export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  if (error.response?.data?.message) {
    toast.error(error.response.data.message);
  } else if (error.message) {
    toast.error(error.message);
  } else {
    toast.error(defaultMessage);
  }
  console.error('API Error:', error);
};