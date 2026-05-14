import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Eye, EyeOff, Bus, Shield, User, Users, Truck, ArrowRight,
  Lock, Mail, Phone, ChevronRight, Wifi
} from 'lucide-react';

const ROLES = [
  { id: 'student',  label: 'Student',  icon: User,   color: 'from-blue-600 to-cyan-500',    glow: 'rgba(6,182,212,0.3)',    border: 'rgba(6,182,212,0.35)' },
  { id: 'parent',   label: 'Parent',   icon: Users,  color: 'from-violet-600 to-purple-500', glow: 'rgba(124,58,237,0.3)',   border: 'rgba(124,58,237,0.35)' },
  { id: 'driver',   label: 'Driver',   icon: Truck,  color: 'from-emerald-600 to-teal-500',  glow: 'rgba(16,185,129,0.3)',   border: 'rgba(16,185,129,0.35)' },
  { id: 'admin',    label: 'Admin',    icon: Shield, color: 'from-amber-500 to-orange-500',  glow: 'rgba(245,158,11,0.3)',   border: 'rgba(245,158,11,0.35)' },
];

const AnimatedLogin = () => {
  const [isLogin, setIsLogin]           = useState(true);
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [password, setPassword]         = useState('');
  const [role, setRole]                 = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post('/api/auth/login', { email, password });
        login(res.data);
        navigate(res.data.user.role === 'admin' ? '/admin' : `/${res.data.user.role}`);
      } else {
        const res = await axios.post('/api/auth/signup', { name, email, phone, password, role });
        login(res.data);
        navigate(`/${res.data.user.role}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName(''); setEmail(''); setPhone(''); setPassword('');
    setRole('student'); setShowPassword(false);
  };

  const selectedRole = ROLES.find(r => r.id === role) || ROLES[0];

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── CENTERED LOGIN FORM ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Background Decorative Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', boxShadow: '0 10px 30px rgba(6,182,212,0.3)' }}>
            <Bus className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">SmartBus</span>
        </div>

          {/* Card */}
          <div className="modal-dark p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-mono tracking-widest uppercase">
                  {isLogin ? 'Secure Login Portal' : 'Create Account'}
                </span>
              </div>
              <h2 className="text-3xl font-black text-white">
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {isLogin ? 'Sign in to access your dashboard' : 'Create your SmartBus account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Phone — signup only */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Full Name */}
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        className="input-dark pl-11"
                        type="text" placeholder="Full Name"
                        value={name} onChange={e => setName(e.target.value)}
                        required disabled={isLoading}
                      />
                    </div>
                    {/* Phone */}
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        className="input-dark pl-11"
                        type="tel" placeholder="Phone Number"
                        value={phone} onChange={e => setPhone(e.target.value)}
                        required disabled={isLoading}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  className="input-dark pl-11"
                  type="text" placeholder={isLogin ? 'Email or Phone' : 'Email'}
                  value={email} onChange={e => setEmail(e.target.value)}
                  required disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  className="input-dark pl-11 pr-12"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Role Selector — signup only */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-slate-500 font-medium mb-3 tracking-widest uppercase">Select your role</p>
                    <div className="grid grid-cols-2 gap-3">
                      {ROLES.filter(r => r.id !== 'admin').map(r => {
                        const Icon = r.icon;
                        const isActive = role === r.id;
                        return (
                          <motion.button
                            key={r.id} type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setRole(r.id)}
                            className="relative flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all text-left overflow-hidden"
                            style={{
                              background: isActive ? `linear-gradient(135deg, ${r.color.split(' ')[1]?.replace('from-','') || '#2563eb'}, transparent)` : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isActive ? r.border : 'rgba(255,255,255,0.07)'}`,
                              boxShadow: isActive ? `0 0 20px ${r.glow}` : 'none',
                              color: isActive ? '#fff' : '#64748b'
                            }}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${r.color}`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            {r.label}
                            {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot password */}
              {isLogin && (
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm btn-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-xs text-slate-600">or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Toggle */}
            <p className="text-center text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button onClick={toggleMode} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors ml-1">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>

            {/* Security note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
              <Wifi className="w-3 h-3" />
              <span>256-bit encrypted • Secure HTTPS connection</span>
            </div>
          </div>

        <p className="text-center text-xs text-slate-700 mt-6 font-mono relative z-10">
          CDGI College — Smart School Bus System
        </p>
      </motion.div>
    </div>
  );
};

export default AnimatedLogin;