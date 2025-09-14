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
  Grid,
  InputAdornment,
  IconButton,
  LinearProgress,
  Snackbar,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Visibility, VisibilityOff, Agriculture, Email, Lock, Person } from '@mui/icons-material';

const SignUpPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  const passwordStrength = (() => {
    const p = formData.password;
    let score = 0;
    if (p.length >= 8) score += 25;
    if (/[A-Z]/.test(p)) score += 25;
    if (/[0-9]/.test(p)) score += 25;
    if (/[^A-Za-z0-9]/.test(p)) score += 25;
    return score;
  })();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'กรุณาใส่อีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.password) {
      errors.password = 'กรุณาใส่รหัสผ่าน';
    } else if (formData.password.length < 8) {
      errors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
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
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!agree) {
      setFormErrors(prev => ({ ...prev, agree: 'โปรดยอมรับเงื่อนไขการใช้งาน' }));
      return;
    }
    const { firstName, lastName, email, password } = formData;
    await register({ email, password, name: [firstName, lastName].filter(Boolean).join(' ').trim() || firstName || lastName });
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradients */}
      <Box sx={{ position: 'absolute', width: 340, height: 340, top: -90, left: -90, background: 'radial-gradient(circle, rgba(76,175,80,0.35) 0%, rgba(76,175,80,0) 70%)', filter: 'blur(6px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', width: 380, height: 380, bottom: -110, right: -110, background: 'radial-gradient(circle, rgba(33,150,243,0.25) 0%, rgba(33,150,243,0) 70%)', filter: 'blur(6px)', pointerEvents: 'none' }} />

      <Container maxWidth="md">
        <Paper elevation={16} sx={{ borderRadius: 4, overflow: 'hidden', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.82)', boxShadow: '0 30px 80px rgba(0,0,0,0.12)' }}>
          <Grid container>
            <Grid item xs={12} md={6}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 50%, #66BB6A 100%)',
                color: 'white',
                p: 5,
                position: 'relative',
              }}
            >
              <Box sx={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(1000px 300px at -10% -10%, rgba(255,255,255,0.15), transparent), radial-gradient(1000px 300px at 110% 110%, rgba(255,255,255,0.15), transparent)'
              }} />
              <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Agriculture sx={{ fontSize: 44, mr: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    FarmIQ™
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ opacity: 0.95, mb: 1, fontWeight: 600 }}>
                  สร้างบัญชีของคุณวันนี้
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  เพื่อเริ่มต้นบริหารจัดการฟาร์มอย่างมืออาชีพด้วยข้อมูลเชิงลึกแบบเรียลไทม์
                </Typography>
                <Box sx={{ textAlign: 'left', display: 'inline-block' }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    ✅ วิเคราะห์ KPI และแนวโน้มสำคัญ
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    ✅ แจ้งเตือนอัจฉริยะจากอุปกรณ์
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ✅ พร้อมใช้งานบนทุกอุปกรณ์
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ height: '100%', borderRadius: 0 }}>
                <CardContent sx={{ p: 5 }}>
                  <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 700, mb: 1 }}>
                    สมัครสมาชิก
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                    เริ่มต้นใช้งานในไม่กี่ขั้นตอน ✨
                  </Typography>

                  <Snackbar open={!!error} onClose={clearError} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
                      {error}
                    </Alert>
                  </Snackbar>

                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 2 }}>
                      <TextField
                        fullWidth
                        name="firstName"
                        label="ชื่อจริง"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        error={!!formErrors.firstName}
                        helperText={formErrors.firstName}
                        InputProps={{ startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        )}}
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
                        InputProps={{ startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        )}}
                      />
                    </Box>

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
                      InputProps={{ startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      )}}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      name="password"
                      label="รหัสผ่าน"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(v => !v)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 1 }}
                    />

                    <Box sx={{ mb: 2 }}>
                      <LinearProgress variant="determinate" value={passwordStrength} sx={{ height: 8, borderRadius: 6 }} />
                      <Typography variant="caption" color="text.secondary">
                        ความแข็งแรงรหัสผ่าน: {passwordStrength <= 25 ? 'อ่อน' : passwordStrength <= 50 ? 'พอใช้' : passwordStrength <= 75 ? 'ดี' : 'แข็งแรง'}
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      name="confirmPassword"
                      label="ยืนยันรหัสผ่าน"
                      type={showConfirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      error={!!formErrors.confirmPassword}
                      helperText={formErrors.confirmPassword}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle confirm visibility" onClick={() => setShowConfirm(v => !v)} edge="end">
                              {showConfirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    <FormControlLabel
                      control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />}
                      label={
                        <Typography variant="body2" color="text.secondary">
                          ฉันยอมรับ{' '}
                          <MuiLink href="#" underline="hover">เงื่อนไขการใช้งาน</MuiLink>{' '}และ{' '}
                          <MuiLink href="#" underline="hover">นโยบายความเป็นส่วนตัว</MuiLink>
                        </Typography>
                      }
                      sx={{ mb: 1 }}
                    />
                    {formErrors.agree && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
                        {formErrors.agree}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: formData.password.length >= 8 ? 'success.main' : 'grey.400' }} />
                      <Typography variant="caption">อย่างน้อย 8 ตัวอักษร</Typography>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: /[A-Z]/.test(formData.password) ? 'success.main' : 'grey.400' }} />
                      <Typography variant="caption">มีตัวพิมพ์ใหญ่</Typography>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: /[0-9]/.test(formData.password) ? 'success.main' : 'grey.400' }} />
                      <Typography variant="caption">มีตัวเลข</Typography>
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading || !agree}
                      sx={{
                        py: 1.4,
                        borderRadius: 2,
                        boxShadow: '0 6px 18px rgba(76, 175, 80, 0.3)',
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)' },
                      }}
                    >
                      {isLoading ? <CircularProgress size={24} color="inherit" /> : 'สมัครสมาชิก'}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        มีบัญชีอยู่แล้ว?
                        {' '}
                        <Link component={RouterLink} to="/signin" sx={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
                          เข้าสู่ระบบ
                        </Link>
                      </Typography>
                    </Box>
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

export default SignUpPage;