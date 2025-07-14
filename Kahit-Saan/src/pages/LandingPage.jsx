import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
    MapPin, Phone, Mail, Facebook, Instagram, Twitter, ChefHat,
    UtensilsCrossed, ScrollText, Menu as MenuIconLucide, X as CloseIconLucide
} from 'lucide-react';
import {
    AppBar, Toolbar, Typography, Button, IconButton, Container, Box, Grid,
    Card, CardMedia,
    CircularProgress, Alert, Link as MuiLink, Drawer,
    List, ListItem, ListItemButton, ListItemText, Paper,
    useTheme, useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Search } from 'lucide-react';
import { socket, joinOrderRoom, leaveOrderRoom } from '../api/socket';
// import './LandingPage.css'; // Keep for any global styles or truly custom CSS if needed

const LandingPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [checkoutInfo, setCheckoutInfo] = useState({ name: '', phone: '', email: '' });
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [checkoutSuccess, setCheckoutSuccess] = useState('');
    const [showOrderPlaced, setShowOrderPlaced] = useState(false);
    const [isBankDetailsModalOpen, setIsBankDetailsModalOpen] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [bankDetails, setBankDetails] = useState({ accountNumber: '', accountName: '', bankName: '' });
    const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
    const [bankDetailsError, setBankDetailsError] = useState('');
    const [accountLookupLoading, setAccountLookupLoading] = useState(false);
    const [accountLookupError, setAccountLookupError] = useState('');
    const [orderSuccessData, setOrderSuccessData] = useState(null);
    const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    
    // Real-time notification states
    const [notifications, setNotifications] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [currentNotification, setCurrentNotification] = useState(null);

    useEffect(() => {
        const fetchPublicMenuItems = async () => {
            setLoading(true);
            setError(null);
            try {
                // Ensure your server exposes GET /api/menu for public access
                const baseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`; // Use dynamic hostname
                const response = await axios.get(`${baseUrl}/api/menu`);
                setMenuItems(response.data);
            } catch (err) {
                console.error("Error fetching public menu items:", err);
                setError(err.response?.data?.message || err.message || 'Failed to load menu items. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPublicMenuItems();
    }, []); // Empty dependency array ensures this runs once on mount

    // Socket connection for real-time notifications
    useEffect(() => {
        // Connect socket when component mounts
        socket.connect();
        
        // Request notification permission for browser notifications
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Listen for order updates
        socket.on('order-update', (data) => {
            console.log('Order update received:', data);
            setCurrentNotification({
                message: data.message,
                severity: data.status === 'completed' ? 'success' : 
                         data.status === 'cancelled' ? 'error' : 'info'
            });
            setShowNotification(true);
            
            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Kahit Saan - Order Update', {
                    body: data.message,
                    icon: '/assets/Images/3x/LogoBlack.webp',
                    tag: 'order-update'
                });
            }
            
            // Add to notifications list
            setNotifications(prev => [...prev, data]);
        });
        
        // Cleanup on unmount
        return () => {
            socket.off('order-update');
            socket.disconnect();
        };
    }, []);

    // Join order room when an order is placed
    useEffect(() => {
        if (currentOrderId) {
            joinOrderRoom(currentOrderId);
            console.log('Joined order room for notifications:', currentOrderId);
        }
    }, [currentOrderId]);

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            const appBarHeight = isMobile ? 64 : 80; // Approximate AppBar height
            const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - appBarHeight;
            window.scrollTo({ top: sectionTop, behavior: 'smooth' });
        }
    };

    const LogoAndBrandName = () => (
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
                image={theme.palette.mode === 'dark'
                    ? '/assets/Images/3x/LogoWhite.webp' // Updated path
                    : '/assets/Images/3x/LogoBlack.webp'} // Updated path
                alt="Kahit Saan Logo"
                sx={{
                    height: { xs: 48, md: 56 }, // Increased logo size
                    width: 'auto',
                    mr: { xs: 1, md: 1.5 },
                    filter: theme.palette.mode === 'dark' ? 'invert(0)' : 'invert(0)',
                }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.2 }}>
                <Typography
                    variant="caption"
                    sx={{
                        fontFamily: 'Open Sans, sans-serif',
                        color: '#fff',
                        letterSpacing: '0.03em',
                        fontWeight: 400,
                        fontSize: { xs: '0.7rem', md: '0.8rem' },
                        ml: 0.3,
                        mb: '-2px',
                        lineHeight: 1.1,
                    }}
                >
                    Saan tayo kakain?
                </Typography>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontFamily: 'montserrat',
                        fontWeight: 900,
                        fontSize: { xs: '1.5rem', md: '1.75rem' },
                        flexGrow: 0,
                        color: '#fff',
                        letterSpacing: '0.04em',
                        textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                        lineHeight: 1.1,
                        mt: 0,
                    }}
                >
                    KAHIT SAAN
                </Typography>

            </Box>
        </Box>
    );

    const mobileMenuDrawer = (
        <Drawer
            anchor="right"
            open={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            PaperProps={{sx: {
                width: '260px', 
            }}}
        >
            <Box sx={{ width: 260, p:2, display: 'flex', flexDirection: 'column', height: '100%' }} role="presentation">
                <Box sx={{display: 'flex', justifyContent: 'flex-end', mb:1}}>
                    <IconButton onClick={() => setIsMobileMenuOpen(false)} sx={{color: theme.palette.text.secondary}}>
                        <CloseIconLucide />
                    </IconButton>
                </Box>
                <List>
                    {[{id:'hero', label:'Home'}, {id:'menu', label:'Menu'}, {id:'about', label:'About'}, {id:'location', label:'Location'}, {id:'contact', label:'Contact'}].map((item) => (
                        <ListItem key={item.id} disablePadding>
                            <ListItemButton onClick={() => {scrollToSection(item.id); setIsMobileMenuOpen(false);}}>
                                <ListItemText 
                                    primary={item.label.toUpperCase()}
                                    primaryTypographyProps={{ sx: { ...theme.typography.button, color: theme.palette.text.primary, textAlign: 'center'} }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                {/* AdminLoginMuiButton removed from mobile drawer main area */}
                {/* <Box sx={{mt: 'auto', pb:1}}> <AdminLoginMuiButton isMobileView={true} /> </Box> */}
            </Box>
        </Drawer>
    );

    const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d298.5801931748438!2d121.15347942067646!3d16.485069986708492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33904416a52df861%3A0x64d0c96af3c988ef!2s44-40%20Jaena%20St%2C%20Bayombong%2C%20Nueva%20Vizcaya!5e1!3m2!1sen!2sph!4v1748581630930!5m2!1sen!2sph"; // Example URL, replace

    // Add to cart handler
    const handleAddToCart = (item) => {
        setCart((prev) => {
            const found = prev.find((i) => i._id === item._id);
            if (found) {
                return prev.map((i) =>
                    i._id === item._id ? { ...i, qty: i.qty + 1 } : i
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    // Remove from cart handler
    const handleRemoveFromCart = (itemId) => {
        setCart((prev) => prev.filter((i) => i._id !== itemId));
    };

    // Update quantity handler
    const handleUpdateQty = (itemId, qty) => {
        setCart((prev) =>
            prev.map((i) =>
                i._id === itemId ? { ...i, qty: Math.max(1, qty) } : i
            )
        );
    };

    // Clear cart
    const handleClearCart = () => setCart([]);

    // Cart total
    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Checkout submit handler
    const handleCheckout = async (e) => {
        e.preventDefault();
        setCheckoutLoading(true);
        setCheckoutError('');
        setCheckoutSuccess('');
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
            const response = await axios.post(`${baseUrl}/api/orders`, {
                items: cart.map(({ _id, name, price, qty }) => ({ _id, name, price, qty })),
                contact: checkoutInfo,
            });
            setCheckoutSuccess('Order placed successfully! Please enter your bank details.');
            setCart([]);
            setCheckoutInfo({ name: '', phone: '', email: '' });
            setCurrentOrderId(response.data._id); // Save the order ID
            setIsBankDetailsModalOpen(true); // Open the bank details modal
            setIsCartOpen(false); // Close the cart drawer
        } catch (err) {
            setCheckoutError(err.response?.data?.message || err.message || 'Failed to place order.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleBankDetailsSubmit = async (e) => {
        e.preventDefault();
        setBankDetailsLoading(true);
        setBankDetailsError('');
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
            
            console.log('Submitting bank details for payment processing...');
            console.log('Order ID:', currentOrderId);
            console.log('Bank details:', bankDetails);
            
            const response = await axios.put(`${baseUrl}/api/orders/${currentOrderId}/bankdetails`, {
                bankDetails,
            });
            
            console.log('Bank details submission response:', response.data);
            
            // Check if payment was successful
            if (response.data.isPaid) {
                setIsBankDetailsModalOpen(false);
                setOrderSuccessData(response.data); // Store the successful order data
                setIsOrderSuccessModalOpen(true); // Open the success modal
                setBankDetails({ accountNumber: '', accountName: '', bankName: '' }); // Reset form
            } else {
                // Payment failed, show error
                setBankDetailsError(
                    response.data.paymentError || 
                    'Payment processing failed. Please check your account details and try again.'
                );
            }
        } catch (err) {
            console.error('Bank details submission error:', err);
            setBankDetailsError(
                err.response?.data?.message || 
                err.response?.data?.paymentError ||
                'Failed to process payment. Please try again.'
            );
        } finally {
            setBankDetailsLoading(false);
        }
    };

    const handleTrackOrder = async (e) => {
        e.preventDefault();
        setTrackingLoading(true);
        setTrackingError('');
        setTrackingResult(null);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;
            const response = await axios.get(`${baseUrl}/api/orders/track/${trackingNumber}`);
            setTrackingResult(response.data);
            setIsTrackingModalOpen(true);
        } catch (err) {
            setTrackingError(err.response?.data?.message || 'Failed to track order.');
            setIsTrackingModalOpen(true);
        } finally {
            setTrackingLoading(false);
        }
    };

    // Bank account lookup function
    const lookupBankAccount = async (accountNumber) => {
        if (!accountNumber || accountNumber.length < 8) {
            setBankDetails(prev => ({ ...prev, accountName: '' }));
            setAccountLookupError('');
            return;
        }

        setAccountLookupLoading(true);
        setAccountLookupError('');
        
        try {
            console.log('Looking up account:', accountNumber);
            console.log('API URL:', 'http://192.168.8.201:5000/api/users');
            
            // First, check if the bank API is online
            await axios.get('http://192.168.8.201:5000/api/health');
            
            // Get all users/accounts from the bank API
            const response = await axios.get('http://192.168.8.201:5000/api/users');
            console.log('Bank API response:', response.data);
            
            // Find the account with matching account number
            const users = Array.isArray(response.data) ? response.data : [];
            const foundUser = users.find(user => 
                user.accountNumber === accountNumber || 
                user.account_number === accountNumber ||
                user.id === accountNumber
            );
            
            if (foundUser) {
                setBankDetails(prev => ({ 
                    ...prev, 
                    accountName: foundUser.name || foundUser.accountName || foundUser.account_name,
                    bankName: foundUser.bankName || foundUser.bank_name || 'BPI Bank'
                }));
                setAccountLookupError('');
                console.log('Account found:', foundUser);
            } else {
                setAccountLookupError('Account not found in BPI system');
                setBankDetails(prev => ({ ...prev, accountName: '' }));
                console.log('Available accounts:', users.map(u => ({
                    id: u.id,
                    accountNumber: u.accountNumber || u.account_number,
                    name: u.name || u.accountName
                })));
            }
        } catch (err) {
            console.error('Bank API lookup error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            
            if (err.response?.status === 404) {
                setAccountLookupError('Bank API not available. Please enter account details manually.');
            } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
                setAccountLookupError('Cannot connect to bank server. Please check if the bank system is running.');
            } else {
                setAccountLookupError('Unable to verify account. Please enter manually.');
            }
            setBankDetails(prev => ({ ...prev, accountName: '' }));
        } finally {
            setAccountLookupLoading(false);
        }
    };

    // Debug function to test bank API connection
    const testBankConnection = async () => {
        try {
            console.log('Testing bank API connection...');
            const healthResponse = await axios.get('http://192.168.8.201:5000/api/health');
            console.log('Health check:', healthResponse.data);
            
            const usersResponse = await axios.get('http://192.168.8.201:5000/api/users');
            console.log('Available users:', usersResponse.data);
            
            alert('Bank API is working! Check console for available accounts.');
        } catch (err) {
            console.error('Bank API connection failed:', err);
            alert('Bank API connection failed. Check console for details.');
        }
    };

    // Handle account number change with debounced lookup
    const handleAccountNumberChange = (value) => {
        setBankDetails(prev => ({ ...prev, accountNumber: value }));
        
        // Clear previous timeout
        if (window.accountLookupTimeout) {
            clearTimeout(window.accountLookupTimeout);
        }
        
        // Set new timeout for lookup (debounced)
        window.accountLookupTimeout = setTimeout(() => {
            lookupBankAccount(value);
        }, 1000); // Wait 1 second after user stops typing
    };

    // Handle bank details modal close
    const handleBankDetailsModalClose = () => {
        setIsBankDetailsModalOpen(false);
        // Clear any pending lookup timeout
        if (window.accountLookupTimeout) {
            clearTimeout(window.accountLookupTimeout);
        }
        // Reset form and errors
        setBankDetails({ accountNumber: '', accountName: '', bankName: '' });
        setBankDetailsError('');
        setAccountLookupError('');
    };

    // Cart Drawer UI (improved)
    const cartDrawer = (
        <Drawer anchor="right" open={isCartOpen} onClose={() => setIsCartOpen(false)}>
            <Box sx={{ width: { xs: 380, sm: 400 }, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Your Cart</Typography>
                    <IconButton onClick={() => setIsCartOpen(false)}><CloseIconLucide /></IconButton>
                </Box>
                {cart.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary', mt: 2, textAlign: 'center' }}>Your cart is empty.</Typography>
                ) : (
                    <>
                        <List sx={{ flex: 1, overflowY: 'auto', mb: 1 }}>
                            {cart.map((item) => (
                                <ListItem key={item._id || item.name} sx={{ alignItems: 'flex-start', px: 0 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontWeight="bold" sx={{ fontSize: '1rem' }}>{item.name}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                ₱{item.price.toFixed(2)}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                sx={{ mx: 0.5 }}
                                                onClick={() => handleUpdateQty(item._id, item.qty - 1)}
                                                disabled={item.qty <= 1}
                                            >-</IconButton>
                                            <TextField
                                                // type="number"
                                                size="small"
                                                value={item.qty}
                                                onChange={(e) => handleUpdateQty(item._id, parseInt(e.target.value) || 1)}
                                                // inputProps={{ min: 1, style: { width: 36, textAlign: 'center' } }}
                                                sx={{ mx: 0.5, width: 55, textAlign: 'center' }}
                                            />
                                            <IconButton
                                                size="small"
                                                sx={{ mx: 0.5 }}
                                                onClick={() => handleUpdateQty(item._id, item.qty + 1)}
                                            >+</IconButton>
                                            <Typography variant="body2" sx={{ ml: 1 }}>
                                                = ₱{(item.price * item.qty).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton onClick={() => handleRemoveFromCart(item._id)} size="small" color="error">
                                        <CloseIconLucide size={18} />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total: ₱{cartTotal.toFixed(2)}</Typography>
                            <Button color="secondary" size="small" onClick={handleClearCart}>Clear Cart</Button>
                        </Box>
                        <Box component="form" onSubmit={handleCheckout} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography fontWeight="bold" sx={{ mb: 1 }}>Contact Information</Typography>
                            <TextField
                                label="Name"
                                value={checkoutInfo.name}
                                onChange={(e) => setCheckoutInfo({ ...checkoutInfo, name: e.target.value })}
                                required
                                size="small"
                            />
                            <TextField
                                label="Phone"
                                value={checkoutInfo.phone}
                                onChange={(e) => setCheckoutInfo({ ...checkoutInfo, phone: e.target.value })}
                                required
                                size="small"
                            />
                            <TextField
                                label="Email"
                                type="email"
                                value={checkoutInfo.email}
                                onChange={(e) => setCheckoutInfo({ ...checkoutInfo, email: e.target.value })}
                                required
                                size="small"
                            />
                            {checkoutError && <Alert severity="error" sx={{ mt: 1 }}>{checkoutError}</Alert>}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={checkoutLoading}
                                sx={{ mt: 1 }}
                                fullWidth
                            >
                                {checkoutLoading ? <CircularProgress size={22} /> : 'Place Order'}
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Drawer>
    );

    // Snackbar for order placed
    const orderPlacedSnackbar = (
        <Snackbar
            open={showOrderPlaced}
            autoHideDuration={2000}
            onClose={() => setShowOrderPlaced(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <MuiAlert elevation={6} variant="filled" severity="success" sx={{ width: '100%' }}>
                Order placed! The admin will manage your order.
            </MuiAlert>
        </Snackbar>
    );

    // Real-time notification snackbar
    const notificationSnackbar = (
        <Snackbar
            open={showNotification}
            autoHideDuration={6000}
            onClose={() => setShowNotification(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <MuiAlert 
                elevation={6} 
                variant="filled" 
                severity={currentNotification?.severity || 'info'} 
                sx={{ width: '100%' }}
                onClose={() => setShowNotification(false)}
            >
                {currentNotification?.message}
            </MuiAlert>
        </Snackbar>
    );

    // Modal for showing success and order number
    const orderSuccessModal = (
        <Dialog open={isOrderSuccessModalOpen} onClose={() => setIsOrderSuccessModalOpen(false)}>
            <DialogTitle>
                {orderSuccessData?.isPaid ? 'Payment Successful!' : 'Order Placed!'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {orderSuccessData?.isPaid 
                        ? 'Your payment has been processed successfully. Your daily order number is:'
                        : 'Your order has been placed. Your daily order number is:'
                    }
                </DialogContentText>
                <Typography variant="h4" component="p" sx={{ textAlign: 'center', my: 2, fontWeight: 'bold' }}>
                    {orderSuccessData?.dailyOrderNumber}
                </Typography>
                <DialogContentText>
                    {orderSuccessData?.isPaid 
                        ? 'Your order is now being prepared. You will receive notifications about the status.'
                        : 'Please complete the payment process. You can track your order using the number above.'
                    }
                </DialogContentText>
                {orderSuccessData?.transactionId && (
                    <DialogContentText sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                        Transaction ID: {orderSuccessData.transactionId}
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsOrderSuccessModalOpen(false)}>OK</Button>
            </DialogActions>
        </Dialog>
    );

    // Bank Details Modal
    const bankDetailsModal = (
        <Dialog open={isBankDetailsModalOpen} onClose={handleBankDetailsModalClose}>
            <DialogTitle>Enter Bank Details for Payment</DialogTitle>
            <Box component="form" onSubmit={handleBankDetailsSubmit}>
                <DialogContent>
                    <DialogContentText>
                        Please provide your bank details. ₱{cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)} will be deducted from your account.
                    </DialogContentText>
                    <TextField
                        margin="dense"
                        id="accountNumber"
                        label="Account Number"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={bankDetails.accountNumber}
                        onChange={(e) => handleAccountNumberChange(e.target.value)}
                        required
                        disabled={bankDetailsLoading}
                        InputProps={{
                            endAdornment: accountLookupLoading && (
                                <CircularProgress size={20} sx={{ ml: 1 }} />
                            ),
                        }}
                        helperText={accountLookupError || "Enter your account number to auto-fill account name"}
                        error={!!accountLookupError}
                    />
                    <TextField
                        margin="dense"
                        id="accountName"
                        label="Account Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={bankDetails.accountName}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                        required
                        disabled={bankDetailsLoading}
                        InputProps={{
                            readOnly: !!bankDetails.accountName && !accountLookupError,
                        }}
                        helperText={bankDetails.accountName && !accountLookupError ? "Auto-filled from bank records" : ""}
                    />
                    <TextField
                        margin="dense"
                        id="bankName"
                        label="Bank Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                        required
                        disabled={bankDetailsLoading}
                    />
                    
                    {/* Temporary debug button - remove after testing */}
                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={testBankConnection}
                        sx={{ mt: 2, mb: 1 }}
                        fullWidth
                        disabled={bankDetailsLoading}
                    >
                        Test Bank API Connection
                    </Button>
                    
                    {bankDetailsLoading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Processing payment...
                            </Typography>
                        </Box>
                    )}
                    
                    {bankDetailsError && <Alert severity="error" sx={{ mt: 2 }}>{bankDetailsError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleBankDetailsModalClose} disabled={bankDetailsLoading}>Cancel</Button>
                    <Button type="submit" disabled={bankDetailsLoading || accountLookupLoading || !bankDetails.accountNumber || !bankDetails.accountName}>
                        {bankDetailsLoading ? <CircularProgress size={24} /> : 'Process Payment'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );

    const trackingModal = (
        <Dialog open={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)}>
            <DialogTitle>{trackingError ? 'Error' : 'Order Status'}</DialogTitle>
            <DialogContent>
                {trackingLoading ? (
                    <CircularProgress />
                ) : trackingError ? (
                    <Alert severity="error">{trackingError}</Alert>
                ) : (
                    <DialogContentText>
                        Your order (No. {trackingResult?.dailyOrderNumber}) is currently: <strong>{trackingResult?.orderStatus}</strong>
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsTrackingModalOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    );

    return (
        // Base background and text color from theme
        <Box sx={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary, minHeight: '100vh' }}> 
            
            {/* AppBar uses theme overrides for MuiAppBar */}
            <AppBar position="fixed" component="header" elevation={0} sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}` 
            }}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ height: {xs: 64, md: 80} }}>
                        <LogoAndBrandName />
                        <Box sx={{ flexGrow: 1 }} />
                       
                        {isMobile ? (
                            <IconButton size="large" edge="end" sx={{color: theme.palette.text.primary}} aria-label="open drawer" onClick={() => setIsMobileMenuOpen(true)}>
                                <MenuIconLucide />
                            </IconButton>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button variant="text" onClick={() => scrollToSection('menu')}>MENU</Button>
                                <Button variant="text" onClick={() => scrollToSection('about')}>ABOUT</Button>
                                <Button variant="text" onClick={() => scrollToSection('location')}>LOCATION</Button>
                                <Button variant="text" onClick={() => scrollToSection('contact')}>CONTACT</Button>
                                <Button variant="text" onClick={() => scrollToSection('track-order')}>TRACK ORDER</Button>
                            </Box>
                        )}
                         {/* Cart Icon */}
                        <IconButton
                            color="inherit"
                            onClick={() => setIsCartOpen(true)}
                            sx={{ mr: isMobile ? 0 : 2 }}
                            aria-label="cart"
                        >
                            <Badge badgeContent={cart.reduce((sum, i) => sum + i.qty, 0)} color="primary">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                    </Toolbar>
                </Container>
            </AppBar>
            {mobileMenuDrawer}
            {cartDrawer}
            {orderPlacedSnackbar}
            {notificationSnackbar}
            {bankDetailsModal}
            {orderSuccessModal}
            {trackingModal}

            {/* Hero Section */}
            <Box id="hero" component="section" sx={{
                minHeight: '100vh', // Full viewport height
                backgroundImage: "url('/assets/Images/Hero_Image.jpg')", // Updated to use your local image
                backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center',
                justifyContent: 'center', position: 'relative',
                // Adjust padding top to account for AppBar height dynamically
                pt: (currentTheme) => `${isMobile ? currentTheme.mixins.toolbar.minHeight + currentTheme.spacing(1) : (currentTheme.mixins.toolbar[currentTheme.breakpoints.up('md')]?.minHeight || 80) + currentTheme.spacing(2)}px`,
                pb: theme.spacing(4) // Ensure some padding at the bottom too
            }}>
                {/* Overlay uses theme's background color with alpha */}
                <Box sx={{ position: 'absolute', inset: 0, backgroundColor: alpha(theme.palette.background.default, 0.8) }} />
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', py: 6 }}> 

                    <Box sx={{ display: 'inline-block', textAlign: 'left', mt: 1 }}> 
                        {/* The inner Box with display:flex was removed */}
                        <Typography
                            variant="caption" // Or consider h6/subtitle1 if more appropriate semantically
                            sx={{
                                fontFamily: 'Open Sans, sans-serif',
                                color: '#fff',
                                letterSpacing: '0.03em',
                                fontWeight: 400,
                                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }, 
                                // ml: 0.3, // Removed for cleaner left alignment within this block
                                mb: 0.5, 
                                lineHeight: 1.1,
                                display: 'block', // Ensures proper block behavior for margins
                            }}
                        >
                            Saan tayo kakain?
                        </Typography>
                        <Typography
                            variant="h6" // Keeping variant, but significantly overriding size
                            component="div"
                            sx={{
                                fontFamily: 'montserrat',
                                fontWeight: 900,
                                fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }, 
                                color: '#fff',
                                letterSpacing: '0.04em',
                                textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                                lineHeight: 1.1,
                                mt: 0, 
                            }}
                        >
                            KAHIT SAAN
                        </Typography>
                    </Box>
                    {/* Wrapper Box to ensure the Button element is centered */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}> {/* mt is now on this wrapper */}
                        <Button 
                            variant="contained" color="primary"
                            size="large" 
                            onClick={() => scrollToSection('menu')} 
                            sx={{ 
                                // mt: 3, // Margin top moved to the wrapper Box above
                                py: 1.5, px: 5, 
                                fontFamily: 'Montserrat',
                                fontWeight: 'bold', 
                                fontSize: {xs: '0.9rem', md: '1.1rem'} 
                            }}
                        > View Our Menu </Button>
                    </Box>
                </Container>
            </Box>

            <main>
                <Box id="menu" component="section" sx={{ py: { xs: 6, md: 10 } }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
                            <ScrollText style={{ margin: '0 auto 16px auto', height: 48, width: 48, color: theme.palette.primary.main }} />
                            <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold' /* color: theme.palette.text.primary - from theme */ }}> Our Delicious Menu </Typography>
                        </Box>
                        {loading && ( <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}> <CircularProgress color="primary" /> </Box> )}
                        {error && ( <Alert severity="error" sx={{ my: 2, backgroundColor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}> {error} </Alert> )}
                        {!loading && !error && menuItems.length > 0 && (
                            <Grid container spacing={5} justifyContent="center">
                                {menuItems.map((item) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={item._id || item.name}
                                        sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            textAlign: 'center', 
                                            mb: 2,
                                            width: '280px' // Added fixed width
                                        }}>
                                        <Box sx={{
                                            width: '166px', height: '166px', borderRadius: '50%',
                                            border: `5px solid ${theme.palette.primary.main}`,
                                            boxSizing: 'border-box', display: 'flex', justifyContent: 'center',
                                            alignItems: 'center', padding: '3px',
                                            backgroundColor: theme.palette.background.paper, // Or default for slight contrast
                                        }}>
                                            <CardMedia
                                                component="img"
                                                image={item.photo?.url || `https://placehold.co/150x150/${theme.palette.background.paper.substring(1)}/${theme.palette.primary.main.substring(1)}?text=${encodeURIComponent(item.name)}`}
                                                alt={item.name}
                                                onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/150x150/${theme.palette.background.paper.substring(1)}/${theme.palette.primary.main.substring(1)}?text=Error`; }}
                                                sx={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}/>
                                        </Box>
                                        <Typography variant="h3" component="h3" sx={{ 
                                            color: theme.palette.primary.main, // h3 in theme is white, this is specific gold
                                            // fontWeight: 700, // theme.typography.h3 is 600 or 700 based on comment
                                            mt: 2.5, mb: 0.5, 
                                            // fontSize: '1.5rem', // from theme.typography.h3
                                            fontFamily: 'Montserrat, sans-serif' // from theme.typography.h3
                                        }}>
                                            {item.name}
                                        </Typography>
                                        <Typography variant="body1" sx={{ 
                                            // color: theme.palette.text.primary, // from theme
                                            mb: 1.5, minHeight: { xs: '3.2em', md:'3.2em' }, 
                                            lineHeight: '1.6em', overflow: 'hidden', textOverflow: 'ellipsis', 
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                                            px: 1, maxWidth: '280px', 
                                            // fontSize: '1rem', // from theme.typography.body1
                                            // fontFamily: '"Open Sans", sans-serif' // from theme.typography.body1
                                        }}>
                                            {item.description}
                                        </Typography>
                                        <Typography sx={{ typography: 'priceText' /* color: theme.palette.primary.main - handled by priceText variant */ }}>
                                            ₱{typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            sx={{ mt: 1.5, width: '100%' }}
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            Add to Cart
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                         {!loading && !error && menuItems.length === 0 && (
                            <Typography variant="body1" sx={{ textAlign: 'center', color: theme.palette.text.secondary, my: 5 }}>
                                Our menu is currently empty. Please check back later!
                            </Typography>
                        )}
                    </Container>
                </Box>

                <Box id="track-order" component="section" sx={{ py: { xs: 6, md: 10 }, backgroundColor: theme.palette.background.paper }}>
                    <Container maxWidth="sm">
                        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
                            <Search style={{ margin: '0 auto 16px auto', height: 48, width: 48, color: theme.palette.primary.main }} />
                            <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold' }}>Track Your Order</Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2, maxWidth: '600px', mx: 'auto' }}>
                                Enter the order number you received to check the status of your order.
                            </Typography>
                        </Box>
                        <Box component="form" onSubmit={handleTrackOrder} sx={{ display: 'flex', gap: 2, maxWidth: '400px', mx: 'auto' }}>
                            <TextField
                                fullWidth
                                label="Your Order Number"
                                variant="outlined"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                required
                            />
                            <Button type="submit" variant="contained" color="primary" disabled={trackingLoading} sx={{ py: 1.5, px: 4 }}>
                                {trackingLoading ? <CircularProgress size={24} /> : 'Track'}
                            </Button>
                        </Box>
                    </Container>
                </Box>

                <Box id="about" component="section" sx={{ py: { xs: 6, md: 10 } /* bg color from parent */ }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
                            <ChefHat style={{ margin: '0 auto 16px auto', height: 48, width: 48, color: theme.palette.primary.main }} />
                            <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold', mt: 1 /* color from theme */ }}>
                                About Kahit Saan
                            </Typography>
                        </Box> 
                        <Container maxWidth="md">
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    mb: 3,
                                    fontSize: { xs: '1rem', md: '1.3rem' },
                                    lineHeight: 1.8,
                                }}
                            >
                                “Saan tayo kakain?”<br />
                                “Kahit saan.”
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    textAlign: 'center',
                                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                                    lineHeight: 1.8,

                                }}
                            >
                                We’ve all heard it—and that’s exactly why this place exists.<br /><br />
                                Kahit Saan was born from the classic barkada struggle:<br />
                                no one can decide where to eat,<br />
                                so you go somewhere that has everything you’re craving—good food, good prices, good vibes.<br /><br />
                                Located near SMU Gate 2,<br />
                                we serve budget-friendly comfort food like chao fan combos, ramen, and laksa<br />
                                that hit the spot after class, during tambay hours, or in the middle of thesis breakdowns.<br /><br />
                                Whether you’re hungry-hungry or just here for the company,<br />
                                Kahit Saan is your default, go-to, “Kahit saan” resto.<br />
                                Because when no one can decide where to eat,<br />
                                we’ll always be the answer.
                            </Typography>
                        </Container>
                    </Container>
                </Box>

                <Box id="location" component="section" sx={{ py: { xs: 6, md: 10 }, backgroundColor: theme.palette.background.default }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
                            <MapPin style={{ margin: '0 auto 16px auto', height: 48, width: 48, color: theme.palette.primary.main }} />
                            <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                                Find Us & Get In Touch
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 2, maxWidth: '600px', mx: 'auto' }}>
                                We're conveniently located. Come visit or give us a call!
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: theme.spacing(5), 
                            alignItems: { xs: 'initial', md: 'stretch' }
                        }}>
                            {/* Contact Details Paper */}
                            <Paper elevation={0} sx={{
                                p: { xs: 3, sm: 4 },
                                borderRadius: '12px',
                                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                width: { xs: '100%', md: `calc(5.5/12 * 100% - (${theme.spacing(5)} / 2))` }, 
                            }}>
                                <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 2.5, fontFamily: 'Montserrat', color: theme.palette.primary.main }}>Kahit Saan Restaurant</Typography>
                                <Typography variant="body1" component="address" sx={{ fontStyle: 'normal', color: theme.palette.text.secondary, mb: 2, lineHeight: 1.7 }}>
                                    Jaena Street (Near SMU gate 2),<br />
                                     Bayombong, Philippines
                                </Typography>
                                <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold', mt: 2, mb: 1, fontFamily: 'Montserrat', color: theme.palette.primary.main }}>Operating Hours:</Typography>
                                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2 }}>Monday - Sunday: 10:00 AM - 8:00 PM</Typography>
                                <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold', mt: 2, mb: 1.5, fontFamily: 'Montserrat', color: theme.palette.primary.main }}>Contact Details:</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <MuiLink href="tel:+639554302862" sx={{
                                        display: 'flex', alignItems: 'center', textDecoration: 'none',
                                        color: theme.palette.text.secondary,
                                        '&:hover': { color: theme.palette.primary.main }
                                    }}>
                                        <Phone sx={{ color: theme.palette.primary.main, mr: 1.5, fontSize: 20 }} /> +63 955 430 2862 (Mobile)
                                    </MuiLink>
                                    <MuiLink href="mailto:info@kahitsaanresto.com" sx={{
                                        display: 'flex', alignItems: 'center', textDecoration: 'none',
                                        color: theme.palette.text.secondary,
                                        '&:hover': { color: theme.palette.primary.main }
                                    }}>
                                        <Mail sx={{ color: theme.palette.primary.main, mr: 1.5, fontSize: 20 }} /> info@kahitsaanresto.com
                                    </MuiLink>
                                </Box>
                            </Paper>

                            {/* Map Paper */}
                            <Paper elevation={0} sx={{
                                width: { xs: '100%', md: `calc(6.5/12 * 100% - (${theme.spacing(5)} / 2))` }, // Adjust width for gap
                                // Or using flexBasis:
                                // flexBasis: { xs: '100%', md: 'calc(6.5/12 * 100%)' },
                                height: { xs: 300, sm: 400, md: 'auto' }, // 'auto' allows it to stretch with alignItems: 'stretch'
                                minHeight: 300,
                                position: 'relative',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            }}>
                                <iframe
                                    src={googleMapsEmbedUrl} // Your working URL
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%', // Fills the Paper
                                        border: 0,
                                    }}
                                    allowFullScreen={true}
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Kahit Saan Restaurant Location"
                                ></iframe>
                            </Paper>
                        </Box>
                    </Container>
                </Box>

                <Box id="contact" component="section" sx={{ py: { xs: 6, md: 10 }}}>
                    <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Connect With Us
                        </Typography>
                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt:1, mb: {xs: 4, md: 5}, maxWidth: '700px', mx: 'auto' }}>
                            Follow us on Facebook for the latest updates, promotions, and a peek into our delicious world! We'd love to hear from you.
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: {xs: 2, sm: 3} }}>
                            {[
                                { Icon: Facebook, label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100090792161432' },
                            ].map(({ Icon, label, url }) => (
                                <IconButton
                                    key={label} component="a" href={url} target="_blank" rel="noopener noreferrer"
                                    aria-label={`${label} link`}
                                    sx={{ 
                                        color: theme.palette.text.secondary, 
                                        p: {xs: 1.2, sm: 1.5}, 
                                        border: `1px solid ${theme.palette.divider}`,
                                        transition: theme.transitions.create(['color', 'transform', 'border-color', 'box-shadow'], {
                                            duration: theme.transitions.duration.short,
                                        }),
                                        '&:hover': { 
                                            color: theme.palette.primary.main, 
                                            borderColor: theme.palette.primary.main, 
                                            transform: 'translateY(-2px) scale(1.05)', 
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                                        } 
                                    }}
                                >
                                    <Icon size={isMobile ? 24 : 28} strokeWidth={1.5} />
                                </IconButton>
                            ))}
                        </Box>
                    </Container>
                </Box>
            </main>

            <Box component="footer" sx={{ 
                backgroundColor: theme.palette.background.paper, 
                color: theme.palette.text.secondary, 
                py: {xs:3, md:4},
                borderTop: `1px solid ${theme.palette.divider}`
            }}>
                <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{fontFamily: 'Open Sans'}}>
                        © {new Date().getFullYear()} Kahit Saan Restaurant. All Rights Reserved.
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5, fontFamily: 'Open Sans', color: theme.palette.text.disabled }}>
                        Bayombong, Nueva Vizcaya, Philippines
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
