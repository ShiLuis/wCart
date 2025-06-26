// src/pages/admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom'; // Added useLocation
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import { setAuthToken as setApiAuthToken } from '../../api/adminApi'; // Import setApiAuthToken
import { useAuth } from '../../context/AuthContext'; // Import useAuth

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Initialize useLocation
  const theme = useTheme(); // Access theme
  const { loginAdmin } = useAuth(); // Get loginAdmin from AuthContext
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiBaseUrl}/api/auth/login`, { 
        username: formData.username, 
        password: formData.password 
      });
      
      // Destructure token and user data from the response
      const { token, ...userDataFromResponse } = response.data;

      setApiAuthToken(token); 
      loginAdmin(userDataFromResponse, token); // Pass the user data and token correctly

      const from = location.state?.from?.pathname || "/admin/menu";
      navigate(from, { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="xs" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        // backgroundColor: 'background.default' // Ensures full page dark background
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          padding: {xs: 3, sm: 4}, // Responsive padding
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          borderRadius: '12px',
          backgroundColor: 'background.paper' // Will be dark paper from theme
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon sx={{color: theme.palette.primary.contrastText}} />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontFamily: 'Montserrat', fontWeight: 'bold', color: 'text.primary' }}>
          Admin Sign In
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2,  bgcolor: 'error.main', color: 'error.contrastText' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            variant="outlined" // Standard MUI text field
            // InputLabelProps and InputProps can be styled further via theme components if needed
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary" // Gold button (Primary from Style Guide)
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.25, // Adjusted padding
              fontFamily: 'Open Sans', 
              fontWeight: 600,
              // Hover handled by theme's MuiButton.styleOverrides.containedPrimary
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/" variant="body2" sx={{fontFamily: 'Open Sans', color: 'primary.main'}}>
                Back to Homepage
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLoginPage;