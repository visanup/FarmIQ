// /src/pages/devices/DeviceDetail.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Stack,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBackIos,
  Refresh,
  MoreVert,
  Fingerprint,
  CalendarToday,
  History,
  Home,
  Category,
  Info,
  Build,
  GroupWork,
  Edit as EditIcon,
} from '@mui/icons-material';

import { deviceApi, Device as ApiDevice } from '../../utils/api/device';

interface StatusHistory {
  id: number;
  performed_by: string;
  status: string;
  changed_at: string;
  note: string;
}

interface DeviceTypeInfo {
  name: string;
  default_image_url: string;
}

interface DeviceGroupInfo {
  name: string;
  note: string;
  category: string;
}

interface DeviceDetailType extends ApiDevice {
  type?: DeviceTypeInfo;
  group?: DeviceGroupInfo;
  status_history?: StatusHistory[];
}

const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<DeviceDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (val?: string | Date | null) => {
    if (!val) return '—';
    const d = val instanceof Date ? val : new Date(val);
    return d.toLocaleDateString();
  };

  useEffect(() => {
    if (!id) {
      setError('Invalid device ID');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = (await deviceApi.devices.get(Number(id))) as DeviceDetailType;
        setDevice(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load device');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIos />}
          sx={{ mt: 2 }}
          onClick={() => navigate('/devices')}
        >
          Back to Devices
        </Button>
      </Box>
    );
  }

  if (!device) return null;

  // Summary fields for the mini-list
  const summaryFields: [string, React.ReactNode][] = [
    ['Serial Number', device.serial_number || '—'],
    ['Install Date', formatDate(device.install_date)],
    ['Last Seen', formatDate(device.last_seen)],
    ['Manufacturer', device.manufacturer || '—'],
    ['Location', device.location_detail || '—'],
  ];

  // Full-detail fields
  const detailFields: [string, React.ReactNode][] = [
    ['Calibration Date', formatDate(device.calibration_date)],
    ['Last Maintenance', formatDate(device.last_maintenance)],
    ['Purchase Date', formatDate(device.purchase_date)],
    ['Warranty Expiry', formatDate(device.warranty_expiry)],
    ['House ID', device.house_id?.toString() ?? '—'],
    ['Type ID', device.type_id?.toString() ?? '—'],
    ['Group ID', device.group_id?.toString() ?? '—'],
    [
      'Created At',
      device.created_at
        ? new Date(device.created_at).toLocaleString()
        : '—',
    ],
  ];

  return (
    <Stack
      spacing={4}
      sx={{
        pt: 10,
        px: 3,
        pb: 3,
      }}
    >
      {/* Header with actions */}
      <Box display="flex" alignItems="center">
        <IconButton onClick={() => navigate('/devices')}>
          <ArrowBackIos />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Device Detail — {device.model}
        </Typography>
        <IconButton onClick={() => window.location.reload()}>
          <Refresh />
        </IconButton>
        <IconButton>
          <MoreVert />
        </IconButton>
      </Box>

      {/* Subtitle */}
      <Typography variant="body2" color="textSecondary">
        View and manage all key information for this device, including status, dates, and history.
      </Typography>

      {/* Main Card */}
      <Card elevation={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ p: 2 }}
        >
          {device.type?.default_image_url && (
            <CardMedia
              component="img"
              image={device.type.default_image_url}
              alt={device.type.name}
              sx={{
                width: { xs: '100%', md: 300 },
                height: 300,
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          )}

          {/* Summary List */}
          <Box sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {device.type?.name || 'Device'}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                <Info sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Status: {device.status}
              </Typography>

              <List disablePadding>
                {summaryFields.map(([label, value]) => (
                  <ListItem key={label} disableGutters>
                    <ListItemIcon>
                      {{
                        'Serial Number': <Fingerprint />,
                        'Install Date': <CalendarToday />,
                        'Last Seen': <History />,
                        Manufacturer: <Category />,
                        Location: <Home />,
                      }[label]}
                    </ListItemIcon>
                    <ListItemText primary={label} secondary={value} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Box>
        </Stack>
      </Card>

      {/* Full Details */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Build sx={{ mr: 1 }} />
          <Typography variant="h6">Full Details</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box
          component="dl"
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {detailFields.map(([label, value]) => (
            <React.Fragment key={label}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                {label}
              </Typography>
              <Typography component="dd">{value}</Typography>
            </React.Fragment>
          ))}
        </Box>
      </Paper>

      {/* Group Information */}
      {device.group && (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <GroupWork sx={{ mr: 1 }} />
            <Typography variant="h6">Group Information</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1}>
            <Typography>
              <strong>Name:</strong> {device.group.name}
            </Typography>
            <Typography>
              <strong>Note:</strong> {device.group.note}
            </Typography>
            <Typography>
              <strong>Category:</strong> {device.group.category}
            </Typography>
          </Stack>
        </Paper>
      )}

      {/* Status History */}
      {device.status_history?.length ? (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <History sx={{ mr: 1 }} />
            <Typography variant="h6">Status History</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {device.status_history.map((h) => (
              <Box key={h.id}>
                <Typography variant="body2">
                  <strong>{formatDate(h.changed_at)}</strong> — {h.status}
                </Typography>
                {h.note && (
                  <Typography variant="caption">
                    By {h.performed_by}: {h.note}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Paper>
      ) : null}

      {/* Actions */}
      <Box textAlign="center" sx={{ mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIos />}
          onClick={() => navigate('/devices')}
        >
          Back to Devices
        </Button>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          sx={{ ml: 2 }}
          onClick={() => navigate(`/devices/edit/${device.device_id}`)}
        >
          Edit Device
        </Button>
      </Box>
    </Stack>
  );
};

export default DeviceDetail;
