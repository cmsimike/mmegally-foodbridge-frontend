import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import pages
import HomePage from './pages/HomePage';
import GoodSamaritanLawPage from './pages/GoodSamaritanLawPage';
import DonorRegistrationPage from './pages/Donor/RegistrationPage';
import DonorLoginPage from './pages/Donor/LoginPage';
import DonorDashboardPage from './pages/Donor/DashboardPage';
import DonorStoreListingPage from './pages/Donor/StoreListingPage';
import FoodSearchPage from './pages/FoodSearchPage';


// Create basic theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Green - representing food/freshness
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff9800', // Orange - warm and inviting
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <div className="content-container">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/donor/login" element={< DonorLoginPage />} />
              <Route path="/donor/register" element={<DonorRegistrationPage />} />
              <Route path="/donor/good-samaritan-law" element={<GoodSamaritanLawPage />} />
              <Route path="/donor/dashboard" element={<DonorDashboardPage />} />
              <Route path="/donor/store/:storeId" element={<DonorStoreListingPage />} />
              <Route path="/browse" element={<FoodSearchPage />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;