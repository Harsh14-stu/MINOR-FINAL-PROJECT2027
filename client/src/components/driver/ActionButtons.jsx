import React from 'react';
import { FiPlay, FiStopCircle, FiAlertCircle, FiClock, FiShield } from 'react-icons/fi';

export default function ActionButtons({ tripStatus, toggleTrip, openMessageModal, openSOS }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {/* Trip Toggle (Full Width) */}
      <button 
        onClick={toggleTrip}
        className={`col-span-2 py-5 rounded-2xl font-black text-xl font-mono tracking-widest transition-all ${
          tripStatus === 'moving' 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
        }`}
      >
        {tripStatus === 'moving' ? (
          <span className="flex items-center justify-center gap-2"><FiStopCircle className="w-6 h-6 animate-pulse" /> END TRIP</span>
        ) : (
          <span className="flex items-center justify-center gap-2"><FiPlay className="w-6 h-6" /> START TRIP</span>
        )}
      </button>

      {/* Report Issue */}
      <button onClick={openMessageModal} className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 py-4 rounded-xl font-bold font-mono text-sm flex flex-col items-center gap-2 transition-colors">
        <FiAlertCircle className="w-6 h-6" />
        Report Issue
      </button>

      {/* Delay */}
      <button onClick={() => openMessageModal('Delay')} className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 py-4 rounded-xl font-bold font-mono text-sm flex flex-col items-center gap-2 transition-colors">
        <FiClock className="w-6 h-6" />
        Log Delay
      </button>

      {/* SOS (Full Width) */}
      <button onClick={openSOS} className="col-span-2 bg-red-600 hover:bg-red-700 text-white py-5 rounded-xl font-black font-mono text-xl tracking-widest flex items-center justify-center gap-3 transition-colors shadow-[0_0_30px_rgba(239,68,68,0.4)]">
        <FiShield className="w-8 h-8" />
        S.O.S
      </button>
    </div>
  );
}
