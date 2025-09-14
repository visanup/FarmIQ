import React from 'react';
import { Box, Typography, TextField, Button, Card, CardHeader, CardContent, Grid, Stack } from '@mui/material';

const SecuritySettings = () => {
    return (
        <Card sx={{ borderRadius: 0 }}>
            <CardHeader
                title="Security"
                subheader="Manage your password and secure your account."
            />
            <CardContent>
                <Stack spacing={3}>
                    <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        variant="outlined"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained">Update Password</Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default SecuritySettings;
