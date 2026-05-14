import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiUser, FiKey, FiBell, FiShield, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { toast } from 'react-toastify';

export default function SettingsModule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Mocks
  const [profile, setProfile] = useState({ name: 'Admin User', email: 'admin@smartbus.com', phone: '+91 9876543210' });
  const [keys, setKeys] = useState({ maps: 'AIzaSyA...', sms: 'tw_test_123' });
  const [notifications, setNotifications] = useState({ emailAlerts: true, smsAlerts: false, pushAlerts: true, sosSound: true });
  const [roles, setRoles] = useState([
    { id: 1, name: 'Transport Manager', level: 'Sub Admin', status: 'Active' },
    { id: 2, name: 'Principal', level: 'Viewer', status: 'Active' }
  ]);

  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    toast.success('💾 Settings successfully saved!');
  };

  const tabs = [
    { id: 'profile', icon: FiUser, label: 'Admin Profile' },
    { id: 'roles', icon: FiShield, label: 'Role Management' },
    { id: 'api', icon: FiKey, label: 'API Keys' },
    { id: 'notifications', icon: FiBell, label: 'Notifications' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:z-auto`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <div className="p-4 bg-gray-800/80 border border-gray-700 rounded-2xl shadow-inner">
                <FiSettings className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-mono text-gray-100">System Configuration</h2>
                <p className="text-sm text-gray-500 font-mono mt-1">Manage admin settings, keys, and roles.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar Tabs */}
              <div className="w-full md:w-64 space-y-2">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-mono text-sm ${
                      activeTab === t.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' : 'text-gray-400 border border-transparent hover:bg-gray-900/80 hover:border-gray-800'
                    }`}>
                    <t.icon className={`w-5 h-5 ${activeTab === t.id ? 'animate-pulse' : ''}`} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Content Panel */}
              <div className="flex-1 bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
                <AnimatePresence mode="wait">
                  
                  {activeTab === 'profile' && (
                    <motion.div key="profile" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}>
                      <h3 className="text-lg font-bold text-gray-200 mb-6 font-mono flex items-center gap-2"><FiUser /> Profile Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1 block">Full Name</label>
                          <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} 
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-200 focus:outline-none focus:border-cyan-500" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1 block">Email Address</label>
                          <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} 
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-200 focus:outline-none focus:border-cyan-500" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1 block">Phone Number</label>
                          <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} 
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-200 focus:outline-none focus:border-cyan-500" />
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-gray-800">
                        <button onClick={handleSave} className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-6 py-2.5 rounded-xl font-mono font-bold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                          <FiSave /> Save Changes
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'roles' && (
                    <motion.div key="roles" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}>
                      <h3 className="text-lg font-bold text-gray-200 mb-6 font-mono flex items-center gap-2"><FiShield /> Role Management</h3>
                      <div className="space-y-3">
                        {roles.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-xl">
                            <div>
                              <p className="font-bold text-gray-200 text-sm font-mono">{r.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono uppercase">{r.level}</span>
                              </div>
                            </div>
                            <span className="text-xs text-emerald-500 font-mono bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{r.status}</span>
                          </div>
                        ))}
                      </div>
                      <button className="mt-6 w-full py-3 bg-gray-900 border border-gray-700 hover:border-cyan-500/50 text-gray-400 hover:text-cyan-400 rounded-xl font-mono text-sm border-dashed transition-all">
                        + Add Sub Admin
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'api' && (
                    <motion.div key="api" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}>
                      <h3 className="text-lg font-bold text-gray-200 mb-6 font-mono flex items-center gap-2"><FiKey /> Integration Keys</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1 flex items-center justify-between">
                            <span>Google Maps / OSM API Key</span>
                            <button onClick={() => setShowKey(!showKey)} className="text-cyan-500 hover:text-cyan-300">
                              {showKey ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </label>
                          <input type={showKey ? 'text' : 'password'} value={keys.maps} onChange={e => setKeys({...keys, maps: e.target.value})} 
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-200 focus:outline-none focus:border-cyan-500" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1 block">SMS Gateway Secret</label>
                          <input type={showKey ? 'text' : 'password'} value={keys.sms} onChange={e => setKeys({...keys, sms: e.target.value})} 
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-200 focus:outline-none focus:border-cyan-500" />
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-gray-800">
                        <button onClick={handleSave} className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-6 py-2.5 rounded-xl font-mono font-bold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                          <FiSave /> Save Keys
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'notifications' && (
                    <motion.div key="notifications" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}>
                      <h3 className="text-lg font-bold text-gray-200 mb-6 font-mono flex items-center gap-2"><FiBell /> Notification Preferences</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'emailAlerts', label: 'Email Alerts for SOS', desc: 'Receive immediate email when SOS is triggered.' },
                          { key: 'smsAlerts', label: 'SMS Backup', desc: 'Send SMS if push notification fails.' },
                          { key: 'pushAlerts', label: 'Dashboard Push Notifications', desc: 'Show toast popups inside the app.' },
                          { key: 'sosSound', label: 'SOS Audio Alarm', desc: 'Play loud siren sound on critical alerts.' }
                        ].map(n => (
                          <div key={n.key} className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-xl">
                            <div>
                              <p className="font-bold text-gray-200 text-sm font-mono">{n.label}</p>
                              <p className="text-xs text-gray-500 font-mono mt-0.5">{n.desc}</p>
                            </div>
                            <button onClick={() => setNotifications({...notifications, [n.key]: !notifications[n.key]})}
                              className={`w-12 h-6 rounded-full relative transition-colors ${notifications[n.key] ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                              <motion.div layout className={`w-4 h-4 bg-white rounded-full absolute top-1 ${notifications[n.key] ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                </AnimatePresence>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
