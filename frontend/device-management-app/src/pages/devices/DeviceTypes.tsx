import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Toolbar,
  InputAdornment,
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef, GridActionsCellItem, GridRenderCellParams } from '@mui/x-data-grid';
import { deviceApi, DeviceType as ApiDeviceType } from '../../utils/api/device';

export default function DeviceTypes() {
  const [deviceTypes, setDeviceTypes] = useState<ApiDeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingType, setEditingType] = useState<ApiDeviceType | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    icon_css_class: '',
    default_image_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [filterText, setFilterText] = useState('');

  const fetchDeviceTypes = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const types = await deviceApi.types.list();
      setDeviceTypes(types);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load device types');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeviceTypes();
  }, [fetchDeviceTypes]);

  const handleOpenDialog = (type?: ApiDeviceType) => {
    if (type) {
      setEditingType(type);
      setFormValues({
        name: type.name,
        icon_css_class: type.icon_css_class || '',
        default_image_url: type.default_image_url || '',
      });
    } else {
      setEditingType(null);
      setFormValues({ name: '', icon_css_class: '', default_image_url: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (field: keyof typeof formValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!formValues.name.trim()) {
      setErrorMsg('Name is required');
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      if (editingType) {
        await deviceApi.types.update(editingType.type_id, formValues);
        setSuccessMsg('Device type updated successfully.');
      } else {
        await deviceApi.types.create(formValues);
        setSuccessMsg('Device type created successfully.');
      }
      await fetchDeviceTypes();
      setOpenDialog(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save device type');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this device type?')) return;
    setErrorMsg(null);
    try {
      await deviceApi.types.remove(id);
      setSuccessMsg('Device type deleted successfully.');
      await fetchDeviceTypes();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete device type');
    }
  };

  const filtered = deviceTypes.filter((dt) =>
    dt.name.toLowerCase().includes(filterText.toLowerCase()) ||
    (dt.icon_css_class?.toLowerCase().includes(filterText.toLowerCase()) ?? false)
  );

  const columns: GridColDef[] = [
    { field: 'type_id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'icon_css_class',
      headerName: 'Icon',
      flex: 1,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? <i className={String(params.value)} /> : <Typography color="text.secondary">N/A</Typography>,
    },
    {
      field: 'default_image_url',
      headerName: 'Image',
      flex: 1,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <img
            src={String(params.value)}
            alt="default"
            style={{ maxHeight: 40, maxWidth: 80, objectFit: 'contain' }}
          />
        ) : (
          <Typography color="text.secondary">N/A</Typography>
        ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row as ApiDeviceType)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDelete((params.row as ApiDeviceType).type_id)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <DevicesIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">Manage Types</Typography>
      </Box>

      <Toolbar disableGutters sx={{ justifyContent: 'space-between', mb: 2 }}>
        <TextField
          placeholder="Search types"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Type
        </Button>
      </Toolbar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            getRowId={(row) => (row as ApiDeviceType).type_id}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
          />
        </Box>
      )}

      <Snackbar open={!!errorMsg} autoHideDuration={6000} onClose={() => setErrorMsg(null)}>
        <Alert severity="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>
      <Snackbar open={!!successMsg} autoHideDuration={6000} onClose={() => setSuccessMsg(null)}>
        <Alert severity="success" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingType ? 'Edit Device Type' : 'Add Device Type'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Name"
            fullWidth
            required
            value={formValues.name}
            onChange={handleChange('name')}
          />
          <TextField
            margin="normal"
            label="Icon CSS Class"
            fullWidth
            value={formValues.icon_css_class}
            onChange={handleChange('icon_css_class')}
          />
          <TextField
            margin="normal"
            label="Default Image URL"
            fullWidth
            value={formValues.default_image_url}
            onChange={handleChange('default_image_url')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editingType ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
