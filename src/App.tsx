import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import pages
import HomePage from './pages/HomePage';
import GoodSamaritanLawPage from './pages/GoodSamaritanLawPage';


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
              <Route path="/donor/good-samaritan-law" element={<GoodSamaritanLawPage />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;