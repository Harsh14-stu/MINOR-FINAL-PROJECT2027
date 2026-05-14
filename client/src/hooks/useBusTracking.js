import { useState, useEffect, useCallback } from 'react';
import { busService } from '../services/api';
import { useSocket } from './useSocket';
import { calculateETA, formatDistance } from '../utils/helpers';
import { DEMO_ROUTE_STOPS } from '../utils/constants';
import socketService from '../services/socket';

export const useBusTracking = (busId) => {
  const [bus, setBus] = useState(null);
  const [routeProgress, setRouteProgress] = useState(0);
  const [eta, setEta] = useState('Calculating...');
  const [isNearby, setIsNearby] = useState(false);
  const [loading, setLoading] = useState(true);
  const { busLocation, connected } = useSocket();

  // Fetch initial bus data
  const fetchBus = useCallback(async () => {
    if (!busId) return;
    
    setLoading(true);
    try {
      const response = await busService.getBus(busId);
      setBus(response.data);
    } catch (error) {
      console.error('Bus fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [busId]);

  // Update tracking data
  const updateTracking = useCallback((location) => {
    if (!location || !bus?.route?.stops) return;

    const { lat, lng } = location;
    
    // Calculate route progress
    const progress = calculateRouteProgress(lat, lng, bus.route.stops);
    setRouteProgress(progress);

    // Calculate ETA to next stop
    const nextStop = bus.route.stops.find(stop => 
      !bus.completedStops?.includes(stop.id)
    );
    
    if (nextStop) {
      const distance = calculateDistance(lat, lng, nextStop.lat, nextStop.lng);
      const etaTime = calculateETA(distance);
      setEta(etaTime);
      
      // Check if nearby (within 100m)
      setIsNearby(distance < 0.1);
    }

    // Check for route deviation
    const deviation = checkRouteDeviation(lat, lng, bus.route.stops);
    if (deviation) {
      toast.warning('🚨 Route deviation detected!');
    }
  }, [bus]);

  // Real-time location updates
  useEffect(() => {
    if (busLocation) {
      updateTracking(busLocation);
    }
  }, [busLocation, updateTracking]);

  // Initial fetch
  useEffect(() => {
    fetchBus();
    
    // Join bus socket room
    if (busId) {
      socketService.joinBus(busId);
    }

    // Refresh every 30 seconds
    const interval = setInterval(fetchBus, 30000);
    return () => {
      clearInterval(interval);
      socketService.leaveRoom(`bus_${busId}`);
    };
  }, [busId, fetchBus]);

  // Send GPS update (for drivers)
  const sendGPSUpdate = async (lat, lng, speed) => {
    try {
      await busService.updateLocation({ 
        busId, 
        lat, 
        lng, 
        speed,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      toast.error('Failed to update GPS');
      return false;
    }
  };

  // Mark arrival
  const markArrival = async (stopId) => {
    try {
      await busService.markArrival({ busId, stopId });
      toast.success('✅ Arrival marked!');
      setBus(prev => ({
        ...prev,
        completedStops: [...(prev.completedStops || []), stopId]
      }));
      return true;
    } catch (error) {
      toast.error('Failed to mark arrival');
      return false;
    }
  };

  return {
    bus,
    loading,
    eta,
    routeProgress,
    isNearby,
    connected,
    sendGPSUpdate,
    markArrival,
    refresh: fetchBus,
    distanceToNext: eta === 'Now' ? '0m' : formatDistance(100) // Placeholder
  };
};

// Route calculation helpers (internal)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // meters
};

const calculateRouteProgress = (lat, lng, stops) => {
  if (!stops?.length) return 0;
  
  let totalDistance = 0;
  let traveledDistance = 0;
  
  for (let i = 0; i < stops.length - 1; i++) {
    const dist = calculateDistance(
      stops[i].lat, stops[i].lng,
      stops[i + 1].lat, stops[i + 1].lng
    );
    totalDistance += dist;
    
    const toCurrent = calculateDistance(
      stops[i].lat, stops[i].lng,
      lat, lng
    );
    
    if (toCurrent < dist) {
      traveledDistance += (dist - toCurrent);
    } else {
      traveledDistance += dist;
    }
  }
  
  return Math.min(100, Math.round((traveledDistance / totalDistance) * 100));
};

const checkRouteDeviation = (lat, lng, routePoints) => {
  let minDistance = Infinity;
  
  for (let point of routePoints) {
    const distance = calculateDistance(lat, lng, point.lat, point.lng);
    minDistance = Math.min(minDistance, distance);
  }
  
  return minDistance > 500; // 500m threshold
};

export default useBusTracking;