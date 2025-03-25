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
  CircularProgress
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// Import API client (assuming you'll set this up separately)
// import { api } from '../api/client';

const DonorLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
      // In a real implementation, you would use your API client like:
      // await api.donorLoginCreate({ username, password });
      
      // For now, let's simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store token in localStorage (in a real app)
      // localStorage.setItem('token', response.token);
      
      // Navigate to donor dashboard after successful login
      navigate('/donor/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    </Box>
  );
};

export default DonorLoginPage;