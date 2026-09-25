import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Shield,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Lock,
  Heart,
  CheckCircle2,
  Tag,
  Key,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { systemSettings, navigateTo, addToast, currentUser } = useApp();

  const handleAdminClick = () => {
    if (currentUser?.role === 'admin') {
      navigateTo('admin-overview');
    } else {
      navigateTo('auth-login', { portal: 'admin' });
    }
  };

  const discountActive = systemSettings?.discount_campaign?.is_active;
  const discountCode = systemSettings?.discount_campaign?.code;
  const discountPercent = systemSettings?.discount_campaign?.percentage;

  return (
    <footer
      id="main-footer"
      className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800 text-sm relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Promotional Banner inside Footer if Discount is active */}
        {discountActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-700/40 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" /> Special Promo Active
                </span>
                <p className="text-sm font-semibold text-white">
                  Save {discountPercent}% today! Use promo code{' '}
                  <code className="px-2 py-0.5 bg-black/40 text-amber-300 font-mono rounded border border-amber-400/30">
                    {discountCode}
                  </code>{' '}
                  for extra storage & pro features.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('pricing')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              <span>Explore Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Main Grid with scroll animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Identity Column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="flex items-center gap-2.5">
              {systemSettings?.logo_type === 'image' && systemSettings?.logo_image_url ? (
                <img
                  src={systemSettings.logo_image_url}
                  alt={systemSettings.site_name || 'Logo'}
                  className="h-9 max-w-[130px] object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 font-bold">
                  <Layers className="w-5 h-5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  {systemSettings?.site_name || 'ImgSphere'}
                </span>
                <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                  {systemSettings?.site_tagline || 'Cloud Image Hosting'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {systemSettings?.footer_description ||
                'High-performance cloud image hosting designed for developers, digital artists, and online creators. Simple, fast, and secure media management.'}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{systemSettings?.footer_status_text || 'All systems operational'}</span>
            </div>
          </motion.div>

          {/* Platform Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('features')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Platform Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('how-it-works')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('pricing')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Pricing Plans</span>
                  {discountActive && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                      Sale
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  About Platform
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Client Portal & Resources */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Client Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('auth-login', { portal: 'client' })}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Client Sign In</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('signup')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Create Client Account</span>
                  <Sparkles className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('help')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Help Center & FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </motion.div>

          {/* ADMIN PANEL OPTION IN FOOTER (Requested by User) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Access</span>
            </h4>

            {/* Dedicated Admin Portal Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-800/40 hover:border-purple-600/60 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Authorized platform management, CMS editing, discount campaigns, and security settings.
              </p>
              <button
                id="footer-admin-portal-btn"
                onClick={handleAdminClick}
                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-900/30 active:scale-95"
              >
                <Key className="w-3 h-3" />
                <span>{currentUser?.role === 'admin' ? 'Open Admin Panel' : 'Admin Sign In'}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar with Copyright and Legal Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4"
        >
          <p>
            {systemSettings?.footer_copyright ||
              `© ${new Date().getFullYear()} ImgSphere. All rights reserved.`}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() =>
                addToast('Terms of Service', 'ImgSphere provides fair-use free image hosting.', 'info')
              }
              className="hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() =>
                addToast('Privacy Policy', 'We value your privacy. No tracking cookies sold.', 'info')
              }
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo('help')}
              className="hover:text-slate-300 transition-colors"
            >
              Report Abuse
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
