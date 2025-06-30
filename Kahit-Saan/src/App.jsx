import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

// Public Pages/Components (Lazy Loaded)
const LandingPage = lazy(() => import("./pages/LandingPage"));

// Admin Pages/Components (Lazy Loaded)
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminMenuManagementPage = lazy(() => import("./pages/Admin/AdminMenuManagementPage"));
const AdminUserManagementPage = lazy(() => import("./pages/Admin/AdminUserManagementPage"));
const AdminOrderManagementPage = lazy(() => import("./pages/Admin/AdminOrderManagementPage"));
const AdminDailyOrdersPage = lazy(() => import("./pages/Admin/AdminDailyOrdersPage"));
// const AdminDashboardPage = lazy(() => import("./pages/Admin/AdminDashboardPage")); // Remove
const AdminLoginPage = lazy(() => import("./pages/Admin/AdminLoginPage"));
const PrivateRoute = lazy(() => import("./assets/components/admin/PrivateRoute")); // <-- ADD THIS LINE

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Route */}
        <Route
          path="/"
          element={
            // The LandingPage component itself contains its navigation
            <LandingPage />
          }
        />

        <Route path="/admin/auth/login" element={<AdminLoginPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminMenuManagementPage />} /> {/* Set Menu Management as index */}
          <Route path="menu" element={<AdminMenuManagementPage />} />
          <Route path="users" element={<AdminUserManagementPage />} />
          <Route path="orders" element={<AdminOrderManagementPage />} />
          <Route path="daily-orders" element={<AdminDailyOrdersPage />} />
          {/* <Route path="dashboard" element={<AdminDashboardPage />} /> Remove this line if dashboard is fully removed */}
        </Route>

        {/* Optional: 404 Not Found Page */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Suspense>
  );
}

export default App;