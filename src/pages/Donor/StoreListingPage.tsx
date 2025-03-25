import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Divider,
  List,
  ListItem,
  ListItemText,
  Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArchiveIcon from '@mui/icons-material/Archive';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

// Helper function to check if a date is in the future
const isDateInFuture = (date) => {
  return new Date(date) > new Date();
};

// Mock data for demonstration
const mockFoodItems = [
  {
    id: '1',
    name: 'Fresh Bread',
    description: 'Assorted bread and pastries',
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    createdAt: new Date(),
    isClaimed: false,
    claimCode: null,
    storeId: '123'
  },
  {
    id: '2',
    name: 'Fruit Selection',
    description: 'Apples, bananas, and oranges',
    expirationDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    isClaimed: true,
    claimCode: 'ABC123',
    storeId: '123'
  },
  {
    id: '3',
    name: 'Prepared Meals',
    description: 'Assorted prepared meals that were not sold today',
    expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isClaimed: false,
    claimCode: null,
    storeId: '123'
  },
  {
    id: '4',
    name: 'Sandwich Platters',
    description: 'Assorted sandwich platters from catering',
    expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (expired)
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    isClaimed: false,
    claimCode: null,
    storeId: '123'
  },
  {
    id: '5',
    name: 'Salad Mix',
    description: 'Fresh garden salad mix',
    expirationDate: new Date(Date.now() + 36 * 60 * 60 * 1000), // 1.5 days from now
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isClaimed: true,
    claimCode: 'XYZ789',
    storeId: '123',
    pickedUp: true
  }
];

const mockStore = {
  id: '123',
  name: 'Good Food Restaurant',
  latitude: 37.7749,
  longitude: -122.4194,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  donorId: 'user123'
};

const DonorStoreListingPage = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [allFoodItems, setAllFoodItems] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New food item form
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 16) // Default to 24 hours from now, format for datetime-local input
  });
  
  // QR Code dialog
  const [qrDialog, setQrDialog] = useState({
    open: false,
    itemId: null,
    claimCode: null
  });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Filter food items based on tab
  const getFilteredItems = () => {
    const now = new Date();
    
    if (tabValue === 0) {
      // Active (not claimed, not expired)
      return allFoodItems.filter(item => 
        !item.isClaimed && isDateInFuture(item.expirationDate)
      );
    } else if (tabValue === 1) {
      // Claimed but not picked up
      return allFoodItems.filter(item => 
        item.isClaimed && 
        item.claimCode && 
        !item.pickedUp && 
        isDateInFuture(item.expirationDate)
      );
    } else {
      // Expired or claimed and picked up
      return allFoodItems.filter(item => 
        !isDateInFuture(item.expirationDate) || 
        (item.isClaimed && item.pickedUp)
      );
    }
  };

  useEffect(() => {
    // Fetch donor store and food items
    const fetchData = async () => {
      try {
        // In a real implementation, you would use your API client like:
        // const storeData = await api.donorStoreList();
        // setStore(storeData);
        
        // Mock data for demonstration
        setStore(mockStore);
        setAllFoodItems(mockFoodItems);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [storeId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: value
    });
  };

  const handleAddFoodItem = async () => {
    // Validate form
    if (!newItem.name || !newItem.expirationDate) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    try {
      // In a real implementation, you would use your API client like:
      // const data = {
      //   ...newItem,
      //   storeId: store.id,
      //   createdAt: new Date()
      // };
      // const result = await api.donorFoodCreate(data);
      
      // Mock adding the item
      const newItemWithId = {
        ...newItem,
        id: Date.now().toString(),
        storeId: store.id,
        createdAt: new Date(),
        isClaimed: false,
        claimCode: null,
        expirationDate: new Date(newItem.expirationDate) // Convert string to Date object
      };
      
      setAllFoodItems([newItemWithId, ...allFoodItems]);
      setNewItem({
        name: '',
        description: '',
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 16)
      });
      
      setSnackbar({
        open: true,
        message: 'Food item added successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to add food item',
        severity: 'error'
      });
      console.error(err);
    }
  };

  const handleDeleteFoodItem = (id) => {
    // In a real implementation, you would call your API
    // For now, just filter out the item
    setAllFoodItems(allFoodItems.filter(item => item.id !== id));
    
    setSnackbar({
      open: true,
      message: 'Food item removed',
      severity: 'success'
    });
  };

  const handleShowQrCode = (id, claimCode) => {
    setQrDialog({
      open: true,
      itemId: id,
      claimCode
    });
  };

  const handleCloseQrDialog = () => {
    setQrDialog({
      ...qrDialog,
      open: false
    });
  };

  const handleMarkAsPickedUp = (id) => {
    // In a real implementation, you would call your API
    setAllFoodItems(allFoodItems.map(item => 
      item.id === id ? { ...item, pickedUp: true } : item
    ));
    
    setSnackbar({
      open: true,
      message: 'Item marked as picked up',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  const getTabLabel = (index) => {
    const now = new Date();
    
    if (index === 0) {
      // Count active items
      const count = allFoodItems.filter(item => 
        !item.isClaimed && isDateInFuture(item.expirationDate)
      ).length;
      return `Active (${count})`;
    } else if (index === 1) {
      // Count claimed but not picked up
      const count = allFoodItems.filter(item => 
        item.isClaimed && 
        item.claimCode && 
        !item.pickedUp && 
        isDateInFuture(item.expirationDate)
      ).length;
      return `Pending Pickup (${count})`;
    } else {
      // Count expired or claimed and picked up
      const count = allFoodItems.filter(item => 
        !isDateInFuture(item.expirationDate) || 
        (item.isClaimed && item.pickedUp)
      ).length;
      return `Archive (${count})`;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton 
            color="inherit" 
            edge="start" 
            sx={{ mr: 2 }} 
            onClick={() => navigate('/donor/dashboard')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Store Listing: {store?.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Box sx={{ p: 3, pb: 1, backgroundColor: 'primary.light', color: 'white' }}>
            <Typography variant="h5" gutterBottom>Add New Food Item</Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Food Item Name"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                {/* Using standard HTML input instead of DateTimePicker */}
                <TextField
                  fullWidth
                  label="Expiration Date & Time"
                  name="expirationDate"
                  type="datetime-local"
                  value={newItem.expirationDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', height: '100%' }}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleAddFoodItem}
                    fullWidth
                    sx={{ height: '100%' }}
                  >
                    Add Food Item
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Paper elevation={3}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            indicatorColor="primary" 
            textColor="primary"
            variant="fullWidth"
          >
            <Tab 
              icon={<FastfoodIcon />} 
              label={getTabLabel(0)} 
              iconPosition="start"
            />
            <Tab 
              icon={<AccessTimeIcon />} 
              label={getTabLabel(1)} 
              iconPosition="start"
            />
            <Tab 
              icon={<ArchiveIcon />} 
              label={getTabLabel(2)} 
              iconPosition="start"
            />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {filteredItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" component="div" color="text.secondary">
                  {tabValue === 0 && "No active food items. Add something above!"}
                  {tabValue === 1 && "No items pending pickup."}
                  {tabValue === 2 && "No archived items yet."}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card 
                      elevation={2}
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderLeft: () => {
                          if (tabValue === 0) return '4px solid #4caf50'; // Active
                          if (tabValue === 1) return '4px solid #ff9800'; // Pending pickup
                          return '4px solid #9e9e9e'; // Archive
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {item.name}
                          </Typography>
                          {item.isClaimed && item.pickedUp ? (
                            <Chip 
                              label="Picked Up" 
                              color="default" 
                              size="small"
                            />
                          ) : item.isClaimed ? (
                            <Chip 
                              label="Claimed" 
                              color="secondary" 
                              size="small"
                            />
                          ) : !isDateInFuture(item.expirationDate) ? (
                            <Chip 
                              label="Expired" 
                              color="error" 
                              size="small"
                            />
                          ) : (
                            <Chip 
                              label="Available" 
                              color="primary" 
                              size="small"
                            />
                          )}
                        </Box>
                        
                        <Typography variant="body2" component="div" color="text.secondary" paragraph>
                          {item.description || 'No description provided'}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" component="div">
                            <strong>Expires:</strong> {formatDate(item.expirationDate)}
                          </Typography>
                          <Typography variant="body2" component="div">
                            <strong>Created:</strong> {formatDate(item.createdAt)}
                          </Typography>
                          {item.isClaimed && item.claimCode && (
                            <Typography variant="body2" component="div">
                              <strong>Claim Code:</strong> {item.claimCode}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                      <CardActions>
                        {tabValue === 0 && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => handleDeleteFoodItem(item.id)}
                          >
                            Remove
                          </Button>
                        )}
                        
                        {tabValue === 1 && (
                          <>
                            <Button
                              size="small"
                              color="primary"
                              startIcon={<QrCodeIcon />}
                              onClick={() => handleShowQrCode(item.id, item.claimCode)}
                              sx={{ mr: 1 }}
                            >
                              Show QR
                            </Button>
                            <Button
                              size="small"
                              color="secondary"
                              onClick={() => handleMarkAsPickedUp(item.id)}
                            >
                              Mark Picked Up
                            </Button>
                          </>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Paper>
      </Container>

      {/* QR Code Dialog */}
      <Dialog open={qrDialog.open} onClose={handleCloseQrDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Claim QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {/* In a real implementation, you would generate a QR code here */}
            <Box
              sx={{
                width: 200,
                height: 200,
                margin: '0 auto',
                border: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <QrCodeIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Claim Code: {qrDialog.claimCode}
            </Typography>
            <Typography variant="body2" component="div" color="text.secondary">
              Show this code to verify the recipient's claim
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrDialog}>Close</Button>
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

export default DonorStoreListingPage;