import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  ArrowPathIcon, 
  UserCircleIcon, 
  AtSymbolIcon, 
  KeyIcon, 
  CheckCircleIcon, 
  BellIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { user, updateProfile, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');

  
  // Check for tab parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['profile', 'account'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const { name, email, password, confirmPassword } = formData;
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError('');
    
    // Only include password in the update if it's provided
    const updateData = {
      name,
      email,
      ...(password && { password }),
    };
    
    const success = await updateProfile(updateData);
    
    if (success) {
      toast.success('Profile updated successfully');
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-[70vh] flex items-center justify-center"
      >
        <motion.div 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center p-8 bg-white rounded-xl shadow-md max-w-md w-full"
        >
          <UserCircleIcon className="h-20 w-20 mx-auto text-gray-400" />
          <h2 className="text-2xl font-medium text-gray-900 mt-4">Please log in to view your settings</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to access your settings and profile information.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="mt-6 w-full inline-flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
          >
            Go to Login
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 200 } }
  };

  // Tab configuration
  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon className="h-5 w-5" />,
      description: 'Manage your personal information and password'
    },
    {
      id: 'account',
      label: 'Account',
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      description: 'Manage your account settings and preferences'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="overflow-hidden sm:rounded-xl bg-white shadow-sm border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
              <motion.h3 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-gray-900 flex items-center"
              >
                <UserCircleIcon className="h-6 w-6 mr-2 text-primary-500" />
                Profile Information
              </motion.h3>
              <p className="mt-1 text-sm text-gray-600">Manage your personal details and update your password</p>
            </div>
            
            <div className="px-8 py-8">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 p-4 mb-8 border-l-4 border-red-400 shadow-sm"
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="space-y-8">
                <motion.div 
                  className="p-6 rounded-lg border border-gray-100 bg-white shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="text-base font-medium text-gray-800 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCircleIcon className="h-5 w-5 text-primary-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={name}
                          onChange={onChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg shadow-sm transition duration-150"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <AtSymbolIcon className="h-5 w-5 text-primary-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={email}
                          onChange={onChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg shadow-sm transition duration-150"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="p-6 rounded-lg border border-gray-100 bg-white shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h4 className="text-base font-medium text-gray-800 mb-4">Security</h4>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyIcon className="h-5 w-5 text-primary-400" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          value={password}
                          onChange={onChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg shadow-sm transition duration-150"
                          placeholder="Leave blank to keep current"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Must be at least 6 characters long
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CheckCircleIcon className="h-5 w-5 text-primary-400" />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={onChange}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg shadow-sm transition duration-150"
                          placeholder="Re-enter new password"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            <div className="px-8 py-5 bg-gray-50 flex justify-end border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                {loading ? (
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                )}
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </motion.button>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="shadow overflow-hidden sm:rounded-xl bg-white">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
              <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences</p>
            </div>
            
            <div className="px-6 py-6">
              <p className="text-gray-500 italic text-center py-16">
                Account settings will be implemented according to your specific requirements.
              </p>
            </div>
          </div>
        );
      default:
        return <div>Select a tab to view settings</div>;
    }
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account, profile, and preferences</p>
      </div>

      <div className="md:grid md:grid-cols-4 md:gap-8">
        <motion.div 
          className="md:col-span-1"
          variants={itemVariants}
        >
          <div className="sticky top-24 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircleIcon className="h-10 w-10" />}
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium leading-6 text-center text-gray-900 mb-1">{user?.name}</h3>
            <p className="text-sm text-center text-gray-500 mb-6">{user?.email}</p>
            
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center py-3 px-4 rounded-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className={`mr-3 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`}>
                    {tab.icon}
                  </span>
                  <span className={`text-sm font-medium ${activeTab === tab.id ? 'text-primary-700' : 'text-gray-700'}`}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="mt-8">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-5 md:mt-0 md:col-span-3"
          variants={itemVariants}
        >
          <form onSubmit={onSubmit}>
            {renderTabContent()}
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;
