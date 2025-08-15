// src/pages/farm/FarmList.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Container,
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

type Farm = {
  farm_id: number;
  name: string;
  location?: string;
  status?: string;
};

export default function FarmList() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/farms');
      if (!res.ok) throw new Error('Failed to fetch farms');
      const data = await res.json();
      setFarms(data);
    } catch (error) {
      console.error(error);
      // TODO: show error notification
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Farm List</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/farms/new')}>
          Add New Farm
        </Button>
      </Box>

      {loading ? (
        <Box textAlign="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="farm table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {farms.map((farm) => (
                <TableRow key={farm.farm_id} hover>
                  <TableCell>{farm.farm_id}</TableCell>
                  <TableCell>{farm.name}</TableCell>
                  <TableCell>{farm.location ?? '-'}</TableCell>
                  <TableCell>{farm.status ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/farms/${farm.farm_id}/edit`)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {farms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No farms found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
