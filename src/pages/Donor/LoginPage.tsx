import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Grid,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// Import API client
import { Api } from '../../services/Api';

// Initialize API client
const api = new Api({ baseUrl: 'http://localhost:5266' });

const DonorLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call the API to login donor
      const response = await api.api.donorLoginCreate({ 
        username, 
        password 
      }, {
        format: 'json'
      });
      
      if (response) {
        if (response.ok) {
          console.log('Login successful');
          const data = await response.json();
          const token = data.token;
          
          // Store token in localStorage for future use
          localStorage.setItem('authToken', token);
          localStorage.setItem('username', username);
          
          // Set authorization header for all future API calls
          api.setSecurityData(token);
          
          setShowSuccess(true);
          
          // Navigate to donor dashboard after successful login
          setTimeout(() => {
            navigate('/donor/dashboard');
          }, 1000);
        } else {
          // Handle non-ok responses
          if (response.status === 401) {
            setError('Invalid username or password');
          } else {
            setError('Login failed. Please try again later.');
          }
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Different error handling based on error response
      if (err.status === 401) {
        setError('Invalid username or password');
      } else if (err.status === 404) {
        setError('User not found');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessMessage = () => {
    setShowSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2
          }}>
            <RestaurantIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              FoodBridge
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            backgroundColor: 'primary.main',
            color: 'white',
            p: 1,
            borderRadius: 1
          }}>
            <LockOutlinedIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Donor Login
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit"
                variant="contained" 
                fullWidth
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account yet?{' '}
            <Link 
              to="/donor/register" 
              style={{ color: '#4caf50', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Register as a donor
            </Link>
          </Typography>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="text" 
            color="primary"
            onClick={() => navigate('/')}
            size="small"
          >
            Return to Home
          </Button>
        </Box>
      </Paper>

      {/* Success message snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccessMessage}
        message="Login successful"
      />
    </Box>
  );
};

export default DonorLoginPage;