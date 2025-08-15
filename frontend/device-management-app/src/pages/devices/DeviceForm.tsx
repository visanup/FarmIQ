// /src/pages/devices/DeviceForm.tsx

import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  Devices,
  GroupWork,
  Category,
  Label,
  Fingerprint,
  CalendarToday,
  Build,
  History,
  Place,
  Home,
  SettingsApplications,
  Code,
  ListAlt,
  Tune,
  Save,
  Cancel,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import {
  deviceApi,
  Device as ApiDevice,
  DeviceGroup,
  DeviceType,
} from '../../utils/api/device';

type FormState = Omit<
  ApiDevice,
  | 'install_date'
  | 'calibration_date'
  | 'last_maintenance'
  | 'purchase_date'
  | 'warranty_expiry'
  | 'last_seen'
  | 'build_date'
  | 'created_at'
  | 'specs'
  | 'config'
  | 'credentials'
> & {

  install_date: Date | null;
  calibration_date: Date | null;
  last_maintenance: Date | null;
  purchase_date: Date | null;
  warranty_expiry: Date | null;
  last_seen: Date | null;
  build_date: Date | null;
  specs: string;
  config: string;
  credentials: string;
};

export default function DeviceForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [groups, setGroups] = useState<DeviceGroup[]>([]);
  const [types, setTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());

  const [form, setForm] = useState<FormState>({
    house_id: 0,
    group_id: null,
    type_id: null,
    model: '',
    serial_number: '',
    install_date: null,
    calibration_date: null,
    last_maintenance: null,
    location_detail: '',
    manufacturer: '',
    purchase_date: null,
    warranty_expiry: null,
    specs: '{}',
    location_latitude: null,
    location_longitude: null,
    firmware_version: '',
    ip_address: '',
    mac_address: '',
    last_seen: null,
    tags: [] as string[],
    config: '{}',
    credentials: '{}',
    build_code: '',
    build_date: null,
    status: 'active',
  });

  useEffect(() => {
    (async () => {
      try {
        const [gList, tList] = await Promise.all([
          deviceApi.groups.list(),
          deviceApi.types.list(),
        ]);
        setGroups(gList);
        setTypes(tList);
        if (isEdit && id) {
          const dev = await deviceApi.devices.get(Number(id));
          setForm({
            ...dev,
            install_date: dev.install_date ? new Date(dev.install_date) : null,
            calibration_date: dev.calibration_date ? new Date(dev.calibration_date) : null,
            last_maintenance: dev.last_maintenance ? new Date(dev.last_maintenance) : null,
            purchase_date: dev.purchase_date ? new Date(dev.purchase_date) : null,
            warranty_expiry: dev.warranty_expiry ? new Date(dev.warranty_expiry) : null,
            last_seen: dev.last_seen ? new Date(dev.last_seen) : null,
            build_date: dev.build_date ? new Date(dev.build_date) : null,
            specs: JSON.stringify(dev.specs, null, 2),
            config: JSON.stringify(dev.config, null, 2),
            credentials: JSON.stringify(dev.credentials, null, 2),
          });
          setCreatedAt(dev.created_at);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toPayload = (f: FormState): ApiDevice => ({
    ...f,
    install_date: f.install_date?.toISOString() ?? null,
    calibration_date: f.calibration_date?.toISOString() ?? null,
    last_maintenance: f.last_maintenance?.toISOString() ?? null,
    purchase_date: f.purchase_date?.toISOString() ?? null,
    warranty_expiry: f.warranty_expiry?.toISOString() ?? null,
    last_seen: f.last_seen?.toISOString() ?? null,
    build_date: f.build_date?.toISOString() ?? null,
    specs: JSON.parse(f.specs),
    config: JSON.parse(f.config),
    credentials: JSON.parse(f.credentials),
    created_at: createdAt,
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await deviceApi.devices.update(Number(id), toPayload(form));
      } else {
        await deviceApi.devices.create(toPayload(form));
      }
      navigate('/devices');
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Title */}
      <Box display="flex" alignItems="center" mb={2}>
        <Devices color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">
          {isEdit ? 'Edit Device' : 'Create Device'}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={onSubmit} noValidate>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {/* === Basic Info === */}
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center">
                <ListAlt sx={{ mr: 1 }} />
                <Typography variant="h6">Basic Info</Typography>
              </Box>
              <Divider />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="House ID"
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home />
                      </InputAdornment>
                    ),
                  }}
                  value={form.house_id}
                  onChange={e => handleChange('house_id', Number(e.target.value))}
                />
                <FormControl fullWidth>
                  <InputLabel>Group</InputLabel>
                  <Select
                    label="Group"
                    value={form.group_id ?? ''}
                    onChange={e => handleChange('group_id', e.target.value || null)}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {groups.map(g => (
                      <MenuItem key={g.group_id} value={g.group_id}>
                        <GroupWork sx={{ mr: 1 }} /> {g.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    value={form.type_id ?? ''}
                    onChange={e => handleChange('type_id', e.target.value || null)}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {types.map(t => (
                      <MenuItem key={t.type_id} value={t.type_id}>
                        <Category sx={{ mr: 1 }} /> {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Model"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Label />
                      </InputAdornment>
                    ),
                  }}
                  value={form.model}
                  onChange={e => handleChange('model', e.target.value)}
                />
                <TextField
                  label="Serial Number"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Fingerprint />
                      </InputAdornment>
                    ),
                  }}
                  value={form.serial_number}
                  onChange={e => handleChange('serial_number', e.target.value)}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* === Key Dates === */}
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center">
                <CalendarToday sx={{ mr: 1 }} />
                <Typography variant="h6">Key Dates</Typography>
              </Box>
              <Divider />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <DatePicker
                  label="Install Date"
                  value={form.install_date}
                  onChange={d => handleChange('install_date', d)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  label="Calibration Date"
                  value={form.calibration_date}
                  onChange={d => handleChange('calibration_date', d)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  label="Last Maintenance"
                  value={form.last_maintenance}
                  onChange={d => handleChange('last_maintenance', d)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <DatePicker
                  label="Purchase Date"
                  value={form.purchase_date}
                  onChange={d => handleChange('purchase_date', d)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  label="Warranty Expiry"
                  value={form.warranty_expiry}
                  onChange={d => handleChange('warranty_expiry', d)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  label="Last Seen"
                  value={form.last_seen}
                  onChange={d => handleChange('last_seen', d)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* === Location & Network === */}
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center">
                <Place sx={{ mr: 1 }} />
                <Typography variant="h6">Location & Network</Typography>
              </Box>
              <Divider />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Location Detail"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Place />
                      </InputAdornment>
                    ),
                  }}
                  value={form.location_detail}
                  onChange={e => handleChange('location_detail', e.target.value)}
                />
                <TextField
                  label="Latitude"
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Place />
                      </InputAdornment>
                    ),
                  }}
                  value={form.location_latitude ?? ''}
                  onChange={e => handleChange('location_latitude', +e.target.value)}
                />
                <TextField
                  label="Longitude"
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Place />
                      </InputAdornment>
                    ),
                  }}
                  value={form.location_longitude ?? ''}
                  onChange={e => handleChange('location_longitude', +e.target.value)}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* === Firmware & Credentials === */}
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center">
                <SettingsApplications sx={{ mr: 1 }} />
                <Typography variant="h6">Firmware & Credentials</Typography>
              </Box>
              <Divider />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Firmware Version"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Build />
                      </InputAdornment>
                    ),
                  }}
                  value={form.firmware_version}
                  onChange={e => handleChange('firmware_version', e.target.value)}
                />
                <TextField
                  label="IP Address"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Code />
                      </InputAdornment>
                    ),
                  }}
                  value={form.ip_address}
                  onChange={e => handleChange('ip_address', e.target.value)}
                />
                <TextField
                  label="MAC Address"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Code />
                      </InputAdornment>
                    ),
                  }}
                  value={form.mac_address}
                  onChange={e => handleChange('mac_address', e.target.value)}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* === Tags & JSON Configs === */}
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center">
                <Tune sx={{ mr: 1 }} />
                <Typography variant="h6">Tags & Config</Typography>
              </Box>
              <Divider />

              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={form.tags}
                onChange={(_, v) => handleChange('tags', v)}
                renderTags={(value, getTagProps) =>
                    value.map((option, idx) => (
                    // เอา key={idx} ออก
                    <Chip
                        {...getTagProps({ index: idx })}
                        label={option}
                    />
                    ))
                }
                renderInput={params => (
                    <TextField
                    {...params}
                    label="Tags"
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                        <>
                            <InputAdornment position="start">
                            <Label />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                        </>
                        ),
                    }}
                    />
                )}
                />


              <TextField
                label="Specs (JSON)"
                fullWidth
                multiline
                minRows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ListAlt />
                    </InputAdornment>
                  ),
                }}
                value={form.specs}
                onChange={e => handleChange('specs', e.target.value)}
              />
              <TextField
                label="Config (JSON)"
                fullWidth
                multiline
                minRows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SettingsApplications />
                    </InputAdornment>
                  ),
                }}
                value={form.config}
                onChange={e => handleChange('config', e.target.value)}
              />
              <TextField
                label="Credentials (JSON)"
                fullWidth
                multiline
                minRows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SettingsApplications />
                    </InputAdornment>
                  ),
                }}
                value={form.credentials}
                onChange={e => handleChange('credentials', e.target.value)}
              />
            </Stack>
          </Paper>

          {/* === Other Settings (Status only) === */}
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center">
                <Tune sx={{ mr: 1 }} />
                <Typography variant="h6">Other Settings</Typography>
              </Box>
              <Divider />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* === Actions === */}
          <Box textAlign="center" mb={4}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={saving}
              sx={{ width: 200, mr: 2 }}
            >
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate('/devices')}
              sx={{ width: 200 }}
            >
              Cancel
            </Button>
          </Box>
        </LocalizationProvider>
      </form>
    </Box>
  );
}

