// src/pages/admin/MenuManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Grid, CircularProgress, Alert,
    DialogContentText,
    TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Paper, CardMedia as MuiCardMedia, useTheme,
    CardContent
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Plus, Pencil, Trash2, X, Save, UtensilsCrossed, AlertCircle, Image as ImageIcon // Loader2 was imported but not used
} from 'lucide-react';

// Import the centralized adminApi and its setAuthToken function
import adminApi, { setAuthToken } from '../../api/adminApi';
import ReusableModal from '../../components/admin/ReusableModal';

// Define FormFields as a standalone component
const StandaloneFormFields = ({ formData, handleInputChange, theme, photoPreview }) => (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <TextField fullWidth required label="Name" name="name" value={formData.name} onChange={handleInputChange} variant="outlined" />
        </Grid>
        <Grid item xs={12}>
            <TextField fullWidth required multiline rows={3} label="Description" name="description" value={formData.description} onChange={handleInputChange} variant="outlined" />
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField fullWidth required type="number" label="Price (₱)" name="price" value={formData.price} onChange={handleInputChange} variant="outlined" inputProps={{ min: 0, step: "0.01" }} />
        </Grid>
        <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="outlined">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                    labelId="category-label"
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    sx={{ minWidth: 180 }} // Ensure minimum width
                >
                    <MenuItem value="" disabled><em>Select a category</em></MenuItem>
                    <MenuItem value="Chaofan">Chaofan</MenuItem>
                    <MenuItem value="Noodles">Noodles</MenuItem>
                    <MenuItem value="Rice Meals">Rice Meals</MenuItem>
                    <MenuItem value="Beverages">Beverages</MenuItem>
                    <MenuItem value="Sides">Sides</MenuItem>
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={12}>
            <Button variant="outlined" component="label" fullWidth startIcon={<ImageIcon />}
                sx={{
                    borderColor: 'primary.main', color: 'primary.main',
                    textTransform: 'none', // For a more natural "Upload Image" text
                    '&:hover': { borderColor: 'primary.dark', backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                }}
            >
                {photoPreview ? 'Change Image' : 'Upload Image'}
                <input type="file" id="menu-item-photo-upload" name="photo" hidden accept="image/*" onChange={handleInputChange} />
            </Button>
            {photoPreview && (
                <Box mt={2} textAlign="center">
                    <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }} gutterBottom>Image Preview:</Typography>
                    <MuiCardMedia // Using MuiCardMedia for consistent image display
                        component="img"
                        src={photoPreview}
                        alt="Preview"
                        sx={{
                            maxHeight: '150px',
                            maxWidth: '100%',
                            width: 'auto', // Maintain aspect ratio
                            borderRadius: '4px',
                            border: `1px solid ${theme.palette.divider}`,
                            objectFit: 'contain', // Ensure whole image is visible
                            margin: '0 auto' // Center the image if it's not full width
                        }}
                    />
                </Box>
            )}
        </Grid>
    </Grid>
);


const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [pageError, setPageError] = useState(null); // For errors displayed on the page
    const [formError, setFormError] = useState(null); // For errors displayed within the form modal
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const theme = useTheme();

    const [formData, setFormData] = useState({
        name: '', description: '', price: '', category: '', photo: null,
    });
    
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            setAuthToken(token);
        }
        // PrivateRoute should handle redirection if no token
    }, []);


    const fetchMenuItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminApi.get('/menu'); 
            setMenuItems(response.data);
            setPageError(null);
        } catch (err) {
            console.error("Error fetching menu items:", err);
            setPageError(err.response?.data?.message || err.message || "Failed to load menu items. Ensure backend is running and API is accessible.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMenuItems();
    }, [fetchMenuItems]);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            if (files && files[0]) {
                setFormData(prev => ({ ...prev, photo: files[0] }));
                if (photoPreview && photoPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(photoPreview); // Revoke old blob URL if one exists
                }
                setPhotoPreview(URL.createObjectURL(files[0]));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || '' : value }));
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', price: '', category: '', photo: null });
        if (photoPreview && photoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(photoPreview);
        }
        setPhotoPreview(null);
        const fileInput = document.getElementById('menu-item-photo-upload');
        if (fileInput) fileInput.value = null;
        setFormError(null); // Clear form-specific errors
    };

    const handleOpenAddModal = () => {
        setEditingItem(null);
        resetForm();
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category || '',
            photo: null, 
        });
        if (photoPreview && photoPreview.startsWith('blob:')) { // Clean up previous blob if any
            URL.revokeObjectURL(photoPreview);
        }
        setPhotoPreview(item.photo?.url || null);
        setIsFormModalOpen(true);
        setFormError(null); // Clear previous form errors
    };

    const handleOpenDeleteModal = (item) => {
        setEditingItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsDeleteModalOpen(false);
        // Only revoke object URL if it's a blob URL created for preview
        if (photoPreview && photoPreview.startsWith('blob:')) {
             URL.revokeObjectURL(photoPreview);
        }
        setEditingItem(null); // Moved here to ensure it's reset even if photoPreview logic changes
        resetForm(); // This will also clear photoPreview if it was a blob
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null); // Clear previous form errors
        setPageError(null); // Clear previous page errors

        const submissionData = new FormData();
        submissionData.append('name', formData.name);
        submissionData.append('description', formData.description);
        submissionData.append('price', String(formData.price)); // Ensure price is string for FormData
        submissionData.append('category', formData.category);
        if (formData.photo) { // Only append photo if a new one is selected
            submissionData.append('photo', formData.photo);
        }
        
        try {
            if (editingItem) {
                await adminApi.put(`/menu/${editingItem._id}`, submissionData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await adminApi.post('/menu', submissionData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            fetchMenuItems(); 
            handleCloseModals();
        } catch (err) {
            console.error("Error saving menu item:", err.response || err);
            setFormError(err.response?.data?.message || "Failed to save menu item. Please check inputs."); // Set form-specific error
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!editingItem) return;
        setFormLoading(true);
        setPageError(null); // Clear page error before delete attempt
        try {
            await adminApi.delete(`/menu/${editingItem._id}`);
            fetchMenuItems(); 
            handleCloseModals();
        } catch (err) {
            console.error("Error deleting menu item:", err);
            // Display error on the main page as modal will close
            setPageError(err.response?.data?.message || "Failed to delete menu item.");
            // Close modal even if delete fails, error will be shown on page
            handleCloseModals(); 
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Box sx={{p: {xs: 2, sm: 3}}}> {/* Added some padding to the main Box */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontFamily: 'Montserrat', fontWeight: 'bold' }}>
                    Menu Management
                </Typography>
                <Button variant="contained" color="primary" startIcon={<Plus />} onClick={handleOpenAddModal} sx={{ fontFamily: 'Open Sans', fontWeight: 600 }}>
                    Add Item
                </Button>
            </Box>

            {pageError && <Alert severity="error" onClose={() => setPageError(null)} sx={{ mb: 2 }}>{pageError}</Alert>}

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress color="primary" /></Box>}
            
            {!loading && menuItems.length === 0 && !pageError && (
                <Paper sx={{ textAlign: 'center', py: {xs:4, md:6}, px:2, backgroundColor: 'background.paper', borderRadius: '12px' }}>
                    <UtensilsCrossed style={{ fontSize: 60, color: theme.palette.text.secondary, marginBottom: theme.spacing(2) }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Menu Items Yet</Typography>
                    <Typography variant="body1" sx={{ color: 'text.disabled', mb: 3, mt:1 }}>Click "Add Item" to populate your menu.</Typography>
                    <Button variant="outlined" color="primary" startIcon={<Plus />} onClick={handleOpenAddModal} sx={{fontFamily: 'Open Sans', fontWeight: 600}}>Add First Item</Button>
                </Paper>
            )}

            {!loading && menuItems.length > 0 && (
                <Grid container spacing={3}>
                    {menuItems.map(item => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                            <Paper elevation={2} sx={{ 
                                display: 'flex', flexDirection: 'column', height: '100%', 
                                backgroundColor: 'background.paper',
                                borderRadius: '12px', overflow: 'hidden',
                                width: '350px' // Added fixed width
                            }}>
                                <MuiCardMedia
                                    component="img"
                                    height="180" // Fixed height for image
                                    image={item.photo?.url || `https://placehold.co/300x180/${theme.palette.background.paper.substring(1).replace('#','')}/${theme.palette.primary.main.substring(1).replace('#','')}?text=${encodeURIComponent(item.name)}&font=montserrat`}
                                    alt={item.name}
                                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/300x180/333333/D4AF37?text=Error&font=montserrat`; }}
                                    sx={{ objectFit: 'cover' }} // Ensures image covers the area
                                />
                                <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="caption" sx={{color: 'primary.main', fontWeight:600, textTransform: 'uppercase'}}>{item.category}</Typography>
                                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', fontFamily: 'Montserrat', mt:0.5, mb:1, color: 'text.primary', lineHeight: 1.3 }}>
                                        {item.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                        mb: 2, 
                                        flexGrow: 1, // Allow description to take available space if price is short
                                        height: '3.6em', // Approx 2 lines
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}>
                                        {item.description}
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', fontFamily: 'Montserrat', mt: 'auto' /* Push price to bottom if description is short */ }}>
                                        ₱{typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
                                    </Typography>
                                </CardContent>
                                <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${theme.palette.divider}`}}>
                                    <IconButton size="small" onClick={() => handleOpenEditModal(item)} sx={{color: 'text.secondary', '&:hover': {color: 'primary.main'}}} aria-label="edit">
                                        <Pencil size={18} />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleOpenDeleteModal(item)} sx={{color: theme.palette.error.light, '&:hover': {color: theme.palette.error.main}}} aria-label="delete">
                                        <Trash2 size={18} />
                                    </IconButton>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Form Modal for Add/Edit */}
            <ReusableModal
                open={isFormModalOpen}
                onClose={handleCloseModals}
                title={editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                actions={
                    <>
                        <Button onClick={handleCloseModals} color="secondary" variant="outlined">Cancel</Button>
                        <Button onClick={handleSubmitForm} color="primary" variant="contained" disabled={formLoading} startIcon={formLoading ? <CircularProgress size={20} /> : <Save />}>
                            {formLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmitForm} noValidate>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <StandaloneFormFields formData={formData} handleInputChange={handleInputChange} theme={theme} photoPreview={photoPreview} />
                </form>
            </ReusableModal>

            {/* Delete Confirmation Modal */}
            <ReusableModal
                open={isDeleteModalOpen}
                onClose={handleCloseModals}
                title="Confirm Deletion"
                actions={
                    <>
                        <Button onClick={handleCloseModals} color="secondary" variant="outlined">Cancel</Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={formLoading} startIcon={formLoading ? <CircularProgress size={20} /> : <Trash2 />}>
                            {formLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </>
                }
            >
                <DialogContentText>
                    Are you sure you want to delete the item "<strong>{editingItem?.name}</strong>"? This action cannot be undone.
                </DialogContentText>
            </ReusableModal>

        </Box>
    );
};

export default MenuManagement;