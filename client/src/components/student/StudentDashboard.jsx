import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin, FiBell, FiUser, FiShield, FiLogOut, FiClock, FiCheckCircle, FiWifi, FiWifiOff, FiHome, FiAlertCircle, FiBookOpen, FiCreditCard, FiPhone } from 'react-icons/fi';
import { MdQrCode2, MdOutlineReportProblem, MdAnnouncement, MdSupportAgent, MdLibraryBooks } from 'react-icons/md';
import { FaBus, FaRoute, FaGamepad, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import QRCodeModal from './QRCodeModal';
import ReportForm from './ReportForm';
import NoticePanel from './NoticePanel';
import ContactAdmin from './ContactAdmin';
import QRCode from 'react-qr-code';
import { SHARED_ROUTE_COORDINATES, SHARED_BUS_STOPS } from '../../utils/constants';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
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

const MapMover = ({ pos }) => { const map = useMap(); useEffect(() => { map.setView(pos, map.getZoom()); }, [pos, map]); return null; };

const NAV = [
  { id: 'dashboard', icon: FiHome,        label: 'Dashboard' },
  { id: 'routes',    icon: FaRoute,       label: 'My Route' },
  { id: 'notices',   icon: MdAnnouncement,label: 'Notices' },
  { id: 'contacts',  icon: MdSupportAgent,label: 'Support' },
  { id: 'profile',   icon: FiUser,        label: 'Profile' },
];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { connected } = useSocketContext();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [busPos, setBusPos] = useState({ lat: 22.6393, lng: 75.8197 });
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState('Offline');
  const [showQR, setShowQR] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [notifCount] = useState(3);

  const attendanceHistory = useMemo(() => {
    const totalDays = 30;
    const presentCount = Math.round((98 / 100) * totalDays);
    return Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      status: i < presentCount ? 'Present' : 'Absent'
    })).sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {}, []);

  const trips = [
    { label: 'Upcoming', route: 'Route 7 – School Gate', time: '08:15 AM', dot: '#3b82f6', status: 'On Time' },
    { label: 'Recent', route: 'Route 7 – Home Stop', time: 'Yesterday 3:40 PM', dot: '#a855f7', status: 'Completed' },
  ];

  const routeCoordinates = SHARED_ROUTE_COORDINATES;
  const busStops = SHARED_BUS_STOPS;

  // Glass-dark Panel Style
  const panel3D = {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden'
  };

  const renderContent = () => {
    if (activeNav === 'notices') return <div className="p-4"><NoticePanel /></div>;
    if (activeNav === 'contacts') return <div className="p-4"><ContactAdmin /></div>;
    if (activeNav === 'profile') return (
      <div className="flex flex-col min-h-full">
        {/* Hero Banner */}
        <div className="relative h-48 overflow-hidden rounded-b-3xl" style={{background:'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0c4a6e 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
          {/* Decorative blobs */}
          <div className="absolute -top-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-2xl"/>
          <div className="absolute -bottom-10 right-10 w-52 h-52 bg-cyan-400/10 rounded-full blur-3xl"/>
          <div className="absolute top-4 right-1/3 w-20 h-20 bg-blue-400/10 rounded-full blur-xl"/>
          <div className="absolute inset-0 flex items-center px-8 gap-6 z-10">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.3)] flex-shrink-0" style={{background: 'linear-gradient(135deg,#2563eb,#06b6d4)', border:'2px solid rgba(255,255,255,0.2)'}}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Student'}&backgroundColor=b6e3f4`} alt="Avatar" className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white leading-tight tracking-tight">{user?.name || 'Student'}</h2>
              <span className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full text-xs font-bold font-mono" style={{background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)'}}>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"/>
                CDGI Scholar · Active
              </span>
            </div>
          </div>
        </div>

        {/* Content below banner */}
        <div className="flex-1 p-6 space-y-6">

          {/* Info Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Student ID', val: user?.studentId || 'STU-2024-001', color: 'text-blue-400' },
              { label: 'Bus Number', val: user?.busId || 'BUS-15', color: 'text-violet-400' },
              { label: 'Route',      val: 'Route 7', color: 'text-emerald-400' },
              { label: 'Phone',      val: user?.phone || 'N/A', color: 'text-cyan-400' }
            ].map((info, idx) => (
              <div key={idx} className="glass-card p-4">
                <p className={`text-[10px] ${info.color} font-black tracking-widest uppercase mb-1`}>{info.label}</p>
                <p className="text-white font-black font-mono text-sm">{info.val}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 space-y-6">
              {/* Attendance Banner */}
              <div className="glass-card-glow p-6 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-xl"/>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <FiCheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black tracking-widest uppercase text-emerald-400">Attendance</p>
                    <p className="text-2xl font-black text-white font-mono">98%</p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex flex-wrap gap-1.5">
                    {attendanceHistory.map((record, idx) => (
                      <div 
                        key={idx} 
                        className="w-6 h-6 rounded flex items-center justify-center relative group"
                        style={{ 
                          background: record.status === 'Present' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                          border: `1px solid ${record.status === 'Present' ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`
                        }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-black/80 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {record.status}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-3 text-[9px] font-mono text-slate-500">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-emerald-500/20 border border-emerald-500/50" /> Present</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-500/20 border border-red-500/50" /> Absent</div>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-3 tracking-wide">Excellent! Keep it up 🎉</p>
              </div>

              {/* Logout */}
              <button onClick={() => logout()} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm transition-all" style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.15)'}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.1)'}}>
                <FiLogOut className="w-4 h-4"/> Terminate Session
              </button>
            </div>

            {/* Detailed Fees Structure */}
            <div className="xl:col-span-2 glass-card p-6 border-glow-blue relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                    <FiCreditCard className="text-blue-400" /> FEES_STRUCTURE
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 tracking-wide">Academic Year 2025-26</p>
                </div>
                <span className="badge-dark badge-blue">
                  <FiCheckCircle className="w-3 h-3" /> ACTIVE_PLAN
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
                      value="upi://pay?pa=cdgi@ybl&pn=CDGI%20College&am=1500&cu=INR" 
                      size={120} 
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono text-center">Scan to pay pending dues (₹1,500)</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
    if (activeNav === 'routes') return (
      <div className="p-4 space-y-4">
        <h3 className="text-slate-800 font-black font-mono text-xl px-2">QUEST LOG (TRIPS)</h3>
        {trips.map((t, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-lg" style={{borderBottom:'4px solid #e5e7eb'}}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:t.dot, boxShadow:`0 0 10px ${t.dot}`}}/>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.label}</p>
              <p className="text-slate-800 font-black text-sm">{t.route}</p>
              <p className="text-slate-500 text-xs font-bold">{t.time}</p>
            </div>
            <span className="text-[10px] font-black px-3 py-1.5 rounded-full" style={{
              background: t.status === 'On Time' ? '#ecfdf5' : '#f5f3ff',
              color: t.status === 'On Time' ? '#10b981' : '#8b5cf6',
              border: `1px solid ${t.status === 'On Time' ? '#a7f3d0' : '#ddd6fe'}`
            }}>{t.status}</span>
          </div>
        ))}
      </div>
    );

    // DASHBOARD (default)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 pb-24">
        {/* LEFT COLUMN: Map & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stop Alert Banner */}
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl shadow-sm flex items-center gap-4 animate-pulse relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"/>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <FiAlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-wide">Approaching Union Square!</p>
              <p className="text-xs font-bold text-amber-600/80">ETA: {eta === 'Offline' ? '2 Mins' : eta} • Prepare to board</p>
            </div>
          </div>

          {/* Live Bus Tracking - 3D Gaming Console */}
          <div className="flex flex-col relative" style={panel3D}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600 to-blue-500 text-white">
              <div className="flex items-center gap-2">
                <FaGamepad className="w-5 h-5 animate-bounce"/>
                <span className="font-black font-mono text-sm tracking-wider">LIVE RADAR</span>
              </div>
              <div className="flex items-center gap-3 bg-black/20 px-3 py-1 rounded-full backdrop-blur">
                <span className="font-mono text-xs font-bold text-cyan-200">{speed} km/h</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
              </div>
            </div>

            {/* 3D Map container */}
            <div className="relative flex-1 min-h-[350px] bg-slate-100 z-0 overflow-hidden">
              <MapContainer center={[busPos.lat, busPos.lng]} zoom={15} style={{ height: '350px', width: '100%', zIndex: 1 }} zoomControl={true} scrollWheelZoom={true} dragging={true} attributionControl={false}>
                <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
                
                {/* Google Maps style Double Polyline Route */}
                <Polyline positions={routeCoordinates} color="#1e3a8a" weight={8} opacity={0.5} />
                <Polyline positions={routeCoordinates} color="#2563eb" weight={5} opacity={1} />
                
                {busStops.map((stop, index) => {
                   const isDestination = index === busStops.length - 1;
                   return (
                     <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={isDestination ? destinationIcon : stopIcon}>
                       <Popup>{stop.name}</Popup>
                     </Marker>
                   );
                })}
                <Marker position={[busPos.lat, busPos.lng]} icon={busIcon}>
                  <Popup><b>🚌 Your Ride</b><br/>Speed: {speed} km/h</Popup>
                </Marker>
                <MapMover pos={[busPos.lat, busPos.lng]} />
              </MapContainer>

              {/* Map overlay info 3D style */}
              <div className="absolute bottom-4 left-4 z-[1000] px-4 py-3 bg-white rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1),_0_2px_0_#d1d5db] border-2 border-slate-100">
                <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">ETA TO TARGET</p>
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 font-mono leading-none">{eta}</p>
              </div>
              <div className="absolute bottom-4 right-4 z-[1000] px-4 py-3 bg-white rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1),_0_2px_0_#d1d5db] border-2 border-slate-100">
                <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">BUS 15 – ROUTE 7</p>
                <p className="text-sm font-black text-slate-800 font-mono">Union Square</p>
              </div>
            </div>

            {/* Bus info strip */}
            <div className="grid grid-cols-3 divide-x divide-slate-200 px-0 py-4 bg-white border-t border-slate-100">
              {[
                { label:'Current Stop', value:'Sector 14', color:'text-cyan-500' },
                { label:'Arrival Time', value:eta, color:'text-emerald-500' },
                { label:'Passengers', value:'18/45', color:'text-violet-500' },
              ].map((s,i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.label}</p>
                  <p className={`text-base font-black font-mono ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions (3D Buttons) */}
          <div>
            <p className="text-xs text-slate-400 font-black tracking-widest uppercase mb-3 px-2">QUICK ACTIONS</p>
            <div className="grid grid-cols-3 gap-4 px-2">
              {[
                { label:'Scan QR Pass', icon: MdQrCode2, bg:'bg-violet-100 text-violet-600 border-violet-200', action: () => setShowQR(true) },
                { label:'Report Issue', icon: MdOutlineReportProblem, bg:'bg-orange-100 text-orange-600 border-orange-200', action: () => setShowReport(true) },
                { label:'Emergency', icon: FiAlertCircle, bg:'bg-red-100 text-red-600 border-red-200', action: () => setActiveNav('contacts') },
              ].map((a, i) => (
                <motion.button key={i} whileTap={{scale:0.95, translateY:4}} onClick={a.action}
                  className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl ${a.bg} border-b-4 shadow-sm hover:shadow-md transition-all`}>
                  <a.icon className="w-8 h-8"/>
                  <span className="text-[10px] font-black tracking-wide text-center leading-tight">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        
        {/* RIGHT COLUMN: Info */}
        <div className="space-y-6">
          
          {/* Gamer ID & Pass (3D Card) */}
          <div className="p-5 relative overflow-hidden" style={panel3D}>
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/40 text-white transform -rotate-6">
                <FiShield className="w-7 h-7 transform rotate-6"/>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                  <span className="text-emerald-500 text-[10px] font-black tracking-widest uppercase">ELITE SCHOLAR</span>
                </div>
                <p className="text-slate-800 font-black text-lg leading-tight">{user?.name || 'Student'} <span className="text-violet-500 text-xs align-top inline-block ml-1">Lv.14</span></p>
                <p className="text-slate-500 text-[10px] font-mono mt-1 font-bold">ID: {user?.studentId || 'STU-2024-001'} • Mar 2025</p>
              </div>
            </div>
            
            <div className="bg-slate-100 p-3 rounded-xl border-2 border-white shadow-inner flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-black tracking-widest">XP LOG</p>
                <div className="h-2 w-24 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 w-[85%]"/>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-black tracking-widest">STREAK</p>
                <p className="text-lg font-black text-amber-500 font-mono">🔥 14</p>
              </div>
            </div>
          </div>

          {/* Live Route Navigations */}
          <div className="p-5" style={panel3D}>
            <div className="flex items-center gap-2 mb-4">
              <FaRoute className="text-blue-500 w-5 h-5" />
              <p className="text-xs text-slate-800 font-black tracking-widest uppercase">LIVE NAVIGATION</p>
            </div>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {busStops.map((stop, i) => (
                <div key={i} className="relative flex items-center justify-between group is-active pl-12">
                  <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-white ${stop.status === 'passed' ? 'bg-slate-300' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'} flex items-center justify-center z-10`}>
                    {stop.status === 'passed' ? <FiCheckCircle className="text-white w-5 h-5" /> : <FiMapPin className="text-white w-5 h-5" />}
                  </div>
                  <div className={`w-full p-4 rounded-xl border border-slate-100 shadow-sm ${stop.status === 'passed' ? 'bg-slate-50' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-black text-sm ${stop.status === 'passed' ? 'text-slate-500' : 'text-slate-800'}`}>{stop.name}</h4>
                      <span className={`text-xs font-black px-2 py-1 rounded-full ${stop.status === 'passed' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>{stop.eta}</span>
                    </div>
                    {stop.status !== 'passed' && (
                      <p className="text-xs text-slate-500 font-bold mt-1">Turn-by-turn: Head north on main road.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fees Status */}
          <div className="p-5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl shadow-[0_15px_30px_rgba(16,185,129,0.3)] text-white relative overflow-hidden" style={{border:'2px solid rgba(255,255,255,0.4)'}}>
            <div className="absolute -right-8 -top-8 opacity-20">
              <FiCreditCard className="w-32 h-32"/>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black tracking-widest uppercase text-emerald-100 mb-1">FEES STATUS</p>
              <h3 className="text-3xl font-black font-mono mb-2">₹0.00</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full backdrop-blur border border-white/30 text-xs font-bold">
                <FiCheckCircle className="w-3.5 h-3.5"/> All dues cleared!
              </div>
            </div>
          </div>

        </div> {/* Close RIGHT COLUMN */}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-100 selection:bg-cyan-800" style={{
      fontFamily: "'Inter', sans-serif",
      background: 'linear-gradient(135deg, #030712 0%, #0d1117 50%, #030712 100%)',
      backgroundAttachment: 'fixed'
    }}>

      {/* LEFT SIDEBAR (Dark Glass) */}
      <aside className="w-20 flex flex-col items-center py-6 gap-4 sticky top-0 h-screen z-40" style={{
        background: 'rgba(9,14,26,0.95)',
        backdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Logo */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{
          background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
          boxShadow: '0 0 20px rgba(6,182,212,0.4)'
        }}>
          <FaGraduationCap className="w-6 h-6 text-white"/>
        </div>

        {NAV.map(n => (
          <motion.button key={n.id} whileTap={{scale:0.9}} onClick={() => setActiveNav(n.id)}
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all group"
            style={{
              background: activeNav===n.id ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(37,99,235,0.15))' : 'transparent',
              border: activeNav===n.id ? '1px solid rgba(6,182,212,0.4)' : '1px solid transparent',
              boxShadow: activeNav===n.id ? '0 0 20px rgba(6,182,212,0.15)' : 'none',
            }}>
            <n.icon className="w-5 h-5" style={{color: activeNav===n.id ? '#22d3ee' : '#475569'}}/>
            {/* Tooltip */}
            <div className="absolute left-16 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50" style={{background:'rgba(9,14,26,0.95)', border:'1px solid rgba(255,255,255,0.1)'}}>
              {n.label}
              <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 rotate-45" style={{background:'rgba(9,14,26,0.95)'}}/>
            </div>
          </motion.button>
        ))}

        {/* Spacer */}
        <div className="flex-1"/>

        {/* Connection dot */}
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
          <div className={`w-3 h-3 rounded-full ${connected?'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]':'bg-red-500'}`}/>
          <span className="text-[9px] font-black tracking-widest" style={{color:'#475569'}}>{connected?'ON':'OFF'}</span>
        </div>

        {/* Logout */}
        <motion.button whileTap={{scale:0.9}} onClick={() => logout()}
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
          style={{border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.05)', color:'#f87171'}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.12)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.05)'}}>
          <FiLogOut className="w-5 h-5"/>
        </motion.button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP HEADER */}
        <header className="flex items-center justify-between px-8 py-5 sticky top-0 z-30" style={{
          background: 'rgba(9,14,26,0.90)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <p className="text-xs font-mono text-cyan-500/70 tracking-widest uppercase mb-0.5">CDGI College</p>
            <h1 className="text-xl font-black text-white tracking-tight">
              {activeNav === 'dashboard' ? 'Student Dashboard' :
               activeNav === 'routes'    ? 'My Route' :
               activeNav === 'notices'   ? 'Notices' :
               activeNav === 'contacts'  ? 'Support' : 'Profile'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Welcome, <span className="text-cyan-400 font-semibold">{user?.name?.split(' ')[0] || 'Student'}!</span></p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notif bell */}
            <button className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8'}}>
              <FiBell className="w-5 h-5"/>
              {notifCount>0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 animate-bounce" style={{borderColor:'#030712'}}>{notifCount}</span>}
            </button>

            {/* Avatar */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden" style={{background:'linear-gradient(135deg,#2563eb,#06b6d4)', boxShadow:'0 0 15px rgba(6,182,212,0.3)', border:'1.5px solid rgba(255,255,255,0.15)'}}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Student'}&backgroundColor=b6e3f4`} alt="Avatar" className="w-full h-full object-cover scale-110" />
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto flex flex-col" style={{scrollbarWidth:'none'}}>
          <AnimatePresence mode="wait">
            <motion.div key={activeNav}
              initial={{opacity:0, scale:0.98, y:10}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.98, y:-10}}
              transition={{duration:0.2, type:'spring', bounce:0.3}}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
          
          {/* Footer added for consistency */}
          <footer className="text-center py-5 text-slate-700 text-xs font-mono tracking-widest mt-auto" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            CDGI COLLEGE · SMART BUS SYSTEM
          </footer>
        </div>
      </div>

      {/* QR MODAL */}
      <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} />

      {/* REPORT BOTTOM SHEET */}
      <AnimatePresence>
        {showReport && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowReport(false)}/>
            <motion.div className="relative z-10 w-full max-w-lg rounded-t-[32px] overflow-hidden bg-white shadow-2xl border-t border-slate-200"
              initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',stiffness:300,damping:30}}>
              <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50">
                <span className="text-base font-black text-slate-800 tracking-tight">REPORT AN ISSUE</span>
                <button onClick={() => setShowReport(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors">×</button>
              </div>
              <ReportForm onClose={() => setShowReport(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}