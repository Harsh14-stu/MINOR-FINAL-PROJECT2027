import React, { useState } from 'react';
import { FiMapPin, FiClock, FiHeart, FiBell, FiHelpCircle } from 'react-icons/fi';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import HelpCenter from '../student/HelpCenter'; // Reusable
import { useSocketContext } from '../../context/SocketContext';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [busStatus, setBusStatus] = useState('moving');
  const [eta, setEta] = useState('8 min');
  const [distance, setDistance] = useState('2.1 km');
  const [speed, setSpeed] = useState(38);
  const { notifications, unreadCount, connected } = useSocketContext();

  const sendEmergency = () => {
    toast.error('🚨 Emergency SOS sent! Help is coming.');
    // Would emit socket event here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50">
      <Navbar onMenuToggle={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-6 lg:p-8">
          {/* Hero Section */}
          <section className="mb-12">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl border border-white/50">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <FiUser className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">
                      Good Morning!
                    </h1>
                    <p className="text-2xl font-bold text-emerald-600 bg-emerald-100 px-4 py-2 rounded-2xl inline-block">
                      Amit Sharma • STU001
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl font-bold text-lg ${
                    connected 
                      ? 'bg-emerald-100 text-emerald-800 shadow-lg' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {connected ? '🟢 LIVE' : '🔴 OFFLINE'}
                  </div>
                  {unreadCount > 0 && (
                    <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg animate-bounce">
                      {unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Main Tracking Card */}
          <section className="mb-12">
            <div className="card shadow-2xl border-0">
              <div className="p-8 pb-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <FiMapPin className="w-8 h-8" />
                    Live Bus Tracking
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-2xl font-bold text-sm ${
                      busStatus === 'moving' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {busStatus.toUpperCase()}
                    </span>
                    <div className="text-3xl font-black text-blue-600 p-4 bg-blue-100 rounded-3xl shadow-lg">
                      {eta}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map Section */}
              <div className="h-[450px] bg-gradient-to-br from-blue-100 to-emerald-100 rounded-b-3xl overflow-hidden shadow-2xl border-t-8 border-white/50">
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl border-8 border-white/30">
                    🚌
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 mb-6 drop-shadow-lg">
                    DL01AB1234
                  </h3>
                  <div className="grid grid-cols-3 gap-8 mb-12 text-center">
                    <div>
                      <div className="text-4xl font-black text-emerald-600 mb-2">{eta}</div>
                      <div className="text-xl text-gray-700 font-semibold">ETA</div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-blue-600 mb-2">{distance}</div>
                      <div className="text-xl text-gray-700 font-semibold">Distance</div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-indigo-600 mb-2">{speed} km/h</div>
                      <div className="text-xl text-gray-700 font-semibold">Speed</div>
                    </div>
                  </div>
                  <div className="space-y-3 text-lg text-gray-700 mb-12">
                    <div>📍 Current: Sector 14, Road B</div>
                    <div>🎯 Next: School Main Gate</div>
                    <div>⏰ Updated: {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="card p-8 text-center">
              <FiClock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <div className="text-3xl font-black text-gray-900 mb-2">{eta}</div>
              <div className="text-xl font-semibold text-blue-600">Time to School</div>
            </div>
            
            <div className="card p-8 text-center">
              <FiActivity className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <div className="text-3xl font-black text-gray-900 mb-2">{speed} km/h</div>
              <div className="text-xl font-semibold text-emerald-600">Current Speed</div>
            </div>
            
            <div className="card p-8 text-center">
              <FiUsers className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <div className="text-3xl font-black text-gray-900 mb-2">24/50</div>
              <div className="text-xl font-semibold text-purple-600">Passengers</div>
            </div>
            
            <div className="card p-8 text-center">
              <FiHeart className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <button 
                className="btn btn-danger w-full p-4 text-lg font-bold shadow-xl hover:shadow-2xl"
                onClick={sendEmergency}
              >
                🚨 EMERGENCY
              </button>
            </div>
          </section>

          {/* Help Center Toggle */}
          {!showHelp ? (
            <div className="card p-12 text-center">
              <button 
                className="btn btn-secondary text-xl px-16 py-8 inline-flex items-center gap-4"
                onClick={() => setShowHelp(true)}
              >
                <FiHelpCircle className="w-8 h-8" />
                Help & Support
              </button>
            </div>
          ) : (
            <HelpCenter onClose={() => setShowHelp(false)} />
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;