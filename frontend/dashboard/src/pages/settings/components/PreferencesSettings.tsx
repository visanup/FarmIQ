import React from 'react';
import {
    Card, CardHeader, CardContent, FormControl, InputLabel,
    Select, MenuItem, Stack
} from '@mui/material';

const PreferencesSettings = () => {
    return (
        <Card sx={{ borderRadius: 0 }}>
            <CardHeader
                title="Preferences"
                subheader="Customize the application appearance."
            />
            <CardContent>
                <Stack spacing={3}>
                    <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select label="Language" defaultValue="en">
                            <MenuItem value="en">English (United States)</MenuItem>
                            <MenuItem value="th">Thai (ภาษาไทย)</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Timezone</InputLabel>
                        <Select label="Timezone" defaultValue="Asia/Bangkok">
                            <MenuItem value="Asia/Bangkok">(GMT+07:00) Bangkok</MenuItem>
                            <MenuItem value="UTC">UTC</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default PreferencesSettings;
