import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Compass,
  FileText,
  Activity,
  Wrench,
  Package,
  Calendar,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User as UserIcon,
  HelpCircle,
  Home,
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SERVICE_MANAGER', 'SERVICE_ENGINEER', 'ACCOUNTS', 'VIEWER'] },
    { name: 'Equipment Catalog', path: '/equipment', icon: Activity, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SERVICE_MANAGER', 'VIEWER'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SERVICE_MANAGER', 'VIEWER'] },
    { name: 'Daily Reports', path: '/daily-reports', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SERVICE_MANAGER', 'SERVICE_ENGINEER', 'ACCOUNTS', 'VIEWER'] },
    { name: 'Installations', path: '/installations', icon: Compass, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SERVICE_MANAGER', 'SERVICE_ENGINEER', 'VIEWER'] },
    { name: 'Service Calls', path: '/service-calls', icon: Wrench, roles: ['SUPER_ADMIN', 'ADMIN', 'SERVICE_MANAGER', 'SERVICE_ENGINEER', 'VIEWER'] },
    { name: 'PM Schedule', path: '/preventive-maintenance', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN', 'SERVICE_MANAGER', 'SERVICE_ENGINEER', 'VIEWER'] },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'SERVICE_MANAGER', 'VIEWER'] },
    { name: 'Accounts', path: '/accounts', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS', 'SALES_MANAGER', 'VIEWER'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
  ];

  const allowedItems = menuItems.filter((item) => !user || item.roles.includes(user.role));

  const notifications = [
    { id: 1, title: 'Warranty Expiry Alert', desc: 'Philips Respironics at Metro Lab expires in 15 days.', time: '1 hr ago' },
    { id: 2, title: 'PM Due Notification', desc: 'PM visit scheduled for GE Voluson at City Heart today.', time: '2 hrs ago' },
    { id: 3, title: 'New Ticket Assigned', desc: 'SRV-2026-0001 assigned to Tony Stark.', time: '3 hrs ago' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 76 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 h-full relative z-20"
      >
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-5 py-6 h-18 border-b border-slate-800">
          {!sidebarCollapsed && (
            <span className="font-extrabold text-xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-400" /> BioTrack EMS
            </span>
          )}
          {sidebarCollapsed && <Activity className="h-7 w-7 text-blue-400 mx-auto" />}
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowedItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-900/30'
                    : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                }`}
              >
                <Icon className="h-5 w-5 min-w-[20px]" />
                {!sidebarCollapsed && <span className="text-sm truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card / Logout */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          {!sidebarCollapsed && user && (
            <div className="bg-slate-800/50 p-3 rounded-xl flex items-center gap-3 border border-slate-800">
              <div className="h-9 w-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-between justify-center text-blue-300 font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 uppercase font-mono tracking-wider truncate">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 rounded-full p-1 cursor-pointer shadow-md"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-18 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2">
              <span className="md:hidden"><Activity className="h-5 w-5 text-blue-600" /></span>
              {allowedItems.find((i) => i.path === location.pathname)?.name || 'BioTrack EMS'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input Mock */}
            <div className="relative hidden md:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Global search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-60"
              />
            </div>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 relative transition-all"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-4"
                    >
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                        <span className="font-bold text-sm text-slate-900">Notifications</span>
                        <span className="text-xs text-blue-600 cursor-pointer font-semibold">Mark read</span>
                      </div>
                      <div className="space-y-3">
                        {notifications.map((item) => (
                          <div key={item.id} className="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                            <h4 className="font-semibold text-xs text-slate-800">{item.title}</h4>
                            <p className="text-slate-500 text-xs mt-0.5 leading-snug">{item.desc}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-semibold text-slate-700 text-sm px-1">{user.name.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                          <p className="font-bold text-sm text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] uppercase font-mono tracking-wider font-bold rounded">
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="p-1">
                          <Link
                            to="/settings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                          >
                            <Settings className="h-4 w-4" /> System Settings
                          </Link>
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                          >
                            <LogOut className="h-4 w-4" /> Log Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto page-fade-in">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-20 shadow-lg">
          {allowedItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                  isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-none">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
export default AdminLayout;
