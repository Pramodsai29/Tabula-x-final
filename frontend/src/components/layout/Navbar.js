import React, { useContext, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  KeyIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Upload', href: '/upload' },
  { name: 'Transform', href: '/transform' },
  { name: 'Apply', href: '/apply' },
  { name: 'About', href: '/about' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Navbar = () => {
  // Animation variants for navbar items
  const logoVariants = {
    hover: {
      scale: 1.1,
      transition: { type: 'spring', stiffness: 300 }
    }
  };
  
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut'
      }
    })
  };
  const location = useLocation();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  
  return (
    <Disclosure as="nav" className="bg-white shadow sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <motion.div 
                  className="flex flex-shrink-0 items-center"
                  whileHover="hover"
                  variants={logoVariants}
                >
                  <Link to="/">
                    <span className="text-2xl font-bold text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">TabulaX</span>
                  </Link>
                </motion.div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:items-center">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={navItemVariants}
                      whileHover={{ y: -2, scale: 1.05, transition: { duration: 0.2, ease: 'easeOut' } }}
                      className="h-full flex items-center"
                    >
                      <Link
                        key={index}
                        to={item.href}
                        className={classNames(
                          // Special color for Home and Upload links
                          (item.name === 'Home') && 'text-primary-700',
                          // Active page styling
                          location.pathname === item.href
                            ? 'border-primary-500 font-bold'
                            : 'text-gray-700 hover:text-primary-700 hover:border-primary-300 border-b-2 border-transparent',
                          'inline-flex items-center px-3 py-2 text-sm font-medium h-16 transition-colors duration-200'
                        )}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* User authentication section */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center h-full">
                {isAuthenticated ? (
                  <div className="flex items-center h-full">

                    {/* Notification bell */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-full p-1 text-gray-400 hover:text-gray-500 mr-4 relative"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white"></span>
                    </motion.button>
                    
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative h-full flex items-center">
                      <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
                        <Menu.Button className="flex rounded-lg bg-gradient-to-r from-primary-100 to-primary-200 p-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <div className="flex items-center rounded-lg bg-white px-3 py-1.5">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                              {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircleIcon className="h-6 w-6" />}
                            </div>
                            <span className="ml-2 text-gray-700 font-medium">{user?.name}</span>
                          </div>
                        </Menu.Button>
                      </motion.div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-100"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 top-full z-10 mt-1 w-64 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                          {/* User info section with gradient background */}
                          <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-3 border-b border-gray-200">
                            <p className="text-sm font-medium text-gray-900">Signed in as</p>
                            <p className="text-sm text-gray-600 font-medium break-all">{user?.email}</p>
                          </div>
                          
                          {/* Menu items with consistent spacing */}
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/settings"
                                  className={classNames(
                                    active ? 'bg-gray-50 text-primary-700' : 'text-gray-700',
                                    'flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150'
                                  )}
                                >
                                  <Cog6ToothIcon className="mr-3 h-5 w-5 text-primary-500" aria-hidden="true" />
                                  Settings
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={logout}
                                  className={classNames(
                                    active ? 'bg-gray-50 text-red-600' : 'text-gray-700',
                                    'flex w-full items-center text-left px-4 py-3 text-sm font-medium transition-colors duration-150 border-t border-gray-100'
                                  )}
                                >
                                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-500" aria-hidden="true" />
                                  Sign out
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    item.href === location.pathname
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            
            {/* Mobile authentication menu */}
            <div className="border-t border-gray-200 pb-3 pt-4">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircleIcon className="h-8 w-8" />}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-semibold text-gray-800">{user?.name}</div>
                        <div className="text-sm font-medium text-gray-600">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <Disclosure.Button
                      as={Link}
                      to="/settings"
                      className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 w-full"
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Settings
                    </Disclosure.Button>

                    <Disclosure.Button
                      as="button"
                      onClick={logout}
                      className="flex w-full items-center text-left px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-150 border-t border-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Sign out
                    </Disclosure.Button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Login
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/register"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign up
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
