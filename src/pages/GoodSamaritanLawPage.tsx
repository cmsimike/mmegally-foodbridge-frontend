import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';

const GoodSamaritanLawPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      {/* Back button */}
      <Box sx={{ mt: 3, mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="text"
        >
          Back to Home
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Good Samaritan Food Donation Law
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Understanding the legal protections for food donors
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            What is the Good Samaritan Law?
          </Typography>
          <Typography paragraph>
            The Bill Emerson Good Samaritan Food Donation Act of 1996 (42 U.S. Code § 1791) is a federal law that provides liability protection for food donations made in good faith.
          </Typography>
          <Typography paragraph>
            This law was designed to encourage the donation of food and grocery products to nonprofit organizations for distribution to individuals in need by protecting donors from civil and criminal liability.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Who is Protected?
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Individuals (backyard gardeners, etc.)" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Restaurants and food service companies" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Retail grocers and food markets" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Farmers and agricultural producers" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Food manufacturers and distributors" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Gleaners (people who collect excess food from fields)" />
            </ListItem>
          </List>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            What Types of Food Can Be Donated?
          </Typography>
          <Typography paragraph>
            The law covers donations of "apparently wholesome food," which is defined as food that meets all quality and labeling standards imposed by federal, state, and local laws and regulations, even if it is not readily marketable due to appearance, age, freshness, grade, size, surplus, or other conditions.
          </Typography>
          <Typography paragraph>
            This includes:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Fresh produce" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Canned and packaged goods" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Prepared foods and leftovers" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Baked goods" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Dairy products" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Meat and fish" />
            </ListItem>
          </List>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Limitations of Protection
          </Typography>
          <Typography paragraph>
            The Good Samaritan Law does not protect donors in cases of gross negligence or intentional misconduct. This means that if you knowingly donate food that could harm someone or are extremely careless in your donation practices, you may still be liable.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              All food donations should be made in good faith and with reasonable care for food safety.
            </Typography>
          </Alert>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="body2">
              <strong>Disclaimer:</strong> This information is provided for general educational purposes only and does not constitute legal advice. For specific questions about your situation, please consult with a qualified attorney. FoodBridge is not a law firm and does not provide legal services.
            </Typography>
          </Box>
        </Alert>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Resources
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Link 
                    href="https://www.fda.gov/food/donating-food-liability-protection-good-samaritan-act" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FDA: Food Donation and Liability Protection
                  </Link>
                } 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Link 
                    href="https://www.usda.gov/foodlossandwaste/donating" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    USDA: Food Donation Resources
                  </Link>
                } 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Link 
                    href="https://www.feedingamerica.org/" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Feeding America
                  </Link>
                } 
              />
            </ListItem>
          </List>
        </Box>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/donor/register')}
            sx={{ minWidth: '200px' }}
          >
            Start Donating
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default GoodSamaritanLawPage;