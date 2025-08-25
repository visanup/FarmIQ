import React, { useState } from 'react';
// SignUp page for FarmIQ Analytics
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Container,
  Paper,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SignUpPage: React.FC = () => {
  const theme = useTheme();
  const { signUp, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.username) {
      errors.username = 'กรุณาใส่ชื่อผู้ใช้';
    } else if (formData.username.length < 3) {
      errors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    if (!formData.email) {
      errors.email = 'กรุณาใส่อีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.password) {
      errors.password = 'กรุณาใส่รหัสผ่าน';
    } else if (formData.password.length < 6) {
      errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    // Clear global error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...userData } = formData;
    await signUp(userData);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={theme.palette.mode === 'dark' ? 8 : 2}
          sx={{
            p: 4,
            borderRadius: 3,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: '2.5rem',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              🌱
            </Typography>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
              }}
            >
              เริ่มต้นใช้งาน
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1.1rem' }}
            >
              สร้างบัญชี FarmIQ Analytics ของคุณ
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
              onClose={clearError}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  name="firstName"
                  label="ชื่อจริง"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  name="lastName"
                  label="นามสกุล"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
              <TextField
                fullWidth
                name="username"
                label="ชื่อผู้ใช้"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                error={!!formErrors.username}
                helperText={formErrors.username}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                name="email"
                label="อีเมล"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                error={!!formErrors.email}
                helperText={formErrors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  name="password"
                  label="รหัสผ่าน"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="ยืนยันรหัสผ่าน"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'สมัครสมาชิก'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                มีบัญชีอยู่แล้ว?{' '}
                <Link
                  component={RouterLink}
                  to="/signin"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  เข้าสู่ระบบ
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUpPage;