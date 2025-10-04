import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Dialog, DialogTitle, DialogContent, Typography, Snackbar, Alert, IconButton } from '@mui/material';
import { LogOut } from 'lucide-react';
import { format } from 'date-fns';

import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Records from './components/Records';
import CycleAdvisor from './components/CycleAdvisor';
import Profile from './components/Profile';
import Auth from './components/Auth';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { mockHealthData } from './data/mockData';
import { reminderSystem } from './utils/reminderSystem';
import { authService } from './services/authService';
import { cloudSyncService } from './services/cloudSyncService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#ec4899',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthData, setHealthData] = useState(mockHealthData);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        // Set user for cloud sync
        cloudSyncService.setCurrentUser(user);
        
        // Load user data from cloud
        try {
          const cloudData = await cloudSyncService.loadFromCloud();
          setHealthData(cloudData);
        } catch (error) {
          console.error('Failed to load cloud data:', error);
          // Fallback to mock data
          setHealthData(mockHealthData);
        }
      } else {
        // Clear data when user logs out
        setHealthData(mockHealthData);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-save to cloud when health data changes
  useEffect(() => {
    if (user && healthData) {
      const saveToCloud = async () => {
        try {
          await cloudSyncService.syncToCloud(healthData);
          localStorage.setItem('last_sync_time', new Date().toISOString());
        } catch (error) {
          console.error('Failed to sync to cloud:', error);
        }
      };
      
      // Debounce saves
      const timeoutId = setTimeout(saveToCloud, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [healthData, user]);

  // Setup reminders when user is authenticated
  useEffect(() => {
    if (user && healthData) {
      reminderSystem.onReminder((reminder) => {
        setNotifications(prev => prev + 1);
        setSnackbar({
          open: true,
          message: `Reminder: ${reminder.title}`,
          severity: 'info'
        });
      });

      reminderSystem.scheduleDailyMedications(healthData.medications || []);
      reminderSystem.scheduleAppointmentReminders(healthData.appointments || []);
      
      // Schedule water reminders
      if (healthData.waterSettings) {
        reminderSystem.pushService.scheduleWaterReminders(healthData.waterSettings);
      }
      
      reminderSystem.startMonitoring();
    }
  }, [user, healthData]);

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    setHealthData(mockHealthData);
  };

  const handleSymptomClick = (symptom) => {
    setSelectedSymptom(symptom);
  };

  const handleMedicationTaken = (medicationId) => {
    setHealthData(prev => ({
      ...prev,
      medications: prev.medications.map(med =>
        med.id === medicationId ? { ...med, taken: true } : med
      )
    }));
    
    setSnackbar({
      open: true,
      message: 'Medication marked as taken!',
      severity: 'success'
    });
  };

  const handleAddSymptom = (newSymptom) => {
    setHealthData(prev => ({
      ...prev,
      symptoms: [newSymptom, ...prev.symptoms]
    }));
    
    setSnackbar({
      open: true,
      message: 'Symptom added and synced to cloud!',
      severity: 'success'
    });
  };

  const handleAddAppointment = (newAppointment) => {
    setHealthData(prev => ({
      ...prev,
      appointments: [newAppointment, ...(prev.appointments || [])]
    }));
    
    reminderSystem.scheduleAppointmentReminders([newAppointment]);
    
    setSnackbar({
      open: true,
      message: 'Appointment added and synced to cloud!',
      severity: 'success'
    });
  };

  const handleAddPrescription = (newPrescription) => {
    setHealthData(prev => ({
      ...prev,
      prescriptions: [newPrescription, ...(prev.prescriptions || [])]
    }));
    
    setSnackbar({
      open: true,
      message: 'Prescription added successfully!',
      severity: 'success'
    });
  };

  const handleUpdateWaterSettings = (newSettings) => {
    setHealthData(prev => ({
      ...prev,
      waterSettings: newSettings
    }));
    
    // Reschedule water reminders with new settings
    reminderSystem.pushService.scheduleWaterReminders(newSettings);
    
    setSnackbar({
      open: true,
      message: 'Water reminder settings updated!',
      severity: 'success'
    });
  };

  const handleAddMedication = (newMedication) => {
    setHealthData(prev => ({
      ...prev,
      medications: [newMedication, ...prev.medications]
    }));
    
    reminderSystem.scheduleDailyMedications([newMedication]);
    
    setSnackbar({
      open: true,
      message: 'Medication added and synced to cloud!',
      severity: 'success'
    });
  };

  const handleEditItem = (type, id, updatedData) => {
    setHealthData(prev => ({
      ...prev,
      [type + 's']: prev[type + 's'].map(item =>
        item.id === id ? { ...item, ...updatedData } : item
      )
    }));
    
    setSnackbar({
      open: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`,
      severity: 'success'
    });
  };

  const handleDeleteItem = (type, id) => {
    setHealthData(prev => ({
      ...prev,
      [type + 's']: prev[type + 's'].filter(item => item.id !== id)
    }));
    
    setSnackbar({
      open: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`,
      severity: 'success'
    });
  };

  const handleUpdateCycle = (updatedCycle) => {
    setHealthData(prev => ({
      ...prev,
      cycleData: updatedCycle
    }));
    
    setSnackbar({
      open: true,
      message: 'Cycle data updated successfully!',
      severity: 'success'
    });
  };

  const handleUpdateMetrics = (metrics) => {
    setHealthData(prev => ({
      ...prev,
      metrics
    }));
    
    setSnackbar({
      open: true,
      message: 'Health metrics logged successfully!',
      severity: 'success'
    });
  };

  const handleLogWater = (amount) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentWaterLog = healthData.waterLog || {};
    const todayIntake = currentWaterLog[today] || 0;
    
    setHealthData(prev => ({
      ...prev,
      waterLog: {
        ...currentWaterLog,
        [today]: todayIntake + amount
      }
    }));
    
    setSnackbar({
      open: true,
      message: `Added ${amount}L water intake!`,
      severity: 'success'
    });
  };

  const handleUpdateProfile = (updatedProfile) => {
    setHealthData(prev => ({
      ...prev,
      profile: updatedProfile
    }));
    
    setSnackbar({
      open: true,
      message: 'Profile updated and synced to cloud!',
      severity: 'success'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Typography>Loading...</Typography>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Auth onAuthSuccess={setUser} />
      </ThemeProvider>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            healthData={healthData} 
            onSymptomClick={handleSymptomClick}
            onMedicationTaken={handleMedicationTaken}
            onUpdateMetrics={handleUpdateMetrics}
            onUpdateWaterSettings={handleUpdateWaterSettings}
            onLogWater={handleLogWater}
          />
        );
      case 'records':
        return (
          <Records 
            healthData={healthData} 
            onSymptomClick={handleSymptomClick}
            onAddSymptom={handleAddSymptom}
            onAddAppointment={handleAddAppointment}
            onAddMedication={handleAddMedication}
            onAddPrescription={handleAddPrescription}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        );
      case 'cycle':
        return (
          <CycleAdvisor 
            cycleData={healthData.cycleData}
            healthData={healthData}
            onUpdateCycle={handleUpdateCycle}
          />
        );
      case 'profile':
        return (
          <Profile 
            profileData={healthData.profile}
            userInfo={user}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      default:
        return <Dashboard healthData={healthData} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-4 right-4 z-50">
          <IconButton 
            onClick={handleSignOut}
            className="bg-white shadow-md hover:bg-gray-50"
            size="small"
          >
            <LogOut size={20} />
          </IconButton>
        </div>

        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          notifications={notifications}
        />
        
        <main className="pt-16 px-4">
          {renderActiveScreen()}
        </main>

        <Dialog 
          open={!!selectedSymptom} 
          onClose={() => setSelectedSymptom(null)}
          maxWidth="sm" 
          fullWidth
        >
          {selectedSymptom && (
            <>
              <DialogTitle className="font-bold">
                {selectedSymptom.type} Details
              </DialogTitle>
              <DialogContent>
                <div className="space-y-4">
                  <div>
                    <Typography variant="subtitle2" className="font-medium text-gray-600">
                      Date & Duration
                    </Typography>
                    <Typography variant="body1">
                      {selectedSymptom.date} • {selectedSymptom.duration}
                    </Typography>
                  </div>
                  
                  <div>
                    <Typography variant="subtitle2" className="font-medium text-gray-600">
                      Severity Level
                    </Typography>
                    <Typography variant="body1">
                      {selectedSymptom.severity}/5
                    </Typography>
                  </div>
                  
                  <div>
                    <Typography variant="subtitle2" className="font-medium text-gray-600">
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {selectedSymptom.notes}
                    </Typography>
                  </div>

                  {selectedSymptom.images && selectedSymptom.images.length > 0 && (
                    <div>
                      <Typography variant="subtitle2" className="font-medium text-gray-600 mb-2">
                        Images
                      </Typography>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSymptom.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt="Symptom"
                            className="w-full h-24 object-cover rounded border cursor-pointer"
                            onClick={() => window.open(image.url, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </>
          )}
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <PWAInstallPrompt />
      </div>
    </ThemeProvider>
  );
}

export default App;
