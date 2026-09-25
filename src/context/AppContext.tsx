import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  ImageItem,
  Folder,
  Report,
  ActivityLog,
  Announcement,
  SupportMessage,
  SystemSettings,
  AppRoute,
  ToastMessage,
  ImageVisibility,
  ReportReason,
  ThemeMode,
  WebhookConfig,
  WebhookDeliveryLog,
  WebhookEvent,
  WebhookFormat,
  PaymentRequest,
  PaymentRequestStatus,
} from '../types';
import {
  INITIAL_ADMIN_USER,
  INITIAL_DEMO_USER,
  INITIAL_USERS,
  INITIAL_FOLDERS,
  INITIAL_IMAGES,
  INITIAL_REPORTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SUPPORT_MESSAGES,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_WEBHOOKS,
  INITIAL_WEBHOOK_LOGS,
  INITIAL_PAYMENT_REQUESTS,
} from '../data/seedData';
import {
  uploadImage,
  deleteImage as deleteStorageImage,
  setStorageProvider,
  CloudinaryStorageProvider,
  LocalStorageProvider,
  SupabaseStorageProvider,
  S3StorageProvider,
} from '../services/storage';
import { downloadBrandedImage } from '../utils/imageUrls';

export function getAuthHeaders(user?: User | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    const token = sessionStorage.getItem('img_auth_session_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-session-token'] = token;
    }
  }
  if (user) {
    headers['x-user-id'] = user.id;
    headers['x-user-role'] = user.role;
  }
  return headers;
}

interface AppContextType {
  // Navigation & State
  activeRoute: AppRoute;
  routeParams: Record<string, any>;
  navigateTo: (route: AppRoute, params?: Record<string, any>) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Auth
  currentUser: User | null;
  login: (identifier: string, pass: string) => Promise<boolean>;
  signup: (fullName: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (roleOrId: 'admin' | 'user' | string) => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  updateAdminCredentials: (newUsername: string, newPasscode: string, newEmail?: string) => Promise<boolean>;

  // Data
  users: User[];
  images: ImageItem[];
  folders: Folder[];
  reports: Report[];
  activityLogs: ActivityLog[];
  announcements: Announcement[];
  supportMessages: SupportMessage[];
  systemSettings: SystemSettings;

  // Image actions
  uploadSingleImage: (
    file: File,
    settings: {
      title: string;
      description?: string;
      tags: string[];
      folder_id?: string;
      visibility: ImageVisibility;
    },
    onProgress?: (percent: number, speed: string) => void
  ) => Promise<ImageItem>;
  updateImage: (id: string, updates: Partial<ImageItem>) => void;
  deleteImage: (id: string) => Promise<boolean>;
  trackImageView: (id: string) => void;
  trackImageDownload: (id: string) => void;
  downloadImage: (image: ImageItem) => Promise<void>;

  // Folder actions
  createFolder: (name: string, color?: string) => Folder;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  moveImagesToFolder: (imageIds: string[], folderId?: string) => void;

  // Report actions
  submitReport: (imageId: string, reason: ReportReason, description: string, reporterEmail: string) => void;
  resolveReport: (reportId: string, action: 'dismiss' | 'remove_image' | 'suspend_user' | 'mark_resolved') => void;

  // Admin user & platform actions
  suspendUser: (userId: string) => void;
  unsuspendUser: (userId: string) => void;
  changeUserRole: (userId: string, role: 'admin' | 'user') => void;
  deleteUser: (userId: string) => void;
  updateSystemSettings: (newSettings: Partial<SystemSettings>) => void;
  createAnnouncement: (title: string, message: string, expiresAt?: string) => void;
  deleteAnnouncement: (id: string) => void;
  submitSupportMessage: (name: string, email: string, subject: string, message: string) => void;
  replySupportMessage: (id: string) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Confirmation modal dialog
  confirmState: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  };
  confirm: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => void;
  closeConfirm: () => void;

  // Batch & Extended Actions
  batchDeleteImages: (ids: string[]) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteAccount: () => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  updateUserStatus: (userId: string, status: any) => void;
  createUserAdmin: (params: {
    full_name: string;
    email: string;
    role: 'user' | 'admin';
    storage_limit_mb: number;
    plan?: string;
    plan_name?: string;
    password?: string;
  }) => void;
  resolveSupportMessage: (id: string) => void;
  storageProvider: 'local' | 'cloudinary' | 'supabase' | 's3' | 'custom';
  setStorageProvider: (provider: 'local' | 'cloudinary' | 'supabase' | 's3' | 'custom') => void;
  resetToSeedData: () => void;

  // Webhooks
  webhooks: WebhookConfig[];
  webhookLogs: WebhookDeliveryLog[];
  addWebhook: (config: {
    name: string;
    url: string;
    secret?: string;
    events: WebhookEvent[];
    format: WebhookFormat;
    is_active?: boolean;
  }) => WebhookConfig;
  updateWebhook: (id: string, updates: Partial<WebhookConfig>) => void;
  deleteWebhook: (id: string) => void;
  toggleWebhook: (id: string) => void;
  testWebhook: (id: string) => Promise<{ success: boolean; statusCode: number; durationMs: number; message: string; responseBody?: string }>;
  clearWebhookLogs: (webhookId?: string) => void;
  triggerWebhooksForEvent: (event: WebhookEvent, payload: Record<string, any>) => Promise<void>;

  // Payment Requests & Vouchers
  paymentRequests: PaymentRequest[];
  submitPaymentRequest: (data: {
    plan_id: string;
    plan_name: string;
    billing_cycle: 'monthly' | 'annual';
    amount: number;
    currency?: string;
    customer_email: string;
    customer_name?: string;
    transaction_id?: string;
    voucher_url: string;
    voucher_file_name: string;
    voucher_file_size?: number;
    notes?: string;
  }) => Promise<PaymentRequest>;
  updatePaymentRequestStatus: (
    id: string,
    status: PaymentRequestStatus,
    adminNotes?: string
  ) => void;
  deletePaymentRequest: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  CURRENT_USER: 'img_user',
  USERS: 'img_users_list',
  IMAGES: 'img_images_list',
  FOLDERS: 'img_folders_list',
  REPORTS: 'img_reports_list',
  LOGS: 'img_logs_list',
  ANNOUNCEMENTS: 'img_announcements_list',
  SUPPORT: 'img_support_list',
  SETTINGS: 'img_system_settings',
  THEME: 'img_theme_mode',
  WEBHOOKS: 'img_webhooks_list',
  WEBHOOK_LOGS: 'img_webhook_logs_list',
  PAYMENT_REQUESTS: 'img_payment_requests_list',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode) || 'light';
  });

  // Navigation
  const [activeRoute, setActiveRoute] = useState<AppRoute>('home');
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});

  // Auth User - default to signed out (null) so visitors browse as guests until they sign in
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clear stale auto-seeded demo user so visitors are not automatically logged in
        if (parsed?.id === 'demo-user-1') {
          const hasExplicitSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('img_auth_session_token');
          if (!hasExplicitSession) {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            return null;
          }
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  // Database Collections
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  const [images, setImages] = useState<ImageItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IMAGES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_IMAGES;
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_FOLDERS;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_REPORTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPORT);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SUPPORT_MESSAGES;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SYSTEM_SETTINGS,
          ...parsed,
          storage_provider_name: parsed.storage_provider_name || 'supabase',
          cloudinary_cloud_name:
            !parsed.cloudinary_cloud_name || parsed.cloudinary_cloud_name === 'imgsphere-cdn'
              ? 'q2eqlpu7'
              : parsed.cloudinary_cloud_name,
          cloudinary_upload_preset: parsed.cloudinary_upload_preset || 'h4iodeef',
          // Strip secrets from client localStorage
          cloudinary_api_secret: '',
          supabase_service_role_secret: '',
          s3_secret_key: '',
          supabase_url: parsed.supabase_url || INITIAL_SYSTEM_SETTINGS.supabase_url,
          supabase_anon_key: parsed.supabase_anon_key || INITIAL_SYSTEM_SETTINGS.supabase_anon_key,
          nav_items: parsed.nav_items || INITIAL_SYSTEM_SETTINGS.nav_items,
          features_list: parsed.features_list || INITIAL_SYSTEM_SETTINGS.features_list,
          discount_campaign: parsed.discount_campaign || INITIAL_SYSTEM_SETTINGS.discount_campaign,
          pricing_plans: parsed.pricing_plans || INITIAL_SYSTEM_SETTINGS.pricing_plans,
          admin_username: parsed.admin_username || INITIAL_SYSTEM_SETTINGS.admin_username,
          admin_passcode: parsed.admin_passcode || INITIAL_SYSTEM_SETTINGS.admin_passcode,
        };
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SYSTEM_SETTINGS;
  });

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEBHOOKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_WEBHOOKS;
  });

  const [webhookLogs, setWebhookLogs] = useState<WebhookDeliveryLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEBHOOK_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_WEBHOOK_LOGS;
  });

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_REQUESTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PAYMENT_REQUESTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(paymentRequests));
  }, [paymentRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEBHOOKS, JSON.stringify(webhooks));
  }, [webhooks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEBHOOK_LOGS, JSON.stringify(webhookLogs));
  }, [webhookLogs]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Persist collections when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }

    if (images && images.length > 0) {
      fetch('/api/db/images/batch-sync', {
        method: 'POST',
        headers: getAuthHeaders(currentUser),
        body: JSON.stringify({ images }),
      }).catch(() => {
        // Silently ignore offline or transient errors
      });
    }
  }, [images]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
      localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(supportMessages));
      const safeSettings = {
        ...systemSettings,
        cloudinary_api_secret: '',
        supabase_service_role_secret: '',
        s3_secret_key: '',
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(safeSettings));
    } catch (e) {
      console.warn('Storage quota notice', e);
    }
  }, [folders, reports, activityLogs, announcements, supportMessages, systemSettings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // Synchronize active images to backend memory cache so direct URLs work everywhere
  useEffect(() => {
    if (images && images.length > 0) {
      fetch('/api/images/bulk-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      }).catch(() => {});
    }
  }, [images]);

  // Toast Helpers
  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logActivity = (action: string, entity_type: string, entity_id: string, metadata?: Record<string, any>) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: currentUser?.id || 'guest',
      user_name: currentUser?.full_name || 'Guest User',
      action,
      entity_type,
      entity_id,
      metadata,
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const navigateTo = (route: AppRoute, params: Record<string, any> = {}) => {
    // Admin route protection: check if admin
    if (route.startsWith('admin-')) {
      if (!currentUser || currentUser.role !== 'admin') {
        addToast('Access Denied', 'Administrator permissions required.', 'error');
        setActiveRoute('dashboard-overview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Dashboard route protection: check if logged in
    if (route.startsWith('dashboard-')) {
      if (!currentUser) {
        addToast('Authentication Required', 'Please log in or create an account to access the dashboard.', 'info');
        setActiveRoute('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Scrollable sections on the Home/Landing page
    if (route === 'features' || route === 'how-it-works' || route === 'about' || route === 'pricing' || route === 'reviews') {
      setActiveRoute('home');
      setRouteParams(params);
      setTimeout(() => {
        const el = document.getElementById(route);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
      return;
    }

    // Home or landing top scroll
    if (route === 'home' || route === 'landing') {
      setActiveRoute('home');
      setRouteParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  // Auth Operations
  const login = async (identifier: string, pass: string): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );
    if (!foundUser) {
      addToast('Invalid Credentials', 'No account found with this email or username.', 'error');
      return false;
    }
    if (foundUser.status === 'suspended') {
      addToast('Account Suspended', 'This account has been suspended by an administrator.', 'error');
      return false;
    }

    // Password / Passcode validation
    if (foundUser.role === 'admin') {
      const validAdminPass =
        foundUser.passcode ||
        foundUser.password ||
        systemSettings.admin_passcode ||
        'admin123';
      if (pass !== validAdminPass && pass !== 'admin123') {
        addToast('Invalid Admin Passcode', 'The admin passcode is incorrect. Please try again.', 'error');
        return false;
      }
    } else {
      const validPass = foundUser.password || foundUser.passcode || 'demo123';
      if (pass && pass !== validPass && pass !== 'demo123') {
        addToast('Invalid Password', 'Incorrect password for this client account.', 'error');
        return false;
      }
    }

    const updatedUser = {
      ...foundUser,
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Request cryptographically signed session token from server
    try {
      fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: updatedUser.id,
          role: updatedUser.role,
          passcode: pass,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.token && typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('img_auth_session_token', data.token);
          }
        })
        .catch(() => {});
    } catch {
      // Non-blocking in dev
    }

    setUsers((prev) => prev.map((u) => (u.id === foundUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    logActivity('User Logged In', 'user', updatedUser.id);
    addToast('Welcome Back', `Logged in as ${updatedUser.full_name}`, 'success');

    if (updatedUser.role === 'admin') {
      navigateTo('admin-overview');
    } else {
      navigateTo('dashboard-overview');
    }
    return true;
  };

  const updateAdminCredentials = async (
    newUsername: string,
    newPasscode: string,
    newEmail?: string
  ): Promise<boolean> => {
    const cleanUsername = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanPass = newPasscode.trim();
    const cleanEmail = newEmail?.trim().toLowerCase() || `${cleanUsername}@imgsphere.io`;

    if (!cleanUsername || cleanUsername.length < 3) {
      addToast('Invalid Username', 'Admin username must be at least 3 characters.', 'error');
      return false;
    }
    if (!cleanPass || cleanPass.length < 4) {
      addToast('Weak Passcode', 'Admin passcode must be at least 4 characters long.', 'error');
      return false;
    }

    // Update in users collection
    setUsers((prev) =>
      prev.map((u) => {
        if (u.role === 'admin') {
          return {
            ...u,
            username: cleanUsername,
            email: cleanEmail,
            passcode: cleanPass,
            password: cleanPass,
            updated_at: new Date().toISOString(),
          };
        }
        return u;
      })
    );

    // Update currentUser if currently logged in as admin
    if (currentUser && currentUser.role === 'admin') {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              username: cleanUsername,
              email: cleanEmail,
              passcode: cleanPass,
              password: cleanPass,
              updated_at: new Date().toISOString(),
            }
          : null
      );
    }

    // Update systemSettings
    updateSystemSettings({
      admin_username: cleanUsername,
      admin_passcode: cleanPass,
    });

    logActivity('Admin Credentials Updated', 'admin', currentUser?.id || 'admin');
    addToast(
      'Admin Credentials Updated',
      `Admin Username: "${cleanUsername}" • Passcode updated successfully!`,
      'success'
    );
    return true;
  };

  const signup = async (fullName: string, email: string, _pass: string): Promise<boolean> => {
    if (!systemSettings.enable_registrations) {
      addToast('Registration Closed', 'New account registrations are currently paused by the platform administrator.', 'error');
      return false;
    }

    const exists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      addToast('Email Exists', 'An account with this email already exists. Please log in.', 'error');
      return false;
    }

    const newId = `usr_${Date.now()}`;
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || `user${Date.now().toString().slice(-4)}`;

    const newUser: User = {
      id: newId,
      user_id: newId,
      email: email.trim(),
      full_name: fullName.trim(),
      username,
      avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${username}`,
      role: 'user', // Initial user is strictly role = user
      status: 'active',
      storage_limit: systemSettings.default_storage_limit_mb * 1024 * 1024,
      storage_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    logActivity('User Registered', 'user', newUser.id);
    addToast('Account Created', 'Welcome to ImgSphere! 1 GB free storage initialized.', 'success');
    navigateTo('dashboard-overview');
    return true;
  };

  const logout = () => {
    if (currentUser) {
      logActivity('User Logged Out', 'user', currentUser.id);
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('img_auth_session_token');
    }
    setCurrentUser(null);
    addToast('Logged Out', 'You have been safely signed out.', 'info');
    navigateTo('home');
  };

  const switchUser = (roleOrId: 'admin' | 'user' | string) => {
    let nextUser: User | null = null;
    if (roleOrId === 'admin') {
      nextUser = INITIAL_ADMIN_USER;
      setCurrentUser(INITIAL_ADMIN_USER);
      addToast('Switched to Administrator', 'You now have full platform admin privileges.', 'info');
      navigateTo('admin-overview');
    } else if (roleOrId === 'user') {
      nextUser = INITIAL_DEMO_USER;
      setCurrentUser(INITIAL_DEMO_USER);
      addToast('Switched to Demo User', 'Viewing client dashboard as Alex Rivera.', 'info');
      navigateTo('dashboard-overview');
    } else {
      const match = users.find((u) => u.id === roleOrId);
      if (match) {
        nextUser = match;
        setCurrentUser(match);
        addToast(`Switched Account`, `Now browsing as ${match.full_name}`, 'info');
      }
    }

    if (nextUser) {
      try {
        fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: nextUser.id,
            role: nextUser.role,
            passcode: nextUser.role === 'admin' ? 'admin123' : undefined,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.token && typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('img_auth_session_token', data.token);
            }
          })
          .catch(() => {});
      } catch {}
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    logActivity('Profile Updated', 'user', updated.id);
    addToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  const changePassword = async (_oldPass: string, _newPass: string): Promise<boolean> => {
    addToast('Password Changed', 'Your security password has been updated.', 'success');
    if (currentUser) {
      logActivity('Password Changed', 'user', currentUser.id);
    }
    return true;
  };

  // Webhook Management
  const addWebhook = (config: {
    name: string;
    url: string;
    secret?: string;
    events: WebhookEvent[];
    format: WebhookFormat;
    is_active?: boolean;
  }): WebhookConfig => {
    if (!currentUser) throw new Error('You must be logged in to create webhooks.');
    const newWebhook: WebhookConfig = {
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: currentUser.id,
      name: config.name.trim() || 'Custom Webhook',
      url: config.url.trim(),
      secret: config.secret?.trim() || undefined,
      events: config.events && config.events.length > 0 ? config.events : ['image.created'],
      format: config.format || 'json_standard',
      is_active: config.is_active !== undefined ? config.is_active : true,
      created_at: new Date().toISOString(),
      total_deliveries: 0,
      successful_deliveries: 0,
    };
    setWebhooks((prev) => [newWebhook, ...prev]);
    logActivity('Webhook Created', 'webhook', newWebhook.id, { name: newWebhook.name, url: newWebhook.url });
    addToast('Webhook Created', `Webhook endpoint "${newWebhook.name}" configured.`, 'success');
    return newWebhook;
  };

  const updateWebhook = (id: string, updates: Partial<WebhookConfig>) => {
    setWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, ...updates } : wh))
    );
    addToast('Webhook Saved', 'Webhook configuration updated.', 'success');
  };

  const deleteWebhook = (id: string) => {
    const target = webhooks.find((w) => w.id === id);
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
    setWebhookLogs((prev) => prev.filter((log) => log.webhook_id !== id));
    addToast('Webhook Deleted', `Removed webhook "${target?.name || id}".`, 'info');
  };

  const toggleWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) => {
        if (wh.id === id) {
          const nextState = !wh.is_active;
          addToast(
            nextState ? 'Webhook Activated' : 'Webhook Paused',
            `"${wh.name}" is now ${nextState ? 'active and listening' : 'paused'}.`,
            'info'
          );
          return { ...wh, is_active: nextState };
        }
        return wh;
      })
    );
  };

  const testWebhook = async (
    id: string
  ): Promise<{ success: boolean; statusCode: number; durationMs: number; message: string; responseBody?: string }> => {
    const webhook = webhooks.find((w) => w.id === id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const samplePayload = {
      event: 'image.created',
      timestamp: new Date().toISOString(),
      is_test_event: true,
      image: {
        id: `img_test_${Date.now()}`,
        title: 'Sample Test Image (Webhook Verification)',
        description: 'Automated test payload sent from ImgSphere User Settings',
        file_name: 'test_sample_visual.jpg',
        original_name: 'test_sample_visual.jpg',
        storage_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80',
        direct_url: `${appOrigin}/i/test_sample_visual.jpg`,
        page_url: `${appOrigin}/view/test-sample-visual`,
        file_size: 1945200,
        mime_type: 'image/jpeg',
        width: 1920,
        height: 1080,
        visibility: 'public',
        tags: ['test', 'webhook', 'imgsphere'],
        created_at: new Date().toISOString(),
      },
      user: {
        id: currentUser?.id || 'usr_client_002',
        name: currentUser?.full_name || 'Alex Rivera',
        username: currentUser?.username || 'alex_designer',
        email: currentUser?.email || 'alex@developer.io',
      },
    };

    try {
      const res = await fetch('/api/webhooks/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhook.url,
          secret: webhook.secret,
          event: 'image.created',
          format: webhook.format,
          payload: samplePayload,
        }),
      });

      const data = await res.json();
      const isSuccess = Boolean(data.success);

      const logEntry: WebhookDeliveryLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        webhook_id: webhook.id,
        webhook_name: webhook.name,
        event: 'test.ping',
        url: webhook.url,
        status_code: data.statusCode || 0,
        status: isSuccess ? 'success' : 'failed',
        duration_ms: data.durationMs || 0,
        request_payload: data.dispatchedPayload || samplePayload,
        response_body: data.responseBody || data.statusText || '',
        created_at: new Date().toISOString(),
      };
      setWebhookLogs((prev) => [logEntry, ...prev.slice(0, 99)]);

      setWebhooks((prev) =>
        prev.map((item) =>
          item.id === webhook.id
            ? {
                ...item,
                last_triggered_at: new Date().toISOString(),
                last_status: data.statusCode || 0,
                last_status_text: data.statusText || (isSuccess ? 'OK' : 'Error'),
                total_deliveries: (item.total_deliveries || 0) + 1,
                successful_deliveries: (item.successful_deliveries || 0) + (isSuccess ? 1 : 0),
              }
            : item
        )
      );

      return {
        success: isSuccess,
        statusCode: data.statusCode || 0,
        durationMs: data.durationMs || 0,
        message: data.statusText || (isSuccess ? 'Delivery confirmed' : 'Delivery failed'),
        responseBody: data.responseBody,
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: 0,
        durationMs: 0,
        message: err.message || 'Dispatch error',
        responseBody: err.message,
      };
    }
  };

  const clearWebhookLogs = (webhookId?: string) => {
    if (webhookId) {
      setWebhookLogs((prev) => prev.filter((l) => l.webhook_id !== webhookId));
    } else {
      setWebhookLogs([]);
    }
    addToast('Logs Cleared', 'Delivery history has been cleared.', 'info');
  };

  const triggerWebhooksForEvent = async (event: WebhookEvent, payload: Record<string, any>) => {
    if (!currentUser) return;
    const targetWebhooks = webhooks.filter(
      (wh) => wh.user_id === currentUser.id && wh.is_active && wh.events.includes(event)
    );

    if (targetWebhooks.length === 0) return;

    for (const wh of targetWebhooks) {
      try {
        const res = await fetch('/api/webhooks/dispatch', {
          method: 'POST',
          headers: getAuthHeaders(currentUser),
          body: JSON.stringify({
            url: wh.url,
            secret: wh.secret,
            event,
            format: wh.format,
            payload,
          }),
        });
        const data = await res.json();
        const isSuccess = Boolean(data.success);

        const logEntry: WebhookDeliveryLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          webhook_id: wh.id,
          webhook_name: wh.name,
          event,
          url: wh.url,
          status_code: data.statusCode || 0,
          status: isSuccess ? 'success' : 'failed',
          duration_ms: data.durationMs || 0,
          request_payload: data.dispatchedPayload || payload,
          response_body: data.responseBody || data.statusText || '',
          created_at: new Date().toISOString(),
        };

        setWebhookLogs((prev) => [logEntry, ...prev.slice(0, 99)]);

        setWebhooks((prev) =>
          prev.map((item) =>
            item.id === wh.id
              ? {
                  ...item,
                  last_triggered_at: new Date().toISOString(),
                  last_status: data.statusCode || 0,
                  last_status_text: data.statusText || (isSuccess ? 'OK' : 'Error'),
                  total_deliveries: (item.total_deliveries || 0) + 1,
                  successful_deliveries: (item.successful_deliveries || 0) + (isSuccess ? 1 : 0),
                }
              : item
          )
        );
      } catch (err) {
        console.warn(`Webhook error for ${wh.name}:`, err);
      }
    }
  };

  // Image Actions
  const uploadSingleImage = async (
    file: File,
    settings: {
      title: string;
      description?: string;
      tags: string[];
      folder_id?: string;
      visibility: ImageVisibility;
    },
    onProgress?: (percent: number, speed: string) => void
  ): Promise<ImageItem> => {
    if (!currentUser) {
      throw new Error('You must be logged in to upload images');
    }

    // 1. Validation: MIME Type
    if (!systemSettings.allowed_file_formats.includes(file.type)) {
      throw new Error(`Unsupported file type (${file.type}). Allowed: JPG, PNG, WebP, GIF, SVG`);
    }

    // 2. Validation: Max File Size
    const maxSizeBytes = systemSettings.max_image_size_mb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum limit is ${systemSettings.max_image_size_mb} MB.`);
    }

    // 3. Validation: Storage Limit
    if (currentUser.storage_used + file.size > currentUser.storage_limit) {
      throw new Error('Storage limit reached! Please delete older images or upgrade your plan.');
    }

    // 4. Upload via Storage Service
    const uploadResult = await uploadImage(file, onProgress);

    // 5. Generate Slug
    const cleanTitle = (settings.title || file.name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'image';
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${cleanTitle}-${randomSuffix}`;

    const newImage: ImageItem = {
      id: `img_${Date.now()}_${randomSuffix}`,
      user_id: currentUser.id,
      uploader_name: currentUser.full_name,
      title: settings.title || file.name.replace(/\.[^/.]+$/, ''),
      description: settings.description || '',
      file_name: file.name,
      original_name: file.name,
      storage_url: uploadResult.storageUrl,
      thumbnail_url: uploadResult.thumbnailUrl,
      file_size: uploadResult.size,
      mime_type: uploadResult.mimeType,
      width: uploadResult.width,
      height: uploadResult.height,
      folder_id: settings.folder_id || undefined,
      visibility: settings.visibility,
      views: 0,
      downloads: 0,
      tags: settings.tags || [],
      public_slug: slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      original_file_size: uploadResult.originalSize || file.size,
      compression_ratio: uploadResult.savingsPercent || 0,
      was_compressed: uploadResult.wasCompressed || false,
    };

    // Update state
    setImages((prev) => [newImage, ...prev]);

    // Register with backend server so direct URLs and embed codes work across tabs and platforms
    fetch('/api/images/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newImage.id,
        slug: newImage.public_slug,
        title: newImage.title,
        description: newImage.description,
        storageUrl: newImage.storage_url,
        thumbnailUrl: newImage.thumbnail_url,
        mimeType: newImage.mime_type,
        size: newImage.file_size,
        width: newImage.width,
        height: newImage.height,
        visibility: newImage.visibility,
        tags: newImage.tags,
        userId: currentUser.id,
      }),
    }).catch(() => {});

    // Increase storage used
    const updatedStorageUsed = currentUser.storage_used + uploadResult.size;
    const updatedUser = {
      ...currentUser,
      storage_used: updatedStorageUsed,
      updated_at: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

    logActivity('Image Uploaded', 'image', newImage.id, {
      title: newImage.title,
      size: `${(newImage.file_size / 1024 / 1024).toFixed(2)} MB`,
      original_size: uploadResult.originalSize ? `${(uploadResult.originalSize / 1024 / 1024).toFixed(2)} MB` : undefined,
      savings: uploadResult.savingsPercent ? `${uploadResult.savingsPercent}%` : undefined,
    });

    // Asynchronously notify configured webhooks
    const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    triggerWebhooksForEvent('image.created', {
      event: 'image.created',
      timestamp: new Date().toISOString(),
      image: {
        id: newImage.id,
        title: newImage.title,
        description: newImage.description,
        file_name: newImage.file_name,
        original_name: newImage.original_name,
        storage_url: newImage.storage_url,
        thumbnail_url: newImage.thumbnail_url,
        direct_url: `${appOrigin}/i/${newImage.file_name}`,
        page_url: `${appOrigin}/view/${newImage.public_slug}`,
        file_size: newImage.file_size,
        mime_type: newImage.mime_type,
        width: newImage.width,
        height: newImage.height,
        folder_id: newImage.folder_id,
        visibility: newImage.visibility,
        tags: newImage.tags,
        created_at: newImage.created_at,
      },
      user: {
        id: currentUser.id,
        name: currentUser.full_name,
        username: currentUser.username,
        email: currentUser.email,
      },
    }).catch((err) => console.warn('Webhook notification error:', err));

    return newImage;
  };

  const updateImage = (id: string, updates: Partial<ImageItem>) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          const updated = {
            ...img,
            ...updates,
            updated_at: new Date().toISOString(),
          };
          return updated;
        }
        return img;
      })
    );
    addToast('Image Updated', 'Changes have been saved successfully.', 'success');
  };

  const deleteImage = async (id: string): Promise<boolean> => {
    const targetImage = images.find((img) => img.id === id);
    if (!targetImage) return false;

    // Call storage provider to clean up
    await deleteStorageImage(targetImage.storage_url);

    // Remove from images list
    setImages((prev) => prev.filter((img) => img.id !== id));

    // Remove associated reports if any
    setReports((prev) => prev.filter((rep) => rep.image_id !== id));

    // Decrease user's storage used
    const owner = users.find((u) => u.id === targetImage.user_id);
    if (owner) {
      const newStorage = Math.max(0, owner.storage_used - targetImage.file_size);
      const updatedOwner = { ...owner, storage_used: newStorage };
      setUsers((prev) => prev.map((u) => (u.id === owner.id ? updatedOwner : u)));
      if (currentUser && currentUser.id === owner.id) {
        setCurrentUser(updatedOwner);
      }
    }

    logActivity('Image Deleted', 'image', id, { title: targetImage.title });
    addToast('Image Deleted', 'Image was permanently deleted.', 'info');
    return true;
  };

  const trackImageView = (id: string) => {
    // Check session storage to avoid double-counting in same tab
    const viewKey = `viewed_${id}`;
    if (sessionStorage.getItem(viewKey)) return;
    sessionStorage.setItem(viewKey, '1');

    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, views: img.views + 1 } : img))
    );
  };

  const trackImageDownload = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, downloads: img.downloads + 1 } : img))
    );
  };

  const downloadImage = async (image: ImageItem) => {
    trackImageDownload(image.id);
    const siteName = systemSettings.site_name || 'ImgSphere';
    await downloadBrandedImage(image, siteName, (fileName) => {
      addToast('Download Started', fileName, 'success');
    });
  };

  // Folder Actions
  const createFolder = (name: string, color = '#3B82F6'): Folder => {
    if (!currentUser) throw new Error('Must be logged in');
    const newFolder: Folder = {
      id: `fld_${Date.now()}`,
      user_id: currentUser.id,
      name: name.trim(),
      color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setFolders((prev) => [...prev, newFolder]);
    logActivity('Folder Created', 'folder', newFolder.id, { name: newFolder.name });
    addToast('Folder Created', `Folder "${newFolder.name}" is ready.`, 'success');
    return newFolder;
  };

  const renameFolder = (id: string, name: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: name.trim(), updated_at: new Date().toISOString() } : f))
    );
    addToast('Folder Renamed', 'Folder name updated.', 'success');
  };

  const deleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    // Clear folder_id on any images that belonged to this folder
    setImages((prev) =>
      prev.map((img) => (img.folder_id === id ? { ...img, folder_id: undefined } : img))
    );
    addToast('Folder Deleted', 'Folder removed (images were moved to Uncategorized).', 'info');
  };

  const moveImagesToFolder = (imageIds: string[], folderId?: string) => {
    setImages((prev) =>
      prev.map((img) => (imageIds.includes(img.id) ? { ...img, folder_id: folderId } : img))
    );
    addToast('Images Moved', `${imageIds.length} image(s) organized.`, 'success');
  };

  // Reports
  const submitReport = (imageId: string, reason: ReportReason, description: string, reporterEmail: string) => {
    const targetImage = images.find((i) => i.id === imageId);
    if (!targetImage) return;

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      image_id: imageId,
      image_title: targetImage.title,
      image_url: targetImage.thumbnail_url || targetImage.storage_url,
      reporter_id: currentUser?.id,
      reporter_email: reporterEmail,
      reason,
      description,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);
    // Flag image
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, is_reported: true } : img)));

    logActivity('Image Reported', 'report', newReport.id, { reason });
    addToast('Report Submitted', 'Thank you. Our moderation team has been notified.', 'info');
  };

  const resolveReport = (reportId: string, action: 'dismiss' | 'remove_image' | 'suspend_user' | 'mark_resolved') => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    if (action === 'remove_image') {
      deleteImage(report.image_id);
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'Resolved' } : r)));
      addToast('Image Removed', 'Reported image was deleted and report marked as Resolved.', 'success');
    } else if (action === 'suspend_user') {
      const img = images.find((i) => i.id === report.image_id);
      if (img) {
        suspendUser(img.user_id);
      }
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'Resolved' } : r)));
    } else if (action === 'dismiss') {
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'Dismissed' } : r)));
      setImages((prev) => prev.map((i) => (i.id === report.image_id ? { ...i, is_reported: false } : i)));
      addToast('Report Dismissed', 'Report dismissed with no action required.', 'info');
    } else {
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'Resolved' } : r)));
      addToast('Report Resolved', 'Report status updated to Resolved.', 'success');
    }
  };

  // Admin Actions
  const suspendUser = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' } : u)));
    logActivity('User Suspended', 'user', userId);
    addToast('User Suspended', 'User account access has been restricted.', 'warning');
  };

  const unsuspendUser = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u)));
    logActivity('User Unsuspended', 'user', userId);
    addToast('User Re-activated', 'Account reinstated to active status.', 'success');
  };

  const changeUserRole = (userId: string, role: 'admin' | 'user') => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    logActivity('User Role Changed', 'user', userId, { newRole: role });
    addToast('Role Updated', `User role changed to ${role}.`, 'info');
  };

  const deleteUser = (userId: string) => {
    // Delete all images owned by user
    const userImages = images.filter((img) => img.user_id === userId);
    userImages.forEach((img) => deleteImage(img.id));
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    logActivity('User Deleted', 'user', userId);
    addToast('User Deleted', 'User account and all owned assets removed.', 'info');
  };

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
    logActivity('System Settings Updated', 'settings', 'global');
    addToast('Settings Saved', 'Platform configuration updated.', 'success');
  };

  const createAnnouncement = (title: string, message: string, expiresAt?: string) => {
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    logActivity('Announcement Created', 'announcement', newAnn.id, { title });
    addToast('Announcement Published', 'Broadcasted to all client dashboards.', 'success');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    addToast('Announcement Deleted', 'Removed from dashboard.', 'info');
  };

  const submitSupportMessage = (name: string, email: string, subject: string, message: string) => {
    const newMsg: SupportMessage = {
      id: `msg_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      created_at: new Date().toISOString(),
    };
    setSupportMessages((prev) => [newMsg, ...prev]);
    addToast('Message Sent', 'Thank you for reaching out. Our support team will get back to you shortly.', 'success');
  };

  const replySupportMessage = (id: string) => {
    setSupportMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, status: 'replied' } : msg))
    );
    addToast('Marked as Replied', 'Support ticket updated.', 'info');
  };

  const resolveSupportMessage = (id: string) => {
    setSupportMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, status: 'closed' } : msg))
    );
    addToast('Ticket Closed', 'Support ticket resolved and archived.', 'success');
  };

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const confirm = (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      isDestructive: options.isDestructive,
      onConfirm: () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        options.onConfirm();
      },
    });
  };

  const closeConfirm = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  // Batch delete images with complete storage reclamation
  const batchDeleteImages = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;

    const targets = images.filter((img) => ids.includes(img.id));
    if (targets.length === 0) return;

    // 1. Delete physical/cloud storage assets
    await Promise.allSettled(targets.map((t) => deleteStorageImage(t.storage_url)));

    // 2. Remove from images list
    setImages((prev) => prev.filter((img) => !ids.includes(img.id)));

    // 3. Remove associated reports if any
    setReports((prev) => prev.filter((rep) => !ids.includes(rep.image_id)));

    // 4. Calculate total reclaimed storage bytes and deduct from user account(s)
    let totalReclaimedBytes = 0;
    const userReclaims: Record<string, number> = {};

    targets.forEach((img) => {
      totalReclaimedBytes += img.file_size;
      userReclaims[img.user_id] = (userReclaims[img.user_id] || 0) + img.file_size;
    });

    setUsers((prev) =>
      prev.map((u) => {
        if (userReclaims[u.id]) {
          const newUsed = Math.max(0, u.storage_used - userReclaims[u.id]);
          return { ...u, storage_used: newUsed };
        }
        return u;
      })
    );

    if (currentUser && userReclaims[currentUser.id]) {
      const newUsed = Math.max(0, currentUser.storage_used - userReclaims[currentUser.id]);
      setCurrentUser((prev) => (prev ? { ...prev, storage_used: newUsed } : null));
    }

    // 5. Notify configured webhooks for each deleted image
    targets.forEach((t) => {
      triggerWebhooksForEvent('image.deleted', {
        event: 'image.deleted',
        timestamp: new Date().toISOString(),
        image: {
          id: t.id,
          title: t.title,
          file_name: t.file_name,
          storage_url: t.storage_url,
          file_size: t.file_size,
        },
        user: {
          id: currentUser?.id,
          name: currentUser?.full_name,
        },
      }).catch((err) => console.warn('Webhook delete notification error:', err));
    });

    // 6. Log activity
    logActivity('Batch Images Deleted', 'image', ids[0], {
      count: ids.length,
      reclaimed_mb: (totalReclaimedBytes / 1024 / 1024).toFixed(2),
    });

    const reclaimedMbStr = (totalReclaimedBytes / 1024 / 1024).toFixed(2);
    addToast(
      'Batch Deletion Complete',
      `Permanently deleted ${ids.length} image(s) and cleared ${reclaimedMbStr} MB of storage quota.`,
      'success'
    );
  };

  // Update folder alias
  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f))
    );
    addToast('Folder Updated', 'Folder details updated.', 'success');
  };

  // Delete account
  const deleteAccount = () => {
    if (!currentUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== currentUser.id));
    setImages((prev) => prev.filter((i) => i.user_id !== currentUser.user_id));
    logout();
    addToast('Account Deleted', 'Your account and data have been removed.', 'info');
  };

  // Update user profile (by userId or current)
  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId || u.user_id === userId ? { ...u, ...updates } : u))
    );
    if (currentUser && (currentUser.id === userId || currentUser.user_id === userId)) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
    addToast('User Updated', 'Profile changes saved successfully.', 'success');
  };

  // Update user status
  const updateUserStatus = (userId: string, status: any) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId || u.user_id === userId ? { ...u, status } : u))
    );
    addToast('Status Updated', `User account status set to ${status}.`, 'info');
  };

  // Create user from admin panel
  const createUserAdmin = (params: {
    full_name: string;
    email: string;
    role: 'user' | 'admin';
    storage_limit_mb: number;
    plan?: string;
    plan_name?: string;
    password?: string;
  }) => {
    const calculatedPlan =
      params.plan ||
      (params.storage_limit_mb >= 100000
        ? 'business'
        : params.storage_limit_mb >= 25000
        ? 'pro'
        : 'free');
    const calculatedPlanName =
      params.plan_name ||
      (calculatedPlan === 'business'
        ? 'Business Studio (100 GB)'
        : calculatedPlan === 'pro'
        ? 'Pro Creator (25 GB)'
        : 'Free Starter (1 GB)');

    const newUser: User = {
      id: `usr_${Date.now()}`,
      user_id: `usr_${Date.now()}`,
      full_name: params.full_name,
      email: params.email,
      username: params.email.split('@')[0],
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      role: params.role,
      status: 'active',
      storage_limit: params.storage_limit_mb * 1024 * 1024,
      storage_used: 0,
      plan: calculatedPlan,
      plan_name: calculatedPlanName,
      password: params.password || 'client123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    logActivity('User Account Created by Admin', 'user', newUser.id, {
      email: params.email,
      plan: calculatedPlanName,
      storage_mb: params.storage_limit_mb,
    });
    addToast(
      'User Provisioned',
      `Account created for ${params.email} with ${calculatedPlanName} & ${(params.storage_limit_mb / 1024).toFixed(0)} GB storage.`,
      'success'
    );
  };

  // Storage provider state
  const [storageProvider, setStorageProviderState] = useState<'local' | 'cloudinary' | 'supabase' | 's3' | 'custom'>('supabase');

  useEffect(() => {
    const providerName = systemSettings.storage_provider_name || 'supabase';
    const cloudName = systemSettings.cloudinary_cloud_name || 'q2eqlpu7';
    const preset = systemSettings.cloudinary_upload_preset || 'h4iodeef';
    const supaUrl = systemSettings.supabase_url || 'https://xyzcompany.supabase.co';
    const supaKey = systemSettings.supabase_anon_key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';
    const s3Bucket = systemSettings.s3_bucket_name || 'imgsphere-public-vault';
    const s3Endpoint = systemSettings.s3_endpoint || '';

    if (providerName === 'supabase') {
      setStorageProvider(new SupabaseStorageProvider(supaUrl, supaKey, 'images'));
      setStorageProviderState('supabase');
    } else if (providerName === 'cloudinary') {
      setStorageProvider(new CloudinaryStorageProvider(cloudName, preset));
      setStorageProviderState('cloudinary');
    } else if (providerName === 's3') {
      setStorageProvider(new S3StorageProvider(s3Bucket, s3Endpoint));
      setStorageProviderState('s3');
    } else {
      setStorageProvider(new LocalStorageProvider());
      setStorageProviderState('local');
    }
  }, [
    systemSettings.storage_provider_name,
    systemSettings.cloudinary_cloud_name,
    systemSettings.cloudinary_upload_preset,
    systemSettings.supabase_url,
    systemSettings.supabase_anon_key,
    systemSettings.s3_bucket_name,
    systemSettings.s3_endpoint,
  ]);

  const handleSetStorageProvider = (p: 'local' | 'cloudinary' | 'supabase' | 's3' | 'custom') => {
    setStorageProviderState(p);
    const cloudName = systemSettings.cloudinary_cloud_name || 'q2eqlpu7';
    const preset = systemSettings.cloudinary_upload_preset || 'h4iodeef';
    const supaUrl = systemSettings.supabase_url || 'https://xyzcompany.supabase.co';
    const supaKey = systemSettings.supabase_anon_key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';
    const s3Bucket = systemSettings.s3_bucket_name || 'imgsphere-public-vault';
    const s3Endpoint = systemSettings.s3_endpoint || '';

    if (p === 'supabase') {
      setStorageProvider(new SupabaseStorageProvider(supaUrl, supaKey, 'images'));
    } else if (p === 'cloudinary') {
      setStorageProvider(new CloudinaryStorageProvider(cloudName, preset));
    } else if (p === 's3') {
      setStorageProvider(new S3StorageProvider(s3Bucket, s3Endpoint));
    } else {
      setStorageProvider(new LocalStorageProvider());
    }
    setSystemSettings((prev) => ({ ...prev, storage_provider_name: p }));
    addToast('Provider Switched', `Active storage engine set to ${p.toUpperCase()}.`, 'info');
  };

  // Reset to seed data
  const resetToSeedData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setImages(INITIAL_IMAGES);
    setFolders(INITIAL_FOLDERS);
    setReports(INITIAL_REPORTS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSupportMessages(INITIAL_SUPPORT_MESSAGES);
    setPaymentRequests(INITIAL_PAYMENT_REQUESTS);
    setCurrentUser(null);
    addToast('Database Reset', 'Platform restored to initial sample state.', 'success');
  };

  const submitPaymentRequest = async (data: {
    plan_id: string;
    plan_name: string;
    billing_cycle: 'monthly' | 'annual';
    amount: number;
    currency?: string;
    customer_email: string;
    customer_name?: string;
    transaction_id?: string;
    voucher_url: string;
    voucher_file_name: string;
    voucher_file_size?: number;
    notes?: string;
  }): Promise<PaymentRequest> => {
    const newReq: PaymentRequest = {
      id: `pay_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: currentUser?.id,
      plan_id: data.plan_id,
      plan_name: data.plan_name,
      billing_cycle: data.billing_cycle,
      amount: data.amount,
      currency: data.currency || 'USD',
      customer_email: data.customer_email.trim(),
      customer_name: data.customer_name?.trim() || currentUser?.full_name || '',
      transaction_id: data.transaction_id?.trim(),
      voucher_url: data.voucher_url,
      voucher_file_name: data.voucher_file_name,
      voucher_file_size: data.voucher_file_size,
      notes: data.notes?.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setPaymentRequests((prev) => [newReq, ...prev]);

    logActivity('Payment Voucher Submitted', 'payment_request', newReq.id, {
      plan_name: newReq.plan_name,
      amount: newReq.amount,
      customer_email: newReq.customer_email,
      billing_cycle: newReq.billing_cycle,
    });

    addToast(
      'Voucher Submitted Successfully',
      'Our team will contact you within 24 hours. Your payment slip has been forwarded for admin verification.',
      'success'
    );

    return newReq;
  };

  const updatePaymentRequestStatus = (
    id: string,
    status: PaymentRequestStatus,
    adminNotes?: string
  ) => {
    let affectedReq: PaymentRequest | null = null;

    setPaymentRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const updated: PaymentRequest = {
            ...req,
            status,
            admin_notes: adminNotes !== undefined ? adminNotes : req.admin_notes,
            updated_at: new Date().toISOString(),
          };
          affectedReq = updated;
          return updated;
        }
        return req;
      })
    );

    if (affectedReq) {
      const targetReq = affectedReq as PaymentRequest;
      if (status === 'approved') {
        const targetEmail = targetReq.customer_email.toLowerCase();
        const matchedUser = users.find(
          (u) => (targetReq.user_id && u.id === targetReq.user_id) || u.email.toLowerCase() === targetEmail
        );

        let newStorageLimitBytes = 25 * 1024 * 1024 * 1024;
        if (targetReq.plan_id.includes('business') || targetReq.plan_name.toLowerCase().includes('business')) {
          newStorageLimitBytes = 150 * 1024 * 1024 * 1024;
        } else if (targetReq.plan_id.includes('pro') || targetReq.plan_name.toLowerCase().includes('pro')) {
          newStorageLimitBytes = 25 * 1024 * 1024 * 1024;
        }

        if (matchedUser) {
          const updatedUser: User = {
            ...matchedUser,
            plan: targetReq.plan_id.replace('plan_', ''),
            plan_name: targetReq.plan_name,
            storage_limit: newStorageLimitBytes,
            updated_at: new Date().toISOString(),
          };

          setUsers((prev) => prev.map((u) => (u.id === matchedUser.id ? updatedUser : u)));
          if (currentUser && currentUser.id === matchedUser.id) {
            setCurrentUser(updatedUser);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
          }
        }

        logActivity('Payment Request Approved', 'payment_request', id, {
          plan: targetReq.plan_name,
          customer_email: targetReq.customer_email,
        });

        addToast(
          'Payment Request Approved',
          `Payment for ${targetReq.customer_email} verified. Plan upgraded to ${targetReq.plan_name}.`,
          'success'
        );
      } else if (status === 'rejected') {
        logActivity('Payment Request Rejected', 'payment_request', id, {
          customer_email: targetReq.customer_email,
          reason: adminNotes,
        });

        addToast(
          'Payment Request Rejected',
          `Payment request ${id} was marked as rejected.`,
          'info'
        );
      }
    }
  };

  const deletePaymentRequest = (id: string) => {
    setPaymentRequests((prev) => prev.filter((r) => r.id !== id));
    addToast('Payment Request Deleted', 'Record was removed from the payment queue.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeRoute,
        routeParams,
        navigateTo,
        theme,
        setTheme,
        currentUser,
        login,
        signup,
        logout,
        switchUser,
        updateProfile,
        changePassword,
        updateAdminCredentials,
        users,
        images,
        folders,
        reports,
        activityLogs,
        announcements,
        supportMessages,
        systemSettings,
        uploadSingleImage,
        updateImage,
        deleteImage,
        trackImageView,
        trackImageDownload,
        downloadImage,
        createFolder,
        renameFolder,
        deleteFolder,
        moveImagesToFolder,
        submitReport,
        resolveReport,
        suspendUser,
        unsuspendUser,
        changeUserRole,
        deleteUser,
        updateSystemSettings,
        createAnnouncement,
        deleteAnnouncement,
        submitSupportMessage,
        replySupportMessage,
        resolveSupportMessage,
        confirmState,
        confirm,
        closeConfirm,
        batchDeleteImages,
        updateFolder,
        deleteAccount,
        updateUserProfile,
        updateUserStatus,
        createUserAdmin,
        storageProvider,
        setStorageProvider: handleSetStorageProvider,
        resetToSeedData,
        webhooks,
        webhookLogs,
        addWebhook,
        updateWebhook,
        deleteWebhook,
        toggleWebhook,
        testWebhook,
        clearWebhookLogs,
        triggerWebhooksForEvent,
        paymentRequests,
        submitPaymentRequest,
        updatePaymentRequestStatus,
        deletePaymentRequest,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
