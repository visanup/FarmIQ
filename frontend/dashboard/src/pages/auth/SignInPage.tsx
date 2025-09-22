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
  Grid,
  Checkbox,
  FormControlLabel,
  Snackbar,
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
        background: 'linear-gradient(135deg, #e0f7fa 0%, #f1f8e9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradients */}
      <Box sx={{ position: 'absolute', width: 320, height: 320, top: -80, left: -80, background: 'radial-gradient(circle, rgba(76,175,80,0.35) 0%, rgba(76,175,80,0) 70%)', filter: 'blur(6px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', width: 360, height: 360, bottom: -100, right: -100, background: 'radial-gradient(circle, rgba(33,150,243,0.25) 0%, rgba(33,150,243,0) 70%)', filter: 'blur(6px)', pointerEvents: 'none' }} />

      <Container maxWidth="md">
        <Paper elevation={16} sx={{ borderRadius: 3, overflow: 'hidden', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.78)' }}>
          <Grid container>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                p: 4,
              }}
            >
              <Box sx={{ textAlign: 'center', maxWidth: 360 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Agriculture sx={{ fontSize: 44, mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    FarmIQ
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ opacity: 0.95, mb: 1 }}>
                  Analytics Dashboard
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  เข้าสู่ระบบเพื่อจัดการฟาร์ม ติดตามอุปกรณ์ และดูข้อมูลเชิงลึกแบบเรียลไทม์
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ height: '100%', borderRadius: 0 }}>
                <CardContent sx={{ p: 5 }}>
                  <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 700, mb: 1 }}>
                    เข้าสู่ระบบ
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                    ยินดีต้อนรับกลับมา 👋
                  </Typography>

                  <Snackbar open={!!error} onClose={clearError} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
                      {error}
                    </Alert>
                  </Snackbar>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ mb: 2 }}>
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
                          />
                        )}
                      />
                    </Box>

                    <Box sx={{ mb: 1 }}>
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
                                  <IconButton aria-label="toggle password visibility" onClick={handleTogglePasswordVisibility} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <FormControlLabel control={<Checkbox defaultChecked={true} />} label={<Typography variant="body2">จดจำฉัน</Typography>} />
                      <Link component={RouterLink} to="/forgot-password" underline="hover" variant="body2">
                        ลืมรหัสผ่าน?
                      </Link>
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading}
                      sx={{
                        py: 1.4,
                        borderRadius: 2,
                        boxShadow: '0 6px 18px rgba(76, 175, 80, 0.3)',
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)' },
                      }}
                    >
                      {isLoading ? <CircularProgress size={24} color="inherit" /> : 'เข้าสู่ระบบ'}
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
                      <Link component={RouterLink} to="/signup" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600 }}>
                        สมัครสมาชิก
                      </Link>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignInPage;