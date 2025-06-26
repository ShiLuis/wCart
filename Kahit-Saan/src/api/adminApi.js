import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'; // Your backend URL

// Axios instance for admin APIs
const adminApi = axios.create({
  baseURL: `${API_URL}/api`, // Adjusted to append /api to the base URL
});

// Ensure axios sends the token with requests
const setAuthToken = (token) => {
  if (token) {
    adminApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete adminApi.defaults.headers.common['Authorization'];
  }
};

// Initialize token from localStorage if available
const token = localStorage.getItem('adminToken');
if (token) {
  setAuthToken(token);
}

// --- User Management ---
export const getUsers = async () => {
  const response = await adminApi.get('/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await adminApi.post('/users', userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await adminApi.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await adminApi.delete(`/users/${userId}`);
  return response.data;
};

// You can also move menu item API calls here for consistency
// Example:
// export const getMenuItems = async () => {
//   const response = await adminApi.get('/menu');
//   return response.data;
// };

export { adminApi, setAuthToken }; // Export adminApi if needed directly, and setAuthToken