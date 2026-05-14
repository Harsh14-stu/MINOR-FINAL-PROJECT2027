import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, MapPin, Zap, PhoneCall, Sparkles } from 'lucide-react';

export default function ParentAIChat({ activeChild, fees, routeData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your AI Assistant. How can I help you today? You can ask about your child\'s location, pending fees, or contact details.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim().toLowerCase();
    setMessages(prev => [...prev, { role: 'user', text: input.trim() }]);
    setInput('');
    setIsTyping(true);

    // Mock AI Logic
    setTimeout(() => {
      let botResponse = '';
      let actionType = null;

      if (userMessage.includes('where') || userMessage.includes('location') || userMessage.includes('child')) {
        botResponse = `Your child (${activeChild?.name || 'the student'}) is currently **${activeChild?.busStatus || 'idle'}** on bus ${activeChild?.busNumber || 'N/A'}. The estimated time of arrival is **${activeChild?.eta || 'N/A'}**.`;
        actionType = 'location';
      } else if (userMessage.includes('fee') || userMessage.includes('due') || userMessage.includes('remain')) {
        const pending = fees?.payableAmount || (fees?.dueAmount - fees?.paidAmount) || 1500;
        botResponse = `The total fee is ₹${fees?.dueAmount || 15000}.\nYou have paid ₹${fees?.paidAmount || 13500}.\nThe remaining pending due is **₹${pending}**.`;
        actionType = 'fees';
      } else if (userMessage.includes('call') || userMessage.includes('contact') || userMessage.includes('management') || userMessage.includes('driver')) {
        botResponse = `Here are the contact details you requested:\n- **Driver**: ${activeChild?.driverPhone || '+91 9876543210'}\n- **School Management**: ${activeChild?.schoolPhone || '+91 11 2345 6789'}`;
        actionType = 'contact';
      } else {
        botResponse = "I'm sorry, I didn't quite catch that. You can ask me things like 'where is my child?', 'what are my remaining fees?', or 'call bus management'.";
      }

      setMessages(prev => [...prev, { role: 'bot', text: botResponse, type: actionType }]);
      setIsTyping(false);
    }, 1200);
  };

  const renderText = (text) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        {i !== text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50 group shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 10px 40px rgba(124,58,237,0.4)'
        }}
      >
        <Sparkles className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0d1117] animate-pulse" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 rounded-2xl flex flex-col z-50 overflow-hidden"
            style={{
              background: 'rgba(9,14,26,0.95)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
              height: '500px',
              maxHeight: '80vh'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.1))' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Smart Assistant</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> AI Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-cyan-500 text-white rounded-tr-sm' : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-sm'}`}>
                    {renderText(msg.text)}
                  </div>

                  {/* Contextual Action Buttons */}
                  {msg.type === 'location' && (
                    <div className="mt-2 p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-mono">Location Fetched</span>
                    </div>
                  )}
                  {msg.type === 'fees' && (
                    <div className="mt-2 p-2 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-amber-400 font-mono">Fee Record Checked</span>
                    </div>
                  )}
                  {msg.type === 'contact' && (
                    <div className="mt-2 flex gap-2">
                      <a href={`tel:${activeChild?.driverPhone || '+919876543210'}`} className="p-2 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center gap-1 hover:bg-blue-500/20 transition-colors">
                        <PhoneCall className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-400 font-mono">Call Driver</span>
                      </a>
                      <a href={`tel:${activeChild?.schoolPhone || '+911123456789'}`} className="p-2 rounded-xl border border-violet-500/30 bg-violet-500/10 flex items-center gap-1 hover:bg-violet-500/20 transition-colors">
                        <PhoneCall className="w-3 h-3 text-violet-400" />
                        <span className="text-xs text-violet-400 font-mono">Call School</span>
                      </a>
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-white/5 text-slate-400 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-white/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="w-full bg-black/40 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-500 mt-2">AI can make mistakes. Verify important info.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
