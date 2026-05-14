import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function MessagePanel({ isOpen, onClose }) {
  const [quickMessage, setQuickMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [issueType, setIssueType] = useState('breakdown');
  const [sendTo, setSendTo] = useState(['admin']); // default to admin

  const quickOptions = [
    "Bus kharab ho gayi hai (Breakdown)",
    "10 min delay hoga (Traffic)",
    "Route change ho gaya hai",
    "Emergency situation"
  ];

  const handleSend = async () => {
    const finalMsg = quickMessage || customMessage;
    if (!finalMsg) {
      toast.error('Please select or type a message');
      return;
    }

    try {
      // Mock axios post
      // await axios.post('/api/messages', { type: issueType, message: finalMsg, sentTo: sendTo });
      toast.success('🚀 Message successfully dispatched!');
      onClose();
    } catch (e) {
      toast.error('Failed to send message');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div initial={{y: '100%'}} animate={{y: 0}} exit={{y: '100%'}} transition={{type: 'spring', damping: 25, stiffness: 200}} 
            className="bg-gray-900 border-t sm:border border-gray-700 sm:rounded-3xl rounded-t-3xl p-6 w-full max-w-md shadow-2xl pb-10 sm:pb-6">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2"><FiMessageSquare className="text-cyan-400" /> Report Issue</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-white bg-gray-800 p-2 rounded-full"><FiX className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-5">
              {/* Issue Type */}
              <div>
                <label className="text-xs text-gray-400 font-mono uppercase mb-2 block">Issue Category</label>
                <div className="flex gap-2">
                  {['breakdown', 'traffic', 'emergency'].map(t => (
                    <button key={t} onClick={() => setIssueType(t)}
                      className={`flex-1 py-2 rounded-lg font-mono text-xs uppercase font-bold border transition-colors ${
                        issueType === t ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-gray-950 text-gray-500 border-gray-800'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Messages */}
              <div>
                <label className="text-xs text-gray-400 font-mono uppercase mb-2 block">1-Tap Quick Messages</label>
                <div className="grid grid-cols-1 gap-2">
                  {quickOptions.map((opt, i) => (
                    <button key={i} onClick={() => { setQuickMessage(opt); setCustomMessage(''); }}
                      className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                        quickMessage === opt ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-800'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Note */}
              <div>
                <label className="text-xs text-gray-400 font-mono uppercase mb-2 block">Voice / Text Note</label>
                <textarea 
                  placeholder="Type custom details here..."
                  value={customMessage}
                  onChange={e => { setCustomMessage(e.target.value); setQuickMessage(''); }}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 min-h-[80px]"
                />
              </div>

              {/* Send To */}
              <div>
                <label className="text-xs text-gray-400 font-mono uppercase mb-2 block">Broadcast To</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-300 font-mono">
                    <input type="checkbox" checked={sendTo.includes('admin')} onChange={(e) => {
                      if(e.target.checked) setSendTo([...sendTo, 'admin']);
                      else setSendTo(sendTo.filter(x => x !== 'admin'));
                    }} className="w-4 h-4 accent-cyan-500" /> Admin
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 font-mono">
                    <input type="checkbox" checked={sendTo.includes('parents')} onChange={(e) => {
                      if(e.target.checked) setSendTo([...sendTo, 'parents']);
                      else setSendTo(sendTo.filter(x => x !== 'parents'));
                    }} className="w-4 h-4 accent-cyan-500" /> Parents
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button onClick={handleSend} className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-xl font-black text-lg font-mono tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                <FiSend /> SEND ALERT
              </button>
            </div>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
