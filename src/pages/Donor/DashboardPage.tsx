import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import StoreIcon from '@mui/icons-material/Store';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/People';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Import API client (assuming you'll set this up separately)
// import { api } from '../api/client';

// Helper function to format dates
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format relative time (e.g., "2 hours ago")
const formatRelativeTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHr < 24) {
    return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date).split(',')[0]; // Return just the date part
  }
};

// Mock data for demonstration
const mockStores = [
  {
    id: '1',
    name: 'Downtown Restaurant',
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    donorId: 'user123',
    activeItems: 3,
    claimedItems: 5,
    totalDonated: 45
  },
  {
    id: '2',
    name: 'Midtown Bakery',
    latitude: 37.7833,
    longitude: -122.4167,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    donorId: 'user123',
    activeItems: 2,
    claimedItems: 0,
    totalDonated: 18
  },
  {
    id: '3',
    name: 'Westside Grocery',
    latitude: 37.7694,
    longitude: -122.4862,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    donorId: 'user123',
    activeItems: 0,
    claimedItems: 1,
    totalDonated: 7
  }
];

const mockUser = {
  username: 'BusinessUser',
  createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
  totalDonations: 70,
  totalClaimed: 54
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'donation',
    itemName: 'Fresh Bread',
    storeName: 'Downtown Restaurant',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: '2',
    type: 'claim',
    itemName: 'Fruit Selection',
    storeName: 'Midtown Bakery',
    claimerName: 'Sarah',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
  },
  {
    id: '3',
    type: 'pickup',
    itemName: 'Sandwich Platters',
    storeName: 'Downtown Restaurant',
    claimerName: 'John',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: '4',
    type: 'donation',
    itemName: 'Prepared Meals',
    storeName: 'Downtown Restaurant',
    date: new Date(Date.now() - 30 * 60 * 60 * 1000) // 30 hours ago
  }
];

const DonorDashboardPage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [stores, setStores] = useState([]);
  const [user, setUser] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Fetch donor data, stores, and activity
    const fetchData = async () => {
      try {
        // In a real implementation, you would use your API client
        // Mock data for demonstration
        setUser(mockUser);
        setStores(mockStores);
        setRecentActivity(mockRecentActivity);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    // Clear local storage
    // localStorage.removeItem('token');
    navigate('/donor/login');
  };

  const handleStoreMenuOpen = (event, storeId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedStoreId(storeId);
  };

  const handleStoreMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedStoreId(null);
  };

  const handleViewStore = (storeId) => {
    handleStoreMenuClose();
    navigate(`/donor/store/${storeId}`);
  };

  const handleEditStore = (storeId) => {
    handleStoreMenuClose();
    // Navigate to store edit page or open dialog
    setSnackbar({
      open: true,
      message: 'Store edit functionality will be implemented soon',
      severity: 'info'
    });
  };

  const handleDeleteStore = (storeId) => {
    handleStoreMenuClose();
    
    // In a real implementation, you would call your API
    // For now, just filter out the store
    setStores(stores.filter(store => store.id !== storeId));
    
    setSnackbar({
      open: true,
      message: 'Store removed successfully',
      severity: 'success'
    });
  };

  const handleAddStore = () => {
    // For now, just show a notification
    setSnackbar({
      open: true,
      message: 'Add store functionality will be implemented soon',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FoodBridge Donor Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Welcome, {user?.username}
            </Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="secondary" 
          textColor="inherit"
          variant="fullWidth"
          sx={{ backgroundColor: 'primary.dark' }}
        >
          <Tab icon={<RestaurantIcon />} label="OVERVIEW" />
          <Tab icon={<StoreIcon />} label="MY STORES" />
          <Tab icon={<BarChartIcon />} label="IMPACT" />
        </Tabs>
      </AppBar>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Total Donations
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {user?.totalDonations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Food items donated since joining
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Claimed Items
                  </Typography>
                  <Typography variant="h3" color="secondary">
                    {user?.totalClaimed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Food items claimed by recipients
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Active Listings
                  </Typography>
                  <Typography variant="h3" color="info.main">
                    {stores.reduce((sum, store) => sum + store.activeItems, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Items currently available for claim
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Recent Activity */}
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                
                {recentActivity.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No recent activity to display
                  </Typography>
                ) : (
                  <List>
                    {recentActivity.map((activity) => (
                      <React.Fragment key={activity.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            {activity.type === 'donation' && <FastfoodIcon color="primary" />}
                            {activity.type === 'claim' && <PeopleIcon color="secondary" />}
                            {activity.type === 'pickup' && <VerifiedIcon color="success" />}
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography variant="body1">
                                {activity.type === 'donation' && 'New food item added'}
                                {activity.type === 'claim' && `Item claimed by ${activity.claimerName}`}
                                {activity.type === 'pickup' && `Item picked up by ${activity.claimerName}`}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span" color="text.primary">
                                  {activity.itemName}
                                </Typography>
                                <Typography variant="body2" component="span" color="text.secondary">
                                  {' - '}
                                  {activity.storeName}
                                </Typography>
                                <Typography variant="body2" display="block" color="text.secondary">
                                  {formatRelativeTime(activity.date)}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
            
            {/* Quick Actions */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                
                <List>
                  <ListItem>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddStore}
                    >
                      Add New Store
                    </Button>
                  </ListItem>
                  <ListItem>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color="primary"
                      onClick={() => {
                        if (stores.length > 0) {
                          navigate(`/donor/store/${stores[0].id}`);
                        } else {
                          setSnackbar({
                            open: true,
                            message: 'Please add a store first',
                            severity: 'info'
                          });
                        }
                      }}
                    >
                      Add Food Item
                    </Button>
                  </ListItem>
                  <ListItem>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color="secondary"
                      onClick={() => navigate('/browse')}
                    >
                      View Public Listings
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* My Stores Tab */}
      {tabValue === 1 && (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">My Stores</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddStore}
            >
              Add New Store
            </Button>
          </Box>

          {stores.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                You haven't added any stores yet. Add your first store to start donating food.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddStore}
              >
                Add Your First Store
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {stores.map((store) => (
                <Grid item xs={12} md={6} key={store.id}>
                  <Card elevation={3}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(store.name)}
                        </Avatar>
                      }
                      action={
                        <>
                          <IconButton 
                            aria-label="store menu" 
                            onClick={(e) => handleStoreMenuOpen(e, store.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={menuAnchorEl}
                            open={Boolean(menuAnchorEl) && selectedStoreId === store.id}
                            onClose={handleStoreMenuClose}
                          >
                            <MenuItem onClick={() => handleViewStore(store.id)}>
                              View Store
                            </MenuItem>
                            <MenuItem onClick={() => handleEditStore(store.id)}>
                              Edit Store
                            </MenuItem>
                            <MenuItem onClick={() => handleDeleteStore(store.id)}>
                              Delete Store
                            </MenuItem>
                          </Menu>
                        </>
                      }
                      title={store.name}
                      subheader={`Added on ${formatDate(store.createdAt).split(',')[0]}`}
                    />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={4} textAlign="center">
                          <Typography variant="h5" color="primary">
                            {store.activeItems}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active
                          </Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="center">
                          <Typography variant="h5" color="secondary">
                            {store.claimedItems}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Claimed
                          </Typography>
                        </Grid>
                        <Grid item xs={4} textAlign="center">
                          <Typography variant="h5">
                            {store.totalDonated}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(`/donor/store/${store.id}`)}
                        sx={{ ml: 'auto' }}
                      >
                        Manage Listings
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Impact Tab */}
      {tabValue === 2 && (
        <Box sx={{ p: 3 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Your Impact</Typography>
            
            <Box sx={{ my: 4, textAlign: 'center' }}>
              <Typography variant="h2" color="primary" gutterBottom>
                {user?.totalDonations}
              </Typography>
              <Typography variant="h5" gutterBottom>
                Total Food Items Donated
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Thank you for helping reduce food waste and hunger in your community!
              </Typography>
              
              <Box sx={{ my: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="h4" gutterBottom>
                        {Math.round(user?.totalDonations * 0.75)} lbs
                      </Typography>
                      <Typography variant="body1">
                        Estimated Food Saved
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, bgcolor: 'secondary.light', color: 'white' }}>
                      <Typography variant="h4" gutterBottom>
                        {Math.round(user?.totalClaimed * 2.5)}
                      </Typography>
                      <Typography variant="body1">
                        Estimated Meals Provided
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, bgcolor: 'success.light', color: 'white' }}>
                      <Typography variant="h4" gutterBottom>
                        {Math.round(user?.totalDonations * 2.8)} kg
                      </Typography>
                      <Typography variant="body1">
                        CO₂ Emissions Prevented
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              
              <Typography variant="body1" paragraph sx={{ mt: 4 }}>
                Food waste is responsible for approximately 8% of global greenhouse gas emissions. By donating your surplus food, you're not only helping feed those in need but also making a significant environmental impact.
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    if (stores.length > 0) {
                      navigate(`/donor/store/${stores[0].id}`);
                    } else {
                      setSnackbar({
                        open: true,
                        message: 'Please add a store first',
                        severity: 'info'
                      });
                    }
                  }}
                >
                  Donate More Food
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

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

export default DonorDashboardPage;