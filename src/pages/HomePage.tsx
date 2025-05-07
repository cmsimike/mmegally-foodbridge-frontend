import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Grid, 
  Paper, 
  Button,
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Box
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ImageCarousel from './components/ImageCarousel';

const HomePage = () => {
  const navigate = useNavigate();


  const carouselImages = [
    {
      url: '/images/carousel/image1.jpg', // These paths will need to be updated
      caption: 'Bringing Communities Together',
      description: 'Local restaurants providing meals to families in need'
    },
    {
      url: '/images/carousel/image2.jpg',
      caption: 'Volunteers Making a Difference',
      description: 'Our amazing volunteers helping distribute food donations'
    },
    {
      url: '/images/carousel/image3.jpg',
      caption: 'Supporting Families',
      description: 'Fresh produce reaching those who need it most'
    },
    {
      url: '/images/carousel/image4.jpg',
      caption: 'Restaurants Fighting Food Waste',
      description: 'Local businesses donating surplus food at the end of the day'
    }
  ];

  return (
    <div>
      {/* Header */}
      <Box sx={{ textAlign: 'center', my: 5 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          FoodBridge
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Connecting surplus food with people who need it most
        </Typography>
      </Box>

      {/* Image Carousel */}
      <ImageCarousel images={carouselImages} autoPlayInterval={6000} />

      {/* Two columns layout */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        {/* Donor Column */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <RestaurantIcon fontSize="large" sx={{ mr: 2 }} />
              <Typography variant="h4" component="h2">
                Food Donors
              </Typography>
            </Box>
            
            <Typography paragraph>
              Have surplus food? Donate it safely and make a difference in your community.
            </Typography>
            
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2 }}>
              <SecurityIcon sx={{ mr: 1 }} />
              Protected by Good Samaritan Law
            </Typography>
            
            <Typography paragraph>
              Federal law protects food donors from liability when donating food in good faith.
              <Button 
                variant="text" 
                size="small"
                color="primary"
                onClick={() => navigate('/donor/good-samaritan-law')}
                sx={{ ml: 1, textTransform: 'none', fontWeight: 'bold' }}
              >
                Learn more
              </Button>
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Protection for individuals, restaurants, grocers, and farmers" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Safety from civil and criminal liability" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Simple process to donate surplus food" />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 'auto' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    fullWidth
                    onClick={() => navigate('/donor/register')}
                    sx={{ textTransform: 'uppercase' }}
                  >
                    Start Donating
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/donor/login')}
                    sx={{ textTransform: 'uppercase' }}
                  >
                    Already Registered
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recipient Column */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ShoppingBasketIcon fontSize="large" sx={{ mr: 2 }} />
              <Typography variant="h4" component="h2">
                Food Recipients
              </Typography>
            </Box>
            
            <Typography paragraph>
              Find available food near you - no registration required.
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Browse available food donations anonymously" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Find food near your location" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Simple claim and pickup process" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="No registration or personal information required" />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 'auto' }}>
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                onClick={() => navigate('/browse')}
                sx={{ textTransform: 'uppercase' }}
              >
                Find Food Near Me
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Footer */}
      <Box sx={{ textAlign: 'center', my: 5 }}>
        <Typography variant="h5" gutterBottom>
          Together we can reduce food waste and fight hunger
        </Typography>
        <Typography color="text.secondary">
          Over 40% of food in America is wasted while millions face food insecurity
        </Typography>
      </Box>
    </div>
  );
};

export default HomePage;