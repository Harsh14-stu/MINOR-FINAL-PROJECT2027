import React from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { MdEmergency } from 'react-icons/md';

const CONTACTS = [
  { name: 'Mr. R.K. Sharma', role: 'Principal', phone: '9876543210', whatsapp: true, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20', initials: 'RS' },
  { name: 'Mrs. Priya Singh', role: 'Transport In-charge', phone: '9871234567', whatsapp: true, color: 'from-violet-600 to-purple-600', shadow: 'shadow-violet-500/20', initials: 'PS' },
  { name: 'Police Control Room', role: 'Emergency', phone: '100', whatsapp: false, color: 'from-red-600 to-rose-600', shadow: 'shadow-red-500/20', initials: 'PC', emergency: true },
  { name: 'Bus Driver - Ramesh', role: 'Your Bus Driver', phone: '9812345678', whatsapp: true, color: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/20', initials: 'RD' },
];

const ContactAdmin = () => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-950/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
          <MdEmergency className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white font-mono tracking-wide">EMERGENCY CONTACTS</h3>
          <p className="text-[10px] text-gray-500 font-mono">One-tap call & WhatsApp</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONTACTS.map((contact, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className={`relative bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 overflow-hidden group hover:border-gray-600 transition-all ${contact.emergency ? 'border-red-500/30 bg-red-500/5' : ''}`}
          >
            {/* subtle gradient overlay */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${contact.color} opacity-10 rounded-full -mr-6 -mt-6 group-hover:opacity-20 transition-opacity`} />

            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-black text-sm shadow-lg ${contact.shadow} flex-shrink-0`}>
                {contact.initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white font-mono truncate">{contact.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">{contact.role}</p>
              </div>
              {contact.emergency && (
                <span className="ml-auto text-[8px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full font-mono flex-shrink-0 animate-pulse">
                  SOS
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {/* Call button */}
              <a
                href={`tel:${contact.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono font-bold transition-all"
              >
                <FiPhone className="w-3.5 h-3.5" />
                Call
              </a>
              {/* WhatsApp button */}
              {contact.whatsapp && (
                <a
                  href={`https://wa.me/91${contact.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded-xl text-green-400 text-xs font-mono font-bold transition-all"
                >
                  <FaWhatsapp className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              )}
              {/* Email placeholder (only if no whatsapp) */}
              {!contact.whatsapp && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono font-bold transition-all animate-pulse"
                >
                  <MdEmergency className="w-3.5 h-3.5" />
                  Emergency
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ContactAdmin;
