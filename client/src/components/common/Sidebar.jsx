import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiUsers, FiBarChart2, FiSettings, FiUser, FiLogOut, FiCpu, FiMapPin, FiMap, FiNavigation, FiAlertTriangle, FiDollarSign, FiTool } from 'react-icons/fi';
import { FaBus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    // Admin Routes
    { path: '/admin', label: 'Dashboard', icon: FiBarChart2, roles: ['admin'] },
    { path: '/admin/tracking', label: 'Live Tracking', icon: FiMapPin, roles: ['admin'] },
    { path: '/admin/students', label: 'Students', icon: FiUsers, roles: ['admin'] },
    { path: '/admin/drivers', label: 'Drivers', icon: FiUser, roles: ['admin'] },
    { path: '/admin/vehicles', label: 'Vehicles', icon: FaBus, roles: ['admin'] },
    { path: '/admin/routes', label: 'Routes', icon: FiMap, roles: ['admin'] },
    { path: '/admin/trips', label: 'Trips', icon: FiNavigation, roles: ['admin'] },
    { path: '/admin/alerts', label: 'Alerts', icon: FiAlertTriangle, roles: ['admin'] },
    { path: '/admin/fees', label: 'Fees', icon: FiDollarSign, roles: ['admin'] },
    { path: '/admin/maintenance', label: 'Maintenance', icon: FiTool, roles: ['admin'] },
    { path: '/admin/settings', label: 'Settings', icon: FiSettings, roles: ['admin'] },
    
    // Driver Routes
    { path: '/driver', label: 'Dashboard', icon: FiBarChart2, roles: ['driver'] },
    { path: '/driver/route', label: 'Modify Route', icon: FiMap, roles: ['driver'] }
  ];

  const handleLogout = () => {
    if (window.confirm('TERMINATE_SESSION?')) {
      logout();
    }
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div 
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : { x: 0 }} // On desktop it stays open, so we handle responsiveness with CSS classes mostly
        className={`fixed md:sticky top-0 left-0 h-screen w-80 bg-gray-950/80 backdrop-blur-2xl border-r border-gray-800/50 shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} custom-scrollbar`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800/50 bg-gray-950/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30">
              <FiCpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 tracking-wider">
                SmartBus
              </h2>
              <p className="text-cyan-500/80 text-xs font-mono tracking-widest uppercase">
                {user?.role === 'driver' ? 'Driver Terminal' : 'Admin Terminal'}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 shadow-inner">
            {user?.role === 'driver' && user?.photo ? (
              <img src={user.photo} alt="Driver" className="w-10 h-10 rounded-lg object-cover border border-emerald-500/30" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400 font-bold font-mono">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-semibold text-gray-200 text-sm font-mono">{user?.name}</div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map(({ path, label, icon: Icon, roles }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
            return roles.includes(user?.role) && (
              <Link 
                key={path}
                to={path}
                onClick={() => { if(window.innerWidth < 768) onClose(); }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-mono text-sm tracking-wide ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200 hover:border-gray-800 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'animate-pulse' : ''}`} />
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_currentColor]" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800/50 bg-gray-950/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all group font-mono text-sm tracking-widest"
          >
            <FiLogOut className="w-5 h-5 group-hover:-rotate-180 transition-transform" />
            <span className="font-medium">{user?.role === 'driver' ? 'LEAVE' : 'INITIATE_LOGOUT'}</span>
          </button>
          
          <div className="text-center mt-6 text-[10px] text-gray-600 font-mono flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            v1.0.0 // SECURE_CONN
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;