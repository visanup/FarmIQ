import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Link,
  Container,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Agriculture,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const loginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);
      navigate('/');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Agriculture sx={{ fontSize: 40, mr: 1 }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                FarmIQ
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              เข้าสู่ระบบเพื่อจัดการฟาร์มของคุณ
            </Typography>
          </Box>

          {/* Form */}
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3, fontWeight: 600 }}>
              เข้าสู่ระบบ
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 3 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="อีเมล"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="รหัสผ่าน"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  mb: 2,
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                หรือ
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีบัญชี?{' '}
                <Link
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  สมัครสมาชิก
                </Link>
              </Typography>
            </Box>

            {/* Demo Credentials */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Demo Credentials:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: demo@farmiq.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Password: demo123
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignInPage;