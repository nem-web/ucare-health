import React from 'react';
import { Home, FileText, Calendar, User, Bell, TestTube } from 'lucide-react';
import { AppBar, Toolbar, Typography, IconButton, Badge } from '@mui/material';
import { reminderSystem } from '../utils/reminderSystem';

const Navigation = ({ activeTab, onTabChange, notifications = 0 }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'records', icon: FileText, label: 'Records' },
    { id: 'cycle', icon: Calendar, label: 'Cycle' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const handleTestNotification = async () => {
    await reminderSystem.testNotification();
  };

  return (
    <>
      <AppBar position="fixed" className="bg-white shadow-sm">
        <Toolbar className="justify-between">
          <Typography variant="h6" className="text-primary font-bold">
            Ucare
          </Typography>
          <div className="flex items-center gap-2">
            <IconButton onClick={handleTestNotification} size="small" title="Test Push Notification">
              <TestTube className="text-gray-600" size={20} />
            </IconButton>
            <IconButton>
              <Badge badgeContent={notifications} color="error">
                <Bell className="text-gray-600" size={24} />
              </Badge>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                activeTab === id 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-500'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navigation;
