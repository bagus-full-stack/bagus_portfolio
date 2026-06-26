import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app.routes';
import { Toaster } from 'sonner';
import { CookieBanner } from './components/CookieBanner';
import PWAInstallBanner from './components/PWAInstallBanner';
import PWAUpdateBanner from './components/PWAUpdateBanner';

export default function App() {
  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-[#0B0F14]">
          <div className="w-8 h-8 border-2 border-[#E08A3E] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster 
        theme="dark" 
        position="bottom-right" 
        role="status"
        aria-live="polite"
        toastOptions={{
          className: 'toast-aria',
          style: {
            background: '#141B22',
            border: '1px solid rgba(255,255,255,0.05)',
            color: '#EDEFF2',
            fontFamily: 'Inter, sans-serif'
          }
        }} 
      />
      <CookieBanner />
      <PWAInstallBanner />
      <PWAUpdateBanner />
    </>
  );
}
