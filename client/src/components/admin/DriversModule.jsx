import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiUser, FiAlertOctagon, FiMessageSquare,
  FiMapPin, FiPhone, FiClock, FiX, FiNavigation, FiActivity, FiFileText
} from 'react-icons/fi';
import { FaBus, FaIdCard } from 'react-icons/fa';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { toast } from 'react-toastify';

import axios from 'axios';

export default function DriversModule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter]= useState('All');
  const [selected, setSelected]       = useState(null);
  const [tab, setTab]                 = useState('profile');
  const [showAdd, setShowAdd]         = useState(false);
  const [msgText, setMsgText]         = useState('');

  const [drivers, setDrivers]         = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);

  const [formData, setFormData] = useState({
    name: '', driverId: '', phone: '', license: '', experience: '', bus: ''
  });

  React.useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get('/api/drivers');
      const data = res.data;
      setDrivers(data);

      const counts = { 'Online': 0, 'On Trip': 0, 'Offline': 0 };
      data.forEach(d => {
        if (d.status === 'Online') counts['Online']++;
        else if (d.status === 'On Trip' || d.tripStatus === 'On Trip') counts['On Trip']++;
        else counts['Offline']++;
      });
      setStatusCounts([
        { status: 'Online', count: counts['Online'], color: 'emerald' },
        { status: 'On Trip', count: counts['On Trip'], color: 'cyan' },
        { status: 'Offline', count: counts['Offline'], color: 'gray' },
      ]);
    } catch (error) {
      toast.error('Failed to load drivers');
    }
  };

  const handleAddSubmit = async () => {
    try {
      await axios.post('/api/drivers', formData);
      toast.success('✅ Driver added successfully!');
      setShowAdd(false);
      fetchDrivers();
    } catch (error) {
      toast.error('❌ Error adding driver');
    }
  };

  const filtered = drivers.filter(d =>
    (statusFilter === 'All' || d.status === statusFilter || d.tripStatus === statusFilter) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || (d.driverId && d.driverId.includes(search)))
  );

  const handleCall = (d) => {
    toast.info(`📞 Calling driver ${d.name} at ${d.phone}...`);
  };

  const handleMsg = (d) => {
    if (!msgText.trim()) return;
    toast.success(`✅ Message sent to ${d.name}!`);
    setMsgText('');
  };

  const handleAssign = (d) => {
    toast.success(`🔄 Reassignment requested for ${d.name}!`);
  };

  const statusColor = (status) => status === 'Online' ? 'emerald' : status === 'Offline' ? 'gray' : 'cyan';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:z-auto`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 col-span-2 sm:col-span-1">
              <p className="text-3xl font-black font-mono text-blue-400">{drivers.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total Drivers</p>
            </motion.div>
            {statusCounts.map((s,i) => (
              <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                className={`bg-gray-900/70 border border-gray-800 rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full bg-${s.color}-500 ${s.status === 'Online' ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-mono text-gray-400">{s.status}</span>
                </div>
                <p className={`text-2xl font-black font-mono text-${s.color}-400`}>{s.count}</p>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-xl px-3 py-2 flex-1 min-w-48">
              <FiSearch className="w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search driver name or ID..."
                className="bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none w-full font-mono" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none">
              <option>All</option>
              <option>Online</option>
              <option>Offline</option>
              <option>On Trip</option>
            </select>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-xl text-sm font-mono font-bold transition-all">
              <FiPlus className="w-4 h-4" /> Add Driver
            </button>
          </div>

          {/* Table + Detail */}
          <div className="flex gap-4 flex-col lg:flex-row" style={{minHeight:'500px'}}>
            {/* Table */}
            <div className="flex-1 min-w-0 bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-950/50">
                      {['Driver', 'Contact', 'License', 'Assigned Bus', 'Status', 'Actions'].map((h,i) => (
                        <th key={i} className="px-4 py-3 text-left text-[10px] font-mono text-gray-500 tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d, i) => (
                      <motion.tr key={d.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                        onClick={() => setSelected(d)}
                        className={`border-b border-gray-800/50 cursor-pointer transition-colors hover:bg-gray-800/40 ${selected?.id === d.id ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {d.photo}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-100 text-sm">{d.name}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{d.driverId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-gray-300">{d.phone}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-gray-400">{d.license}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-lg">🚌 {d.bus}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs font-bold font-mono text-${statusColor(d.status)}-400 flex items-center gap-1`}>
                              <div className={`w-1.5 h-1.5 rounded-full bg-${statusColor(d.status)}-500 ${d.status === 'Online' ? 'animate-pulse' : ''}`} />
                              {d.status}
                            </span>
                            {d.tripStatus === 'On Trip' && (
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md inline-block w-max">
                                On Trip
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={e => {e.stopPropagation(); handleCall(d);}}
                              className="p-1.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-lg transition-all" title="Call">
                              <FiPhone className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={e => {e.stopPropagation(); setSelected(d); setTab('msg');}}
                              className="p-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all" title="Message">
                              <FiMessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-500 font-mono text-sm">No drivers found</div>
                )}
              </div>
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
              {selected && (
                <motion.div key={selected.id} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                  className="w-full lg:w-96 flex-shrink-0 bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-800 bg-gray-950/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold">{selected.photo}</div>
                      <div>
                        <p className="font-bold text-gray-100 text-sm">{selected.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-gray-500 font-mono">{selected.driverId}</p>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            selected.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}>{selected.status}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-400"><FiX /></button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-800">
                    {['profile','tracking','msg'].map(t => (
                      <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${tab===t ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-400'}`}>
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {tab === 'profile' && (
                      <>
                        <div className="p-6 space-y-6">
                
                          {/* DL Verification Block */}
                          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 shadow-inner">
                            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FiFileText className="text-cyan-400" /> License Verification</h4>
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                              <div className="w-32 h-20 bg-gray-900 border border-gray-700 border-dashed rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                {selected.licenseImage ? (
                                  <img src={selected.licenseImage} alt="DL Preview" className="w-full h-full object-cover opacity-80" />
                                ) : (
                                  <span className="text-[10px] text-gray-500 font-mono">No Image</span>
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-bold text-gray-200 font-mono">{selected.license || 'NOT UPLOADED'}</p>
                                <p className="text-xs text-gray-500 font-mono">Exp: {selected.licenseExpiry ? new Date(selected.licenseExpiry).toLocaleDateString() : 'N/A'}</p>
                                <div className="mt-2">
                                  {selected.dlStatus === 'Verified' ? (
                                     <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded font-mono">✅ VERIFIED</span>
                                  ) : (
                                     <button onClick={() => {
                                       setSelected({...selected, dlStatus: 'Verified'});
                                       setDrivers(drivers.map(d => d.id === selected.id ? {...d, dlStatus: 'Verified'} : d));
                                       toast.success('🛡️ Driver License Verified Successfully!');
                                     }} className="text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded font-mono border border-amber-500/30 transition-colors">⚠️ CLICK TO VERIFY</button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {[
                            {icon:FaIdCard,    label:'License',   val:selected.license},
                            {icon:FiClock,     label:'Experience',val:selected.experience},
                            {icon:FiPhone,     label:'Contact',   val:selected.phone},
                            {icon:FaBus,       label:'Assigned',  val:`Bus ${selected.bus}`},
                          ].map((r,i) => (
                            <div key={i} className="flex items-center gap-2.5 bg-gray-950/30 p-2.5 rounded-xl border border-gray-800/50">
                              <r.icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-500 font-mono">{r.label}</p>
                                <p className="text-xs text-gray-200 font-mono truncate">{r.val}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-800">
                          <p className="text-[10px] text-gray-500 font-mono tracking-widest mb-3">QUICK ACTIONS</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleCall(selected)}
                              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-gray-800/40 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all">
                              <FiPhone className="w-4 h-4 text-green-400" />
                              <span className="text-[10px] font-mono text-gray-300">Call Driver</span>
                            </button>
                            <button onClick={() => handleAssign(selected)}
                              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-gray-800/40 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all">
                              <FiUser className="w-4 h-4 text-cyan-400" />
                              <span className="text-[10px] font-mono text-gray-300">Reassign</span>
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-800">
                          <p className="text-[10px] text-gray-500 font-mono tracking-widest mb-3">ACTIVITY HISTORY</p>
                          <div className="space-y-2">
                            {selected.history.map((h,i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                <span className="text-xs text-gray-400 font-mono">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {tab === 'tracking' && (
                      <div className="space-y-4 h-full flex flex-col">
                        <div className="flex-shrink-0 space-y-3">
                          <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800">
                            <p className="text-[10px] text-gray-500 font-mono mb-1">Current Route</p>
                            <p className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                              <FiNavigation className="w-4 h-4" />
                              {selected.route}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800">
                              <p className="text-[10px] text-gray-500 font-mono mb-1">Current Stop</p>
                              <p className="text-xs font-bold text-gray-200 truncate">{selected.currentStop}</p>
                            </div>
                            <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800">
                              <p className="text-[10px] text-gray-500 font-mono mb-1">Next Stop</p>
                              <p className="text-xs font-bold text-gray-200 truncate">{selected.nextStop}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-950/50 rounded-xl border border-gray-800">
                            <div className="flex items-center gap-2">
                              <FiActivity className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-mono text-gray-400">Speed & Status</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold font-mono text-gray-200">{selected.speed}</p>
                              <p className="text-[10px] text-emerald-400 font-mono animate-pulse">{selected.tripStatus}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Map View */}
                        <div className="flex-1 min-h-[200px] mt-2 rounded-xl overflow-hidden border border-gray-700 relative">
                           {/* Live status badge */}
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-gray-950/90 backdrop-blur px-2 py-1 rounded-lg border border-cyan-500/30">
                              <span className={`w-1.5 h-1.5 rounded-full ${selected.tripStatus === 'On Trip' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                              <span className="text-[9px] font-mono text-cyan-400 tracking-widest">GPS LIVE</span>
                            </div>
                            <iframe
                              title="Driver Location"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.lng - 0.02}%2C${selected.lat - 0.02}%2C${selected.lng + 0.02}%2C${selected.lat + 0.02}&layer=mapnik&marker=${selected.lat}%2C${selected.lng}`}
                              style={{ width: '100%', height: '100%', border: 0, filter: 'invert(85%) hue-rotate(180deg) brightness(0.95) saturate(0.8)' }}
                              loading="lazy"
                              allowFullScreen
                            />
                        </div>
                      </div>
                    )}

                    {tab === 'msg' && (
                      <div className="space-y-3">
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest">QUICK MESSAGES</p>
                        {['Route diversion required','Traffic ahead, take alternate','Emergency: Stop bus immediately','Return to depot'].map((q,i) => (
                          <button key={i} onClick={() => setMsgText(q)}
                            className="w-full text-left text-xs text-gray-400 font-mono px-3 py-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 rounded-xl transition-colors">
                            {q}
                          </button>
                        ))}
                        <textarea value={msgText} onChange={e => setMsgText(e.target.value)}
                          placeholder="Type custom message for driver..."
                          rows={4}
                          className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 resize-none mt-2" />
                        <button onClick={() => handleMsg(selected)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs font-mono font-bold transition-all">
                          <FiMessageSquare className="w-4 h-4" /> Send Message
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Add Driver Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4">
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9}} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-blue-400 font-mono">➕ Add New Driver</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-gray-300"><FiX /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label:'Full Name',        ph:'Ramesh Singh',    field:'name', col:2},
                  {label:'Driver ID',        ph:'DRV-004',         field:'driverId', col:1},
                  {label:'Phone Number',     ph:'+91 9876543000',  field:'phone', col:1},
                  {label:'License Number',   ph:'MP09 DL 2020 XXX',field:'license', col:2},
                  {label:'Experience',       ph:'5 Years',         field:'experience', col:1},
                  {label:'Assign Bus',       ph:'MP-09',           field:'bus', col:1},
                ].map((f,i) => (
                  <div key={i} className={`${f.col===2?'col-span-2':''}`}>
                    <label className="text-[10px] text-gray-400 font-mono mb-1 block">{f.label}</label>
                    <input 
                      placeholder={f.ph} 
                      value={formData[f.field] || ''}
                      onChange={(e) => setFormData({...formData, [f.field]: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors" 
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAddSubmit}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 rounded-xl py-2.5 text-sm font-mono font-bold transition-all">
                  ✅ Add Driver
                </button>
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded-xl py-2.5 text-sm font-mono transition-all">
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
