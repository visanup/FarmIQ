// src/pages/auth/Profile.tsx
// src/pages/auth/Profile.tsx
import React, { useEffect, useState, FormEvent } from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  AccountCircle as UsernameIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { authApi, ProfileData } from '../../utils/api/auth';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const profile = await authApi.me();
        setData(profile);
        setUsername(profile.username);
        setEmail(profile.email);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.REACT_APP_AUTH_URL}/api/auth/me`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, email }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update profile');
      }
      setSuccess('Profile updated successfully');
      setData((prev) =>
        prev ? { ...prev, username, email } : null
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container 
        maxWidth="sm" 
        sx={{ mt: 10, mb: 4 }}
        >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            width: 64,
            height: 64,
            m: '0 auto',
          }}
        >
          <UsernameIcon fontSize="large" sx={{ color: '#fff' }} />
        </Avatar>
        <Typography variant="h5" sx={{ mt: 1 }}>
          {data?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Role: {data?.role}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Joined on{' '}
          {new Date(data!.createdAt).toLocaleDateString()}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSave}>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <UsernameIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Two-column layout for buttons */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 2,
            mt: 2,
          }}
        >
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={saving}
          >
            {saving ? (
              <CircularProgress size={20} />
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={handleChangePassword}
          >
            Change Password
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Button
        fullWidth
        variant="text"
        color="error"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Container>
  );
}

