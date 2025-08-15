// /src/pages/devices/DeviceList.tsx

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
} from '@mui/x-data-grid';
import DevicesIcon from '@mui/icons-material/Devices';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

import { deviceApi, Device as ApiDevice } from '../../utils/api/device';

interface DeviceRow {
  id: number;
  device_id?: number;
  model?: string;
  serial_number?: string;
  status?: string;
  manufacturer?: string | null;
  installed: string;
  groupId?: number | null;
  typeId?: number | null;
}

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

/**
 * DeviceList
 *
 * Professional list of devices with search, refresh, and
 * actions to view/edit. Icons provided for clarity.
 */
const DeviceList: React.FC = () => {
  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch devices from API
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: ApiDevice[] = await deviceApi.devices.list();
      const mapped = data.map<DeviceRow>(d => ({
        id:            d.device_id!,
        device_id:     d.device_id,
        model:         d.model,
        serial_number: d.serial_number,
        status:        d.status,
        manufacturer:  d.manufacturer,
        installed:     d.install_date
                          ? new Date(d.install_date).toLocaleDateString()
                          : '—',
        groupId:       (d as any).group_id ?? null,
        typeId:        (d as any).type_id  ?? null,
      }));
      setRows(mapped);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Navigation actions
  const navigateToDetail = (id: number) => navigate(`/devices/${id}`);
  const navigateToEdit   = (id: number) => navigate(`/devices/edit/${id}`);
  const navigateToNew    = ()       => navigate('/devices/new');

  // Filter rows by search term
  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r =>
      `${r.model ?? ''} ${r.serial_number ?? ''}`
        .toLowerCase()
        .includes(term)
    );
  }, [rows, searchTerm]);

  // Column definitions with action icons
  const columns: GridColDef[] = [
    { field: 'id',            headerName: 'ID',             width: 80 },
    { field: 'model',         headerName: 'Model',          width: 180 },
    { field: 'serial_number', headerName: 'Serial Number',  width: 180 },
    { field: 'status',        headerName: 'Status',         width: 120 },
    { field: 'manufacturer',  headerName: 'Manufacturer',   width: 150 },
    { field: 'installed',     headerName: 'Install Date',   width: 130 },
    { field: 'groupId',       headerName: 'Group ID',       width: 120 },
    { field: 'typeId',        headerName: 'Type ID',        width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => navigateToDetail(row.id)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => navigateToEdit(row.id)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with title, refresh, and add */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Box display="flex" alignItems="center">
          <DevicesIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">All Devices List</Typography>
        </Box>
        <Box>
          <IconButton onClick={fetchDevices}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={navigateToNew}
            sx={{ ml: 1 }}
          >
            Add Device
          </Button>
        </Box>
      </Box>

      {/* Search Input */}
      <Paper
        elevation={1}
        sx={{ mb: 2, maxWidth: 400, p: 1 }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder="Search model or serial…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Data Grid or Loading */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          autoHeight
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: DEFAULT_PAGE_SIZE,
                page:     0,
              },
            },
          }}
          pagination
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': { py: 1 },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'background.paper' },
          }}
        />
      )}
    </Box>
  );
};

export default DeviceList;
