import { Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard } from './ChartCard';

const healthData = [
  { name: 'สุขภาพดี', value: 75, color: '#4caf50' },
  { name: 'ป่วยเล็กน้อย', value: 15, color: '#ff9800' },
  { name: 'ป่วยหนัก', value: 8, color: '#f44336' },
  { name: 'ตาย', value: 2, color: '#9e9e9e' },
];

export const AnimalHealthChart = () => {
  return (
    <ChartCard title="สถานะสุขภาพสัตว์">
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  );
};
