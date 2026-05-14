import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiWifi, FiWifiOff, FiRefreshCw, FiAlertTriangle, FiPlus,
  FiNavigation, FiClock, FiActivity, FiMap, FiUser, FiZap
} from 'react-icons/fi';
import { FaBus } from 'react-icons/fa';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { useSocketContext } from '../../context/SocketContext';
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

const MOCK_BUSES = [
  { id: 1, number: 'MP-09', driver: 'Amit Kumar', driverPhone: '+91 9876543210', status: 'moving', gps: 'connected', lat: 22.6268, lng: 75.8063, speed: 42, students: 22, route: 'Route A - City Center → School', stops: ['City Center', 'Central Park', 'School Campus'], currentStop: 'Central Park', eta: '7 min', nextStop: 'School Campus', fuel: 85 },
  { id: 2, number: 'MP-09', driver: 'Raj Singh',  driverPhone: '+91 9876543211', status: 'stopped', gps: 'connected', lat: 22.6240, lng: 75.8000, speed: 0,  students: 18, route: 'Route B - Sector 5 → School', stops: ['Sector 5', 'Market Road', 'School Campus'], currentStop: 'Market Road', eta: '12 min', nextStop: 'School Campus', fuel: 17 },
  { id: 3, number: 'MP-04', driver: 'Suresh V.',  driverPhone: '+91 9876543212', status: 'moving', gps: 'connected', lat: 22.6290, lng: 75.8100, speed: 38, students: 30, route: 'Route C - West Zone → School', stops: ['West Gate', 'Park Avenue', 'School Campus'], currentStop: 'Park Avenue', eta: '3 min', nextStop: 'School Campus', fuel: 62 },
  { id: 4, number: 'DL-04', driver: 'Mohan Das',  driverPhone: '+91 9876543213', status: 'offline', gps: 'disconnected', lat: 22.6200, lng: 75.7900, speed: 0,  students: 0,  route: 'Route D - North Zone → School', stops: ['North Gate', 'Ring Road', 'School Campus'], currentStop: 'Unknown', eta: 'N/A', nextStop: 'Unknown', fuel: 43 },
];

const STATUS_COLOR = { moving: 'emerald', stopped: 'amber', offline: 'red' };
const GPS_COLOR    = { connected: 'emerald', disconnected: 'red' };

const MapPanel = ({ selected, connected }) => {
  const lat = selected?.lat || 22.6268;
  const lng = selected?.lng || 75.8063;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.05}%2C${lat-0.05}%2C${lng+0.05}%2C${lat+0.05}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-950 border border-gray-800">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-gray-950/90 backdrop-blur px-3 py-1.5 rounded-xl border border-cyan-500/30">
        <span className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-emerald-400' : 'bg-red-500'}`} />
        <span className="text-xs font-mono text-cyan-400 tracking-widest">{connected ? 'GPS LIVE' : 'OFFLINE'}</span>
      </div>
      {selected && (
        <div className="absolute top-3 right-3 z-[1000] bg-gray-950/90 backdrop-blur px-3 py-2 rounded-xl border border-gray-700 text-xs font-mono space-y-1">
          <p className="text-cyan-400 font-bold">🚌 {selected.number}</p>
          <p className="text-gray-300">Speed: <span className="text-emerald-400">{selected.speed} km/h</span></p>
          <p className="text-gray-300">ETA: <span className="text-blue-400">{selected.eta}</span></p>
          <p className="text-gray-300">Next: <span className="text-gray-100">{selected.nextStop}</span></p>
        </div>
      )}
      
      <MapContainer 
        center={[lat, lng]} 
        zoom={MAP_CONFIG.defaultZoom} 
        style={{ width:'100%', height:'100%', zIndex: 1 }} 
        zoomControl={true} scrollWheelZoom={true} dragging={true}
      >
        <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
        
        {/* Visual Route */}
        <Polyline positions={SHARED_ROUTE_COORDINATES} color="#1e3a8a" weight={8} opacity={0.5} />
        <Polyline positions={SHARED_ROUTE_COORDINATES} color="#2563eb" weight={5} opacity={1} />
        
        {SHARED_BUS_STOPS.map((stop, i) => {
          const isDestination = i === SHARED_BUS_STOPS.length - 1;
          return (
            <Marker key={i} position={[stop.lat, stop.lng]} icon={isDestination ? destinationIcon : stopIcon}>
              <Popup><b>{stop.name}</b></Popup>
            </Marker>
          );
        })}

        {/* Bus Marker */}
        <Marker position={[lat, lng]} icon={busIcon}>
          <Popup><b>{selected?.number}</b><br/>Speed: {selected?.speed} km/h</Popup>
        </Marker>
      </MapContainer>
      <div className="absolute bottom-3 left-3 z-10 flex gap-2 flex-wrap">
        {MOCK_BUSES.map(b => (
          <div key={b.id} className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${
            b.gps === 'connected' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
          }`}>🚌 {b.number}</div>
        ))}
      </div>
    </div>
  );
};

export default function LiveTracking() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBus, setSelectedBus]   = useState(MOCK_BUSES[0]);
  const [buses, setBuses]               = useState(MOCK_BUSES);
  const [syncing, setSyncing]           = useState(false);
  const [showAddGPS, setShowAddGPS]     = useState(false);
  const [newBusNum, setNewBusNum]       = useState('');
  const [ticker, setTicker]             = useState(0);
  const { connected, busUpdates }       = useSocketContext();

  // Simulate real-time movement
  useEffect(() => {
    const id = setInterval(() => {
      setBuses(prev => prev.map(b => {
        if (b.gps === 'disconnected' || b.status === 'stopped') return b;
        return { ...b, lat: b.lat + (Math.random()-0.5)*0.0005, lng: b.lng + (Math.random()-0.5)*0.0005, speed: Math.floor(Math.random()*15)+30 };
      }));
      setTicker(t => t+1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Merge socket updates
  useEffect(() => {
    if (!busUpdates || Object.keys(busUpdates).length === 0) return;
    setBuses(prev => prev.map(b => {
      const live = Object.values(busUpdates).find(u => u.busNumber === b.number);
      if (!live) return b;
      return { ...b, lat: live.location?.lat || b.lat, lng: live.location?.lng || b.lng, speed: live.speed || b.speed, fuel: live.fuelLevel || b.fuel };
    }));
  }, [busUpdates]);

  // Alert offline buses
  useEffect(() => {
    const offline = buses.filter(b => b.gps === 'disconnected');
    if (offline.length > 0) {
      offline.forEach(b => toast.warning(`⚠️ GPS offline: Bus ${b.number}`, { toastId: b.id, autoClose: false }));
    }
  }, []);

  const handleSync = useCallback(() => {
    setSyncing(true);
    toast.info('🔄 Syncing GPS data...', { autoClose: 2000 });
    setTimeout(() => { setSyncing(false); toast.success('✅ GPS data synced!'); }, 2500);
  }, []);

  const handleAddGPS = () => {
    if (!newBusNum.trim()) return;
    toast.success(`✅ GPS device added to Bus ${newBusNum}`);
    setNewBusNum(''); setShowAddGPS(false);
  };

  const offlineCount   = buses.filter(b => b.gps === 'disconnected').length;
  const connectedCount = buses.filter(b => b.gps === 'connected').length;
  const movingCount    = buses.filter(b => b.status === 'moving').length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:z-auto`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">

          {/* ── TOP STATUS BAR ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'GPS Connected',  value: connectedCount, icon: FiWifi,     color: 'emerald' },
              { label: 'GPS Offline',    value: offlineCount,   icon: FiWifiOff,  color: 'red'     },
              { label: 'Buses Moving',   value: movingCount,    icon: FiActivity, color: 'cyan'    },
              { label: 'Total Tracked',  value: buses.length,   icon: FaBus,      color: 'blue'    },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
                className={`bg-gray-900/70 rounded-2xl border border-gray-800 p-4 flex items-center gap-3 hover:border-${s.color}-500/40 transition-all`}>
                <div className={`p-2.5 rounded-xl bg-${s.color}-500/10 border border-${s.color}-500/20 text-${s.color}-400`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-2xl font-black font-mono text-${s.color}-400`}>{s.value}</p>
                  <p className="text-[11px] text-gray-400">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── ACTION BAR ── */}
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={handleSync} disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 rounded-xl text-sm font-mono font-bold transition-all">
              <FiRefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync GPS Data'}
            </button>
            <button onClick={() => setShowAddGPS(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-sm font-mono font-bold transition-all">
              <FiPlus className="w-4 h-4" /> Add GPS Device
            </button>
            {offlineCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-mono animate-pulse">
                <FiAlertTriangle className="w-4 h-4" /> {offlineCount} Bus{offlineCount>1?'es':''} GPS Offline!
              </div>
            )}
          </div>

          {/* ── MAIN PANEL ── */}
          <div className="flex gap-4" style={{ height: '520px' }}>

            {/* Bus List */}
            <div className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
              {buses.map(bus => {
                const sc = STATUS_COLOR[bus.status] || 'gray';
                const gc = GPS_COLOR[bus.gps] || 'gray';
                const isSelected = selectedBus?.id === bus.id;
                return (
                  <motion.button key={bus.id} onClick={() => setSelectedBus(bus)} whileHover={{ scale:1.01 }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${isSelected ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaBus className={`w-4 h-4 text-${sc}-400`} />
                        <span className="font-bold font-mono text-gray-100 text-sm">Bus {bus.number}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full bg-${gc}-400 ${bus.gps==='connected'?'animate-pulse':''}`} />
                        <span className={`text-[10px] font-mono text-${gc}-400`}>{bus.gps}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <FiUser className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-400 truncate">{bus.driver}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div className="bg-gray-950/50 rounded-lg p-1.5">
                        <p className={`text-xs font-bold font-mono text-${sc}-400`}>{bus.speed}<span className="text-[9px] text-gray-500">km/h</span></p>
                        <p className="text-[9px] text-gray-600">Speed</p>
                      </div>
                      <div className="bg-gray-950/50 rounded-lg p-1.5">
                        <p className="text-xs font-bold font-mono text-blue-400">{bus.eta}</p>
                        <p className="text-[9px] text-gray-600">ETA</p>
                      </div>
                      <div className="bg-gray-950/50 rounded-lg p-1.5">
                        <p className="text-xs font-bold font-mono text-purple-400">{bus.students}</p>
                        <p className="text-[9px] text-gray-600">Kids</p>
                      </div>
                    </div>
                    <div className={`mt-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-${sc}-500/10 border border-${sc}-500/20`}>
                      <span className={`text-[10px] font-mono text-${sc}-400 capitalize`}>● {bus.status}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Map */}
            <div className="flex-1 min-w-0">
              <MapPanel selected={selectedBus} connected={connected} />
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
              {selectedBus && (
                <motion.div key={selectedBus.id} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
                  className="w-64 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">

                  {/* Bus Info */}
                  <div className="bg-gray-900/70 rounded-2xl border border-gray-800 p-4">
                    <h3 className="text-sm font-bold font-mono text-cyan-400 mb-3 tracking-widest">BUS DETAILS</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Number',  val: selectedBus.number,      icon: FaBus },
                        { label: 'Driver',  val: selectedBus.driver,      icon: FiUser },
                        { label: 'Phone',   val: selectedBus.driverPhone, icon: FiActivity },
                        { label: 'Students',val: selectedBus.students,    icon: FiZap },
                        { label: 'Fuel',    val: `${selectedBus.fuel}%`,  icon: FiZap },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <r.icon className="w-3 h-3 text-gray-500 flex-shrink-0" />
                          <span className="text-[10px] text-gray-500 w-16">{r.label}</span>
                          <span className="text-xs text-gray-200 font-mono truncate">{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Route */}
                  <div className="bg-gray-900/70 rounded-2xl border border-gray-800 p-4">
                    <h3 className="text-sm font-bold font-mono text-cyan-400 mb-2 tracking-widest flex items-center gap-2"><FiMap className="w-3.5 h-3.5" />ROUTE</h3>
                    <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">{selectedBus.route}</p>
                    <div className="space-y-2">
                      {selectedBus.stops.map((stop, i) => {
                        const isDone = i < selectedBus.stops.indexOf(selectedBus.currentStop);
                        const isCurrent = stop === selectedBus.currentStop;
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${isCurrent ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_8px_#22d3ee]' : isDone ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-700 border-gray-600'}`} />
                            <span className={`text-xs font-mono ${isCurrent ? 'text-cyan-400 font-bold' : isDone ? 'text-emerald-400' : 'text-gray-500'}`}>{stop}</span>
                            {isCurrent && <span className="text-[9px] text-cyan-500 font-mono ml-auto">● HERE</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Speed & ETA */}
                  <div className="bg-gray-900/70 rounded-2xl border border-gray-800 p-4">
                    <h3 className="text-sm font-bold font-mono text-cyan-400 mb-3 tracking-widest">TELEMETRY</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label:'Speed', val:`${selectedBus.speed} km/h`, icon:FiNavigation, c:'emerald' },
                        { label:'ETA',   val:selectedBus.eta,             icon:FiClock,     c:'blue' },
                        { label:'Status',val:selectedBus.status,          icon:FiActivity,  c:STATUS_COLOR[selectedBus.status] },
                        { label:'GPS',   val:selectedBus.gps,             icon:FiWifi,      c:GPS_COLOR[selectedBus.gps] },
                      ].map((t, i) => (
                        <div key={i} className={`p-2 rounded-xl bg-${t.c}-500/5 border border-${t.c}-500/20 text-center`}>
                          <t.icon className={`w-3.5 h-3.5 text-${t.c}-400 mx-auto mb-1`} />
                          <p className={`text-xs font-bold font-mono text-${t.c}-400 capitalize`}>{t.val}</p>
                          <p className="text-[9px] text-gray-600">{t.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GPS Offline Alert */}
                  {selectedBus.gps === 'disconnected' && (
                    <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }}
                      className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiAlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                        <span className="text-sm font-bold text-red-400 font-mono">GPS OFFLINE</span>
                      </div>
                      <p className="text-xs text-red-300/70 mb-3">Last known position shown. Contact driver immediately.</p>
                      <a href={`tel:${selectedBus.driverPhone}`}
                        className="block w-full text-center px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-xl text-xs font-mono font-bold transition-all">
                        📞 Call Driver
                      </a>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </main>
      </div>

      {/* Add GPS Modal */}
      <AnimatePresence>
        {showAddGPS && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, y:20 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-lg font-bold text-cyan-400 font-mono mb-4">➕ Add GPS Device</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 font-mono mb-1 block">Bus Number</label>
                  <input value={newBusNum} onChange={e => setNewBusNum(e.target.value)}
                    placeholder="e.g. DL-05"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-mono mb-1 block">GPS Device ID</label>
                  <input placeholder="e.g. GPS-9876-XYZ"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-mono mb-1 block">SIM Number</label>
                  <input placeholder="e.g. +91 9999888877"
                    className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleAddGPS}
                  className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400 rounded-xl py-2.5 text-sm font-mono font-bold transition-all">
                  ✅ Add Device
                </button>
                <button onClick={() => setShowAddGPS(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded-xl py-2.5 text-sm font-mono transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
