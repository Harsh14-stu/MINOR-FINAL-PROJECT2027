import React from 'react';
import { FiMapPin, FiClock, FiHeart, FiPhone, FiMail, FiVideo } from 'react-icons/fi';

const HelpCenter = ({ onClose }) => {
  const helpSections = [
    {
      icon: FiMapPin,
      title: 'Track Live Location',
      description: 'See your child\'s bus location in real-time on the map',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: FiClock,
      title: 'Check ETA',
      description: 'Get accurate estimated time of arrival to school/home',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: FiHeart,
      title: 'Emergency SOS',
      description: 'Send instant emergency alert to driver & admin',
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: FiPhone,
      title: 'Call Driver',
      description: 'Direct call to assigned bus driver',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: FiMail,
      title: 'Send Message',
      description: 'Chat with driver or school admin',
      color: 'from-purple-500 to-violet-600'
    },
    {
      icon: FiVideo,
      title: 'Live Support',
      description: '24/7 video support from school admin',
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  return (
    <div className="card p-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Help Center
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl">
            Everything you need to track your child's safe journey
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {helpSections.map((section, index) => (
          <div key={index} className="group cursor-pointer hover:scale-[1.02] transition-all">
            <div className={`w-full h-48 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl group-hover:shadow-2xl transition-all duration-500 ${section.color}`}>
              <section.icon className="w-16 h-16 mb-6 opacity-90 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">
                {section.title}
              </h3>
              <p className="text-white/90 text-lg leading-relaxed drop-shadow-md">
                {section.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Contact */}
      <div className="mt-16 p-8 bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl border-2 border-rose-200">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-rose-900 mb-2">Need Immediate Help?</h3>
          <p className="text-lg text-rose-700">Contact our 24/7 support team</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-rose-100">
            <FiPhone className="w-12 h-12 text-rose-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl text-gray-900 mb-1">Call Now</div>
            <div className="text-rose-600 font-semibold">+91 98765 43210</div>
          </button>
          
          <button className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-rose-100">
            <FiMail className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl text-gray-900 mb-1">Email</div>
            <div className="text-blue-600 font-semibold">support@smartbus.com</div>
          </button>
          
          <button className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-rose-100">
            <FiVideo className="w-12 h-12 text-emerald-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xl text-gray-900 mb-1">Video Call</div>
            <div className="text-emerald-600 font-semibold">Live Support</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;