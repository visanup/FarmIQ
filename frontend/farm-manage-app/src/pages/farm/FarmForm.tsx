// src/pages/farm/FarmForm.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, TextField, Typography, CircularProgress,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

type Farm = {
  farm_id?: number;
  name: string;
  location?: string;
  status?: string;
};

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function FarmForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [farm, setFarm] = useState<Farm>({
    name: '',
    location: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetch(`/api/farms/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch farm');
          return res.json();
        })
        .then((data) => {
          setFarm(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFarm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(isEdit ? `/api/farms/${id}` : '/api/farms', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save farm');
      }

      navigate('/farms');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" mb={3}>
        {isEdit ? 'Edit Farm' : 'Add New Farm'}
      </Typography>

      {error && (
        <Box mb={2} color="error.main" fontWeight="bold">
          {error}
        </Box>
      )}

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={farm.name}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Location"
          name="location"
          value={farm.location}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        <TextField
          select
          label="Status"
          name="status"
          value={farm.status}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={() => navigate('/farms')}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
