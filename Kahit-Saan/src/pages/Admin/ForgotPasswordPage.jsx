import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { socket } from '../../api/socket';
import {
  Box, Typography, TextField, Button, Container, Paper, Alert, CircularProgress, Link as MuiLink
} from '@mui/material';
import { KeyRound, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const storedUsername = localStorage.getItem('passwordResetUsername');
      if (storedUsername) {
        setUsername(storedUsername);
        setLoading(true);
        try {
          const { data } = await adminApi.get(`/password-reset/status/${storedUsername}`);
          if (data.status === 'approved' && data.token) {
            setMessage('Your request has been approved! Click the button below to proceed.');
            setResetToken(data.token);
            setRequestSubmitted(false);
          } else if (data.status === 'pending') {
            setMessage('Your request is pending admin approval.');
            setRequestSubmitted(true);
          }
        } catch (error) {
          // It's okay if this fails, the user can just re-submit.
          console.error('Failed to get password reset status:', error);
          localStorage.removeItem('passwordResetUsername'); // Clear if status check fails
        } finally {
          setLoading(false);
        }
      }
    };

    checkStatus();
  }, []);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!username) return;

    const approvalEvent = `passwordResetApproved_${username}`;
    const rejectionEvent = `passwordResetRejected_${username}`;

    const handleApproval = ({ token }) => {
      setMessage('Your request has been approved! Click the button below to proceed.');
      setResetToken(token);
      setRequestSubmitted(false); // Hide the spinner
    };

    const handleRejection = () => {
      setError('Your password reset request was rejected. Please contact an administrator.');
      setMessage('');
      setRequestSubmitted(false); // Allow user to try again and hide spinner
    };

    socket.on(approvalEvent, handleApproval);
    socket.on(rejectionEvent, handleRejection);

    return () => {
      socket.off(approvalEvent, handleApproval);
      socket.off(rejectionEvent, handleRejection);
    };
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setError('Please enter a username.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    setResetToken(null); // Reset token on new submission

    try {
      const response = await adminApi.post('/password-reset/request', { username });
      setRequestSubmitted(true);
      localStorage.setItem('passwordResetUsername', username); // Store username
      setMessage(response.data.message + ' Please wait for an admin to approve your request.');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToReset = () => {
    if (resetToken) {
      localStorage.removeItem('passwordResetUsername'); // Clean up on navigation
      navigate(`/admin/reset-password/${resetToken}`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '12px' }}>
        <KeyRound size={40} style={{ marginBottom: '1rem' }} />
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
          Enter your username to request a password reset.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading || requestSubmitted || !!resetToken}
          />
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          {message && <Alert severity={resetToken ? "success" : "info"} sx={{ width: '100%', mt: 2 }}>{message}</Alert>}
          
          {!resetToken && (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || requestSubmitted}
            >
              {loading ? <CircularProgress size={24} /> : 'Request Reset'}
            </Button>
          )}
        </Box>

        {requestSubmitted && !resetToken && (
          <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <CircularProgress size={24} />
            <Typography sx={{ mt: 1 }}>
              Waiting for admin approval...
            </Typography>
          </Box>
        )}

        {resetToken && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, py: 1.5 }}
            onClick={handleNavigateToReset}
            startIcon={<CheckCircle />}
          >
            Create New Password
          </Button>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <MuiLink component={RouterLink} to="/admin/auth/login" variant="body2">
            Back to Login
          </MuiLink>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;
