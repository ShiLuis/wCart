import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Your custom MUI theme
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import './index.css'; // For global styles, Tailwind base/components/utilities if you mix

// Import Google Fonts (ensure these are also in your public/index.html)
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/kaushan-script'; // Ensure Kaushan Script is imported


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* Wrap with AuthProvider */}
        <ThemeProvider theme={theme}>
          <CssBaseline /> {/* Normalizes styles and applies background color */}
          <App />
        </ThemeProvider>
      </AuthProvider> {/* Close AuthProvider */}
    </BrowserRouter>
  </React.StrictMode>
);