import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';
import { socket } from '../api/socket';

export const usePasswordReset = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const navigate = useNavigate();

  const clearState = () => {
    setError('');
    setMessage('');
    setResetToken(null);
    setRequestSubmitted(false);
  };

  const checkStatus = useCallback(async () => {
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
      } catch (err) {
        console.error('Failed to get password reset status:', err);
        localStorage.removeItem('passwordResetUsername');
      } finally {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    socket.connect();
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!username) return;

    const approvalEvent = `passwordResetApproved_${username}`;
    const rejectionEvent = `passwordResetRejected_${username}`;

    const handleApproval = ({ token }) => {
      setMessage('Your request has been approved! Click the button below to proceed.');
      setResetToken(token);
      setRequestSubmitted(false);
    };

    const handleRejection = () => {
      setError('Your password reset request was rejected. Please contact an administrator.');
      setMessage('');
      setRequestSubmitted(false);
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
    clearState();

    try {
      const response = await adminApi.post('/password-reset/request', { username });
      setRequestSubmitted(true);
      localStorage.setItem('passwordResetUsername', username);
      setMessage(response.data.message + ' Please wait for an admin to approve your request.');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToReset = () => {
    if (resetToken) {
      localStorage.removeItem('passwordResetUsername');
      navigate(`/admin/reset-password/${resetToken}`);
    }
  };

  return {
    username,
    setUsername,
    loading,
    error,
    message,
    requestSubmitted,
    resetToken,
    handleSubmit,
    handleNavigateToReset,
  };
};
