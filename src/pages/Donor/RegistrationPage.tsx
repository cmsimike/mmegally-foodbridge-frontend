import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Grid,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

// Import API client
import { Api } from '../../services/Api';

// Initialize API client
const api = new Api({ baseUrl: 'http://localhost:5266' });

const DonorRegistrationPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Geolocation state
  const [gettingLocation, setGettingLocation] = useState(false);

  const steps = ['Account Information', 'Store Information'];

  const validateStep1 = () => {
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    
    if (password.length < 3) {
      setError('Password must be at least 3 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (storeName.length < 3) {
      setError('Store name must be at least 3 characters');
      return false;
    }
    
    if (!latitude || !longitude) {
      setError('Location is required');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (validateStep1()) {
        // When moving to step 2, register the donor first
        await registerDonor();
      }
    } else if (activeStep === 1) {
      if (validateStep2()) {
        await registerStore();
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleGetLocation = () => {
    setGettingLocation(true);
    setError('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setGettingLocation(false);
        },
        (error) => {
          setError('Error getting location: ' + error.message);
          setGettingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
      setGettingLocation(false);
    }
  };

  const registerDonor = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Call the API to register donor
      const response = await api.api.donorRegisterCreate({ 
        username, 
        password 
      }, {
        format: 'json'
      });
      
      if (response) {
        if (response.ok) {
          console.log('Donor registration successful');
          const data = await response.json();
          const token = data.token;
          const username = data.username;
          
          // Store data in localStorage for future use
          localStorage.setItem('authToken', token);
          localStorage.setItem('username', username);
          
          // Set authorization header for all future API calls
          api.setSecurityData(token);
          
          console.log('Registration successful, received token');
          setSuccessMessage('Registration successful! Now set up your store.');
          setShowSuccess(true);
          setActiveStep(1);
        }
      }
      
      } catch (err) {
        console.error('Registration error:', err);
      
      // If error wasn't already set above (for HTTP responses), handle other error types
      if (!error) {
        if (err.status === 409) {
          setError('Username already exists. Please choose another one.');
        }
        else {
          console.error('Registration failed:', err);
          setError('Registration failed. Please try again later.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const registerStore = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get token from local storage
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please login again.');
        setActiveStep(0);
        return;
      }
      
      // Set the token for this request
      api.setSecurityData(token);
      
      // Call the API to register store
      const response = await api.api.donorStoreCreate({ 
        name: storeName, 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      }, {
        format: 'json',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Check response
      if (response && response.ok) {
        console.log('Store registration successful');
        setSuccessMessage('Store registration successful!');
        setShowSuccess(true);
        
        // Navigate to donor dashboard after successful registration
        setTimeout(() => {
          navigate('/donor/dashboard');
        }, 1500);
      } else {
        throw new Error('Store registration failed with status: ' + (response ? response.status : 'unknown'));
      }
    } catch (err) {
      console.error('Store registration error:', err);
      
      if (err.message && err.message.includes('Authentication required')) {
        setError('Authentication expired. Please register again.');
        // Could redirect to login or restart registration process
      } else {
        setError('Store registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessMessage = () => {
    setShowSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <RestaurantIcon fontSize="large" sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Become a Food Donor
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {activeStep === 0 ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create Your Donor Account
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  helperText="Username must be at least 3 characters"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  helperText="Password must be at least 3 characters"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Store Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Store Name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                  helperText="Enter the name of your store, restaurant, or organization"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                  disabled={gettingLocation}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                  disabled={gettingLocation}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  startIcon={gettingLocation ? <CircularProgress size={20} /> : null}
                >
                  {gettingLocation ? 'Getting Location...' : 'Use My Current Location'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/') : handleBack}
            disabled={loading}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {activeStep === steps.length - 1 ? 'Register' : 'Next'}
          </Button>
        </Box>
      </Paper>

      {/* Success message snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={handleCloseSuccessMessage}
        message={successMessage}
      />
    </Box>
  );
};

export default DonorRegistrationPage;