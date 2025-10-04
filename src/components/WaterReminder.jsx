import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, Chip } from '@mui/material';
import { Droplets, Settings, Plus } from 'lucide-react';
import { format } from 'date-fns';

const WaterReminder = ({ waterSettings, onUpdateSettings, onLogWater, healthData }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    dailyGoal: 2.0,
    reminderInterval: 60,
    startTime: '08:00',
    endTime: '22:00',
    ...waterSettings
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayIntake = healthData?.waterLog?.[today] || 0;

  useEffect(() => {
    if (settings.enabled) {
      startWaterReminders();
    }
    return () => clearWaterReminders();
  }, [settings]);

  const startWaterReminders = () => {
    const now = new Date();
    const startTime = new Date();
    const endTime = new Date();
    
    const [startHour, startMin] = settings.startTime.split(':');
    const [endHour, endMin] = settings.endTime.split(':');
    
    startTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

    if (now >= startTime && now <= endTime) {
      const intervalId = setInterval(() => {
        const currentTime = new Date();
        if (currentTime >= startTime && currentTime <= endTime) {
          showWaterNotification();
        }
      }, settings.reminderInterval * 60 * 1000);

      return () => clearInterval(intervalId);
    }
  };

  const clearWaterReminders = () => {
    // Clear any existing intervals
  };

  const showWaterNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('💧 Water Reminder', {
        body: `Time to drink water! Goal: ${settings.dailyGoal}L`,
        icon: '/icon.svg',
        tag: 'water-reminder'
      });
    }
  };

  const handleSettingsSave = () => {
    onUpdateSettings(settings);
    setSettingsOpen(false);
  };

  const handleLogWater = (amount) => {
    onLogWater(amount);
  };

  const getProgressColor = () => {
    const percentage = (todayIntake / settings.dailyGoal) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const quickAmounts = [0.25, 0.5, 1.0];

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Droplets className="text-blue-500 mr-2" size={24} />
            <Typography variant="h6" className="font-semibold">
              Water Intake
            </Typography>
          </div>
          <Button
            startIcon={<Settings size={16} />}
            onClick={() => setSettingsOpen(true)}
            size="small"
            variant="outlined"
          >
            Settings
          </Button>
        </div>

        <div className="text-center mb-4">
          <Typography variant="h4" className={`font-bold ${getProgressColor()}`}>
            {todayIntake.toFixed(1)}L
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            of {settings.dailyGoal}L goal
          </Typography>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (todayIntake / settings.dailyGoal) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              onClick={() => handleLogWater(amount)}
              variant="outlined"
              size="small"
              startIcon={<Plus size={14} />}
            >
              {amount}L
            </Button>
          ))}
        </div>

        {settings.enabled && (
          <div className="text-center">
            <Chip 
              label={`Reminders every ${settings.reminderInterval} min`}
              size="small"
              className="bg-blue-50 text-blue-700"
            />
          </div>
        )}
      </CardContent>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Water Reminder Settings</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                />
              }
              label="Enable Water Reminders"
            />

            <TextField
              label="Daily Goal (Liters)"
              type="number"
              value={settings.dailyGoal}
              onChange={(e) => setSettings(prev => ({ ...prev, dailyGoal: parseFloat(e.target.value) }))}
              fullWidth
              inputProps={{ min: 0.5, max: 5, step: 0.1 }}
            />

            <TextField
              label="Reminder Interval (Minutes)"
              type="number"
              value={settings.reminderInterval}
              onChange={(e) => setSettings(prev => ({ ...prev, reminderInterval: parseInt(e.target.value) }))}
              fullWidth
              inputProps={{ min: 15, max: 240, step: 15 }}
              helperText="How often to remind you"
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Start Time"
                type="time"
                value={settings.startTime}
                onChange={(e) => setSettings(prev => ({ ...prev, startTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="End Time"
                type="time"
                value={settings.endTime}
                onChange={(e) => setSettings(prev => ({ ...prev, endTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={handleSettingsSave} variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default WaterReminder;
