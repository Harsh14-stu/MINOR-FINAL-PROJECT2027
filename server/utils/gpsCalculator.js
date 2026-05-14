// Haversine formula for distance between two GPS coordinates
const toRadians = (degrees) => {
  return degrees * Math.PI / 180;
};

// Calculate distance between two coordinates (in km)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in km
};

// Calculate ETA based on distance and speed
const calculateETA = (distanceKm, speedKmh = 40) => {
  if (speedKmh === 0) return 'Stopped';
  
  const timeHours = distanceKm / speedKmh;
  const timeMinutes = Math.round(timeHours * 60);
  
  if (timeMinutes < 1) return 'Arriving Now';
  if (timeMinutes < 60) return `${timeMinutes} min`;
  
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  return `${hours}h ${minutes}m`;
};

// Calculate bearing (direction) between two points
const calculateBearing = (lat1, lng1, lat2, lng2) => {
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLng = toRadians(lng2 - lng1);
  
  const y = Math.sin(deltaLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng);
  const bearing = Math.atan2(y, x);
  
  return (bearing * 180 / Math.PI + 360) % 360;
};

// Check if bus deviated from route
const checkRouteDeviation = (currentLat, currentLng, routePoints) => {
  let minDistance = Infinity;
  
  for (let point of routePoints) {
    const distance = calculateDistance(currentLat, currentLng, point.lat, point.lng);
    minDistance = Math.min(minDistance, distance);
  }
  
  // Deviation threshold: 500 meters (0.5 km)
  return minDistance > 0.5;
};

// Calculate route progress
const calculateRouteProgress = (currentLat, currentLng, routeStops) => {
  if (!routeStops || routeStops.length === 0) return 0;
  
  let totalDistance = 0;
  let completedDistance = 0;
  
  for (let i = 0; i < routeStops.length - 1; i++) {
    const dist = calculateDistance(
      routeStops[i].lat, routeStops[i].lng,
      routeStops[i + 1].lat, routeStops[i + 1].lng
    );
    totalDistance += dist;
    
    // Check if current position is past this segment
    const toCurrent = calculateDistance(
      routeStops[i].lat, routeStops[i].lng,
      currentLat, currentLng
    );
    if (toCurrent < dist) {
      completedDistance += (dist - toCurrent);
    } else {
      completedDistance += dist;
    }
  }
  
  return Math.round((completedDistance / totalDistance) * 100);
};

// Speed-based ETA adjustment
const adjustETAByTraffic = (baseETA, speedKmh, avgSpeed = 40) => {
  if (speedKmh > avgSpeed * 1.2) return `${parseInt(baseETA)} min (Fast)`;
  if (speedKmh < avgSpeed * 0.7) return `${parseInt(baseETA) + 5} min (Slow)`;
  return baseETA;
};

// Export all functions
module.exports = {
  calculateDistance,
  calculateETA,
  calculateBearing,
  checkRouteDeviation,
  calculateRouteProgress,
  adjustETAByTraffic,
  toRadians
};