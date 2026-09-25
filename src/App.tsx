import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { PricingSection } from './components/public/PricingSection';
import { LandingPage } from './components/public/LandingPage';
import { AuthPages } from './components/public/AuthPages';
import { PublicImagePage } from './components/public/PublicImagePage';
import { HelpCenter } from './components/public/HelpCenter';
import { ContactPage } from './components/public/ContactPage';

// Client Dashboard
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { UploadPage } from './components/dashboard/UploadPage';
import { MyImagesPage } from './components/dashboard/MyImagesPage';
import { ImageDetailPage } from './components/dashboard/ImageDetailPage';
import { FoldersPage } from './components/dashboard/FoldersPage';
import { AnalyticsPage } from './components/dashboard/AnalyticsPage';
import { StoragePage } from './components/dashboard/StoragePage';
import { ProfilePage } from './components/dashboard/ProfilePage';
import { SettingsPage } from './components/dashboard/SettingsPage';

// Admin Panel
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminUsersPage } from './components/admin/AdminUsersPage';
import { AdminImagesPage } from './components/admin/AdminImagesPage';
import { AdminReportsPage } from './components/admin/AdminReportsPage';
import { AdminStoragePage } from './components/admin/AdminStoragePage';
import { AdminSupportInbox } from './components/admin/AdminSupportInbox';
import { AdminSettingsPage } from './components/admin/AdminSettingsPage';
import { AdminCMSPage } from './components/admin/AdminCMSPage';
import { AdminPaymentsPage } from './components/admin/AdminPaymentsPage';

import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeRoute,
    navigateTo,
    currentUser,
    confirmState,
    closeConfirm,
    images,
  } = useApp();

  // Check URL path and query parameters for image links
  useEffect(() => {
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const imgParam = params.get('img');

    let targetSlugOrId = imgParam;
    if (!targetSlugOrId) {
      // Matches /view/:slug or /:brand/view/:slug
      const viewMatch = pathname.match(/(?:\/[^/]+)?\/view\/([^/]+)/);
      if (viewMatch) {
        targetSlugOrId = viewMatch[1];
      }
    }

    if (targetSlugOrId) {
      const match = images.find(
        (i) => i.public_slug === targetSlugOrId || i.id === targetSlugOrId
      );
      if (match) {
        navigateTo('public-image', { imageId: match.id, slug: match.public_slug });
      } else {
        // Fallback: lookup on backend (e.g. when link is opened on mobile phone or new browser session)
        fetch(`/api/db/images/lookup/${encodeURIComponent(targetSlugOrId)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.image) {
              const fetched = data.image;
              navigateTo('public-image', {
                imageId: fetched.id,
                slug: fetched.slug || fetched.public_slug,
                fetchedImage: {
                  id: fetched.id,
                  user_id: fetched.userId || fetched.user_id || 'system',
                  uploader_name: fetched.uploader_name || 'ImgSphere Creator',
                  title: fetched.title || 'Image',
                  description: fetched.description || '',
                  file_name: fetched.title ? `${fetched.title}.jpg` : 'image.jpg',
                  original_name: fetched.title ? `${fetched.title}.jpg` : 'image.jpg',
                  storage_url: fetched.storageUrl || fetched.storage_url,
                  thumbnail_url: fetched.thumbnailUrl || fetched.thumbnail_url || fetched.storageUrl || fetched.storage_url,
                  file_size: fetched.size || fetched.file_size || 500000,
                  mime_type: fetched.mimeType || fetched.mime_type || 'image/jpeg',
                  width: fetched.width || 1200,
                  height: fetched.height || 800,
                  visibility: fetched.visibility || 'public',
                  views: fetched.views || 1,
                  downloads: fetched.downloads || 0,
                  tags: Array.isArray(fetched.tags) ? fetched.tags : [],
                  public_slug: fetched.slug || fetched.public_slug || targetSlugOrId,
                  created_at: fetched.createdAt || fetched.created_at || new Date().toISOString(),
                  updated_at: fetched.updatedAt || fetched.updated_at || new Date().toISOString(),
                },
              });
            }
          })
          .catch(() => {
            // Silently ignore network failures
          });
      }
    }
  }, [images]);

  // Public Layout Wrapper for pages that share Navbar and Footer
  const renderPublicPage = (children: React.ReactNode) => (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );

  // Authentication guard for Dashboard
  if (activeRoute.startsWith('dashboard-') && !currentUser) {
    return renderPublicPage(
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold">Sign In Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please sign in to access your media library, analytics, and personal cloud folders.
        </p>
        <button
          onClick={() => navigateTo('auth-login')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // Authentication & Role guard for Admin Panel
  if (activeRoute.startsWith('admin-')) {
    if (!currentUser || currentUser.role !== 'admin') {
      return renderPublicPage(
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold">Administrator Access Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You must be logged in as an administrator to access the moderation panel.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigateTo('landing')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
            >
              Return Home
            </button>
            <button
              onClick={() => navigateTo('auth-login')}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl"
            >
              Sign In as Admin
            </button>
          </div>
        </div>
      );
    }
  }

  // Router dispatcher
  const renderRoute = () => {
    switch (activeRoute) {
      // Public pages
      case 'home':
      case 'landing':
      case 'features':
      case 'how-it-works':
      case 'about':
        return renderPublicPage(<LandingPage />);
      case 'pricing':
        return renderPublicPage(<PricingSection isStandalonePage />);
      case 'login':
      case 'signup':
      case 'forgot-password':
      case 'reset-password':
      case 'auth-login':
      case 'auth-signup':
      case 'auth-forgot':
        return renderPublicPage(<AuthPages />);
      case 'public-image':
        return renderPublicPage(<PublicImagePage />);
      case 'help':
        return renderPublicPage(<HelpCenter />);
      case 'contact':
        return renderPublicPage(<ContactPage />);

      // Client Dashboard
      case 'dashboard-overview':
        return (
          <DashboardLayout>
            <DashboardOverview />
          </DashboardLayout>
        );
      case 'dashboard-upload':
        return (
          <DashboardLayout>
            <UploadPage />
          </DashboardLayout>
        );
      case 'dashboard-images':
        return (
          <DashboardLayout>
            <MyImagesPage />
          </DashboardLayout>
        );
      case 'dashboard-image-detail':
        return (
          <DashboardLayout>
            <ImageDetailPage />
          </DashboardLayout>
        );
      case 'dashboard-folders':
        return (
          <DashboardLayout>
            <FoldersPage />
          </DashboardLayout>
        );
      case 'dashboard-analytics':
        return (
          <DashboardLayout>
            <AnalyticsPage />
          </DashboardLayout>
        );
      case 'dashboard-storage':
        return (
          <DashboardLayout>
            <StoragePage />
          </DashboardLayout>
        );
      case 'dashboard-profile':
        return (
          <DashboardLayout>
            <ProfilePage />
          </DashboardLayout>
        );
      case 'dashboard-settings':
        return (
          <DashboardLayout>
            <SettingsPage />
          </DashboardLayout>
        );
      case 'dashboard-webhooks':
        return (
          <DashboardLayout>
            <SettingsPage initialTab="webhooks" />
          </DashboardLayout>
        );
      case 'dashboard-help':
        return (
          <DashboardLayout>
            <HelpCenter />
          </DashboardLayout>
        );

      // Admin Panel
      case 'admin-overview':
        return (
          <AdminLayout>
            <AdminOverview />
          </AdminLayout>
        );
      case 'admin-users':
        return (
          <AdminLayout>
            <AdminUsersPage />
          </AdminLayout>
        );
      case 'admin-images':
        return (
          <AdminLayout>
            <AdminImagesPage />
          </AdminLayout>
        );
      case 'admin-reports':
        return (
          <AdminLayout>
            <AdminReportsPage />
          </AdminLayout>
        );
      case 'admin-storage':
        return (
          <AdminLayout>
            <AdminStoragePage />
          </AdminLayout>
        );
      case 'admin-support':
        return (
          <AdminLayout>
            <AdminSupportInbox />
          </AdminLayout>
        );
      case 'admin-settings':
        return (
          <AdminLayout>
            <AdminSettingsPage />
          </AdminLayout>
        );
      case 'admin-cms':
        return (
          <AdminLayout>
            <AdminCMSPage />
          </AdminLayout>
        );
      case 'admin-payments':
        return (
          <AdminLayout>
            <AdminPaymentsPage />
          </AdminLayout>
        );

      default:
        return renderPublicPage(<LandingPage />);
    }
  };

  return (
    <>
      {renderRoute()}

      {/* Global Notifications Toast Container */}
      <ToastContainer />

      {/* Global Confirmation Modal Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        isDestructive={confirmState.isDestructive}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
