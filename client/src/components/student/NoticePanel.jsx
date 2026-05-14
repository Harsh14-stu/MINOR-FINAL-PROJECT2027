import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiAlertCircle, FiInfo, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { MdAnnouncement } from 'react-icons/md';
import axios from 'axios';

const DUMMY_NOTICES = [
  { _id: 'n1', title: 'School Picnic - Extra Bus Arranged', message: 'An extra bus will be available on Friday for the annual picnic trip. Pickup at main gate at 7:30 AM.', priority: 'high', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'n2', title: 'Bus Route Change — Sector 14', message: 'Due to road construction, Bus #DL-01 will take alternate route via Green Park from Monday. ETA +8 minutes.', priority: 'urgent', createdAt: new Date(Date.now() - 10800000).toISOString() },
  { _id: 'n3', title: 'Fee Submission Reminder', message: 'Last date for Q2 bus fee submission is 15th of this month. Avoid late charges.', priority: 'medium', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'n4', title: 'Holiday Notice — Eid', message: 'School and bus services will remain suspended on account of Eid on Thursday.', priority: 'low', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const priorityConfig = {
  urgent: { label: 'URGENT', bg: 'bg-red-500/10', dotCls: 'bg-red-500 animate-pulse', badgeCls: 'bg-red-500 text-white', textCls: 'text-red-400', borderCls: 'border-l-red-500', icon: FiAlertCircle },
  high:   { label: 'HIGH',   bg: 'bg-orange-500/10', dotCls: 'bg-orange-400', badgeCls: 'bg-orange-500/20 text-orange-300 border border-orange-500/30', textCls: 'text-orange-400', borderCls: 'border-l-orange-400', icon: FiAlertCircle },
  medium: { label: 'INFO',   bg: 'bg-blue-500/10', dotCls: 'bg-blue-400', badgeCls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', textCls: 'text-blue-400', borderCls: 'border-l-blue-400', icon: FiInfo },
  low:    { label: 'NOTICE', bg: 'bg-gray-800/30', dotCls: 'bg-gray-500', badgeCls: 'bg-gray-700 text-gray-300', textCls: 'text-gray-500', borderCls: 'border-l-gray-600', icon: FiCheckCircle },
};

function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

const NoticePanel = () => {
  const [notices, setNotices] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/student/notices');
      setNotices(res.data.notices?.length ? res.data.notices : DUMMY_NOTICES);
    } catch {
      setNotices(DUMMY_NOTICES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const toggle = (id) => {
    setReadIds(prev => new Set([...prev, id]));
    setExpanded(prev => prev === id ? null : id);
  };

  const unread = notices.filter(n => !readIds.has(n._id)).length;

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <MdAnnouncement className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-mono tracking-wide">NOTICE BOARD</h3>
            <p className="text-[10px] text-gray-500 font-mono">From Admin / Principal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold font-mono animate-pulse">
              {unread} NEW
            </span>
          )}
          <button onClick={fetchNotices} className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-gray-800 rounded-lg transition-colors">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-800/50">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notices.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-mono text-sm">
            <FiBell className="w-8 h-8 mx-auto mb-3 opacity-30" />
            No notices at this time.
          </div>
        ) : notices.map((notice, idx) => {
          const cfg = priorityConfig[notice.priority] || priorityConfig.low;
          const isRead = readIds.has(notice._id);
          const isOpen = expanded === notice._id;
          const Icon = cfg.icon;
          return (
            <motion.div key={notice._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}
              className={`px-5 py-4 cursor-pointer transition-colors border-l-2 ${isOpen ? cfg.borderCls : 'border-l-transparent'} ${cfg.bg} hover:bg-gray-800/30`}
              onClick={() => toggle(notice._id)}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${cfg.dotCls}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-bold font-mono leading-tight ${isRead ? 'text-gray-400' : 'text-white'}`}>{notice.title}</h4>
                    <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.badgeCls}`}>{cfg.label}</span>
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.p className="text-xs text-gray-400 font-mono leading-relaxed my-2"
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        {notice.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <div className={`flex items-center gap-1.5 text-[10px] font-mono ${cfg.textCls}`}>
                    <Icon className="w-3 h-3" />
                    <span>{timeAgo(notice.createdAt)}</span>
                    {!isRead && <span className="text-cyan-500 ml-1">• Tap to read</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default NoticePanel;
