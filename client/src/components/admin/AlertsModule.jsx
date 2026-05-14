import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiAlertOctagon, FiClock, FiMessageSquare, FiPhoneCall, FiCheckCircle, FiShield, FiNavigation } from 'react-icons/fi';
import { FaBus, FaWrench } from 'react-icons/fa';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function AlertsModule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      // Mocking fetch or fetching from real if available
      const res = await axios.get('/api/alerts').catch(() => null);
      if (res?.data?.alerts) {
        setAlerts(res.data.alerts);
      } else {
        // Fallback mock
        setAlerts([
          { id: '1', type: 'SOS', severity: 'Critical', source: 'Student: Aarav Sharma', bus: 'MP-09', time: '10 mins ago', message: 'SOS button pressed from student app!', status: 'Active' },
          { id: '2', type: 'Breakdown', severity: 'High', source: 'Driver: Raj Singh', bus: 'MP-04', time: '25 mins ago', message: 'Engine overheated near Vijay Nagar stop.', status: 'Active' },
          { id: '3', type: 'Deviation', severity: 'Medium', source: 'System GPS', bus: 'DL-05', time: '1 hr ago', message: 'Bus deviated 2km from authorized route.', status: 'Resolved' },
        ]);
      }
    } catch (e) {
      toast.error('Failed to load alerts');
    }
  };

  const resolveAlert = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    toast.success('✅ Alert marked as resolved.');
  };

  const notifyDriver = (bus) => {
    toast.info(`📞 Calling driver of ${bus}...`);
  };

  const notifyParents = (bus) => {
    toast.success(`✉️ Emergency broadcast sent to all parents on ${bus}.`);
  };

  const filtered = alerts.filter(a => filter === 'All' || a.status === filter);

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Critical': return 'red';
      case 'High': return 'amber';
      case 'Medium': return 'yellow';
      default: return 'gray';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SOS': return <FiAlertOctagon className="w-6 h-6" />;
      case 'Breakdown': return <FaWrench className="w-5 h-5" />;
      default: return <FiNavigation className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:z-auto`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          
          {/* Header */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <FiAlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-mono text-gray-100">Mission Control</h2>
                <p className="text-xs text-gray-500 font-mono tracking-widest">{alerts.filter(a=>a.status==='Active').length} ACTIVE ALERTS</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-center">
              <select value={filter} onChange={e => setFilter(e.target.value)}
                className="bg-gray-950 border border-gray-800 text-gray-300 rounded-xl px-4 py-2 text-sm font-mono focus:outline-none focus:border-red-500 transition-colors">
                <option value="All">All Alerts</option>
                <option value="Active">Active</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <AnimatePresence>
              {filtered.map((alert, i) => {
                const color = getSeverityColor(alert.severity);
                const isActive = alert.status === 'Active';
                return (
                  <motion.div key={alert.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.95}} transition={{delay:i*0.05}}
                    className={`bg-gray-900/60 border rounded-2xl overflow-hidden transition-all ${
                      isActive ? `border-${color}-500/50 shadow-[0_0_20px_rgba(239,68,68,0.05)]` : 'border-gray-800 opacity-60'
                    }`}>
                    
                    <div className="p-5 flex flex-col sm:flex-row gap-5">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isActive ? `bg-${color}-500/10 text-${color}-500 border border-${color}-500/30 ${alert.severity==='Critical' ? 'animate-pulse' : ''}` : 'bg-gray-800 text-gray-500 border border-gray-700'
                      }`}>
                        {getIcon(alert.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border ${
                                isActive ? `bg-${color}-500/10 text-${color}-400 border-${color}-500/20` : 'bg-gray-800 text-gray-500 border-gray-700'
                              }`}>
                                {alert.severity} • {alert.type}
                              </span>
                              <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                <FiClock className="w-3 h-3" /> {alert.time}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-100">{alert.message}</h3>
                          </div>
                          
                          {isActive && (
                            <button onClick={() => resolveAlert(alert.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold transition-colors">
                              <FiCheckCircle className="w-3.5 h-3.5" /> Resolve
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-800/50">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 font-mono text-[10px] uppercase">Source:</span>
                            <span className="text-gray-300">{alert.source}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 font-mono text-[10px] uppercase">Bus:</span>
                            <span className="px-2 py-0.5 bg-gray-800 rounded font-mono text-gray-300 text-xs">{alert.bus}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {isActive && (
                        <div className="flex sm:flex-col gap-2 border-t sm:border-t-0 sm:border-l border-gray-800/50 pt-4 sm:pt-0 sm:pl-5">
                          <button onClick={() => notifyDriver(alert.bus)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-xs font-mono font-bold transition-colors">
                            <FiPhoneCall className="w-4 h-4" /> Driver
                          </button>
                          <button onClick={() => notifyParents(alert.bus)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl text-xs font-mono font-bold transition-colors">
                            <FiMessageSquare className="w-4 h-4" /> Parents
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filtered.length === 0 && (
              <div className="text-center py-20 border border-gray-800 border-dashed rounded-2xl bg-gray-900/30">
                <FiShield className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
                <h3 className="text-gray-300 font-bold font-mono">All Systems Nominal</h3>
                <p className="text-xs text-gray-500 mt-1 font-mono">No {filter.toLowerCase()} alerts found.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
