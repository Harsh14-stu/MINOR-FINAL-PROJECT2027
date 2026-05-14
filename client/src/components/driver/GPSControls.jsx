import React, { useState, useEffect } from 'react';
import { FiNavigation, FiCompass, FiSpeedometer2, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';

const GPSControls = ({ bus, onGPSUpdate, connected }) => {
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [speed, setSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isWatching, setIsWatching] = useState(false);

  // Watch GPS position
  useEffect(() => {
    let watchId;

    const startWatching = () => {
      if (!navigator.geolocation) {
        toast.error('Geolocation not supported');
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy: acc, speed } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setAccuracy(acc);
          setSpeed(speed || 0);
          
          // Auto-send GPS update
          if (isWatching) {
            onGPSUpdate({ lat: latitude, lng: longitude, speed: speed || 0 });
          }
        },
        (error) => {
          toast.error(`GPS Error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );
      
      setIsWatching(true);
    };

    const stopWatching = () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setIsWatching(false);
      }
    };

    if (connected) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
  }, [connected, onGPSUpdate]);

  const manualUpdate = () => {
    onGPSUpdate({ lat: location.lat, lng: location.lng, speed });
    toast.success(' GPS Updated!');
  };

  return (
    <div className="card p-8 h-full">
      <div className="card-header mb-8">
        <h2 className="card-title flex items-center gap-3">
          <FiNavigation className="w-7 h-7" />
          GPS Controls
        </h2>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          connected && isWatching 
            ? 'bg-emerald-100 text-emerald-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {connected && isWatching ? '🔴 LIVE TRACKING' : '⚠️ DISCONNECTED'}
        </div>
      </div>

      {/* Current Position */}
      <div className="space-y-6 mb-8">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <h3 className="font-bold text-xl text-blue-900">Current Position</h3>
          </div>
          <div className="space-y-3 text-center">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-blue-600">28.6139°</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Latitude</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-blue-600">77.2090°</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Longitude</div>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <div className={`text-2xl font-bold ${
                  speed > 0 ? 'text-emerald-600' : 'text-gray-500'
                }`}>
                  {speed.toFixed(1)} km/h
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Speed</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Accuracy: {accuracy.toFixed(0)}m • Last Update: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Manual GPS Input */}
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-dashed border-indigo-200">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FiCompass className="w-5 h-5" />
            Manual GPS Update
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={location.lat}
                onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="28.6139"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                value={location.lng}
                onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="77.2090"
              />
            </div>
          </div>
          <button
            className="w-full btn btn-primary py-4 text-lg font-bold shadow-xl hover:shadow-2xl"
            onClick={manualUpdate}
            disabled={!connected}
          >
            📍 Send GPS Update
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">Live Tracking</span>
          <div className={`w-3 h-3 rounded-full ${
            connected && isWatching ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
          }`} />
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {connected && isWatching 
            ? '✅ Auto GPS updates active' 
            : '⚠️ Connect to start live tracking'
          }
        </div>
      </div>
    </div>
  );
};

export default GPSControls;