import React, { useState } from 'react';
import { ChevronDown, X, PhoneCall, Mail, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  { q: "How does the Live Bus Tracking work?", a: "The system uses GPS units installed on our buses to provide real-time updates. The map refreshes every 5 seconds to show the exact location and ETA of your child's bus." },
  { q: "What should I do if the bus is delayed?", a: "If the bus is delayed by more than 15 minutes, you will receive an automatic alert. You can also message the driver or call the school management directly from this dashboard." },
  { q: "How do I update my child's pickup/drop point?", a: "For security reasons, route changes must be requested through the School Management office. Please contact them at least 24 hours in advance." },
  { q: "When are transport fees due?", a: "Fees are due by the 5th of every month. You can view your due amount and pay directly using the UPI QR code in the Fees Details section." }
];

export default function HelpCenter({ onClose }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="glass-card p-5 h-full flex flex-col relative animate-in fade-in zoom-in-95 duration-300" style={{ minHeight: '350px' }}>
      <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white z-10">
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-violet-400" />
        <span className="text-lg font-bold text-white tracking-wide">Knowledge Base</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {FAQS.map((faq, idx) => (
          <div key={idx} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button 
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-200">{faq.q}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openFaq === idx && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-white/5 mt-1">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="mt-6 p-4 rounded-xl text-center" style={{ background: 'linear-gradient(145deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(124,58,237,0.2)' }}>
          <p className="text-sm font-bold text-white mb-2">Still need help?</p>
          <div className="flex justify-center gap-4">
            <a href="tel:+911123456789" className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300">
              <PhoneCall className="w-3 h-3" /> Call Us
            </a>
            <a href="mailto:support@cdgicollege.edu" className="flex items-center gap-2 text-xs font-mono text-violet-400 hover:text-violet-300">
              <Mail className="w-3 h-3" /> Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}