import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Adjust path if your AuthContext is located elsewhere

const PrivateRoute = ({ children }) => {
  const { adminUser, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    // You might want to show a loading spinner here while auth state is being determined
    // For simplicity, returning null or a minimal loader.
    // Or, ensure your Suspense fallback in App.jsx covers this initial load.
    return null; // Or <CircularProgress />;
  }

  if (!adminUser) {
    // User is not authenticated, redirect to login page
    // Save the current location they were trying to go to,
    // so we can send them there after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the children components
  return children;
};

export default PrivateRoute;