import { Box, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard } from './ChartCard';

export const DeviceStatusChart = () => {
  const theme = useTheme();

  const pieData = [
    { name: 'ออนไลน์', value: 10, color: theme.palette.success.main },
    { name: 'ออฟไลน์', value: 2, color: theme.palette.error.main },
  ];

  return (
    <ChartCard title="สถานะอุปกรณ์" dense height={340} contentPadding={12}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
