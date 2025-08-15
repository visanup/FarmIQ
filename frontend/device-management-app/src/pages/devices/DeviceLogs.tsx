// /src\pages\devices\DeviceLogs.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Toolbar,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';
import { deviceApi, DeviceLog } from '../../utils/api/device';

export default function DeviceLogs() {
  const { id } = useParams<{ id: string }>();
  const deviceId = Number(id);

  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await deviceApi.logs.list(deviceId);
      setLogs(list);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load device logs');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => fetchLogs();

  const filteredRows = logs.filter((log) =>
    log.event_type.toLowerCase().includes(filterText.toLowerCase()) ||
    (log.performed_by || '').toLowerCase().includes(filterText.toLowerCase()) ||
    JSON.stringify(log.event_data).toLowerCase().includes(filterText.toLowerCase())
  );

  const columns: GridColDef[] = [
    {
      field: 'created_at',
      headerName: 'Timestamp',
      flex: 1.5,
      renderCell: (params: GridRenderCellParams<DeviceLog>) => (
        <span>{new Date(params.row.created_at).toLocaleString()}</span>
      ),
    },
    {
      field: 'event_type',
      headerName: 'Event Type',
      flex: 1,
    },
    {
      field: 'performed_by',
      headerName: 'Performed By',
      flex: 1,
      renderCell: (params: GridRenderCellParams<DeviceLog>) => (
        <span>{params.row.performed_by || '-'}</span>
      ),
    },
    {
      field: 'event_data',
      headerName: 'Details',
      flex: 2,
      renderCell: (params: GridRenderCellParams<DeviceLog>) => (
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
          {JSON.stringify(params.row.event_data, null, 2)}
        </pre>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar disableGutters sx={{ justifyContent: 'space-between', mb: 2 }}>
        <Box display="flex" alignItems="center">
          <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Logs</Typography>
        </Box>
        <Box>
          <TextField
            placeholder="Search logs"
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
            }}
            sx={{ mr: 1 }}
          />
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid<DeviceLog>
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.log_id}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            autoHeight
          />
        </Box>
      )}

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

