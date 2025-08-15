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
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { deviceApi } from '../../utils/api/device';

// Align local type with API: note can be null
interface DeviceGroup {
  group_id: number;
  name: string;
  note?: string | null;
}

export default function DeviceGroups() {
  const [groups, setGroups] = useState<DeviceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editGroup, setEditGroup] = useState<DeviceGroup | null>(null);
  const [name, setName] = useState('');
  const [note, setNote] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Filter state
  const [filterText, setFilterText] = useState('');

  // Columns definition for DataGrid
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'note', headerName: 'Note', flex: 2 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row as DeviceGroup)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDelete((params.row as DeviceGroup).group_id)}
        />,
      ],
    },
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await deviceApi.groups.list();
      setGroups(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load device groups');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenDialog = (group?: DeviceGroup) => {
    if (group) {
      setEditGroup(group);
      setName(group.name);
      setNote(group.note || '');
    } else {
      setEditGroup(null);
      setName('');
      setNote('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Name is required');
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      if (editGroup) {
        await deviceApi.groups.update(editGroup.group_id, { name, note });
        setSuccessMsg('Device group updated successfully.');
      } else {
        await deviceApi.groups.create({ name, note });
        setSuccessMsg('Device group created successfully.');
      }
      await fetchGroups();
      setOpenDialog(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save device group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group_id: number) => {
    if (!window.confirm('Are you sure you want to delete this device group?')) return;
    setErrorMsg(null);
    try {
      await deviceApi.groups.remove(group_id);
      setSuccessMsg('Device group deleted successfully.');
      await fetchGroups();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete device group');
    }
  };

  // Filtered rows based on search text
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(filterText.toLowerCase()) ||
    (g.note && g.note.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <GroupIcon fontSize="large" sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">Manage Groups</Typography>
      </Box>

      <Toolbar disableGutters sx={{ justifyContent: 'space-between', mb: 2 }}>
        <TextField
          placeholder="Search device groups"
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Group
        </Button>
      </Toolbar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={filteredGroups}
            columns={columns}
            getRowId={(row) => row.group_id}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
          />
        </div>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg(null)}
      >
        <Alert severity="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg(null)}
      >
        <Alert severity="success" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editGroup ? 'Edit Device Group' : 'Add Device Group'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Note"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
