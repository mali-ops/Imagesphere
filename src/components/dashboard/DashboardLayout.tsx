import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  UploadCloud,
  Images,
  FolderOpen,
  BarChart3,
  HardDrive,
  User,
  Settings,
  HelpCircle,
  Webhook,
  LogOut,
  Shield,
  Menu,
  X,
  Layers,
  Sun,
  Moon,
  AlertCircle,
  Bell,
  Search,
} from 'lucide-react';
import { StorageProgress } from '../ui/StorageProgress';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const {
    activeRoute,
    navigateTo,
    currentUser,
    logout,
    announcements,
    theme,
    setTheme,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { label: 'Overview', route: 'dashboard-overview', icon: LayoutDashboard },
    { label: 'Upload', route: 'dashboard-upload', icon: UploadCloud },
    { label: 'My Images', route: 'dashboard-images', icon: Images },
    { label: 'Folders', route: 'dashboard-folders', icon: FolderOpen },
    { label: 'Analytics', route: 'dashboard-analytics', icon: BarChart3 },
    { label: 'Storage', route: 'dashboard-storage', icon: HardDrive },
    { label: 'Profile', route: 'dashboard-profile', icon: User },
    { label: 'Webhooks', route: 'dashboard-webhooks', icon: Webhook },
    { label: 'Settings', route: 'dashboard-settings', icon: Settings },
    { label: 'Help', route: 'dashboard-help', icon: HelpCircle },
  ];

  const activeAnnouncements = announcements.filter(
    (a) => a.status === 'active' && !dismissedAnnouncements.includes(a.id)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-white">
      {/* Mobile Top Header */}
      <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 h-16 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => navigateTo('dashboard-overview')}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-base">ImgSphere</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
      <aside
        id="dashboard-sidebar"
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                navigateTo('dashboard-overview');
                setSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-base leading-tight">ImgSphere</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                  Client Dashboard
                </span>
              </div>
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Bar */}
          {currentUser && (
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.full_name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.full_name}
                </p>
                <span className="inline-block px-1.5 py-0.2 text-[10px] font-semibold rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  {currentUser.role === 'admin' ? 'Admin / Owner' : 'Free Plan (1 GB)'}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.route;
              return (
                <button
                  key={item.route}
                  id={`sidebar-link-${item.route}`}
                  onClick={() => {
                    navigateTo(item.route as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin shortcut if user is an admin */}
            {currentUser?.role === 'admin' && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    navigateTo('admin-overview');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
                >
                  <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Admin Panel</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Section: Storage widget & Theme/Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {currentUser && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750">
              <StorageProgress
                usedBytes={currentUser.storage_used}
                limitBytes={currentUser.storage_limit}
                compact
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg text-xs flex items-center gap-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span className="capitalize">{theme} mode</span>
            </button>

            <button
              id="sidebar-logout-btn"
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with breadcrumb / quick actions */}
        <header className="hidden md:flex h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('home')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              ← Public Site
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 capitalize">
              {activeRoute.replace('dashboard-', '').replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigateTo('dashboard-upload')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Images</span>
            </button>
          </div>
        </header>

        {/* Global Announcement Banner if present */}
        {activeAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className="bg-blue-600 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2 max-w-4xl truncate">
              <Bell className="w-4 h-4 shrink-0 animate-bounce" />
              <span className="font-bold">{ann.title}:</span>
              <span className="truncate">{ann.message}</span>
            </div>
            <button
              onClick={() => setDismissedAnnouncements((prev) => [...prev, ann.id])}
              className="p-1 hover:bg-blue-700 rounded text-blue-200 hover:text-white shrink-0"
              title="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
