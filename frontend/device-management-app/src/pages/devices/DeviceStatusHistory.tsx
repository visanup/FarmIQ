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
import TimelineIcon from '@mui/icons-material/Timeline';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';
import { deviceApi, DeviceStatusHistory as StatusRecord } from '../../utils/api/device';

export default function DeviceStatusHistory() {
  const { id } = useParams<{ id: string }>();
  const deviceId = Number(id);

  const [records, setRecords] = useState<StatusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await deviceApi.statusHistory.list(deviceId);
      setRecords(list);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load status history');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleRefresh = () => fetchRecords();

  const filteredRows = records.filter((rec) =>
    rec.status.toLowerCase().includes(filterText.toLowerCase()) ||
    (rec.performed_by || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (rec.note || '').toLowerCase().includes(filterText.toLowerCase())
  );

  const columns: GridColDef<StatusRecord>[] = [
    {
      field: 'changed_at',
      headerName: 'Changed At',
      flex: 1.5,
      renderCell: (params: GridRenderCellParams<StatusRecord>) => (
        <span>{new Date(params.row.changed_at).toLocaleString()}</span>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
    },
    {
      field: 'performed_by',
      headerName: 'Performed By',
      flex: 1,
      renderCell: (params: GridRenderCellParams<StatusRecord>) => (
        <span>{params.row.performed_by || '-'}</span>
      ),
    },
    {
      field: 'note',
      headerName: 'Note',
      flex: 2,
      renderCell: (params: GridRenderCellParams<StatusRecord>) => (
        <span>{params.row.note || '-'}</span>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar disableGutters sx={{ justifyContent: 'space-between', mb: 2 }}>
        <Box display="flex" alignItems="center">
          <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Status History</Typography>
        </Box>
        <Box>
          <TextField
            placeholder="Search history"
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
          <DataGrid<StatusRecord>
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.id}
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
