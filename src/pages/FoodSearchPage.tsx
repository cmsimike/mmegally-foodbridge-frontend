import React, { useState, useEffect, useRef } from 'react';
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
  ListItemText,
  Divider,
} from '@mui/material';
import NearMeIcon from '@mui/icons-material/NearMe';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
// Import marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Set default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Import API client and types
import { Api, FoodItem, ClaimFoodRequest } from '../services/Api';

// Initialize API client
const api = new Api({ 
  baseUrl: 'http://localhost:5266',
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

// Store with its food items
interface StoreWithItems {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  items: FoodItemWithDistance[];
}

// Component to recenter map when location changes
const MapRecenter = ({ latitude, longitude, zoom }: { latitude: number, longitude: number, zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], zoom);
    }
  }, [latitude, longitude, zoom, map]);
  
  return null;
};

const FoodSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [foodItems, setFoodItems] = useState<FoodItemWithDistance[]>([]);
  const [storesWithItems, setStoresWithItems] = useState<StoreWithItems[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([40, -95]); // Default center of US
  const [mapZoom, setMapZoom] = useState<number>(4); // Default zoom level
  
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
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setLatitude(lat);
          setLongitude(lng);
          setMapCenter([lat, lng]);
          setMapZoom(13); // Zoom in when we get user location
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
    setSelectedStoreId(null);
    
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
        
        // Group items by store
        const storeMap = new Map<string, StoreWithItems>();
        
        withinRadius.forEach(item => {
          if (item.store && item.store.id) {
            const storeId = item.store.id;
            
            if (!storeMap.has(storeId)) {
              storeMap.set(storeId, {
                id: storeId,
                name: item.store.name,
                latitude: item.store.latitude,
                longitude: item.store.longitude,
                distance: item.distance,
                items: []
              });
            }
            
            storeMap.get(storeId)?.items.push(item);
          }
        });
        
        // Convert map to array
        const storesArray = Array.from(storeMap.values());
        
        // Sort stores by distance
        storesArray.sort((a, b) => 
          (a.distance ?? Infinity) - (b.distance ?? Infinity)
        );
        
        setStoresWithItems(storesArray);
        setSearchPerformed(true);
        
        // Center map on user location with appropriate zoom
        if (typeof latitude === 'number' && typeof longitude === 'number') {
          setMapCenter([latitude, longitude]);
          setMapZoom(12);
        }
        
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

  const handleStoreSelect = (storeId: string): void => {
    setSelectedStoreId(storeId);
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
        
        // Remove the claimed item from the lists
        const updatedFoodItems = foodItems.filter(item => item.id !== claimDialog.itemId);
        setFoodItems(updatedFoodItems);
        
        // Update stores with items
        const updatedStores = storesWithItems.map(store => ({
          ...store,
          items: store.items.filter(item => item.id !== claimDialog.itemId)
        })).filter(store => store.items.length > 0);
        
        setStoresWithItems(updatedStores);
        
        // If there are no more items at the selected store, clear selection
        const selectedStore = updatedStores.find(store => store.id === selectedStoreId);
        if (!selectedStore) {
          setSelectedStoreId(null);
        }
        
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
      return `${(distance * 1000).toFixed(0)} m away`;
    }
    return `${distance.toFixed(1)} mi away`;
  };

  // Get the selected store's items
  const selectedStoreItems = selectedStoreId 
    ? storesWithItems.find(store => store.id === selectedStoreId)?.items || []
    : [];

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

      <Container maxWidth="xl" sx={{ mt: 4 }}>
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
                  const parsedValue = value === '' ? '' : parseFloat(value);
                  setLatitude(parsedValue);
                  if (typeof parsedValue === 'number' && typeof longitude === 'number') {
                    setMapCenter([parsedValue, longitude]);
                  }
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
                  const parsedValue = value === '' ? '' : parseFloat(value);
                  setLongitude(parsedValue);
                  if (typeof latitude === 'number' && typeof parsedValue === 'number') {
                    setMapCenter([latitude, parsedValue]);
                  }
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

        {/* Two-column layout */}
        <Grid container spacing={3}>
          {/* Left column - Map */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ height: "600px", width: "100%" }}>
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Center map when location changes */}
                <MapRecenter 
                  latitude={mapCenter[0]} 
                  longitude={mapCenter[1]} 
                  zoom={mapZoom} 
                />
                
                {/* User location marker */}
                {typeof latitude === 'number' && typeof longitude === 'number' && (
                  <>
                    <Marker 
                      position={[latitude, longitude]} 
                      icon={userIcon}
                    >
                      <Popup>
                        Your Location
                      </Popup>
                    </Marker>
                    
                    {/* Search radius circle */}
                    <Circle 
                      center={[latitude, longitude]}
                      radius={searchRadius * 1609.34} // Convert miles to meters
                      pathOptions={{ 
                        color: 'blue', 
                        fillColor: 'blue', 
                        fillOpacity: 0.1 
                      }}
                    />
                  </>
                )}
                
                {/* Store markers */}
                {storesWithItems.map((store) => (
                  <Marker
                    key={store.id}
                    position={[store.latitude, store.longitude]}
                    icon={storeIcon}
                    eventHandlers={{
                      click: () => {
                        handleStoreSelect(store.id);
                      }
                    }}
                  >
                    <Popup>
                      <Box sx={{ p: 1, minWidth: "200px" }}>
                        <Typography variant="h6" gutterBottom>
                          {store.name}
                        </Typography>
                        <Typography variant="body2">
                          {formatDistanceText(store.distance)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {store.items.length} food item{store.items.length !== 1 ? 's' : ''} available
                        </Typography>
                      </Box>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Paper>
          </Grid>
          
          {/* Right column - Food items */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                height: "600px", 
                p: 2, 
                overflowY: "auto"
              }}
            >
              {searchPerformed ? (
                <>
                  {selectedStoreId ? (
                    <Box>
                      {/* Selected store header */}
                      {storesWithItems.find(store => store.id === selectedStoreId) && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <StoreIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h5">
                              {storesWithItems.find(store => store.id === selectedStoreId)?.name}
                            </Typography>
                          </Box>
                          <Chip 
                            label={formatDistanceText(storesWithItems.find(store => store.id === selectedStoreId)?.distance)} 
                            color="primary" 
                            size="small" 
                            icon={<NearMeIcon />}
                          />
                        </Box>
                      )}
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      {/* Store items */}
                      {selectedStoreItems.length > 0 ? (
                        <Typography variant="subtitle1" gutterBottom>
                          {selectedStoreItems.length} available item{selectedStoreItems.length !== 1 ? 's' : ''}:
                        </Typography>
                      ) : (
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          No items available at this store
                        </Typography>
                      )}
                      
                      <Grid container spacing={2}>
                        {selectedStoreItems.map((item) => (
                          <Grid item xs={12} key={item.id}>
                            <Card elevation={3} sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              borderLeft: '4px solid #4caf50',
                              height: '100%'
                            }}>
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="h2" gutterBottom>
                                  {item.name}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  {item.description || 'No description provided'}
                                </Typography>
                                
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2">
                                    <strong>Expires:</strong> {formatDate(item.expirationDate)}
                                  </Typography>
                                  {/* <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <AccessTimeIcon fontSize="small" sx={{ color: 'warning.main', mr: 1 }} />
                                    <Typography variant="body2" color="warning.main">
                                      Claim before it's gone!
                                    </Typography>
                                  </Box> */}
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
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '100%' 
                    }}>
                      {storesWithItems.length > 0 ? (
                        <>
                          <StoreIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7, mb: 2 }} />
                          <Typography variant="h6" color="primary" gutterBottom>
                            {storesWithItems.length} store{storesWithItems.length !== 1 ? 's' : ''} found
                          </Typography>
                          <Typography variant="body1" color="text.secondary" align="center">
                            Click on a store marker on the map to view available food items
                          </Typography>
                        </>
                      ) : (
                        <>
                          <FastfoodIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No available food found in your area
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try increasing your search radius or check back later
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%' 
                }}>
                  <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Search for available food
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Enter your location and search radius above, then click "Search For Food"
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
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
              You'll receive a claim code after claiming this item. Please show this code to the donor when picking up your food.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClaimDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitClaim} 
            variant="contained" 
            disabled={loading}
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