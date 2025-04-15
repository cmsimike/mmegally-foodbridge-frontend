import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Container,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import NearMeIcon from '@mui/icons-material/NearMe';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';

// Import API client and types
import { Api, FoodItem, ClaimFoodRequest } from '../services/Api';

// Initialize API client
const api = new Api({ 
  baseUrl: 'http://localhost:5266',
  // securityWorker: (token) => {
  //   if (token) {
  //     return {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     };
  //   }
  //   return {};
  // }
});

// Define an interface for the response when a food item is claimed
interface ClaimResponse {
  claimCode: string;
}

// Helper function to format dates
const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to check if a date is in the future
const isDateInFuture = (date: string): boolean => {
  return new Date(date) > new Date();
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Extend FoodItem with distance property
interface FoodItemWithDistance extends FoodItem {
  distance?: number;
}

const FoodSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [foodItems, setFoodItems] = useState<FoodItemWithDistance[]>([]);
  const [error, setError] = useState<string>('');
  
  // Location state
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [searchRadius, setSearchRadius] = useState<number>(10);
  
  // Claim dialog state
  const [claimDialog, setClaimDialog] = useState<{
    open: boolean;
    itemId: string | null;
    name: string;
    storeName: string;
    expirationDate: string | null;
  }>({
    open: false,
    itemId: null,
    name: '',
    storeName: '',
    expirationDate: null
  });
  
  // Claim form state
  const [claimerName, setClaimerName] = useState<string>('');
  
  // Success claim dialog state
  const [successDialog, setSuccessDialog] = useState<{
    open: boolean;
    claimCode: string | null;
  }>({
    open: false,
    claimCode: null
  });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleGetLocation = (): void => {
    setGettingLocation(true);
    setError('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
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

  const handleSearch = async (): Promise<void> => {
    if (!latitude || !longitude) {
      setError('Please provide your location to search for nearby food');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call the API to search for available food
      const response = await api.api.recipientAvailableFoodList(
        {
          latitude: Number(latitude),
          longitude: Number(longitude)
        },
        {
          format: 'json'
        }
      );
      
      if (response && response.ok) {
        let availableFood = await response.json();
        
        // Handle backend returning either array or object with $values
        if (availableFood && '$values' in availableFood) {
          availableFood = availableFood.$values;
        }
        
        // Filter out claimed or expired items (as a safety check)
        let filteredFood = (availableFood as FoodItem[]).filter(item => 
          !item.isClaimed && isDateInFuture(item.expirationDate)
        );
        
        // Add distance to each item
        const foodWithDistance: FoodItemWithDistance[] = filteredFood.map(item => {
          const store = item.store;
          if (store) {
            const distance = calculateDistance(
              Number(latitude), 
              Number(longitude), 
              store.latitude, 
              store.longitude
            );
            return { ...item, distance };
          }
          return { ...item, distance: undefined };
        });
        
        // Filter by search radius
        const withinRadius = foodWithDistance.filter(item => 
          (item.distance !== undefined && item.distance <= searchRadius)
        );
        
        // Sort by distance (closest first)
        withinRadius.sort((a, b) => 
          (a.distance ?? Infinity) - (b.distance ?? Infinity)
        );
        
        setFoodItems(withinRadius);
        setSearchPerformed(true);
        
        if (withinRadius.length === 0) {
          setSnackbar({
            open: true,
            message: 'No available food found in your area',
            severity: 'info'
          });
        }
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for food. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimClick = (item: FoodItemWithDistance): void => {
    setClaimDialog({
      open: true,
      itemId: item.id || null,
      name: item.name,
      storeName: item.store?.name || 'Unknown',
      expirationDate: item.expirationDate
    });
  };

  const handleCloseClaimDialog = (): void => {
    setClaimDialog({
      ...claimDialog,
      open: false
    });
    setClaimerName('');
  };

  const handleSubmitClaim = async (): Promise<void> => {
    if (!claimerName || claimerName.length < 2) {
      setError('Please enter your name (minimum 2 characters)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (!claimDialog.itemId) {
        throw new Error('No item selected for claiming');
      }
      
      // Create the claim request
      const claimRequest: ClaimFoodRequest = {
        claimerName
      };
      
      // Call the API to claim the food item
      const response = await api.api.recipientClaimCreate(
        claimDialog.itemId,
        claimRequest,
        {
          format: 'json'
        }
      );
      
      if (response && response.ok) {
        const data = await response.json() as ClaimResponse;
        
        // Close the claim dialog
        handleCloseClaimDialog();
        
        // Remove the claimed item from the list
        setFoodItems(foodItems.filter(item => item.id !== claimDialog.itemId));
        
        // Show success dialog with claim code
        setSuccessDialog({
          open: true,
          claimCode: data.claimCode
        });
      } else {
        throw new Error('Claim failed');
      }
    } catch (err) {
      console.error('Claim error:', err);
      setError('Failed to claim food item. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessDialog = (): void => {
    setSuccessDialog({
      ...successDialog,
      open: false
    });
  };

  const handleCloseSnackbar = (): void => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const formatDistanceText = (distance: number | undefined): string => {
    if (distance === undefined) return 'Unknown distance';
    
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} miles away`;
    }
    return `${distance.toFixed(1)} mi away`;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <RestaurantIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FoodBridge
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            startIcon={<PersonIcon />}
            onClick={() => navigate('/donor/login')}
          >
            Donor Login
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Find Available Food
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Search for available food donations in your area. You can claim items and pick them up from the donor's location.
          </Typography>

          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Latitude"
                value={latitude}
                onChange={(e) => {
                  const value = e.target.value;
                  setLatitude(value === '' ? '' : parseFloat(value));
                }}
                disabled={gettingLocation}
                type="number"
                inputProps={{ step: "0.0001" }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Longitude"
                value={longitude}
                onChange={(e) => {
                  const value = e.target.value;
                  setLongitude(value === '' ? '' : parseFloat(value));
                }}
                disabled={gettingLocation}
                type="number"
                inputProps={{ step: "0.0001" }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Radius (mi)"
                type="number"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
                inputProps={{ min: 1, max: 50 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                startIcon={gettingLocation ? <CircularProgress size={20} /> : <NearMeIcon />}
                sx={{ height: '100%' }}
              >
                {gettingLocation ? 'Getting Location...' : 'Use My Current Location'}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={loading || !latitude || !longitude}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                sx={{ height: '100%' }}
              >
                {loading ? 'Searching...' : 'Search For Food'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {searchPerformed && (
          <Box>
            <Typography variant="h5" gutterBottom>
              {foodItems.length > 0 
                ? `Found ${foodItems.length} available food item${foodItems.length !== 1 ? 's' : ''}`
                : 'No food items found nearby'}
            </Typography>
            
            {foodItems.length > 0 ? (
              <Grid container spacing={3}>
                {foodItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card elevation={3} sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderLeft: '4px solid #4caf50'
                    }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {item.name}
                          </Typography>
                          <Chip
                            label={formatDistanceText(item.distance)}
                            color="primary"
                            size="small"
                            icon={<NearMeIcon />}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {item.description || 'No description provided'}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>From:</strong> {item.store?.name}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Expires:</strong> {formatDate(item.expirationDate)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <AccessTimeIcon fontSize="small" sx={{ color: 'warning.main', mr: 1 }} />
                            <Typography variant="body2" color="warning.main">
                              Claim before it's gone!
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={() => handleClaimClick(item)}
                        >
                          Claim This Item
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
                <FastfoodIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No available food found in your area
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try increasing your search radius or check back later
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Container>

      {/* Claim Dialog */}
      <Dialog open={claimDialog.open} onClose={handleCloseClaimDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Claim Food Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="h6" gutterBottom>
              {claimDialog.name}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Pickup Location" 
                  secondary={claimDialog.storeName} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Expires" 
                  secondary={claimDialog.expirationDate ? formatDate(claimDialog.expirationDate) : 'Unknown'} 
                />
              </ListItem>
            </List>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
              Please provide your name to claim this item. You'll receive a claim code to show when picking up.
            </Typography>
            <TextField
              fullWidth
              label="Your Name (Optional)"
              value={claimerName}
              onChange={(e) => setClaimerName(e.target.value)}
              sx={{ mt: 2 }}
              helperText="Minimum 2 characters"
              defaultValue={''}
              inputProps={{ minLength: 2, maxLength: 100 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClaimDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitClaim} 
            variant="contained" 
            disabled={loading }
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Claiming...' : 'Claim Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog with Claim Code */}
      <Dialog open={successDialog.open} onClose={handleCloseSuccessDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Item Claimed Successfully!</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              You have successfully claimed this food item. Please use the following claim code when picking up:
            </Typography>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                my: 2, 
                backgroundColor: 'success.light', 
                color: 'success.contrastText',
                display: 'inline-block',
                minWidth: '200px'
              }}
            >
              <Typography variant="h3" component="div">
                {successDialog.claimCode}
              </Typography>
            </Paper>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please save this code or take a screenshot. You will need to show this code to the donor when picking up your food.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} variant="contained">
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FoodSearchPage;