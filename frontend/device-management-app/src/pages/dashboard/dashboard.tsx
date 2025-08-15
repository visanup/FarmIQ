// src/pages/dashboard/dashboard.tsx
// src/pages/dashboard/dashboard.tsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { deviceApi, Device } from '../../utils/api/device';

const COLORS = ['#1976d2', '#388e3c', '#d32f2f'];

export default function Dashboard() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDevices() {
            try {
                setLoading(true);
                const list = await deviceApi.devices.list();
                setDevices(list);
            } catch (err: any) {
                setError(err.message || 'Failed to load devices');
            } finally {
                setLoading(false);
            }
        }
        fetchDevices();
    }, []);

    const totalDevices = devices.length;
    const activeDevices = devices.filter((d) => d.status === 'active').length;
    const inactiveDevices = totalDevices - activeDevices;

    const pieData = [
        { name: 'Active', value: activeDevices },
        { name: 'Inactive', value: inactiveDevices },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error" sx={{ fontWeight: 'bold', fontSize: 16 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: 3,
                backgroundColor: '#f9fafb',
                minHeight: '100vh',
                paddingTop: '40px',
                fontFamily: "'Roboto', sans-serif",
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1 }}>
                Overview
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                Here is the summary of your device management status and alerts.
            </Typography>
            {/* Summary Cards */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 5,
                    mb: 6,
                }}
            >
                {/* Total Devices */}
                <Card
                    sx={{
                        bgcolor: 'linear-gradient(135deg, #d0f0c0, #a8d5a0)',
                        borderRadius: 4,
                        boxShadow:
                            '0 6px 20px rgba(88, 151, 79, 0.3), 0 0 6px rgba(88, 151, 79, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        px: 4,
                        py: 2,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.03)' },
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: '#a8d5a0',
                            borderRadius: '50%',
                            p: 2,
                            mr: 3,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <DevicesIcon sx={{ fontSize: 60, color: '#388e3c' }} />
                    </Box>
                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="#4a6540"
                            fontWeight={600}
                            sx={{ textTransform: 'uppercase' }}
                        >
                            Total Devices
                        </Typography>
                        <Typography
                            variant="h2"
                            fontWeight="bold"
                            color="#2e7d32"
                            sx={{ letterSpacing: '0.05em' }}
                        >
                            {totalDevices}
                        </Typography>
                    </Box>
                </Card>

                {/* Active Devices */}
                <Card
                    sx={{
                        bgcolor: 'linear-gradient(135deg, #cfe8fd, #a1c6fc)',
                        borderRadius: 4,
                        boxShadow:
                            '0 6px 20px rgba(48, 110, 204, 0.3), 0 0 6px rgba(48, 110, 204, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        px: 4,
                        py: 2,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.03)' },
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: '#a1c6fc',
                            borderRadius: '50%',
                            p: 2,
                            mr: 3,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <CheckCircleIcon sx={{ fontSize: 60, color: '#1976d2' }} />
                    </Box>
                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="#205e9a"
                            fontWeight={600}
                            sx={{ textTransform: 'uppercase' }}
                        >
                            Active Devices
                        </Typography>
                        <Typography
                            variant="h2"
                            fontWeight="bold"
                            color="#1565c0"
                            sx={{ letterSpacing: '0.05em' }}
                        >
                            {activeDevices}
                        </Typography>
                    </Box>
                </Card>

                {/* Inactive Devices */}
                <Card
                    sx={{
                        bgcolor: 'linear-gradient(135deg, #fdecea, #f9c7c5)',
                        borderRadius: 4,
                        boxShadow:
                            '0 6px 20px rgba(211, 66, 62, 0.3), 0 0 6px rgba(211, 66, 62, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        px: 4,
                        py: 2,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.03)' },
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: '#f9c7c5',
                            borderRadius: '50%',
                            p: 2,
                            mr: 3,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <CancelIcon sx={{ fontSize: 60, color: '#d32f2f' }} />
                    </Box>
                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="#9e2b29"
                            fontWeight={600}
                            sx={{ textTransform: 'uppercase' }}
                        >
                            Inactive Devices
                        </Typography>
                        <Typography
                            variant="h2"
                            fontWeight="bold"
                            color="#b71c1c"
                            sx={{ letterSpacing: '0.05em' }}
                        >
                            {inactiveDevices}
                        </Typography>
                    </Box>
                </Card>
            </Box>

            {/* Chart and Alerts Section */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                    gap: 5,
                }}
            >
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow:
                            '0 8px 22px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                        p: 4,
                        bgcolor: 'white',
                    }}
                >
                    <Typography
                        variant="h6"
                        gutterBottom
                        fontWeight="medium"
                        sx={{ letterSpacing: 1 }}
                    >
                        Device Status Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={110}
                                fill="#8884d8"
                                dataKey="value"
                                isAnimationActive
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `${value} devices`}
                                contentStyle={{ fontSize: 14, fontWeight: 600 }}
                            />
                            <Legend
                                iconType="circle"
                                verticalAlign="bottom"
                                height={36}
                                wrapperStyle={{ fontSize: 14 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow:
                            '0 8px 22px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                        p: 4,
                        bgcolor: 'white',
                    }}
                >
                    <Typography
                        variant="h6"
                        gutterBottom
                        fontWeight="medium"
                        sx={{ letterSpacing: 1 }}
                    >
                        Recent Alerts
                    </Typography>
                    <Box
                        sx={{
                            height: 320,
                            bgcolor: '#f0f0f0',
                            borderRadius: 2,
                            border: '1px solid #ddd',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#999',
                            fontStyle: 'italic',
                        }}
                    >
                        No alerts available
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}