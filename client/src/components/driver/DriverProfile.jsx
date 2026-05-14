import React, { useState } from 'react';
import { FiUpload, FiCheckCircle, FiClock, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function DriverProfile({ driverInfo }) {
  const [dlPreview, setDlPreview] = useState(driverInfo?.licenseImage || null);
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDlPreview(reader.result);
        toast.success('📸 DL Image Uploaded successfully!');
        // Here you would make an API call to save the Base64 string to DB
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 mt-6 shadow-xl">
      <h2 className="text-xl font-bold font-mono text-white mb-6 flex items-center gap-2"><FiFileText className="text-cyan-400" /> Driver License (DL) Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info Side */}
        <div className="space-y-4">
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-1">Driver Name</p>
            <p className="text-lg font-bold text-gray-200">{driverInfo?.name || 'Loading...'}</p>
          </div>
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-1">License Number</p>
            <p className="text-lg font-bold text-cyan-400 font-mono tracking-widest">{driverInfo?.license || 'NOT_SET'}</p>
          </div>
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-1">DL Verification</p>
              <div className="flex items-center gap-2 mt-1">
                {driverInfo?.dlStatus === 'Verified' ? (
                  <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold font-mono border border-emerald-500/20"><FiCheckCircle /> VERIFIED</span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold font-mono border border-amber-500/20"><FiClock /> PENDING</span>
                )}
              </div>
            </div>
            {driverInfo?.licenseExpiry && (
               <div className="text-right">
                 <p className="text-[10px] text-gray-500 font-mono uppercase">Expiry Date</p>
                 <p className="text-sm font-bold text-gray-300 font-mono mt-1">{new Date(driverInfo.licenseExpiry).toLocaleDateString()}</p>
               </div>
            )}
          </div>
        </div>

        {/* DL Image Side */}
        <div className="bg-gray-950 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-[200px]">
          {dlPreview ? (
            <>
              <img src={dlPreview} alt="Driver License" className="w-full h-full object-cover absolute inset-0 opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
              <label className="relative z-10 mt-auto bg-gray-900/80 backdrop-blur-sm border border-gray-700 px-4 py-2 rounded-lg text-sm font-mono text-gray-300 cursor-pointer hover:bg-gray-800 transition-colors">
                <FiUpload className="inline mr-2" /> Update Image
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center text-gray-500 hover:text-cyan-400 transition-colors">
              <FiUpload className="w-10 h-10 mb-3" />
              <span className="font-mono text-sm">Upload DL Image (Front)</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
