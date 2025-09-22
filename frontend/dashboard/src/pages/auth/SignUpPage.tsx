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
  Fade,
  Zoom,
  Avatar,
  Divider,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Visibility, VisibilityOff, Agriculture, Email, Lock, Person, CheckCircle, Security, Speed } from '@mui/icons-material';

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
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f0fdf4 50%, #ecfeff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      }}
    >
      {/* Enhanced decorative gradients */}
      <Box sx={{ 
        position: 'absolute', 
        width: 400, 
        height: 400, 
        top: -100, 
        left: -100, 
        background: 'radial-gradient(circle, rgba(76,175,80,0.4) 0%, rgba(76,175,80,0.1) 50%, rgba(76,175,80,0) 70%)', 
        filter: 'blur(8px)', 
        pointerEvents: 'none',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <Box sx={{ 
        position: 'absolute', 
        width: 450, 
        height: 450, 
        bottom: -120, 
        right: -120, 
        background: 'radial-gradient(circle, rgba(33,150,243,0.3) 0%, rgba(33,150,243,0.1) 50%, rgba(33,150,243,0) 70%)', 
        filter: 'blur(8px)', 
        pointerEvents: 'none',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      
      {/* Floating particles */}
      <Box sx={{ 
        position: 'absolute', 
        width: 8, 
        height: 8, 
        top: '20%', 
        left: '10%', 
        background: 'rgba(76,175,80,0.6)', 
        borderRadius: '50%',
        animation: 'float 4s ease-in-out infinite'
      }} />
      <Box sx={{ 
        position: 'absolute', 
        width: 6, 
        height: 6, 
        top: '60%', 
        right: '15%', 
        background: 'rgba(33,150,243,0.6)', 
        borderRadius: '50%',
        animation: 'float 5s ease-in-out infinite reverse'
      }} />

      <Container maxWidth="xl">
        <Fade in timeout={800}>
          <Paper 
            elevation={24} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden', 
              backdropFilter: 'blur(20px)', 
              backgroundColor: 'rgba(255,255,255,0.95)', 
              boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Grid container>
              <Grid item xs={12} md={5}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 50%, #66BB6A 100%)',
                  color: 'white',
                  p: 6,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '600px',
                }}
              >
                {/* Enhanced background effects */}
                <Box sx={{
                  position: 'absolute', 
                  inset: 0, 
                  pointerEvents: 'none',
                  background: 'radial-gradient(1200px 400px at -20% -20%, rgba(255,255,255,0.2), transparent), radial-gradient(1200px 400px at 120% 120%, rgba(255,255,255,0.15), transparent)'
                }} />
                <Box sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  filter: 'blur(20px)'
                }} />
                
                <Zoom in timeout={1000}>
                  <Box sx={{ textAlign: 'center', maxWidth: 420, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mb: 3,
                      animation: 'pulse 2s ease-in-out infinite'
                    }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        width: 64, 
                        height: 64, 
                        mr: 2,
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,255,255,0.3)'
                      }}>
                        <Agriculture sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        FarmIQ
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ opacity: 0.95, mb: 2, fontWeight: 600 }}>
                      สร้างบัญชีของคุณวันนี้
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 4, lineHeight: 1.6 }}>
                      เพื่อเริ่มต้นบริหารจัดการฟาร์มอย่างมืออาชีพด้วยข้อมูลเชิงลึกแบบเรียลไทม์
                    </Typography>
                    
                    <Box sx={{ textAlign: 'left', display: 'inline-block' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                        <CheckCircle sx={{ fontSize: 20, color: 'rgba(255,255,255,0.9)' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          วิเคราะห์ KPI และแนวโน้มสำคัญ
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                        <Security sx={{ fontSize: 20, color: 'rgba(255,255,255,0.9)' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          แจ้งเตือนอัจฉริยะจากอุปกรณ์
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                        <Speed sx={{ fontSize: 20, color: 'rgba(255,255,255,0.9)' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          พร้อมใช้งานบนทุกอุปกรณ์
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Zoom>
              </Grid>
            <Grid item xs={12} md={7}>
              <Card elevation={0} sx={{ height: '100%', borderRadius: 0 }}>
                <CardContent sx={{ p: 6 }}>
                  <Fade in timeout={1200}>
                    <Box>
                      <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          สมัครสมาชิก
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                          เริ่มต้นใช้งานในไม่กี่ขั้นตอน ✨
                        </Typography>
                      </Box>

                      <Snackbar open={!!error} onClose={clearError} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert onClose={clearError} severity="error" sx={{ width: '100%', borderRadius: 2 }}>
                          {error}
                        </Alert>
                      </Snackbar>

                      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 3 }}>
                          <Zoom in timeout={1400}>
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
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#4CAF50',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#4CAF50',
                                    borderWidth: 2,
                                  },
                                },
                              }}
                              InputProps={{ 
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Person sx={{ color: '#4CAF50' }} />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Zoom>
                          <Zoom in timeout={1600}>
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
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#4CAF50',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#4CAF50',
                                    borderWidth: 2,
                                  },
                                },
                              }}
                              InputProps={{ 
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Person sx={{ color: '#4CAF50' }} />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Zoom>
                        </Box>

                        <Zoom in timeout={1800}>
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
                              mb: 3,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#4CAF50',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#4CAF50',
                                  borderWidth: 2,
                                },
                              },
                            }}
                            InputProps={{ 
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email sx={{ color: '#4CAF50' }} />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Zoom>

                        <Zoom in timeout={2000}>
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
                            sx={{ 
                              mb: 2,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#4CAF50',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#4CAF50',
                                  borderWidth: 2,
                                },
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock sx={{ color: '#4CAF50' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton 
                                    aria-label="toggle password visibility" 
                                    onClick={() => setShowPassword(v => !v)} 
                                    edge="end"
                                    sx={{ color: '#4CAF50' }}
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Zoom>

                        <Zoom in timeout={2200}>
                          <Box sx={{ mb: 3 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={passwordStrength} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 6,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: passwordStrength <= 25 ? '#f44336' : passwordStrength <= 50 ? '#ff9800' : passwordStrength <= 75 ? '#2196f3' : '#4caf50',
                                }
                              }} 
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              ความแข็งแรงรหัสผ่าน: {passwordStrength <= 25 ? 'อ่อน' : passwordStrength <= 50 ? 'พอใช้' : passwordStrength <= 75 ? 'ดี' : 'แข็งแรง'}
                            </Typography>
                          </Box>
                        </Zoom>

                        <Zoom in timeout={2400}>
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
                            sx={{ 
                              mb: 3,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#4CAF50',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#4CAF50',
                                  borderWidth: 2,
                                },
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock sx={{ color: '#4CAF50' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton 
                                    aria-label="toggle confirm visibility" 
                                    onClick={() => setShowConfirm(v => !v)} 
                                    edge="end"
                                    sx={{ color: '#4CAF50' }}
                                  >
                                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Zoom>

                        <Zoom in timeout={2600}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={agree} 
                                onChange={(e) => setAgree(e.target.checked)}
                                sx={{
                                  color: '#4CAF50',
                                  '&.Mui-checked': {
                                    color: '#4CAF50',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                                ฉันยอมรับ{' '}
                                <MuiLink href="#" underline="hover" sx={{ color: '#4CAF50', fontWeight: 600 }}>เงื่อนไขการใช้งาน</MuiLink>{' '}และ{' '}
                                <MuiLink href="#" underline="hover" sx={{ color: '#4CAF50', fontWeight: 600 }}>นโยบายความเป็นส่วนตัว</MuiLink>
                              </Typography>
                            }
                            sx={{ mb: 2 }}
                          />
                        </Zoom>
                        {formErrors.agree && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2, fontWeight: 500 }}>
                            {formErrors.agree}
                          </Typography>
                        )}

                        <Zoom in timeout={2800}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            mb: 3, 
                            p: 2, 
                            bgcolor: 'rgba(76,175,80,0.05)', 
                            borderRadius: 2,
                            border: '1px solid rgba(76,175,80,0.1)'
                          }}>
                            <Box sx={{ 
                              width: 10, 
                              height: 10, 
                              borderRadius: '50%', 
                              bgcolor: formData.password.length >= 8 ? '#4caf50' : '#e0e0e0',
                              transition: 'all 0.3s ease'
                            }} />
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>อย่างน้อย 8 ตัวอักษร</Typography>
                            <Box sx={{ 
                              width: 10, 
                              height: 10, 
                              borderRadius: '50%', 
                              bgcolor: /[A-Z]/.test(formData.password) ? '#4caf50' : '#e0e0e0',
                              transition: 'all 0.3s ease'
                            }} />
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>มีตัวพิมพ์ใหญ่</Typography>
                            <Box sx={{ 
                              width: 10, 
                              height: 10, 
                              borderRadius: '50%', 
                              bgcolor: /[0-9]/.test(formData.password) ? '#4caf50' : '#e0e0e0',
                              transition: 'all 0.3s ease'
                            }} />
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>มีตัวเลข</Typography>
                          </Box>
                        </Zoom>

                        <Zoom in timeout={3000}>
                          <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading || !agree}
                            sx={{
                              py: 1.6,
                              borderRadius: 3,
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
                              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                              '&:hover': { 
                                background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
                                boxShadow: '0 12px 32px rgba(76, 175, 80, 0.5)',
                                transform: 'translateY(-2px)',
                              },
                              '&:disabled': {
                                background: 'rgba(0,0,0,0.12)',
                                color: 'rgba(0,0,0,0.26)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {isLoading ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={24} color="inherit" />
                                <Typography>กำลังสร้างบัญชี...</Typography>
                              </Box>
                            ) : (
                              'สมัครสมาชิก'
                            )}
                          </Button>
                        </Zoom>

                        <Divider sx={{ my: 4 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ px: 2, bgcolor: 'background.paper' }}>
                            หรือ
                          </Typography>
                        </Divider>

                        <Zoom in timeout={3200}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                              มีบัญชีอยู่แล้ว?
                            </Typography>
                            <Link 
                              component={RouterLink} 
                              to="/signin" 
                              sx={{ 
                                color: '#4CAF50', 
                                textDecoration: 'none', 
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                '&:hover': {
                                  textDecoration: 'underline',
                                }
                              }}
                            >
                              เข้าสู่ระบบ
                            </Link>
                          </Box>
                        </Zoom>
                      </Box>
                      </Box>
                    </Fade>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default SignUpPage;