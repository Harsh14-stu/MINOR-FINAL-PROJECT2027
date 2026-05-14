import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiWifi, FiWifiOff, FiNavigation, FiTool, FiX, FiTrash2 } from 'react-icons/fi';
import { FaBus } from 'react-icons/fa';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function VehiclesModule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter]= useState('All');
  const [vehicles, setVehicles]       = useState([]);
  const [showAdd, setShowAdd]         = useState(false);
  const [formData, setFormData]       = useState({ busNumber: '', capacity: 50, driverName: '', gpsId: '' });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      // Mocking fetch or fetching from real if available
      const res = await axios.get('/api/buses').catch(() => null);
      if (res?.data?.buses) {
        setVehicles(res.data.buses.map(b => ({
          id: b._id,
          number: b.busNumber,
          capacity: b.capacity || 50,
          driver: b.driverId?.name || 'Unassigned',
          status: b.status === 'moving' ? 'Online' : 'Offline',
          route: b.route?.name || 'Unassigned',
          gps: 'Active'
        })));
      } else {
        // Fallback mock
        setVehicles([
          { id: '1', number: 'MP-09-AB-1234', capacity: 50, driver: 'Amit Kumar', status: 'Online', route: 'Route 01', gps: 'Active' },
          { id: '2', number: 'MP-04-XY-9876', capacity: 40, driver: 'Raj Singh', status: 'Offline', route: 'Route 02', gps: 'Inactive' },
          { id: '3', number: 'DL-05-ZZ-5555', capacity: 60, driver: 'Suresh V.', status: 'Online', route: 'Route 03', gps: 'Active' }
        ]);
      }
    } catch (e) {
      toast.error('Failed to load vehicles');
    }
  };

  const handleAddSubmit = () => {
    toast.success('🚌 Bus successfully added!');
    setShowAdd(false);
    setVehicles([...vehicles, {
      id: Date.now().toString(),
      number: formData.busNumber,
      capacity: formData.capacity,
      driver: formData.driverName || 'Unassigned',
      status: 'Offline',
      route: 'Unassigned',
      gps: formData.gpsId ? 'Active' : 'Pending'
    }]);
  };

  const removeBus = (id) => {
    if(window.confirm('Are you sure you want to remove this bus?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
      toast.info('🗑️ Bus removed from fleet.');
    }
  };

  const filtered = vehicles.filter(v => 
    (statusFilter === 'All' || v.status === statusFilter) &&
    v.number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:z-auto`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          
          {/* Header Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <FaBus className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-mono text-gray-100">Fleet Management</h2>
                <p className="text-xs text-gray-500 font-mono tracking-widest">{vehicles.length} ACTIVE VEHICLES</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-center flex-1 justify-end">
              <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 w-64">
                <FiSearch className="w-4 h-4 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bus number..."
                  className="bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none w-full font-mono" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-gray-950 border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors">
                <option value="All">All Status</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 rounded-xl text-sm font-mono font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <FiPlus className="w-4 h-4" /> Add Bus
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((bus, i) => (
              <motion.div key={bus.id} initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay:i*0.05}}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all group relative">
                
                <div className="p-5 border-b border-gray-800">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center">
                        <FaBus className={`w-5 h-5 ${bus.status === 'Online' ? 'text-indigo-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-100 text-lg font-mono">{bus.number}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${bus.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                          <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">{bus.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    {bus.gps === 'Active' ? (
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20" title="GPS Active">
                        <FiWifi className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-red-500/10 rounded-lg text-red-400 border border-red-500/20" title="GPS Inactive">
                        <FiWifiOff className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gray-950/50 rounded-xl p-2.5 border border-gray-800/50">
                      <p className="text-[10px] text-gray-500 font-mono uppercase">Capacity</p>
                      <p className="text-sm font-bold text-gray-200 mt-0.5">{bus.capacity} Seats</p>
                    </div>
                    <div className="bg-gray-950/50 rounded-xl p-2.5 border border-gray-800/50">
                      <p className="text-[10px] text-gray-500 font-mono uppercase">Driver</p>
                      <p className="text-sm font-bold text-gray-200 mt-0.5 truncate">{bus.driver}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-950/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-2">
                    <FiNavigation className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{bus.route}</span>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-gray-800 hover:bg-indigo-500/20 hover:text-indigo-400 text-gray-400 rounded-lg transition-colors" title="Assign Route/Driver">
                      <FiTool className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeBus(bus.id)} className="p-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-colors" title="Remove">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>

        </main>
      </div>

      {/* Add Bus Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{scale:0.95,y:10}} animate={{scale:1,y:0}} exit={{scale:0.95}} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-indigo-400 font-mono flex items-center gap-2"><FaBus /> Add New Bus</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-gray-300"><FiX /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-mono mb-1 block uppercase">Bus Number</label>
                  <input 
                    placeholder="e.g. MP-09-AB-1234" 
                    value={formData.busNumber}
                    onChange={e => setFormData({...formData, busNumber: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono mb-1 block uppercase">Capacity</label>
                    <input 
                      type="number"
                      placeholder="50" 
                      value={formData.capacity}
                      onChange={e => setFormData({...formData, capacity: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono mb-1 block uppercase">GPS Hardware ID</label>
                    <input 
                      placeholder="e.g. GPS-9901" 
                      value={formData.gpsId}
                      onChange={e => setFormData({...formData, gpsId: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-mono mb-1 block uppercase">Default Driver</label>
                  <input 
                    placeholder="Enter Driver Name" 
                    value={formData.driverName}
                    onChange={e => setFormData({...formData, driverName: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 text-gray-100 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors" 
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-800">
                <button onClick={handleAddSubmit}
                  className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-400 rounded-xl py-3 text-sm font-mono font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                  Save Vehicle
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
