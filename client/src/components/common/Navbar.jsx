import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiUser, FiAlertOctagon } from 'react-icons/fi';
import { HiMenuAlt2 } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const pageTitles = {
  '/admin': 'Main Dashboard',
  '/admin/tracking': 'Live Tracking',
  '/admin/students': 'Students',
  '/admin/drivers': 'Drivers',
  '/admin/vehicles': 'Vehicles',
  '/admin/routes': 'Routes',
  '/admin/trips': 'Trips',
  '/admin/alerts': 'Alerts',
  '/admin/fees': 'Fees',
  '/admin/maintenance': 'Maintenance',
  '/admin/settings': 'Settings',
};

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocketContext();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  const handleSOS = () => {
    toast.error('🚨 SOS ALERT SENT TO ALL ADMINS!', { autoClose: false, position: 'top-center' });
  };

  return (
    <nav className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-5 py-3">

        {/* LEFT: Menu toggle + Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 text-cyan-400 hover:bg-gray-900 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30"
            id="menu-toggle-btn"
          >
            <HiMenuAlt2 className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 tracking-tight leading-none">
              {pageTitle}
            </h1>
            <p className="text-[10px] text-cyan-500/60 font-mono tracking-widest uppercase">SmartBus Admin</p>
          </div>
        </div>

        {/* RIGHT: Notifications + SOS + Profile */}
        <div className="flex items-center gap-3">

          {/* Notifications */}
          <div className="relative">
            <button
              id="notif-btn"
              onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
              className="relative p-2.5 text-gray-400 hover:text-cyan-400 transition-colors bg-gray-900/50 rounded-xl border border-gray-800 hover:border-cyan-500/30"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-gray-950 rounded-full animate-pulse" />
              )}
            </button>
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-200 font-mono">NOTIFICATIONS</span>
                    {unreadCount > 0 && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">{unreadCount} new</span>}
                  </div>
                  <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                    {unreadCount === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4 font-mono">No new notifications</p>
                    ) : null}
                    {[{ msg: 'Bus MP-09 fuel low', time: '2m ago', color: 'text-amber-400' },
                      { msg: 'Student Aarav boarded', time: '5m ago', color: 'text-emerald-400' },
                      { msg: 'Route deviation detected', time: '12m ago', color: 'text-red-400' }
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.color.replace('text-', 'bg-')}`} />
                        <div>
                          <p className={`text-xs font-medium ${n.color}`}>{n.msg}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SOS Button */}
          <motion.button
            id="sos-btn"
            onClick={handleSOS}
            whileTap={{ scale: 0.93 }}
            animate={{ boxShadow: ['0 0 12px rgba(239,68,68,0.4)', '0 0 24px rgba(239,68,68,0.7)', '0 0 12px rgba(239,68,68,0.4)'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm border border-red-400/50 transition-colors"
          >
            <FiAlertOctagon className="w-4 h-4" />
            <span className="font-mono tracking-widest">SOS</span>
          </motion.button>

          {/* Admin Profile */}
          <div className="relative">
            <button
              id="profile-btn"
              onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
              className="flex items-center gap-2.5 pl-3 pr-4 py-2 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-cyan-500/30 rounded-xl transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-gray-200 font-mono leading-none">{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-cyan-500/70 font-mono tracking-widest uppercase">{user?.role}</div>
              </div>
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-800">
                    <p className="text-sm font-bold text-gray-200">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors">
                      <FiUser className="w-4 h-4" /> Profile
                    </button>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                    >
                      <FiAlertOctagon className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;