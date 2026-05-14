import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { FiX, FiCamera, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiZap } from 'react-icons/fi';
import { MdQrCodeScanner } from 'react-icons/md';

const QRCodeModal = ({ isOpen, onClose }) => {
  const [scannerState, setScannerState] = useState('idle'); // idle | scanning | success | error
  const [scannedData, setScannedData] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const mountedRef = useRef(false);

  // Cleanup scanner
  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (_) {}
      html5QrRef.current = null;
    }
  };

  // Start scanner
  const startScanner = async (cameraId) => {
    await stopScanner();
    if (!mountedRef.current) return;
    setScannerState('scanning');
    setScannedData(null);

    try {
      const qr = new Html5Qrcode('qr-scanner-region');
      html5QrRef.current = qr;

      await qr.start(
        cameraId || { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (!mountedRef.current) return;
          setScannerState('success');
          setScannedData(decodedText);
          stopScanner();
          if ('vibrate' in navigator) navigator.vibrate([100, 50, 200]);
          toast.success('✅ QR Code Scanned Successfully!', { autoClose: 3000 });
        },
        () => {} // ignore per-frame errors
      );
    } catch (err) {
      if (!mountedRef.current) return;
      setScannerState('error');
      console.error('Scanner error:', err);
    }
  };

  // Get cameras list
  const loadCameras = async () => {
    try {
      const list = await Html5Qrcode.getCameras();
      if (list && list.length > 0) {
        setCameras(list);
        setSelectedCamera(list[0].id);
        return list[0].id;
      }
    } catch (_) {}
    return null;
  };

  useEffect(() => {
    if (isOpen) {
      mountedRef.current = true;
      setScannerState('idle');
      setScannedData(null);
      loadCameras().then((camId) => {
        if (camId && mountedRef.current) startScanner(camId);
      });
    } else {
      mountedRef.current = false;
      stopScanner();
      setScannerState('idle');
      setScannedData(null);
    }
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
    // eslint-disable-next-line
  }, [isOpen]);

  const handleRetry = () => {
    setScannerState('idle');
    setScannedData(null);
    const camId = selectedCamera || cameras[0]?.id;
    startScanner(camId);
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal Card */}
        <motion.div
          className="relative z-10 w-full max-w-sm"
          initial={{ scale: 0.85, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        >
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80">

            {/* ── Header ── */}
            <div className="relative px-6 py-5 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7c3aed 100%)' }}>
              {/* blobs */}
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 left-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow">
                    <MdQrCodeScanner className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white tracking-wide">QR Scanner</h3>
                    <p className="text-xs text-blue-200 font-medium">Scan your bus pass or ticket</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors border border-white/20"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="p-5 bg-slate-50">

              {/* Camera selector (if multiple cameras) */}
              {cameras.length > 1 && (
                <div className="mb-4">
                  <select
                    value={selectedCamera || ''}
                    onChange={(e) => {
                      setSelectedCamera(e.target.value);
                      startScanner(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {cameras.map((cam) => (
                      <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id}`}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Scanner Viewfinder */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-inner" style={{ minHeight: 260 }}>

                {/* The html5-qrcode target div — always rendered */}
                <div
                  id="qr-scanner-region"
                  ref={scannerRef}
                  className="w-full"
                  style={{ minHeight: 260 }}
                />

                {/* Scanning overlay frame */}
                {scannerState === 'scanning' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* corner brackets */}
                    <div className="relative w-48 h-48">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-xl" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-xl" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-xl" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-xl" />
                      {/* scan line */}
                      <motion.div
                        className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-lg"
                        style={{ boxShadow: '0 0 12px 2px rgba(56,189,248,0.7)' }}
                        animate={{ top: ['8%', '88%', '8%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  </div>
                )}

                {/* Idle / Error state overlay */}
                {(scannerState === 'idle' || scannerState === 'error') && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-4 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                      {scannerState === 'error'
                        ? <FiAlertCircle className="w-8 h-8 text-red-400" />
                        : <FiCamera className="w-8 h-8 text-slate-400" />}
                    </div>
                    <p className="text-sm text-slate-400 text-center font-medium">
                      {scannerState === 'error'
                        ? 'Camera access denied or not available'
                        : 'Starting camera...'}
                    </p>
                  </div>
                )}

                {/* Success overlay */}
                {scannerState === 'success' && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6"
                    style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                    >
                      <FiCheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-emerald-400 font-black text-lg">Scan Successful!</p>
                      <p className="text-emerald-200/60 text-xs font-mono mt-1 break-all px-2 line-clamp-2">
                        {scannedData}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Status bar */}
              <div className="mt-4 flex items-center gap-3 px-1">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  scannerState === 'scanning' ? 'bg-blue-500 animate-pulse' :
                  scannerState === 'success' ? 'bg-emerald-500' :
                  scannerState === 'error' ? 'bg-red-500' : 'bg-slate-400'
                }`} />
                <p className="text-xs font-semibold text-slate-500">
                  {scannerState === 'scanning' && 'Point camera at a QR code to scan'}
                  {scannerState === 'success' && 'QR code scanned and recorded'}
                  {scannerState === 'error' && 'Failed to access camera'}
                  {scannerState === 'idle' && 'Initializing scanner...'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleClose}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  <FiX className="w-4 h-4" /> Close
                </button>
                <button
                  onClick={handleRetry}
                  disabled={scannerState === 'scanning'}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-60 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #7c3aed)' }}
                >
                  {scannerState === 'success'
                    ? <><FiZap className="w-4 h-4" /> Scan Again</>
                    : <><FiRefreshCw className={`w-4 h-4 ${scannerState === 'scanning' ? 'animate-spin' : ''}`} /> Retry</>
                  }
                </button>
              </div>

              {/* Info strip */}
              <p className="mt-4 text-center text-[10px] text-slate-400 font-medium">
                🔒 Camera access is used only for QR scanning — nothing is stored
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRCodeModal;
