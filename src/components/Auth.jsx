import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Heart } from 'lucide-react';
import { authService } from '../services/authService';

const Auth = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    sex: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.signIn(formData.email, formData.password);
    
    if (result.success) {
      onAuthSuccess(result.user);
    } else {
      setError(result.error);
      // If user doesn't exist, suggest sign up
      if (result.error.includes('User not found')) {
        setError(
          <div>
            {result.error}
            <Button 
              variant="text" 
              size="small" 
              onClick={() => setActiveTab(1)}
              className="ml-2 text-primary"
            >
              Sign up here
            </Button>
          </div>
        );
      }
    }
    
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await authService.signUp(formData.email, formData.password, formData.name, formData.sex);
    
    if (result.success) {
      onAuthSuccess(result.user);
    } else {
      setError(result.error);
      // If user already exists, suggest sign in
      if (result.error.includes('User already exists')) {
        setError(
          <div>
            {result.error}
            <Button 
              variant="text" 
              size="small" 
              onClick={() => setActiveTab(0)}
              className="ml-2 text-primary"
            >
              Sign in here
            </Button>
          </div>
        );
      }
    }
    
    setLoading(false);
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Heart className="mx-auto text-primary mb-4" size={48} />
            <Typography variant="h4" className="font-bold text-primary mb-2">
              Ucare Health
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Your personal health companion
            </Typography>
          </div>

          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            className="mb-6"
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          {activeTab === 0 ? (
            // Login Form
            <form onSubmit={handleLogin} className="space-y-4">
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
                required
              />
              
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                className="bg-primary hover:bg-primary/90 py-3"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Typography variant="body2" className="text-center text-gray-500 mt-3">
                Don't have an account?{' '}
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => setActiveTab(1)}
                  className="text-primary p-0 min-w-0"
                >
                  Sign up here
                </Button>
              </Typography>
            </form>
          ) : (
            // Signup Form
            <form onSubmit={handleSignup} className="space-y-4">
              <TextField
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                fullWidth
                required
              />

              <FormControl fullWidth required>
                <InputLabel>Sex</InputLabel>
                <Select
                  value={formData.sex}
                  label="Sex"
                  onChange={(e) => handleInputChange('sex', e.target.value)}
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
                required
              />
              
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                fullWidth
                required
                helperText="Minimum 6 characters"
              />

              <TextField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                className="bg-primary hover:bg-primary/90 py-3"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Typography variant="body2" className="text-center text-gray-500 mt-3">
                Already have an account?{' '}
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => setActiveTab(0)}
                  className="text-primary p-0 min-w-0"
                >
                  Sign in here
                </Button>
              </Typography>
            </form>
          )}

          <Typography variant="body2" className="text-center text-gray-500 mt-6">
            Your health data is encrypted and securely stored in the cloud
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Auth;
