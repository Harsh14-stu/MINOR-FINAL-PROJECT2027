import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bus, ArrowRight, Shield, MapPin, Bell, Activity } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Animated blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 blob-anim"
        style={{ background: 'radial-gradient(circle, #2563eb, #7c3aed)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 blob-anim"
        style={{ background: 'radial-gradient(circle, #06b6d4, #10b981)', animationDelay: '4s' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-3xl px-6"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-28 h-28 rounded-3xl mb-10 float"
          style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', boxShadow: '0 20px 50px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
          <Bus className="w-14 h-14 text-white" />
        </motion.div>

        <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
          Smart<span className="text-glow-cyan">Bus</span>
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-slate-300 mb-6">Next-Gen School Transport</p>
        <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
          Experience real-time GPS tracking, seamless attendance automation, and secure parent communication — unified in a single, premium platform.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: MapPin, text: 'Live GPS Tracking', color: 'text-blue-400' },
            { icon: Shield, text: 'Secure Auth', color: 'text-violet-400' },
            { icon: Bell, text: 'Instant Alerts', color: 'text-cyan-400' },
            { icon: Activity, text: 'Route Analytics', color: 'text-emerald-400' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl glass-card hover:bg-white/5 transition-colors"
              >
                <div className={`p-3 rounded-xl bg-white/5 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-300">{f.text}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-white text-lg btn-glow-cyan"
        >
          Access Secure Portal
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        
        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-10 max-w-lg mx-auto"
        >
          {[{ val: '2,400+', lbl: 'Active Students' }, { val: '48', lbl: 'Tracking Buses' }, { val: '99.9%', lbl: 'System Uptime' }].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-white">{s.val}</p>
              <p className="text-xs text-slate-500 font-mono tracking-widest uppercase mt-2">{s.lbl}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
