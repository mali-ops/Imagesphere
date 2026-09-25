import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, navigateTo, routeParams, addToast, users } = useApp();
  const [portalMode, setPortalMode] = useState<'client' | 'admin'>(() => {
    if (routeParams?.portal === 'admin') return 'admin';
    return 'client';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handlePortalChange = (mode: 'client' | 'admin') => {
    setPortalMode(mode);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);

    const targetUser = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (portalMode === 'admin' && targetUser && targetUser.role !== 'admin') {
      addToast(
        'Admin Access Restricted',
        'This account is registered as a standard client. Please switch to the Client Portal to log in.',
        'warning'
      );
      setLoading(false);
      return;
    }

    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8">
        
        {/* Dual Portal Switcher Tabs */}
        <div className="mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl grid grid-cols-2 gap-1 border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            id="login-tab-client-portal"
            onClick={() => handlePortalChange('client')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              portalMode === 'client'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Client Portal</span>
          </button>

          <button
            type="button"
            id="login-tab-admin-portal"
            onClick={() => handlePortalChange('admin')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              portalMode === 'admin'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Portal Header */}
        <div className="text-center mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md transition-colors ${
              portalMode === 'admin'
                ? 'bg-purple-600 text-white shadow-purple-600/25'
                : 'bg-blue-600 text-white shadow-blue-600/25'
            }`}
          >
            {portalMode === 'admin' ? <Shield className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {portalMode === 'admin' ? 'Admin Portal Login' : 'Client Portal Login'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {portalMode === 'admin'
              ? 'Platform control room for moderation, client accounts, website CMS & storage secrets.'
              : 'Upload images, manage folders, generate shareable links, and track real-time views.'}
          </p>
        </div>

        {/* Admin Authentication Notice (No one-click bypass for clients) */}
        {portalMode === 'admin' && (
          <div className="mb-6 p-3.5 rounded-2xl border text-xs bg-purple-50/60 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-900/40 text-purple-900 dark:text-purple-200">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Admin Authentication Portal</span>
            </div>
            <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed">
              Enter your master administrator username or email and passcode configured in the Admin CMS to access moderation controls.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {portalMode === 'admin' ? 'Admin Username or Email' : 'Email Address'}
            </label>
            <div className="relative">
              {portalMode === 'admin' ? (
                <Shield className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              ) : (
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}
              <input
                id="login-email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={portalMode === 'admin' ? 'sarah_admin or admin@imgsphere.io' : 'name@example.com'}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {portalMode === 'admin' ? 'Admin Passcode' : 'Password'}
              </label>
              {portalMode === 'client' && (
                <button
                  type="button"
                  onClick={() => navigateTo('auth-forgot')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={portalMode === 'admin' ? 'Enter admin passcode' : '••••••••'}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember Me</span>
            </label>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
              portalMode === 'admin'
                ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 shadow-purple-600/20'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-600/20'
            }`}
          >
            {loading
              ? 'Authenticating...'
              : portalMode === 'admin'
              ? 'Sign In to Admin Portal'
              : 'Sign In to Client Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          {portalMode === 'admin' ? (
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 bg-purple-50/50 dark:bg-purple-950/20 py-2.5 px-3 rounded-xl border border-purple-200/40 dark:border-purple-900/30">
              <Lock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span>Admin Panel is Sign In only. Registration is restricted.</span>
            </div>
          ) : (
            <div>
              Don't have a client account yet?{' '}
              <button
                id="login-create-account-link"
                onClick={() => navigateTo('signup')}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create free client account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SignupPage: React.FC = () => {
  const { signup, navigateTo } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const success = await signup(fullName, email, password);
    setLoading(false);
    if (!success) {
      setError('Signup failed. Email might already be registered.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-600/20">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Free Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            1 GB free storage, unlimited links, and instant setup
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              id="terms-checkbox"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms-checkbox" className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
              I agree to the <span className="text-blue-600 underline">Terms of Service</span> & <span className="text-blue-600 underline">Privacy Policy</span>.
            </label>
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <div>
            Already have an account?{' '}
            <button
              onClick={() => navigateTo('auth-login', { portal: 'client' })}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign In to Client Portal
            </button>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            Looking for Admin Portal?{' '}
            <button
              onClick={() => navigateTo('auth-login', { portal: 'admin' })}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              Admin Sign In &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const { navigateTo, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    addToast('Reset Link Sent', `Password reset instructions sent to ${email}`, 'success');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-600/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reset Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter your account email to receive a password recovery link
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Check Your Inbox
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              We sent a password reset email to <strong>{email}</strong>. Follow the instructions in the email to regain access.
            </p>
            <button
              onClick={() => navigateTo('auth-login')}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => navigateTo('auth-login')}
              className="w-full py-2.5 text-xs text-slate-600 dark:text-slate-400 hover:underline text-center"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const AuthPages: React.FC = () => {
  const { activeRoute } = useApp();

  if (activeRoute === 'auth-signup' || activeRoute === 'signup') {
    return <SignupPage />;
  }
  if (activeRoute === 'auth-forgot' || activeRoute === 'forgot-password') {
    return <ForgotPasswordPage />;
  }
  return <LoginPage />;
};
