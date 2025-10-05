import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { User, Edit, Camera, Save, X } from 'lucide-react';

const Profile = ({ profileData, userInfo, onUpdateProfile }) => {
  const [editing, setEditing] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userInfo?.displayName || '',
    age: profileData?.age || '',
    bloodGroup: profileData?.bloodGroup || '',
    height: profileData?.height || '',
    weight: profileData?.weight || '',
    emergencyContact: profileData?.emergencyContact || '',
    medicalConditions: profileData?.medicalConditions || '',
    allergies: profileData?.allergies || '',
    profileImage: profileData?.profileImage || null
  });

  const handleSave = () => {
    onUpdateProfile(formData);
    setEditing(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, profileImage: e.target.result }));
        setImageDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profileImage: null }));
    setImageDialogOpen(false);
  };

  const profileFields = [
    { key: 'age', label: 'Age', type: 'number', placeholder: 'Enter your age' },
    { key: 'bloodGroup', label: 'Blood Group', type: 'text', placeholder: 'e.g., A+, B-, O+' },
    { key: 'height', label: 'Height', type: 'text', placeholder: 'e.g., 5\'8", 170cm' },
    { key: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g., 70kg, 154lbs' },
    { key: 'emergencyContact', label: 'Emergency Contact', type: 'tel', placeholder: 'Phone number' },
    { key: 'medicalConditions', label: 'Medical Conditions', type: 'text', multiline: true, placeholder: 'Any ongoing conditions' },
    { key: 'allergies', label: 'Allergies', type: 'text', multiline: true, placeholder: 'Food, drug, or other allergies' }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar
                src={formData.profileImage}
                className="w-24 h-24 bg-primary text-white"
                style={{ width: 96, height: 96, fontSize: '2rem' }}
              >
                {!formData.profileImage && (userInfo?.displayName?.[0] || userInfo?.email?.[0] || 'U')}
              </Avatar>
              <IconButton
                className="absolute -bottom-2 -right-2 bg-primary text-white hover:bg-primary/90"
                size="small"
                onClick={() => setImageDialogOpen(true)}
              >
                <Camera size={16} />
              </IconButton>
            </div>
            
            <Typography variant="h5" className="font-bold mb-1">
              {editing ? (
                <TextField
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  variant="standard"
                  className="text-xl font-bold"
                />
              ) : (
                formData.displayName || userInfo?.displayName || 'User'
              )}
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              {userInfo?.email}
            </Typography>
            
            <Button
              startIcon={editing ? <Save size={16} /> : <Edit size={16} />}
              onClick={editing ? handleSave : () => setEditing(true)}
              variant={editing ? "contained" : "outlined"}
              className={editing ? "bg-primary" : ""}
            >
              {editing ? 'Save Profile' : 'Edit Profile'}
            </Button>
            
            {editing && (
              <Button
                startIcon={<X size={16} />}
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    age: profileData?.age || '',
                    bloodGroup: profileData?.bloodGroup || '',
                    height: profileData?.height || '',
                    weight: profileData?.weight || '',
                    emergencyContact: profileData?.emergencyContact || '',
                    medicalConditions: profileData?.medicalConditions || '',
                    allergies: profileData?.allergies || '',
                    profileImage: profileData?.profileImage || null
                  });
                }}
                variant="text"
                className="mt-2"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold mb-4 flex items-center">
            <User className="mr-2" size={20} />
            Health Information
          </Typography>
          
          <div className="space-y-4">
            {profileFields.map(({ key, label, type, placeholder, multiline }) => (
              <TextField
                key={key}
                label={label}
                type={type}
                value={formData[key]}
                onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                fullWidth
                multiline={multiline}
                rows={multiline ? 3 : 1}
                disabled={!editing}
                variant={editing ? "outlined" : "filled"}
                InputProps={{
                  readOnly: !editing,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <Typography variant="h6" className="font-semibold mb-4">
            Account Information
          </Typography>
          
          <div className="space-y-4">
            <TextField
              label="Full Name"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              fullWidth
              disabled={!editing}
              variant="filled"
              helperText={editing ? "You can change your display name" : "Name is set during account creation"}
            />
            
            <TextField
              label="Email Address"
              value={userInfo?.email || ''}
              fullWidth
              disabled
              variant="filled"
              helperText="Email cannot be changed"
            />
            
            <TextField
              label="Member Since"
              value={userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'N/A'}
              fullWidth
              disabled
              variant="filled"
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Profile Picture</DialogTitle>
        <DialogContent>
          <div className="text-center space-y-4">
            <Avatar
              src={formData.profileImage}
              className="w-32 h-32 mx-auto bg-primary text-white"
              style={{ width: 128, height: 128, fontSize: '3rem' }}
            >
              {!formData.profileImage && (userInfo?.displayName?.[0] || userInfo?.email?.[0] || 'U')}
            </Avatar>
            
            <div className="space-y-2">
              <Button
                component="label"
                variant="contained"
                startIcon={<Camera size={16} />}
                fullWidth
              >
                Upload New Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              
              {formData.profileImage && (
                <Button
                  onClick={removeImage}
                  variant="outlined"
                  color="error"
                  fullWidth
                >
                  Remove Photo
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Profile;
