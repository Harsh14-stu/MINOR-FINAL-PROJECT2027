import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiActivity, FiUsers, FiAlertTriangle, FiUser,
  FiZap, FiNavigation, FiPlusCircle, FiTool, FiShield,
  FiTrendingUp, FiCheckCircle, FiClock, FiAlertOctagon
} from 'react-icons/fi';
import { FaBus } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { useSocketContext } from '../../context/SocketContext';
import axios from 'axios';


import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Bus Icon on Map
const busIcon = L.divIcon({
  className: '',
  html: `<div style="background-color:#2563eb; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.4); border:3px solid white;">
    <span style="font-size:20px; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.3));">🚌</span>
  </div>`,
  iconSize: [40, 40], iconAnchor: [20, 20],
});

const LiveMap = ({ buses, connected }) => {
  const [selectedBus, setSelectedBus] = useState(null);
  const lat = 22.6268, lng = 75.8063; // Indore CDGI

  return (
    <div className="relative w-full h-full bg-gray-950 rounded-2xl overflow-hidden" style={{ zIndex: 1 }}>
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-gray-950/90 backdrop-blur px-3 py-1.5 rounded-xl border border-cyan-500/30">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-xs font-mono text-cyan-400 tracking-widest">{connected ? 'LIVE TRACKING' : 'OFFLINE'}</span>
      </div>

      <MapContainer center={[lat, lng]} zoom={14} style={{ height: '100%', width: '100%', zIndex: 1 }} zoomControl={true} scrollWheelZoom={true} dragging={true}>
        <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
        {buses.map(bus => (
          <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon} eventHandlers={{ click: () => setSelectedBus(bus) }}>
            <Popup>
               <div className="text-gray-900 font-bold font-mono">🚌 {bus.number}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedBus && (
        <div className="absolute bottom-16 left-3 z-[1000] bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl min-w-[180px]">
          <p className="font-bold text-white text-sm mb-1">🚌 Bus {selectedBus.number}</p>
          <p className="text-xs text-gray-400">Driver: <span className="text-gray-200">{selectedBus.driver}</span></p>
          <p className="text-xs text-gray-400">Students: <span className="text-gray-200">{selectedBus.students}</span></p>
          <p className="text-xs text-gray-400">ETA: <span className="text-blue-400 font-bold">{selectedBus.eta}</span></p>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            selectedBus.status === 'on-time' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>{selectedBus.status === 'on-time' ? '✅ On Time' : '⚠️ Delayed'}</span>
          <button onClick={() => setSelectedBus(null)} className="ml-2 text-gray-500 hover:text-gray-300 text-xs">✕</button>
        </div>
      )}
    </div>
  );
};


const MONTHLY_DATA = [
  { month: 'Jan', trips: 420 }, { month: 'Feb', trips: 380 },
  { month: 'Mar', trips: 510 }, { month: 'Apr', trips: 460 },
  { month: 'May', trips: 530 }, { month: 'Jun', trips: 490 },
];

const FUEL_DATA = [
  { bus: 'MP-09', fuel: 85, status: 'ok' },
  { bus: 'MP-09', fuel: 17, status: 'critical' },
  { bus: 'MP-04', fuel: 62, status: 'ok' },
  { bus: 'DL-04', fuel: 43, status: 'ok' },
  { bus: 'DL-05', fuel: 8,  status: 'critical' },
];

const MAINTENANCE_DATA = [
  { bus: 'MP-09', service: '12 days', insurance: '45 days', ok: true },
  { bus: 'MP-09', service: '2 days',  insurance: '10 days', ok: false },
  { bus: 'MP-04', service: '30 days', insurance: '90 days', ok: true },
];

const ALERT_DATA = [
  { type: 'Over-speed', bus: 'MP-09', time: '2m ago',  color: 'red' },
  { type: 'Route Deviation', bus: 'MP-09', time: '8m ago',  color: 'amber' },
  { type: 'Low Fuel', bus: 'DL-05', time: '15m ago', color: 'amber' },
  { type: 'Student Boarding', bus: 'MP-04', time: '20m ago', color: 'green' },
];

const MOCK_BUSES = [
  { id: 1, number: 'MP-09', lat: 22.6268, lng: 75.8063, status: 'on-time', students: 22, driver: 'Amit Kumar', eta: '5 min' },
  { id: 2, number: 'MP-09', lat: 22.6240, lng: 75.8000, status: 'delayed', students: 18, driver: 'Raj Singh',   eta: '12 min' },
  { id: 3, number: 'MP-04', lat: 22.6290, lng: 75.8100, status: 'on-time', students: 30, driver: 'Suresh V.',   eta: '3 min' },
];

// ─── Stats Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative bg-gray-900/70 backdrop-blur rounded-2xl border border-gray-800 p-4 overflow-hidden group hover:border-cyan-500/40 transition-all"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color}/5 to-transparent pointer-events-none rounded-2xl`} />
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl bg-gray-950/60 border border-gray-800 ${color}`}>
        <Icon className="w-5 h-5 text-current" />
      </div>
    </div>
    <p className="text-2xl font-black text-white font-mono">{value}</p>
    <p className="text-xs text-gray-400 mt-0.5 font-medium">{title}</p>
    {sub && <p className="text-[10px] text-gray-600 font-mono mt-1">{sub}</p>}
  </motion.div>
);

// ─── Main AdminDashboard ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats]             = useState({ totalBuses: 0, activeBuses: 0, totalStudents: 0, studentsOnboard: 0, alerts: 0, driversAvailable: 0, activeTrips: 0 });
  const [buses, setBuses]             = useState(MOCK_BUSES);
  const { busUpdates, connected }     = useSocketContext();

  // Fetch real stats from backend
  useEffect(() => {
    axios.get('/api/admin/dashboard')
      .then(r => { if (r.data?.stats) setStats(s => ({ ...s, ...r.data.stats })); })
      .catch(() => {});
  }, []);

  // Merge live socket bus updates into markers
  useEffect(() => {
    const keys = Object.keys(busUpdates || {});
    if (keys.length === 0) return;
    setBuses(prev => prev.map(b => {
      const live = Object.values(busUpdates).find(u => u.busNumber === b.number);
      if (!live) return b;
      return { ...b, lat: live.location?.lat || b.lat, lng: live.location?.lng || b.lng, fuel: live.fuelLevel };
    }));
  }, [busUpdates]);

  const statsCards = [
    { icon: FaBus,          title: 'Total Buses',       value: stats.totalBuses ?? 0,        color: 'text-blue-400',    delay: 0.0 },
    { icon: FiNavigation,   title: 'Active Trips',      value: stats.activeTrips ?? 0,        color: 'text-cyan-400',    delay: 0.05 },
    { icon: FiUsers,        title: 'Students Onboard',  value: stats.studentsOnboard ?? 0,  color: 'text-emerald-400', delay: 0.1 },
    { icon: FiZap,          title: 'Total Students',    value: stats.totalStudents ?? 0,    color: 'text-purple-400',  delay: 0.15 },
    { icon: FiAlertTriangle,title: 'Alerts',            value: stats.alerts ?? 0,             color: 'text-red-400',     delay: 0.2 },
    { icon: FiUser,         title: 'Drivers Available', value: stats.driversAvailable ?? 0,   color: 'text-amber-400',   delay: 0.25 },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:z-auto`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

          {/* ── STATS CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {statsCards.map(c => <StatCard key={c.title} {...c} />)}
          </div>

          {/* ── MAP + RIGHT PANEL ── */}
          <div className="flex gap-4 h-[500px]">

            {/* MAP 60% */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-[3] rounded-2xl overflow-hidden border border-gray-800 relative"
              style={{ minWidth: 0 }}
            >
              <LiveMap buses={buses} connected={connected} />
            </motion.div>

            {/* RIGHT PANEL 40% */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-[2] flex flex-col gap-4 overflow-y-auto"
              style={{ minWidth: 0 }}
            >
              {/* Alerts */}
              <div className="bg-gray-900/70 rounded-2xl border border-gray-800 flex-1 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-gray-800 flex items-center gap-2">
                  <FiAlertOctagon className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-bold font-mono text-gray-200 tracking-widest">RECENT ALERTS</span>
                  <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">{ALERT_DATA.length}</span>
                </div>
                <div className="p-3 space-y-2 overflow-y-auto flex-1">
                  {ALERT_DATA.map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                        a.color === 'red'   ? 'bg-red-500/5 border-red-500/20' :
                        a.color === 'amber' ? 'bg-amber-500/5 border-amber-500/20' :
                                              'bg-emerald-500/5 border-emerald-500/20'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        a.color === 'red' ? 'bg-red-500' : a.color === 'amber' ? 'bg-amber-400' : 'bg-emerald-500'
                      }`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${
                          a.color === 'red' ? 'text-red-400' : a.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>{a.type}</p>
                        <p className="text-[11px] text-gray-400">Bus {a.bus}</p>
                        <p className="text-[10px] text-gray-600 font-mono">{a.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-900/70 rounded-2xl border border-gray-800 p-3">
                <p className="text-xs font-bold font-mono text-gray-400 tracking-widest mb-3">QUICK ACTIONS</p>
                <div className="space-y-2">
                  {[
                    { label: '+ Add Student', color: 'cyan',    path: '/admin/students' },
                    { label: '+ Add Bus',     color: 'blue',    path: '/admin/vehicles' },
                    { label: '+ Start Trip',  color: 'emerald', path: '/admin/trips'    },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-mono transition-all border ${
                        btn.color === 'cyan'    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' :
                        btn.color === 'blue'    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' :
                                                  'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      <FiPlusCircle className="w-4 h-4" /> {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── BOTTOM 3-COLUMN ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* 1. Fuel Monitoring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900/70 rounded-2xl border border-gray-800 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800 flex items-center gap-2">
                <FiZap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold font-mono text-gray-200 tracking-widest">FUEL MONITORING</span>
              </div>
              <div className="p-4 space-y-3">
                {FUEL_DATA.map((f, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-gray-400">Bus {f.bus}</span>
                      <div className="flex items-center gap-1.5">
                        {f.status === 'critical' && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-mono border border-red-500/30 animate-pulse">LOW</span>
                        )}
                        <span className={`text-xs font-bold font-mono ${f.status === 'critical' ? 'text-red-400' : 'text-emerald-400'}`}>{f.fuel}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.fuel}%` }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                        className={`h-full rounded-full ${
                          f.fuel < 20 ? 'bg-gradient-to-r from-red-600 to-red-400' :
                          f.fuel < 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                                        'bg-gradient-to-r from-emerald-600 to-cyan-400'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 2. Maintenance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-900/70 rounded-2xl border border-gray-800 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800 flex items-center gap-2">
                <FiTool className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold font-mono text-gray-200 tracking-widest">MAINTENANCE</span>
              </div>
              <div className="p-4 space-y-3">
                {MAINTENANCE_DATA.map((m, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${m.ok ? 'bg-gray-950/40 border-gray-800' : 'bg-red-500/5 border-red-500/30'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold font-mono text-gray-200">Bus {m.bus}</span>
                      {!m.ok && <span className="text-[10px] text-red-400 font-mono bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30 animate-pulse">⚠ URGENT</span>}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FiTool className="w-3 h-3 text-gray-500" />
                        <span className="text-[11px] text-gray-400">Service: <span className={`font-bold ${!m.ok ? 'text-red-400' : 'text-gray-300'}`}>in {m.service}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiShield className="w-3 h-3 text-gray-500" />
                        <span className="text-[11px] text-gray-400">Insurance: <span className="font-bold text-gray-300">in {m.insurance}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 3. Trips Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gray-900/70 rounded-2xl border border-gray-800 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800 flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold font-mono text-gray-200 tracking-widest">TRIPS ANALYTICS</span>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 font-mono mb-3">Monthly Trips — 2025</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip
                      contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#e5e7eb', fontSize: 12 }}
                      cursor={{ fill: 'rgba(139,92,246,0.1)' }}
                    />
                    <Bar dataKey="trips" fill="url(#tripGrad)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'This Month', val: '530', icon: FiActivity, c: 'text-purple-400' },
                    { label: 'On Time',    val: '94%',  icon: FiCheckCircle, c: 'text-emerald-400' },
                    { label: 'Avg ETA',   val: '7min', icon: FiClock, c: 'text-cyan-400' },
                  ].map((s, i) => (
                    <div key={i} className="text-center p-2 bg-gray-950/50 rounded-lg border border-gray-800">
                      <s.icon className={`w-3 h-3 mx-auto mb-1 ${s.c}`} />
                      <p className={`text-sm font-black font-mono ${s.c}`}>{s.val}</p>
                      <p className="text-[9px] text-gray-500 font-mono">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;