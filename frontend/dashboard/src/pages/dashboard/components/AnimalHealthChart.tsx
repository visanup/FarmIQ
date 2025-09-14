import { Box, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard } from './ChartCard';

export const AnimalHealthChart = () => {
  const theme = useTheme();

  const healthData = [
    { name: 'สุขภาพดี', value: 75, color: theme.palette.success.main },
    { name: 'ป่วยเล็กน้อย', value: 15, color: theme.palette.warning.main },
    { name: 'ป่วยหนัก', value: 8, color: theme.palette.error.main },
    { name: 'ตาย', value: 2, color: theme.palette.grey[500] },
  ];

  return (
    <ChartCard title="สถานะสุขภาพสัตว์">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={healthData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {healthData.map((entry, index) => (
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
