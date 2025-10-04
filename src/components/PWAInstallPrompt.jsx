import React, { useState, useEffect } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if user previously dismissed
  if (localStorage.getItem('pwa-install-dismissed') === 'true') {
    return null;
  }

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: 80 }} // Above bottom navigation
    >
      <Alert
        severity="info"
        action={
          <div className="flex gap-2">
            <Button
              color="inherit"
              size="small"
              onClick={handleInstallClick}
              startIcon={<Download size={16} />}
            >
              Install
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={handleDismiss}
            >
              <X size={16} />
            </Button>
          </div>
        }
      >
        Install Ucare Health app for better experience!
      </Alert>
    </Snackbar>
  );
};

export default PWAInstallPrompt;
