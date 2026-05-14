const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Alert = require('../models/Alert');
const Route = require('../models/Route');

class GPSSimulator {
  constructor(io) {
    this.io = io;
    this.intervalId = null;
  }

  start() {
    console.log('GPS Simulator started...');
    this.intervalId = setInterval(() => this.simulateMovement(), 5000);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    console.log('GPS Simulator stopped.');
  }

  async simulateMovement() {
    try {
      // Find all active trips
      const activeTrips = await Trip.find({ status: 'active' }).populate('vehicleId').populate('routeId');

      for (const trip of activeTrips) {
        if (!trip.routeId || !trip.vehicleId) continue;

        const vehicle = trip.vehicleId;
        const route = trip.routeId;

        if (trip.currentStopIndex >= route.stops.length - 1) {
          // Trip completed
          trip.status = 'completed';
          trip.endTime = new Date();
          await trip.save();
          vehicle.status = 'idle';
          await vehicle.save();
          continue;
        }

        // Move towards the next stop (simplified simulation)
        const currentStop = route.stops[trip.currentStopIndex];
        const nextStop = route.stops[trip.currentStopIndex + 1];

        // Randomly step towards the next stop
        const latStep = (nextStop.lat - currentStop.lat) * 0.1;
        const lngStep = (nextStop.lng - currentStop.lng) * 0.1;

        const currentLoc = trip.locationHistory.length > 0 
          ? trip.locationHistory[trip.locationHistory.length - 1] 
          : { lat: currentStop.lat, lng: currentStop.lng };

        const newLat = currentLoc.lat + latStep + (Math.random() * 0.0001);
        const newLng = currentLoc.lng + lngStep + (Math.random() * 0.0001);

        // Update location history
        trip.locationHistory.push({ lat: newLat, lng: newLng });
        
        // Progress to next stop if close enough (mock logic)
        if (Math.abs(newLat - nextStop.lat) < 0.001 && Math.abs(newLng - nextStop.lng) < 0.001) {
          trip.currentStopIndex++;
        }

        await trip.save();

        // Fuel Tracking Logic
        vehicle.fuelLevel = Math.max(0, vehicle.fuelLevel - 0.5); // Decrease fuel
        await vehicle.save();

        if (vehicle.fuelLevel < 20) {
          // Check if an unresolved fuel alert already exists
          const existingAlert = await Alert.findOne({ vehicleId: vehicle._id, type: 'fuel', resolved: false });
          if (!existingAlert) {
            const alert = new Alert({
              type: 'fuel',
              message: `Fuel critically low (${vehicle.fuelLevel}%) on bus ${vehicle.busNumber}`,
              vehicleId: vehicle._id
            });
            await alert.save();
            this.io.emit('emergency-alert', { message: alert.message, type: 'fuel' });
          }
        }

        // Emit live location
        this.io.emit('bus-location', {
          busId: vehicle._id,
          busNumber: vehicle.busNumber,
          location: { lat: newLat, lng: newLng },
          fuelLevel: vehicle.fuelLevel,
          speed: Math.floor(Math.random() * 20) + 30 // random 30-50 km/h
        });
      }
    } catch (err) {
      console.error('Simulation error:', err.message);
    }
  }
}

module.exports = GPSSimulator;
