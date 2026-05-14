import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiUser, FiAlertOctagon, FiMessageSquare,
  FiMapPin, FiPhone, FiClock, FiX, FiCheck, FiBell, FiCreditCard
} from 'react-icons/fi';
import { FaBus, FaQrcode } from 'react-icons/fa';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { toast } from 'react-toastify';

import axios from 'axios';

export default function StudentsModule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]           = useState('');
  const [busFilter, setBusFilter]     = useState('All');
  const [selected, setSelected]       = useState(null);
  const [tab, setTab]                 = useState('info');
  const [showAdd, setShowAdd]         = useState(false);
  const [showQR, setShowQR]           = useState(null);
  const [msgText, setMsgText]         = useState('');
  
  const [students, setStudents]       = useState([]);
  const [busCounts, setBusCounts]     = useState([]);
  
  // New Student Form State
  const [formData, setFormData] = useState({
    name: '', studentId: '', class: '', assignedBus: '', RFID: '', pickup: '', drop: '', phone: '', parentName: '', parentPhone: ''
  });

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      const data = res.data;
      setStudents(data);
      
      // Calculate bus counts
      const counts = {};
      data.forEach(s => {
        if (!s.assignedBus) return;
        counts[s.assignedBus] = (counts[s.assignedBus] || 0) + 1;
      });
      const colors = ['cyan', 'blue', 'purple', 'emerald', 'amber'];
      setBusCounts(Object.keys(counts).map((bus, i) => ({ bus, count: counts[bus], color: colors[i % colors.length] })));
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const handleAddSubmit = async () => {
    try {
      await axios.post('/api/students', formData);
      toast.success('✅ Student added successfully!');
      setShowAdd(false);
      fetchStudents(); // Refresh list
    } catch (error) {
      toast.error('❌ Error adding student');
    }
  };

  const filtered = students.filter(s =>
    (busFilter === 'All' || s.assignedBus === busFilter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || (s.studentId && s.studentId.includes(search)))
  );



  const handleSOS = (s) => {
    toast.error(`🚨 SOS sent for ${s.name} to Admin & Driver!`, { autoClose: false });
    toast.info(`📞 Notifying parent ${s.parentName}...`);
  };

  const handleMsg = (s) => {
    if (!msgText.trim()) return;
    toast.success(`✅ Message sent to ${s.name}'s parent!`);
    setMsgText('');
  };

  const feeColor = (due) => due === 0 ? 'emerald' : due < 5000 ? 'amber' : 'red';
  const attColor = (a)  => a >= 90 ? 'emerald' : a >= 75 ? 'amber' : 'red';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:z-auto`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 col-span-2 sm:col-span-1">
              <p className="text-3xl font-black font-mono text-cyan-400">{students.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total Students</p>
            </motion.div>
            {busCounts.map((b,i) => (
              <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                className={`bg-gray-900/70 border border-gray-800 rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <FaBus className={`w-4 h-4 text-${b.color}-400`} />
                  <span className="text-xs font-mono text-gray-400">{b.bus}</span>
                </div>
                <p className={`text-2xl font-black font-mono text-${b.color}-400`}>{b.count} <span className="text-sm text-gray-500">students</span></p>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-xl px-3 py-2 flex-1 min-w-48">
              <FiSearch className="w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..."
                className="bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none w-full font-mono" />
            </div>
            <select value={busFilter} onChange={e => setBusFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none">
              <option>All</option>
              {busCounts.map(b => <option key={b.bus}>{b.bus}</option>)}
            </select>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 rounded-xl text-sm font-mono font-bold transition-all">
              <FiPlus className="w-4 h-4" /> Add Student
            </button>
          </div>

          {/* Table + Detail */}
          <div className="flex gap-4" style={{minHeight:'420px'}}>

            {/* Table */}
            <div className="flex-1 min-w-0 bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-950/50">
                      {['Student','Class','Bus','Pickup','Attendance','Fees Due',''].map((h,i) => (
                        <th key={i} className="px-4 py-3 text-left text-[10px] font-mono text-gray-500 tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <motion.tr key={s.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                        onClick={() => setSelected(s)}
                        className={`border-b border-gray-800/50 cursor-pointer transition-colors hover:bg-gray-800/40 ${selected?.id === s.id ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {s.photo}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-100 text-sm">{s.name}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{s.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs font-mono text-gray-300">{s.class}</span></td>
                        <td className="px-4 py-3"><span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-lg">{s.assignedBus}</span></td>
                        <td className="px-4 py-3"><span className="text-xs text-gray-400 truncate max-w-28 block">{s.pickup}</span></td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold font-mono text-${attColor(s.attendance)}-400`}>{s.attendance}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold font-mono text-${feeColor(s.feeDue)}-400`}>
                            {s.feeDue === 0 ? '✅ Paid' : `₹${s.feeDue.toLocaleString()}`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={e => {e.stopPropagation(); handleSOS(s);}}
                              className="p-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg transition-all" title="SOS">
                              <FiAlertOctagon className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={e => {e.stopPropagation(); setShowQR(s);}}
                              className="p-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all" title="RFID">
                              <FaQrcode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-500 font-mono text-sm">No students found</div>
                )}
              </div>
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
              {selected && (
                <motion.div key={selected.id} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                  className="w-72 flex-shrink-0 bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-800 bg-gray-950/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">{selected.photo}</div>
                      <div>
                        <p className="font-bold text-gray-100 text-sm">{selected.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{selected.id}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-400"><FiX /></button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-800">
                    {['info','fees','history','msg'].map(t => (
                      <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${tab===t ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-600 hover:text-gray-400'}`}>
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {tab === 'info' && (
                      <>
                        {[
                          {icon:FiBell,      label:'Class',   val:selected.class},
                          {icon:FaBus,       label:'Bus',     val:selected.assignedBus},
                          {icon:FiMapPin,    label:'Pickup',  val:selected.pickup},
                          {icon:FiMapPin,    label:'Drop',    val:selected.drop},
                          {icon:FiPhone,     label:'Student', val:selected.phone},
                          {icon:FiUser,      label:'Parent',  val:selected.parentName},
                          {icon:FiPhone,     label:'P.Phone', val:selected.parentPhone},
                          {icon:FaQrcode,    label:'RFID',    val:selected.rfid},
                        ].map((r,i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <r.icon className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                            <span className="text-[10px] text-gray-500 w-14 flex-shrink-0">{r.label}</span>
                            <span className="text-xs text-gray-200 font-mono truncate">{r.val}</span>
                          </div>
                        ))}
                        <div className="mt-2">
                          <p className="text-[10px] text-gray-500 mb-1">Attendance</p>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div initial={{width:0}} animate={{width:`${selected.attendance}%`}} transition={{duration:1}}
                              className={`h-full rounded-full bg-${attColor(selected.attendance)}-500`} />
                          </div>
                          <p className={`text-xs font-bold font-mono text-${attColor(selected.attendance)}-400 mt-1`}>{selected.attendance}%</p>
                        </div>
                        <button onClick={() => handleSOS(selected)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-mono font-bold transition-all">
                          <FiAlertOctagon className="w-4 h-4" /> Send SOS Alert
                        </button>
                      </>
                    )}

                    {tab === 'fees' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            {label:'Total Fees',  val:`₹${selected.feeTotal.toLocaleString()}`,  c:'gray'},
                            {label:'Total Paid',  val:`₹${selected.feePaid.toLocaleString()}`,   c:'emerald'},
                            {label:'Remaining',   val:`₹${selected.feeDue.toLocaleString()}`,    c: feeColor(selected.feeDue)},
                          ].map((f,i) => (
                            <div key={i} className={`p-3 rounded-xl bg-${f.c}-500/5 border border-${f.c}-500/20 flex justify-between items-center`}>
                              <span className="text-xs text-gray-400">{f.label}</span>
                              <span className={`text-sm font-bold font-mono text-${f.c}-400`}>{f.val}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <p className="text-[10px] text-gray-500 mb-1">Payment Progress</p>
                          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div initial={{width:0}} animate={{width:`${(selected.feePaid/selected.feeTotal)*100}%`}} transition={{duration:1}}
                              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500" />
                          </div>
                          <p className="text-xs text-gray-500 font-mono mt-1">{Math.round((selected.feePaid/selected.feeTotal)*100)}% paid</p>
                        </div>
                        {selected.feeDue > 0 && (
                          <button onClick={() => toast.info(`📩 Fee reminder sent to ${selected.parentName}!`)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-mono font-bold transition-all">
                            <FiCreditCard className="w-4 h-4" /> Send Fee Reminder
                          </button>
                        )}
                      </div>
                    )}

                    {tab === 'history' && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-gray-500 font-mono mb-3 tracking-widest">TODAY'S TRAVEL HISTORY</p>
                        {selected.history.map((h,i) => (
                          <div key={i} className="flex items-start gap-2.5 p-2.5 bg-gray-950/40 rounded-xl border border-gray-800">
                            <FiClock className="w-3 h-3 text-cyan-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-300 font-mono">{h}</span>
                          </div>
                        ))}
                        <div className="p-2.5 bg-purple-500/5 border border-purple-500/20 rounded-xl flex items-center gap-2">
                          <FaQrcode className="w-3 h-3 text-purple-400" />
                          <span className="text-[10px] text-purple-400 font-mono">RFID: {selected.rfid}</span>
                        </div>
                      </div>
                    )}

                    {tab === 'msg' && (
                      <div className="space-y-3">
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest">SEND NOTIFICATION</p>
                        {['Absent today','Fee pending','Emergency pickup','Early dismissal'].map((q,i) => (
                          <button key={i} onClick={() => setMsgText(q)}
                            className="w-full text-left text-xs text-gray-400 font-mono px-3 py-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 rounded-xl transition-colors">
                            {q}
                          </button>
                        ))}
                        <textarea value={msgText} onChange={e => setMsgText(e.target.value)}
                          placeholder="Type custom message..."
                          rows={3}
                          className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 resize-none" />
                        <button onClick={() => handleMsg(selected)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 rounded-xl text-xs font-mono font-bold transition-all">
                          <FiMessageSquare className="w-4 h-4" /> Send to Parent
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4">
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9}} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-cyan-400 font-mono">➕ Add New Student</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-gray-300"><FiX /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label:'Full Name',        ph:'Aarav Sharma',    field:'name', col:2},
                  {label:'Student ID',       ph:'STU-007',         field:'studentId', col:1},
                  {label:'Class',            ph:'10-A',            field:'class', col:1},
                  {label:'Assigned Bus',     ph:'MP-09',           field:'assignedBus', col:1},
                  {label:'RFID Tag',         ph:'RFID-1007',       field:'RFID', col:1},
                  {label:'Pickup Location',  ph:'City Center',     field:'pickup', col:2},
                  {label:'Drop Location',    ph:'School Campus',   field:'drop', col:2},
                  {label:'Student Phone',    ph:'+91 9876543000',  field:'phone', col:1},
                  {label:'Parent Name',      ph:'Ramesh Kumar',    field:'parentName', col:1},
                  {label:'Parent Phone',     ph:'+91 9876543000',  field:'parentPhone', col:2},
                ].map((f,i) => (
                  <div key={i} className={`${f.col===2?'col-span-2':''}`}>
                    <label className="text-[10px] text-gray-400 font-mono mb-1 block">{f.label}</label>
                    <input 
                      placeholder={f.ph} 
                      value={formData[f.field] || ''}
                      onChange={(e) => setFormData({...formData, [f.field]: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors" 
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleAddSubmit}
                  className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400 rounded-xl py-2.5 text-sm font-mono font-bold transition-all">
                  ✅ Add Student
                </button>
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded-xl py-2.5 text-sm font-mono transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RFID Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 shadow-2xl text-center">
              <h3 className="text-lg font-bold text-purple-400 font-mono mb-4">📟 RFID / QR Tag</h3>
              <div className="w-32 h-32 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 border-4 border-purple-500/30">
                <FaQrcode className="w-20 h-20 text-gray-900" />
              </div>
              <p className="text-sm font-mono text-gray-300 mb-1">{showQR.name}</p>
              <p className="text-xs font-mono text-purple-400 mb-4">{showQR.rfid}</p>
              <div className="flex gap-3">
                <button onClick={() => { toast.success('🖨 RFID printed!'); setShowQR(null); }}
                  className="flex-1 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded-xl py-2.5 text-sm font-mono font-bold transition-all hover:bg-purple-500/30">
                  🖨 Print
                </button>
                <button onClick={() => setShowQR(null)} className="flex-1 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl py-2.5 text-sm font-mono transition-all hover:bg-gray-700">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
