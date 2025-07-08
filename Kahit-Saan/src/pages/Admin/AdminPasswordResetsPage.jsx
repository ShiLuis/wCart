import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, Button, CircularProgress, Alert, Chip, IconButton
} from '@mui/material';
import { Check, X, Copy, AlertCircle } from 'lucide-react';
import ReusableModal from '../../components/admin/ReusableModal';
import { socket } from '../../api/socket';

const AdminPasswordResetsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [approvedRequestInfo, setApprovedRequestInfo] = useState(null); // For modal

  const fetchRequests = async () => {
    // No setLoading(true) here to avoid jarring UI reloads on socket events
    try {
      const { data } = await adminApi.get('/password-reset/requests');
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests.');
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true); // Set loading true on initial load
    fetchRequests();

    socket.connect();

    const handleRequestUpdate = () => {
      // Refetch requests without showing the main loader for a smoother UX
      fetchRequests();
    };

    // Listen for updates (new, approved, rejected)
    socket.on('passwordResetRequestUpdated', handleRequestUpdate);

    return () => {
      socket.off('passwordResetRequestUpdated', handleRequestUpdate);
      socket.disconnect();
    };
  }, []);

  const handleApprove = async (id) => {
    setUpdatingId(id);
    try {
      const { data } = await adminApi.put(`/password-reset/requests/${id}/approve`);
      setApprovedRequestInfo({ // Set info for the modal
        username: requests.find(r => r._id === id)?.userId?.username,
        token: data.request.token,
      });
      // No need to call fetchRequests(); socket event will handle it.
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request.');
    }
    setUpdatingId(null);
  };

  const handleReject = async (id) => {
    setUpdatingId(id);
    try {
      await adminApi.put(`/password-reset/requests/${id}/reject`);
      // No need to call fetchRequests(); socket event will handle it.
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request.');
    }
    setUpdatingId(null);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  const handleCloseModal = () => {
    setApprovedRequestInfo(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Optionally, add a toast notification for feedback
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Password Reset Requests</Typography>
      <Paper elevation={3}>
        {requests.length === 0 ? (
          <Typography sx={{ p: 3, textAlign: 'center' }}>No pending requests.</Typography>
        ) : (
          <List>
            {requests.map((req) => (
              <ListItem key={req._id} divider>
                <ListItemText
                  primary={`Request from: ${req.userId.username}`}
                  secondary={`Email: ${req.userId.email}`}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleApprove(req._id)}
                    disabled={updatingId === req._id}
                    startIcon={updatingId === req._id ? <CircularProgress size={20} /> : <Check />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleReject(req._id)}
                    disabled={updatingId === req._id}
                    startIcon={updatingId === req._id ? <CircularProgress size={20} /> : <X />}
                  >
                    Reject
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Modal to show after approval */}
      <ReusableModal
        open={!!approvedRequestInfo}
        onClose={handleCloseModal}
        title="Request Approved"
      >
        {approvedRequestInfo && (
          <Box>
            <Alert severity="success" icon={<AlertCircle size={20} />} sx={{ mb: 2 }}>
              The password reset request for <strong>{approvedRequestInfo.username}</strong> has been approved.
            </Alert>
            <Typography sx={{ mb: 1 }}>
              Please provide the following link to the user to reset their password. This link is valid for one hour.
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'action.hover' }}>
              <Typography sx={{ flexGrow: 1, wordBreak: 'break-all', fontSize: '0.9rem' }}>
                {`${window.location.origin}/admin/reset-password/${approvedRequestInfo.token}`}
              </Typography>
              <IconButton onClick={() => copyToClipboard(`${window.location.origin}/admin/reset-password/${approvedRequestInfo.token}`)} size="small">
                <Copy size={18} />
              </IconButton>
            </Paper>
            <Button onClick={handleCloseModal} sx={{ mt: 2 }} fullWidth variant='contained'>
                Close
            </Button>
          </Box>
        )}
      </ReusableModal>

    </Box>
  );
};

export default AdminPasswordResetsPage;
