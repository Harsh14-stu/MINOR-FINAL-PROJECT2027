import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        animate={{ 
          rotate: 360 
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full"
      />
    </div>
  );
};

export default LoadingSpinner;