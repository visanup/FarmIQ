import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  DarkMode,
  LightMode,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Web as WebIcon,
  VolumeUp as VolumeIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentTab, setCurrentTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  
  // User settings state
  const [userSettings, setUserSettings] = useState({
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@farmiq.com',
    phone: '+66 89 123 4567',
    language: 'th',
    timezone: 'Asia/Bangkok',
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    autoRefresh: true,
    refreshInterval: 30,
    compactView: false,
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Container maxWidth="xl" sx={{ p: 0 }}>
      {/* Page Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <SettingsIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }, color: theme.palette.primary.main }} />
          ⚙️ การตั้งค่าระบบ
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          จัดการการตั้งค่าส่วนตัว การแจ้งเตือน และการตั้งค่าระบบ
        </Typography>
      </Box>

      {showSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setShowSuccess(false)}
        >
          บันทึกการตั้งค่าเรียบร้อยแล้ว
        </Alert>
      )}

      {/* Settings Tabs */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTab-root': {
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 500,
            }
          }}
        >
          <Tab 
            icon={<PersonIcon />} 
            label="โปรไฟล์" 
            iconPosition="start"
            sx={{ minHeight: { xs: 56, sm: 64 } }}
          />
          <Tab 
            icon={<NotificationsIcon />} 
            label="การแจ้งเตือน" 
            iconPosition="start"
            sx={{ minHeight: { xs: 56, sm: 64 } }}
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="ระบบ" 
            iconPosition="start"
            sx={{ minHeight: { xs: 56, sm: 64 } }}
          />
          <Tab 
            icon={<SecurityIcon />} 
            label="ความปลอดภัย" 
            iconPosition="start"
            sx={{ minHeight: { xs: 56, sm: 64 } }}
          />
        </Tabs>

        {/* Profile Settings Tab */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={3}>
              {/* Profile Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Avatar
                  sx={{
                    width: { xs: 80, sm: 100 },
                    height: { xs: 80, sm: 100 },
                    bgcolor: theme.palette.primary.main,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                  }}
                >
                  {userSettings.firstName[0]}{userSettings.lastName[0]}
                </Avatar>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {userSettings.firstName} {userSettings.lastName}
                  </Typography>
                  <Chip 
                    label="ผู้ดูแลระบบ" 
                    color="primary" 
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    เข้าสู่ระบบล่าสุด: วันนี้ 14:30
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  {!isEditing ? (
                    <Tooltip title="แก้ไขโปรไฟล์">
                      <IconButton 
                        onClick={() => setIsEditing(true)}
                        sx={{ 
                          bgcolor: theme.palette.primary.main + '15',
                          '&:hover': { bgcolor: theme.palette.primary.main + '25' }
                        }}
                      >
                        <EditIcon sx={{ color: theme.palette.primary.main }} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="บันทึก">
                        <IconButton 
                          onClick={handleSave}
                          sx={{ 
                            bgcolor: theme.palette.success.main + '15',
                            '&:hover': { bgcolor: theme.palette.success.main + '25' }
                          }}
                        >
                          <SaveIcon sx={{ color: theme.palette.success.main }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ยกเลิก">
                        <IconButton 
                          onClick={handleCancel}
                          sx={{ 
                            bgcolor: theme.palette.error.main + '15',
                            '&:hover': { bgcolor: theme.palette.error.main + '25' }
                          }}
                        >
                          <CancelIcon sx={{ color: theme.palette.error.main }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </Box>
              </Box>

              <Divider />

              {/* Profile Form */}
              <Box 
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3
                }}
              >
                <TextField
                  label="ชื่อจริง"
                  value={userSettings.firstName}
                  onChange={(e) => setUserSettings({ ...userSettings, firstName: e.target.value })}
                  disabled={!isEditing}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="นามสกุล"
                  value={userSettings.lastName}
                  onChange={(e) => setUserSettings({ ...userSettings, lastName: e.target.value })}
                  disabled={!isEditing}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="อีเมล"
                  value={userSettings.email}
                  onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                  disabled={!isEditing}
                  fullWidth
                  type="email"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="เบอร์โทรศัพท์"
                  value={userSettings.phone}
                  onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
                  disabled={!isEditing}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>ภาษา</InputLabel>
                  <Select
                    value={userSettings.language}
                    label="ภาษา"
                    onChange={(e) => setUserSettings({ ...userSettings, language: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="th">ไทย</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>เขตเวลา</InputLabel>
                  <Select
                    value={userSettings.timezone}
                    label="เขตเวลา"
                    onChange={(e) => setUserSettings({ ...userSettings, timezone: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Asia/Bangkok">เวลาประเทศไทย (UTC+7)</MenuItem>
                    <MenuItem value="UTC">UTC (UTC+0)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                ตั้งค่าการแจ้งเตือน
              </Typography>
              
              <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon sx={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="การแจ้งเตือนทางอีเมล"
                    secondary="รับการแจ้งเตือนผ่านอีเมลสำหรับเหตุการณ์สำคัญ"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={systemSettings.emailNotifications}
                      onChange={(e) => setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <SmsIcon sx={{ color: theme.palette.secondary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="การแจ้งเตือนทาง SMS"
                    secondary="รับการแจ้งเตือนผ่าน SMS สำหรับเหตุการณ์เร่งด่วน"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={systemSettings.smsNotifications}
                      onChange={(e) => setSystemSettings({ ...systemSettings, smsNotifications: e.target.checked })}
                      color="secondary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <WebIcon sx={{ color: theme.palette.info.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="การแจ้งเตือนบนเว็บ"
                    secondary="แสดงการแจ้งเตือนบนหน้าเว็บไซต์"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={systemSettings.pushNotifications}
                      onChange={(e) => setSystemSettings({ ...systemSettings, pushNotifications: e.target.checked })}
                      color="info"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <VolumeIcon sx={{ color: theme.palette.warning.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="เสียงแจ้งเตือน"
                    secondary="เปิดเสียงเมื่อมีการแจ้งเตือนใหม่"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={systemSettings.soundEnabled}
                      onChange={(e) => setSystemSettings({ ...systemSettings, soundEnabled: e.target.checked })}
                      color="warning"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Stack>
          </Box>
        </TabPanel>

        {/* System Settings Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                ตั้งค่าระบบ
              </Typography>
              
              <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                <ListItem>
                  <ListItemIcon>
                    {theme.palette.mode === 'dark' ? 
                      <LightMode sx={{ color: theme.palette.warning.main }} /> : 
                      <DarkMode sx={{ color: theme.palette.primary.main }} />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="โหมดมืด"
                    secondary="เปลี่ยนธีมของแอปพลิเคชัน"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={theme.palette.mode === 'dark'}
                      onChange={(e) => {
                        // This would be handled by the parent component
                        console.log('Theme toggle:', e.target.checked);
                      }}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: theme.palette.secondary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="รีเฟรชอัตโนมัติ"
                    secondary="อัปเดตข้อมูลอัตโนมัติ"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={systemSettings.autoRefresh}
                      onChange={(e) => setSystemSettings({ ...systemSettings, autoRefresh: e.target.checked })}
                      color="secondary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                {systemSettings.autoRefresh && (
                  <ListItem sx={{ pl: 7 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>ช่วงเวลา (วินาที)</InputLabel>
                      <Select
                        value={systemSettings.refreshInterval}
                        label="ช่วงเวลา (วินาที)"
                        onChange={(e) => setSystemSettings({ ...systemSettings, refreshInterval: Number(e.target.value) })}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value={10}>10 วินาที</MenuItem>
                        <MenuItem value={30}>30 วินาที</MenuItem>
                        <MenuItem value={60}>1 นาที</MenuItem>
                        <MenuItem value={300}>5 นาที</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItem>
                )}
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon sx={{ color: theme.palette.info.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="มุมมองแบบกะทัดรัด"
                    secondary="แสดงข้อมูลในรูปแบบที่กะทัดรัดมากขึ้น"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={systemSettings.compactView}
                      onChange={(e) => setSystemSettings({ ...systemSettings, compactView: e.target.checked })}
                      color="info"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Stack>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={currentTab} index={3}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                ความปลอดภัย
              </Typography>
              
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                การตั้งค่าความปลอดภัยจะถูกพัฒนาในเวอร์ชันถัดไป รวมถึงการเปลี่ยนรหัสผ่าน การตั้งค่า 2FA และการจัดการเซสชัน
              </Alert>
              
              <Box 
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3
                }}
              >
                <Card>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <SecurityIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      เปลี่ยนรหัสผ่าน
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      อัปเดตรหัสผ่านของคุณเพื่อความปลอดภัย
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ borderRadius: 2 }}
                      disabled
                    >
                      ยังไม่พร้อมใช้งาน
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <SecurityIcon sx={{ fontSize: 48, color: theme.palette.secondary.main, mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      การยืนยันตัวตนแบบ 2 ขั้นตอน
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      เพิ่มความปลอดภัยด้วย 2FA
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ borderRadius: 2 }}
                      disabled
                    >
                      ยังไม่พร้อมใช้งาน
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SettingsPage;