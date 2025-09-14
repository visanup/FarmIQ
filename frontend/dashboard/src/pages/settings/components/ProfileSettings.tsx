import React from 'react';
import { Box, Typography, TextField, Button, Avatar, Card, CardHeader, CardContent, Grid, Alert } from '@mui/material';
import { useAuthStore } from '../../../stores/authStore';

const ProfileSettings = () => {
    const { user } = useAuthStore();

    return (
        <Card sx={{ borderRadius: 0 }}>
            <CardHeader
                title="Profile Information"
                subheader="Update your personal details here."
            />
            <CardContent>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm="auto">
                        <Avatar
                            sx={{ width: 80, height: 80, bgcolor: 'primary.light', color: 'primary.main', fontSize: '2rem' }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                    </Grid>
                    <Grid item xs={12} sm>
                        <Button variant="outlined" component="label">
                            Upload Photo
                            <input type="file" hidden />
                        </Button>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Allowed *.jpeg, *.jpg, *.png, *.gif max size of 3.1 MB
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            defaultValue={user?.name || 'Demo User'}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            defaultValue={user?.email || 'demo@farmiq.com'}
                            variant="outlined"
                            disabled
                        />
                    </Grid>
                     <Grid item xs={12}>
                        <Alert severity="info">
                            Changes will be reflected across the application after saving.
                        </Alert>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained">Save Changes</Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default ProfileSettings;
