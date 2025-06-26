import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import CardMedia from '@mui/material/CardMedia'; // Import CardMedia from MUI
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '@mui/material/styles';

// Lucide Icons
import { 
    ChefHat, 
    LayoutDashboard, 
    Users, 
    UtensilsCrossed,
    Settings, 
    LogOut,
    Home,
    Sun,
    Moon
} from 'lucide-react';

const AdminSidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle, handleThemeToggle, isDarkMode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logoutAdmin } = useAuth();
    const theme = useTheme();

    const handleLogout = () => {
        logoutAdmin();
        navigate('/'); // Changed to redirect to the landing page
    };

const menuItems = [
    { text: 'Menu Management', icon: <UtensilsCrossed size={20} />, path: '/admin/menu' },
    { text: 'User Management', icon: <Users size={20} />, path: '/admin/users' },
    { text: 'Order Management', icon: <ChefHat size={20} />, path: '/admin/orders' }, // Add this line
];

    const drawer = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit', 
                    }}
                    component={RouterLink}
                    to="/"
                >
                    <CardMedia
                        component="img"
                        image={isDarkMode ? "/assets/Images/3x/LogoWhite.webp" : "/assets/Images/3x/LogoWhite.webp"} // Corrected path
                        alt="Kahit Saan Logo"
                        sx={{
                            height: 40, 
                            width: 'auto', 
                            mr: 1 
                        }} 
                    />
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                        Kahit Saan
                    </Typography>
                </Box>
            </Toolbar>
            <Divider />
            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item, index) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton component={RouterLink} to={item.path} selected={location.pathname.startsWith(item.path)}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon><LogOut size={20} /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { 
                    width: drawerWidth, 
                    boxSizing: 'border-box',
                    backgroundColor: 'brand.eerieBlack', 
                    borderRight: 'none', 
                },
            }}
            open 
        >
            {drawer}
        </Drawer>
    );
};

export default AdminSidebar;