import React from 'react';
import {
    Typography, Card, CardHeader, CardContent, FormGroup, FormControlLabel,
    Switch, Divider, Stack
} from '@mui/material';

const NotificationSettings = () => {
    return (
        <Card sx={{ borderRadius: 0 }}>
            <CardHeader
                title="Notifications"
                subheader="Manage how you receive notifications."
            />
            <CardContent>
                <Stack spacing={2} divider={<Divider />}>
                    <FormGroup>
                        <Typography variant="subtitle2" gutterBottom>System Alerts</Typography>
                        <FormControlLabel
                            control={<Switch defaultChecked />}
                            label="Email Notifications"
                            labelPlacement="start"
                            sx={{ justifyContent: 'space-between', ml: 0 }}
                        />
                        <FormControlLabel
                            control={<Switch />}
                            label="Push Notifications"
                            labelPlacement="start"
                            sx={{ justifyContent: 'space-between', ml: 0 }}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Typography variant="subtitle2" gutterBottom sx={{ pt: 2 }}>Weekly Reports</Typography>
                        <FormControlLabel
                            control={<Switch defaultChecked />}
                            label="Email Summaries"
                            labelPlacement="start"
                            sx={{ justifyContent: 'space-between', ml: 0 }}
                        />
                    </FormGroup>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default NotificationSettings;
