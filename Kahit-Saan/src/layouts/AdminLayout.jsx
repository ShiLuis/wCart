// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
// Corrected path for AdminSidebar
import AdminSidebar from '../assets/components/admin/AdminSidebar'; 

const AdminLayout = () => {
  const drawerWidth = 256; // Slightly wider for better spacing with MUI components

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 }, // Responsive padding
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default', // This will be Eerie Black from your dark theme
          color: 'text.primary' // This will be Custom White from your dark theme
        }}
      >
        {/* You might add a Toolbar here if you ever introduce a top AppBar in the admin section */}
        {/* <Toolbar /> */}
        <Outlet /> {/* Admin page content renders here */}
      </Box>
    </Box>
  );
};

export default AdminLayout;