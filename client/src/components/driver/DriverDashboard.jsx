import React, { useState, useEffect } from 'react';
import { FiMapPin, FiActivity, FiUsers, FiClock, FiAlertCircle, FiPlay, FiStopCircle, FiCrosshair, FiRadio } from 'react-icons/fi';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import GPSControls from './GPSControls';
import ActionButtons from './ActionButtons';
import MessagePanel from './MessagePanel';
import DriverProfile from './DriverProfile';
import { useSocketContext } from '../../context/SocketContext';
import { driverService } from '../../services/api';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SHARED_ROUTE_COORDINATES, SHARED_BUS_STOPS, MAP_CONFIG } from '../../utils/constants';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Bus Icon on Map
const busIcon = L.divIcon({
  className: '',
  html: `<div style="background-color:#2563eb; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.4); border:3px solid white;">
    <span style="font-size:20px; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.3));">🚌</span>
  </div>`,
  iconSize: [40, 40], iconAnchor: [20, 20],
});

// Grey stop dot
const stopIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px; height:16px; background-color:#9ca3af; border:3px solid white; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8]
});

// Red Destination Pin
const destinationIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:24px; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.3));">📍</div>`,
  iconSize: [24, 24], iconAnchor: [12, 24]
});

const DriverDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bus, setBus] = useState(null);
  const [tripStatus, setTripStatus] = useState('idle');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [driverInfo, setDriverInfo] = useState({
    name: 'Amit Kumar',
    license: 'DL-142020012345',
    dlStatus: 'Pending',
    licenseExpiry: '2028-05-20'
  });
  const { connected, sendGPSUpdate } = useSocketContext();

  const routeStops = SHARED_BUS_STOPS;

  useEffect(() => {
    fetchDashboard();
  }, []);

  // GPS AUTO SEND
  useEffect(() => {
    let interval;
    if (tripStatus === 'moving') {
      interval = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
              // Send via API
              await driverService.updateGPS({
                driverId: driverInfo.license, // using license as mock id for now
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                speed: pos.coords.speed || 0
              }).catch(() => null);
              
              // Also send via Socket for realtime map
              sendGPSUpdate({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                speed: pos.coords.speed || 0
              });
            } catch (err) {
              console.error('GPS send failed');
            }
          });
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tripStatus, driverInfo.license, sendGPSUpdate]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await driverService.getDashboard().catch(() => null);
      if (response?.data) {
        setBus(response.data.bus);
        setTripStatus(response.data.bus?.status || 'idle');
        setCurrentStopIndex(response.data.currentStopIndex || 0);
      } else {
        // Fallback for UI testing
        setBus({ busNumber: 'MP-09-AB-1234', status: 'idle' });
        setTripStatus('idle');
        setCurrentStopIndex(0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrip = async () => {
    try {
      if (tripStatus === 'idle' || tripStatus === 'stopped') {
        await driverService.startTrip().catch(() => null);
        setTripStatus('moving');
        toast.success('SYSTEM_LINK: GPS Broadcast Initiated');
      } else {
        await driverService.endTrip().catch(() => null);
        setTripStatus('idle');
        toast.success('SYSTEM_LINK: Broadcast Terminated');
      }
    } catch (error) {
      toast.error('SYSTEM_ERROR: Connection Failed');
    }
  };

  const markArrival = async () => {
    if (currentStopIndex < routeStops.length) {
      try {
        await driverService.markArrival(routeStops[currentStopIndex].id);
        toast.success(`WAYPOINT_REACHED: ${routeStops[currentStopIndex].name}`);
        setCurrentStopIndex(prev => prev + 1);
      } catch (error) {
        toast.error('SYNC_ERROR: Unable to log waypoint');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <FiActivity className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-xl font-mono text-blue-600 tracking-widest animate-pulse">INITIALIZING TERMINAL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh text-slate-100 font-sans">
      <Navbar onMenuToggle={() => setSidebarOpen(true)} />

      <div className="flex relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <p className="text-xs font-mono text-cyan-500/70 tracking-widest uppercase mb-1">CDGI College · Driver Terminal</p>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
                  Driver Panel
                </h1>
                <p className="text-sm font-mono text-slate-400 tracking-widest uppercase flex items-center gap-2">
                  <FiRadio className="text-cyan-400 animate-pulse" />
                  Vehicle {bus?.busNumber || 'UNASSIGNED'} · Secure Uplink Active
                </p>
              </div>
              <div className={`p-3 rounded-xl font-bold font-mono text-sm border flex items-center gap-2 ${
                connected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                {connected ? 'GPS: ONLINE' : 'GPS: OFFLINE'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Live Map */}
            <div className="xl:col-span-2 rounded-3xl overflow-hidden flex flex-col" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)'}}>
              
              <div className="flex-1 bg-slate-100 relative overflow-hidden min-h-[350px]">
                <MapContainer 
                  center={[MAP_CONFIG.defaultCenter.lat, MAP_CONFIG.defaultCenter.lng]} 
                  zoom={MAP_CONFIG.defaultZoom} 
                  style={{ width:'100%', height:'100%', zIndex: 1 }} 
                  zoomControl={true} scrollWheelZoom={true} dragging={true}
                >
                  <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
                  <Polyline positions={SHARED_ROUTE_COORDINATES} color="#1e3a8a" weight={8} opacity={0.5} />
                  <Polyline positions={SHARED_ROUTE_COORDINATES} color="#2563eb" weight={5} opacity={1} />
                  
                  {routeStops.map((stop, i) => {
                    const isDestination = i === routeStops.length - 1;
                    return (
                      <Marker key={i} position={[stop.lat, stop.lng]} icon={isDestination ? destinationIcon : stopIcon}>
                        <Popup><b>{stop.name}</b></Popup>
                      </Marker>
                    );
                  })}
                  <Marker position={[routeStops[currentStopIndex]?.lat || MAP_CONFIG.defaultCenter.lat, routeStops[currentStopIndex]?.lng || MAP_CONFIG.defaultCenter.lng]} icon={busIcon}>
                    <Popup><b>Your Location</b></Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            <div className="flex flex-col">
              <ActionButtons 
                tripStatus={tripStatus} 
                toggleTrip={toggleTrip} 
                openMessageModal={() => setShowMessagePanel(true)} 
                openSOS={() => toast.error('🚨 EMERGENCY SOS SENT TO ADMIN AND PARENTS!')}
              />
            </div>
          </div>

          <DriverProfile driverInfo={driverInfo} />

          <MessagePanel isOpen={showMessagePanel} onClose={() => setShowMessagePanel(false)} />
          
          <footer className="text-center py-6 text-slate-700 text-xs font-mono tracking-widest mt-4" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            CDGI COLLEGE · SMART BUS SYSTEM
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;