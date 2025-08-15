import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Toolbar,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

// Adjust this interface to match backend payload
interface AlertRecord {
  id: number;
  device_id: number;
  type: string;
  message: string;
  created_at: string;
}

const API_URL = process.env.REACT_APP_DATA_SERVICE_URL!;
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/alerts`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data: AlertRecord[] = await res.json();
      setAlerts(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleRefresh = () => fetchAlerts();

  const filteredRows = alerts.filter(a =>
    a.type.toLowerCase().includes(filterText.toLowerCase()) ||
    a.message.toLowerCase().includes(filterText.toLowerCase()) ||
    String(a.device_id).includes(filterText)
  );

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'device_id', headerName: 'Device', width: 100 },
    { field: 'type', headerName: 'Alert Type', flex: 1 },
    { field: 'message', headerName: 'Message', flex: 2 },
    {
      field: 'created_at',
      headerName: 'Timestamp',
      flex: 1.5,
      renderCell: (params: GridRenderCellParams<AlertRecord>) => (
        <Typography variant="body2">
          {new Date(params.row.created_at).toLocaleString()}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      {/* Page Header */}
      <Box display="flex" alignItems="center" mb={2}>
        <NotificationsActiveIcon fontSize="large" sx={{ color: 'primary.main', mr: 1 }} />
        <Typography variant="h5">System Alerts</Typography>
      </Box>

      {/* Alerts Panel */}
      <Paper elevation={1} sx={{ mb: 2, p: 1 }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <TextField
            placeholder="Search alerts..."
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
            }}
            sx={{ width: 300 }}
          />
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </Paper>

      {/* Data Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={1} sx={{ height: 600, width: '100%', p: 1 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.id}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            autoHeight
          />
        </Paper>
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
    </Box>
  );
}

