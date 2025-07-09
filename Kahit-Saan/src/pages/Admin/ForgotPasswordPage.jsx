import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Container, Paper, Alert, CircularProgress, Link as MuiLink
} from '@mui/material';
import { KeyRound, CheckCircle } from 'lucide-react';
import { usePasswordReset } from '../../hooks/usePasswordReset';

const ForgotPasswordPage = () => {
  const {
    username,
    setUsername,
    loading,
    error,
    message,
    requestSubmitted,
    resetToken,
    handleSubmit,
    handleNavigateToReset,
  } = usePasswordReset();

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
