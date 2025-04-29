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

// Import API client
import { Api } from '../../services/Api';

// Initialize API client
const api = new Api({ 
  baseUrl: 'http://localhost:5266',
  securityWorker: (token) => {
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    }
    return {};
  }
});

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

// We'll derive activity data from food items instead of using mock data
// Helper function to check if a date is in the future
const isDateInFuture = (date: string): boolean => {
  return new Date(date) > new Date();
};
const DonorDashboardPage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [store, setStore] = useState(null);
  const [user, setUser] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/donor/login');
      return;
    }

    // Set token for API calls
    api.setSecurityData(token);

    // Fetch donor data and store
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get store data from API
        const storeResponse = await api.api.donorStoreList({
          secure: true,
          format: 'json'
        });
        
        if (storeResponse.ok) {
          const storeData = await storeResponse.json();
          
          // Set basic user data from localStorage
          setUser({
            username: localStorage.getItem('username') || 'User',
            createdAt: storeData.createdAt || new Date(),
            // Calculate totals - assuming we need to track these
            totalDonations: storeData.foodItems ? storeData.foodItems.length : 0,
            totalClaimed: storeData.foodItems ? storeData.foodItems.filter(item => item.isClaimed).length : 0
          });
          
          // Add calculated properties to store
          const enrichedStore = {
            ...storeData,
            activeItems: storeData.foodItems ? storeData.foodItems.filter(item => !item.isClaimed && isDateInFuture(item.expirationDate)).length : 0,
            claimedItems: storeData.foodItems ? storeData.foodItems.filter(item => item.isClaimed).length : 0,
            totalDonated: storeData.foodItems ? storeData.foodItems.length : 0
          };
          
          setStore(enrichedStore);
          
          // Generate activity data from food items
          if (storeData.foodItems && storeData.foodItems.length > 0) {
            const activityItems = [];
            
            // Process food items to create activity entries
            storeData.foodItems.forEach(item => {
              // Add donation activity (when the item was created)
              activityItems.push({
                id: `donation-${item.id}`,
                type: 'donation',
                itemName: item.name,
                storeName: storeData.name,
                date: new Date(item.createdAt)
              });
              
              // If item is claimed, add a claim activity
              if (item.isClaimed && item.claimCode) {
                activityItems.push({
                  id: `claim-${item.id}`,
                  type: 'claim',
                  itemName: item.name,
                  storeName: storeData.name,
                  // Using "Recipient" as claimer name since we don't have the actual name
                  claimerName: "Recipient",
                  date: new Date(item.createdAt) // Using createdAt as a proxy since we don't have claimedAt
                });
              }
            });
            
            // Sort by date, most recent first
            activityItems.sort((a, b) => b.date - a.date);
            
            // Take the most recent 5 activities
            setRecentActivity(activityItems.slice(0, 5));
          } else {
            setRecentActivity([]);
          }
        } else {
          // If store not found, we assume user doesn't have a store yet
          setStore(null);
          setUser({
            username: localStorage.getItem('username') || 'User',
            createdAt: new Date(),
            totalDonations: 0,
            totalClaimed: 0
          });
          setRecentActivity([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/donor/login');
  };

  const handleStoreMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleStoreMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewStore = () => {
    handleStoreMenuClose();
    if (store) {
      navigate(`/donor/store/${store.id}`);
    }
  };

  const handleEditStore = () => {
    handleStoreMenuClose();
    // Navigate to store edit page or open dialog
    setSnackbar({
      open: true,
      message: 'Store edit functionality will be implemented soon',
      severity: 'info'
    });
  };

  const handleAddStore = () => {
    navigate('/donor/add-store');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const getInitials = (name) => {
    if (!name) return "ST";
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
          {/* <Tab icon={<StoreIcon />} label="MY STORE" /> */}
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
                    {user?.totalDonations || 0}
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
                    {user?.totalClaimed || 0}
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
                    {store?.activeItems || 0}
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
                  {!store && (
                    <ListItem>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddStore}
                      >
                        Add Your Store
                      </Button>
                    </ListItem>
                  )}
                  {store && (
                    <ListItem>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/donor/store/${store.id}`)}
                      >
                        Go to Store
                      </Button>
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* My Store Tab */}
      {tabValue === 1 && (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">My Store</Typography>
            {!store && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddStore}
              >
                Add Store
              </Button>
            )}
          </Box>

          {!store ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                You haven't added a store yet. Add your store to start donating food.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddStore}
              >
                Add Your Store
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
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
                          onClick={handleStoreMenuOpen}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchorEl}
                          open={Boolean(menuAnchorEl)}
                          onClose={handleStoreMenuClose}
                        >
                          <MenuItem onClick={handleViewStore}>
                            View Store
                          </MenuItem>
                          <MenuItem onClick={handleEditStore}>
                            Edit Store
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
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Location: {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
                    </Typography>
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
            </Grid>
          )}
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