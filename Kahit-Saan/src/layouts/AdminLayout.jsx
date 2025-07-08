// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
    Box, CssBaseline, useTheme, useMediaQuery, Snackbar, Alert
} from '@mui/material';
// Corrected path for AdminSidebar
import AdminSidebar from '../assets/components/admin/AdminSidebar'; 
import { socket } from '../api/socket';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const drawerWidth = 256; // Slightly wider for better spacing with MUI components

  useEffect(() => {
    // Connect the socket when the layout mounts
    socket.connect();

    // Listen for new password reset requests
    socket.on('newPasswordResetRequest', (data) => {
        setNotification({ open: true, message: data.message });
    });

    // Disconnect the socket when the layout unmounts
    return () => {
        socket.disconnect();
        socket.off('newPasswordResetRequest');
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
        setSidebarOpen(false);
    } else {
        setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
    setNotification({ open: false, message: '' });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#121212' }}>
      <CssBaseline />
      <AdminSidebar 
        drawerWidth={drawerWidth} 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#1E1E1E',
          color: '#FFFFFF',
        }}
      >
        {/* The Header would go here if you had one in the main content area */}
        <Outlet /> {/* Page content will be rendered here */}
      </Box>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity="info" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLayout;