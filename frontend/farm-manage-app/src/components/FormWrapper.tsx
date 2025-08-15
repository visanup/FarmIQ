import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

interface Props { title: string; children: React.ReactNode }

export default function FormWrapper({ title, children }: Props) {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h5" gutterBottom>{title}</Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {children}
        </Box>
      </Paper>
    </Container>
  );
}