import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to settings page
    navigate('/settings');
    toast('Profile page has moved to Settings', {
      icon: '🔄',
      duration: 3000
    });
  }, [navigate]);
  
  // Render a simple loading state while redirecting
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <p className="text-gray-600">Redirecting to Settings...</p>
      </motion.div>
    </div>
  );
};

export default Profile;
