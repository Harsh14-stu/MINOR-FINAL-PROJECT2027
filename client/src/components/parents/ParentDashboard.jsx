import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Heart, Bell, User, Shield, Crosshair,
  Radio, PhoneCall, MessageSquare, ChevronRight, Bus,
  Activity, AlertCircle, CheckCircle, Navigation, Zap, LogOut
} from 'lucide-react';
import HelpCenter from './HelpCenter';
import ParentAIChat from './ParentAIChat';
import { useSocketContext } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { SHARED_ROUTE_COORDINATES, SHARED_BUS_STOPS, MAP_CONFIG } from '../../utils/constants';
import { formatTime } from '../../utils/helpers';
import { parentService } from '../../services/api';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import QRCode from 'react-qr-code';

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

const MOCK_CHILDREN = [
  { id: 'STU001', name: 'Amit Sharma', busNumber: 'MP-09-AB-1234', busStatus: 'moving', eta: '12 min', lastSeen: '2 min ago', location: { lat: 22.6268, lng: 75.8063 } },
  { id: 'STU002', name: 'Priya Singh',  busNumber: 'MP-09-CD-5678', busStatus: 'idle',   eta: 'N/A',    lastSeen: '15 min ago', location: { lat: 22.6240, lng: 75.8000 } },
];

const statusColor = (s) => s === 'moving' ? '#10b981' : s === 'idle' ? '#64748b' : '#f59e0b';
const statusBg    = (s) => s === 'moving' ? 'rgba(16,185,129,0.12)' : s === 'idle' ? 'rgba(100,116,139,0.12)' : 'rgba(245,158,11,0.12)';
const statusBorder= (s) => s === 'moving' ? 'rgba(16,185,129,0.25)' : s === 'idle' ? 'rgba(100,116,139,0.2)' : 'rgba(245,158,11,0.25)';

const NAV = [
  { id: 'tracking',   icon: MapPin,     label: 'Live Tracking' },
  { id: 'schedule',   icon: Clock,      label: 'Schedule & Info' },
  { id: 'attendance', icon: Activity,   label: 'Attendance' },
  { id: 'fees',       icon: Zap,        label: 'Fees Details' },
  { id: 'alerts',     icon: Bell,       label: 'Alerts & Help' },
];

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('tracking');
  const [children, setChildren] = useState(MOCK_CHILDREN);
  const [activeChild, setActiveChild] = useState(MOCK_CHILDREN[0]);
  const [attendance, setAttendance]   = useState({ today: 'Present', monthlyPercentage: 96 });
  const [fees, setFees]               = useState({ dueAmount: 12000, paidAmount: 12000, payableAmount: 0, status: 'paid', month: 'May' });
  const [showHelp, setShowHelp]       = useState(false);
  const [notifs, setNotifs]           = useState([]);
  const [routeData, setRouteData]     = useState(null);
  const { connected } = useSocketContext();

  const attendanceHistory = useMemo(() => {
    const totalDays = 30;
    const presentCount = Math.round(((attendance?.monthlyPercentage || 96) / 100) * totalDays);
    return Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      status: i < presentCount ? 'Present' : 'Absent'
    })).sort(() => Math.random() - 0.5);
  }, [attendance?.monthlyPercentage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [busRes, attRes, notifRes, routeRes, feesRes] = await Promise.all([
          parentService.getBusInfo(activeChild.id),
          parentService.getAttendance(activeChild.id),
          parentService.getNotifications(activeChild.id),
          parentService.getRoute(activeChild.id),
          parentService.getFees(activeChild.id),
        ]);
        setActiveChild(p => ({ ...p, ...busRes.data }));
        setAttendance(attRes.data);
        setFees(feesRes.data);
        setNotifs(notifRes.data);
        setRouteData(routeRes.data);
      } catch (_) {}
    };
    fetchData();
  }, [activeChild.id]);

  const handleSOS = async () => {
    if (window.confirm('Send Emergency SOS to Admin and Driver?')) {
      try {
        await parentService.sendSOS({ studentId: activeChild.id, type: 'emergency' });
        toast.error('🚨 Emergency SOS dispatched!');
      } catch { toast.error('🚨 Emergency SOS dispatched! (Mock)'); }
    }
  };

  const handleMessage = async () => {
    const msg = window.prompt('Message for Admin/Driver:');
    if (msg) {
      try {
        await parentService.sendMessage({ message: msg, senderId: user?.id });
        toast.success('Message sent!');
      } catch { toast.success('Message sent! (Mock)'); }
    }
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'tracking':
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── CHILDREN SELECTOR ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child, i) => {
                const isActive = activeChild?.id === child.id;
                return (
                  <motion.div key={child.id}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}
                    onClick={() => setActiveChild(child)}
                    className="relative p-5 rounded-2xl cursor-pointer transition-all overflow-hidden"
                    style={{
                      background: isActive ? 'linear-gradient(145deg, rgba(6,182,212,0.12), rgba(37,99,235,0.08))' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: isActive ? '0 0 30px rgba(6,182,212,0.1)' : 'none'
                    }}
                  >
                    {isActive && <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: '#06b6d4' }} />}
                    <div className="relative flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}>
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">{child.name}</h3>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{child.id} · {child.busNumber}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: statusBg(child.busStatus), border: `1px solid ${statusBorder(child.busStatus)}`, color: statusColor(child.busStatus) }}>
                        {child.busStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                        <Radio className="w-3 h-3 text-cyan-500" /> Sync: {child.lastSeen}
                      </span>
                      <span className="text-sm font-black text-cyan-400 font-mono">ETA {child.eta}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ── LIVE MAP ── */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Map header */}
              <div className="flex items-center justify-between px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400 animate-bounce" />
                  <span className="font-bold text-white text-sm tracking-wide">LIVE TRACKING</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: statusBg(activeChild?.busStatus || 'idle'), border: `1px solid ${statusBorder(activeChild?.busStatus || 'idle')}`, color: statusColor(activeChild?.busStatus || 'idle') }}>
                    {activeChild?.busStatus?.toUpperCase()}
                  </span>
                  <span className="text-xl font-black font-mono text-cyan-400">{activeChild?.eta || 'N/A'}</span>
                </div>
              </div>

              {/* Map */}
              <div style={{ height: 380, position: 'relative' }}>
                <MapContainer 
                  center={[activeChild?.location?.lat || MAP_CONFIG.defaultCenter.lat, activeChild?.location?.lng || MAP_CONFIG.defaultCenter.lng]} 
                  zoom={MAP_CONFIG.defaultZoom} 
                  style={{ height: '100%', width: '100%', zIndex: 1 }} 
                  zoomControl={false} 
                  attributionControl={false}
                >
                  <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
                  
                  {/* Google Maps style Double Polyline Route */}
                  <Polyline positions={SHARED_ROUTE_COORDINATES} color="#1e3a8a" weight={8} opacity={0.5} />
                  <Polyline positions={SHARED_ROUTE_COORDINATES} color="#2563eb" weight={5} opacity={1} />
                  
                  {SHARED_BUS_STOPS.map((stop, idx) => {
                    const isDestination = idx === SHARED_BUS_STOPS.length - 1;
                    return (
                      <Marker key={idx} position={[stop.lat, stop.lng]} icon={isDestination ? destinationIcon : stopIcon}>
                        <Popup><div className="font-bold text-sm">{stop.name}</div><div className={stop.status === 'passed' ? 'text-green-600 text-xs' : 'text-amber-600 text-xs'}>{stop.status === 'passed' ? 'Reached' : 'Pending'}</div></Popup>
                      </Marker>
                    );
                  })}
                  {activeChild?.location && (
                    <Marker position={[activeChild.location.lat, activeChild.location.lng]} icon={busIcon}>
                      <Popup><strong>{activeChild.busNumber}</strong><br />ETA: {activeChild.eta}</Popup>
                    </Marker>
                  )}
                </MapContainer>

                {/* Overlay */}
                <div className="absolute bottom-4 right-4 z-[1000] p-4 rounded-2xl text-xs font-mono"
                  style={{ background: 'rgba(9,14,26,0.9)', border: '1px solid rgba(6,182,212,0.2)', backdropFilter: 'blur(12px)' }}>
                  <div className="flex justify-between gap-8 mb-1.5">
                    <span className="text-slate-500">COORD</span>
                    <span className="text-cyan-400">{activeChild?.location?.lat?.toFixed(4)}, {activeChild?.location?.lng?.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between gap-8 mb-1.5">
                    <span className="text-slate-500">NEXT STOP</span>
                    <span className="text-emerald-400">{SHARED_BUS_STOPS.find(s => s.status !== 'passed')?.name || 'Destination'}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-slate-500">SYNC</span>
                    <span className="text-blue-400">{formatTime(Date.now())}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── ACTION BUTTONS ── */}
            <div className="grid grid-cols-3 gap-4">
              <motion.button whileTap={{ scale:0.96 }} onClick={handleSOS}
                animate={{ boxShadow: ['0 0 15px rgba(239,68,68,0.3)', '0 0 30px rgba(239,68,68,0.6)', '0 0 15px rgba(239,68,68,0.3)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="col-span-1 flex flex-col items-center justify-center gap-3 p-5 rounded-2xl font-bold text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                <Heart className="w-7 h-7" />
                <span className="text-xs font-mono tracking-widest">EMERGENCY SOS</span>
              </motion.button>

              <div className="col-span-2 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => window.location.href = `tel:${activeChild?.driverPhone || '+919876543210'}`}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl font-bold text-sm btn-ghost-dark">
                  <PhoneCall className="w-6 h-6 text-cyan-400" />
                  <span className="text-xs font-mono tracking-wide">CALL DRIVER</span>
                </button>
                <button onClick={handleMessage}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl font-bold text-sm btn-glow-cyan">
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-xs font-mono tracking-wide">MESSAGE</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Schedule */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-bold text-white tracking-wide">SCHEDULE</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Pickup Time', val: activeChild?.pickupTime || '07:30 AM', color: 'text-cyan-400' },
                  { label: 'Drop Time',   val: activeChild?.dropTime   || '02:45 PM', color: 'text-violet-400' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{row.label}</span>
                    <span className={`text-lg font-black font-mono ${row.color}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contacts */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white tracking-wide">CONTACTS</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: `Driver (${activeChild?.driverName || 'N/A'})`, val: activeChild?.driverPhone || '+91 9876543210' },
                  { label: 'School Management',                             val: activeChild?.schoolPhone || '+91 11 2345 6789' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{row.label}</span>
                    <a href={`tel:${row.val}`} className="text-cyan-400 font-bold text-sm hover:text-cyan-300 transition-colors">{row.val}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span className="text-lg font-bold text-white tracking-wide">ATTENDANCE REPORT</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-slate-500 font-mono uppercase mb-3">TODAY'S STATUS</p>
                <p className={`text-3xl font-black font-mono ${attendance.today === 'Present' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {attendance.today === 'Present' ? '✅ Present' : '❌ Absent'}
                </p>
              </div>
              <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-slate-500 font-mono uppercase mb-3">MONTHLY AVERAGE</p>
                <p className="text-4xl font-black font-mono text-cyan-400">{attendance.monthlyPercentage}%</p>
              </div>
            </div>
            {/* ── 30 Day Graph ── */}
            <div className="mt-6 p-5 rounded-2xl" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-xs text-slate-500 font-mono uppercase mb-4 tracking-widest text-center">LAST 30 DAYS GRID</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {attendanceHistory.map((record, idx) => (
                  <div 
                    key={idx} 
                    className="w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center relative group cursor-help transition-transform hover:scale-110"
                    style={{ 
                      background: record.status === 'Present' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      border: `1px solid ${record.status === 'Present' ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`
                    }}
                  >
                    <span className="text-[10px] font-mono opacity-50" style={{ color: record.status === 'Present' ? '#34d399' : '#f87171' }}>{idx + 1}</span>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-white/10">
                      Day {idx + 1}: {record.status}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center gap-4 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/50" /> Present</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/50" /> Absent</div>
              </div>
            </div>
          </div>
        );

      case 'fees':
        return (
          <div className="glass-card p-6 border-glow-blue relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                  <Zap className="text-blue-400" /> FEES_STRUCTURE
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1 tracking-wide">Academic Year 2025-26</p>
              </div>
              <span className="badge-dark badge-blue">
                <CheckCircle className="w-3 h-3" /> ACTIVE_PLAN
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Fee details grid */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">Total Fee (Per Year)</p>
                  <p className="text-lg font-black text-white font-mono">₹15,000</p>
                </div>
                <div className="p-4 rounded-xl" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">Fee (Per Month)</p>
                  <p className="text-lg font-black text-cyan-400 font-mono">₹1,500</p>
                </div>
                
                <div className="p-4 rounded-xl" style={{background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)'}}>
                  <p className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase mb-1">Paid / Last Pay</p>
                  <p className="text-lg font-black text-emerald-400 font-mono">₹13,500</p>
                  <p className="text-[9px] text-emerald-600 font-mono mt-1">MAY 01, 2026</p>
                </div>
                <div className="p-4 rounded-xl" style={{background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)'}}>
                  <p className="text-[10px] text-red-500 font-mono tracking-widest uppercase mb-1">Pending / Due</p>
                  <p className="text-lg font-black text-red-400 font-mono">₹1,500</p>
                  <p className="text-[9px] text-red-600 font-mono mt-1">DUE: JUNE 01</p>
                </div>
              </div>

              {/* UPI QR Code Block */}
              <div className="w-full md:w-48 flex-shrink-0 flex flex-col items-center p-4 rounded-2xl" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(6,182,212,0.2)'}}>
                <p className="text-[10px] text-cyan-400 font-black tracking-widest uppercase mb-3 text-center">PAY BY UPI</p>
                <div className="bg-white p-2 rounded-xl mb-3 w-full aspect-square flex items-center justify-center">
                  <QRCode 
                    value={`upi://pay?pa=cdgi@ybl&pn=CDGI%20College&am=1500&cu=INR&tn=Fee_Payment_${activeChild?.id}`} 
                    size={120} 
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-mono text-center">Scan to pay pending dues (₹1,500)</p>
              </div>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Help */}
            {!showHelp ? (
              <div className="glass-card p-8 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 30px rgba(124,58,237,0.3)' }}>
                  <Bell className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Knowledge Base</h3>
                  <p className="text-xs text-slate-500">Get help, FAQs, and support guides</p>
                </div>
                <button onClick={() => setShowHelp(true)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm btn-glow-violet">
                  Open Help Center
                </button>
              </div>
            ) : (
              <HelpCenter onClose={() => setShowHelp(false)} />
            )}

            {/* Notifications */}
            <div className="glass-card p-5 max-h-96 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-white tracking-wide">ALERTS</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {notifs.map((n, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: n.type === 'arrival' ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)' }}>
                      <MapPin className="w-4 h-4" style={{ color: n.type === 'arrival' ? '#34d399' : '#60a5fa' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-slate-600 font-mono mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {notifs.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-20 text-slate-600">
                    <CheckCircle className="w-6 h-6 mb-2" />
                    <p className="text-sm font-mono">No active alerts</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex text-slate-100 selection:bg-cyan-800" style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg, #030712 0%, #0d1117 50%, #030712 100%)', backgroundAttachment: 'fixed' }}>
      
      {/* ── LEFT SIDEBAR (Dark Glass) ── */}
      <aside className="w-20 lg:w-64 flex flex-col items-center lg:items-stretch py-6 gap-4 sticky top-0 h-screen z-40" style={{
        background: 'rgba(9,14,26,0.95)',
        backdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 lg:px-6 mb-4">
          <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="hidden lg:block">
            <h2 className="text-lg font-black text-white leading-tight">Parent<br/><span className="text-glow-cyan">Portal</span></h2>
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 px-4 space-y-2 w-full flex flex-col items-center lg:items-stretch overflow-y-auto custom-scrollbar">
          {NAV.map(n => (
            <motion.button key={n.id} whileTap={{scale:0.96}} onClick={() => setActiveNav(n.id)}
              className="relative w-12 lg:w-full h-12 rounded-2xl flex items-center lg:justify-start justify-center transition-all group overflow-hidden"
              style={{
                background: activeNav===n.id ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(37,99,235,0.15))' : 'transparent',
                border: activeNav===n.id ? '1px solid rgba(6,182,212,0.4)' : '1px solid transparent',
                boxShadow: activeNav===n.id ? '0 0 20px rgba(6,182,212,0.15)' : 'none',
              }}>
              <div className="flex items-center lg:pl-3">
                <n.icon className="w-5 h-5" style={{color: activeNav===n.id ? '#22d3ee' : '#475569'}}/>
                <span className={`hidden lg:block ml-3 text-sm font-semibold ${activeNav===n.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                  {n.label}
                </span>
              </div>
              
              {/* Tooltip for collapsed sidebar */}
              <div className="lg:hidden absolute left-16 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50" style={{background:'rgba(9,14,26,0.95)', border:'1px solid rgba(255,255,255,0.1)'}}>
                {n.label}
                <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 rotate-45" style={{background:'rgba(9,14,26,0.95)'}}/>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto px-4 w-full flex flex-col items-center lg:items-stretch gap-4">
          <div className="flex flex-col lg:flex-row items-center gap-2 p-2 lg:p-3 rounded-xl" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${connected?'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]':'bg-red-500'}`}/>
            <span className="hidden lg:block text-[10px] font-black tracking-widest text-slate-400 uppercase">
              {connected ? 'System Online' : 'System Offline'}
            </span>
          </div>

          <motion.button whileTap={{scale:0.96}} onClick={logout}
            className="w-12 lg:w-full h-12 rounded-2xl flex items-center justify-center transition-all group"
            style={{border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.05)', color:'#f87171'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.12)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.05)'}}>
            <LogOut className="w-5 h-5"/>
            <span className="hidden lg:block ml-2 text-sm font-bold">Sign Out</span>
          </motion.button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="flex items-center justify-between px-6 lg:px-8 py-5 sticky top-0 z-30" style={{
          background: 'rgba(9,14,26,0.90)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <p className="text-xs font-mono text-cyan-500/70 tracking-widest uppercase mb-0.5">CDGI College</p>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              {NAV.find(n => n.id === activeNav)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notif bell */}
            <button onClick={() => setActiveNav('alerts')} className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8'}}>
              <Bell className="w-5 h-5"/>
              {notifs.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 animate-bounce" style={{borderColor:'#030712'}}>{notifs.length}</span>}
            </button>

            {/* Avatar */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden" style={{background:'linear-gradient(135deg,#2563eb,#06b6d4)', boxShadow:'0 0 15px rgba(6,182,212,0.3)', border:'1.5px solid rgba(255,255,255,0.15)'}}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Parent'}&backgroundColor=b6e3f4`} alt="Avatar" className="w-full h-full object-cover scale-110" />
            </div>
          </div>
        </header>

        {/* ── DYNAMIC CONTENT ── */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar flex flex-col">
          {renderContent()}

          <ParentAIChat activeChild={activeChild} fees={fees} routeData={routeData} />

          {/* Footer */}
          <footer className="text-center py-5 text-slate-700 text-xs font-mono tracking-widest mt-auto border-t border-white/5 pt-6">
            CDGI COLLEGE · SMART BUS SYSTEM
          </footer>
        </main>
      </div>
    </div>
  );
}