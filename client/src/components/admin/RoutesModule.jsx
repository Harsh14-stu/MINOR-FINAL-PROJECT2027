import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiMap, FiClock, FiX, FiCheckCircle, FiCircle,
  FiMapPin, FiNavigation, FiActivity, FiUser
} from 'react-icons/fi';
import { FaBus } from 'react-icons/fa';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { toast } from 'react-toastify';

import axios from 'axios';

export default function RoutesModule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState(null);
  const [showAdd, setShowAdd]         = useState(false);
  
  const [routes, setRoutes]           = useState([]);
  const [formData, setFormData] = useState({
    name: '', bus: 'MP-09', driver: 'Amit Kumar', stops: [{ name: '', time: '' }]
  });

  React.useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await axios.get('/api/routes');
      setRoutes(res.data);
    } catch (error) {
      toast.error('Failed to load routes');
    }
  };

  const handleAddSubmit = async () => {
    try {
      const payload = {
        ...formData,
        routeId: `RT-0${routes.length + 1}`,
        status: 'Active',
        progress: 0,
        stops: formData.stops.map(s => ({ ...s, completed: false }))
      };
      await axios.post('/api/routes', payload);
      toast.success('🗺️ Route successfully added and assigned!');
      setShowAdd(false);
      fetchRoutes();
    } catch (error) {
      toast.error('❌ Error adding route');
    }
  };

  const filtered = routes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    (r.routeId && r.routeId.includes(search)) || 
    r.bus.includes(search)
  );

  const statusColor = (status) => status === 'Active' ? 'emerald' : 'gray';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:z-auto`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          
          {/* Header Controls */}
          <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <FiMap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-mono text-gray-100">Route Management</h2>
                <p className="text-xs text-gray-500 font-mono tracking-widest">{routes.length} TOTAL ROUTES</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-center flex-1 justify-end">
              <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 w-64">
                <FiSearch className="w-4 h-4 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search route, ID or bus..."
                  className="bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none w-full font-mono" />
              </div>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 rounded-xl text-sm font-mono font-bold transition-all">
                <FiPlus className="w-4 h-4" /> Add Route
              </button>
            </div>
          </div>

          {/* Main Layout */}
          <div className="flex gap-4 flex-col xl:flex-row" style={{minHeight:'600px'}}>
            
            {/* Routes List (Left) */}
            <div className="flex-1 min-w-0 space-y-3">
              {filtered.map((route, i) => (
                <motion.div key={route.routeId || route._id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:i*0.05}}
                  onClick={() => setSelected(route)}
                  className={`bg-gray-900/60 border cursor-pointer transition-all rounded-2xl overflow-hidden hover:border-purple-500/40 ${selected?.routeId === route.routeId ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-gray-800'}`}>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-inner ${
                        route.status === 'Active' ? 'bg-gradient-to-br from-emerald-600 to-teal-500' : 'bg-gradient-to-br from-gray-700 to-gray-600'
                      }`}>
                        {route.routeId?.split('-')[1]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-100 text-sm mb-1">{route.name}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                            <FaBus className="w-3 h-3" /> {route.bus}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                            <FiUser className="w-3 h-3 text-gray-500" /> {route.driver}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`flex items-center gap-1.5 justify-end mb-1 ${route.status === 'Active' ? 'text-emerald-400' : 'text-gray-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${route.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                        <span className="text-xs font-bold font-mono tracking-wider uppercase">{route.status}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono">{route.stops.length} STOPS</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1 bg-gray-950 w-full relative">
                    <motion.div initial={{width:0}} animate={{width:`${route.progress}%`}} transition={{duration:1}}
                      className={`absolute top-0 left-0 h-full ${route.status === 'Active' ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-gray-600'}`} />
                  </div>
                </motion.div>
              ))}
              
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500 font-mono text-sm border border-dashed border-gray-800 rounded-2xl">
                  No routes match your search.
                </div>
              )}
            </div>

            {/* Route Detail & Live Progress (Right) */}
            <AnimatePresence>
              {selected ? (
                <motion.div key={selected.routeId} initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}}
                  className="w-full xl:w-[450px] flex-shrink-0 bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                  
                  {/* Map Preview */}
                  <div className="h-48 relative border-b border-gray-800 bg-gray-950">
                    <div className="absolute top-3 left-3 z-10 bg-gray-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-700/50 shadow-xl">
                      <p className="text-[10px] text-gray-400 font-mono">Current Route</p>
                      <p className="text-xs font-bold text-purple-400 flex items-center gap-1.5 mt-0.5">
                        <FiNavigation className="w-3.5 h-3.5" /> {selected.routeId}
                      </p>
                    </div>
                    {selected.status === 'Active' && (
                       <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-emerald-500/10 backdrop-blur px-2.5 py-1 rounded-md border border-emerald-500/30">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                         <span className="text-[9px] text-emerald-400 font-mono tracking-widest">LIVE GPS</span>
                       </div>
                    )}
                    <iframe
                      title="Route Map"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.lng - 0.05}%2C${selected.lat - 0.05}%2C${selected.lng + 0.05}%2C${selected.lat + 0.05}&layer=mapnik&marker=${selected.lat}%2C${selected.lng}`}
                      style={{ width: '100%', height: '100%', border: 0, filter: 'invert(85%) hue-rotate(180deg) brightness(0.95) saturate(0.8)' }}
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>

                  {/* Route Info */}
                  <div className="p-4 border-b border-gray-800 bg-gray-950/40">
                    <h3 className="text-lg font-bold text-gray-100">{selected.name}</h3>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-2.5 flex items-center gap-3">
                        <FaBus className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-[10px] text-gray-500 font-mono">ASSIGNED BUS</p>
                          <p className="text-xs font-bold text-gray-200">{selected.bus}</p>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-2.5 flex items-center gap-3">
                        <FiUser className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="text-[10px] text-gray-500 font-mono">DRIVER</p>
                          <p className="text-xs font-bold text-gray-200">{selected.driver}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stops List */}
                  <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest mb-4">LIVE PROGRESS & STOPS</p>
                    
                    <div className="relative pl-3 space-y-6">
                      {/* Vertical tracking line */}
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-800" />
                      
                      {selected.stops.map((stop, i) => (
                        <div key={i} className="relative flex items-start gap-4">
                          {/* Marker */}
                          <div className={`relative z-10 w-3 h-3 rounded-full mt-1 border-2 bg-gray-950 ${
                            stop.completed ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                            (selected.status === 'Active' && i > 0 && selected.stops[i-1].completed && !stop.completed) ? 'border-cyan-400 animate-pulse' : 'border-gray-600'
                          }`} />
                          
                          {/* Content */}
                          <div className={`flex-1 p-3 rounded-xl border transition-all ${
                             stop.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 
                             (selected.status === 'Active' && i > 0 && selected.stops[i-1].completed && !stop.completed) ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-gray-900/50 border-gray-800'
                          }`}>
                            <div className="flex justify-between items-center mb-1">
                              <p className={`text-sm font-bold ${stop.completed ? 'text-gray-200' : 'text-gray-400'}`}>{stop.name}</p>
                              {stop.completed ? (
                                <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <FiClock className={`w-3.5 h-3.5 ${selected.status === 'Active' && i > 0 && selected.stops[i-1].completed && !stop.completed ? 'text-cyan-400 animate-pulse' : 'text-gray-600'}`} />
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-gray-500">{stop.completed ? 'Reached at' : 'Estimated'} {stop.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </motion.div>
              ) : (
                <div className="hidden xl:flex w-[450px] flex-shrink-0 bg-gray-900/30 border border-gray-800/50 border-dashed rounded-2xl items-center justify-center p-8 text-center">
                  <div>
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiMap className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-gray-400 font-bold mb-1">No Route Selected</h3>
                    <p className="text-xs text-gray-600 font-mono">Select a route from the list to view its live progress and map details.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Add Route Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{scale:0.95,y:10}} animate={{scale:1,y:0}} exit={{scale:0.95}} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-purple-400 font-mono flex items-center gap-2"><FiMap /> Add New Route</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-gray-300"><FiX /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-mono mb-1 block uppercase">Route Name</label>
                  <input 
                    placeholder="e.g. City Center → School" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono mb-1 block uppercase">Assign Bus</label>
                    <select 
                      value={formData.bus}
                      onChange={e => setFormData({...formData, bus: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 text-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors">
                      <option>MP-09</option>
                      <option>MP-04</option>
                      <option>DL-05</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono mb-1 block uppercase">Assign Driver</label>
                    <select 
                      value={formData.driver}
                      onChange={e => setFormData({...formData, driver: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 text-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors">
                      <option>Amit Kumar</option>
                      <option>Raj Singh</option>
                      <option>Suresh V.</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-gray-400 font-mono uppercase">Stops List</label>
                    <button 
                      onClick={() => setFormData({...formData, stops: [...formData.stops, { name: '', time: '' }]})}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-mono font-bold">+ ADD STOP</button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.stops.map((stop, index) => (
                      <div key={index} className="flex gap-2 items-center bg-gray-950 p-2 rounded-xl border border-gray-800">
                        <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-500">{index + 1}</div>
                        <input 
                          placeholder={`Stop ${index + 1} Name`} 
                          value={stop.name}
                          onChange={(e) => {
                            const newStops = [...formData.stops];
                            newStops[index].name = e.target.value;
                            setFormData({...formData, stops: newStops});
                          }}
                          className="flex-1 bg-transparent text-xs text-gray-200 placeholder-gray-600 focus:outline-none font-mono" 
                        />
                        <input 
                          placeholder="Time (e.g. 07:00 AM)" 
                          value={stop.time}
                          onChange={(e) => {
                            const newStops = [...formData.stops];
                            newStops[index].time = e.target.value;
                            setFormData({...formData, stops: newStops});
                          }}
                          className="w-28 bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-purple-500 font-mono" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-800">
                <button onClick={handleAddSubmit}
                  className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-400 rounded-xl py-3 text-sm font-mono font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                  Save Route
                </button>
                <button onClick={() => setShowAdd(false)} className="px-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded-xl py-3 text-sm font-mono transition-all">
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
