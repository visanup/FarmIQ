import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard } from './ChartCard';
import { useTheme } from '@mui/material';

const chartData = (() => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
            day: date.toLocaleDateString('th-TH', { weekday: 'short' }),
            production: 25 + Math.random() * 5 + Math.sin(i * 0.2) * 2,
        });
    }
    return data;
})();

export const ProductionChart = () => {
  const theme = useTheme();

  return (
    <ChartCard title="การผลิต 7 วัน" dense height={420} contentPadding={16}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 24, left: 6, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 16, fontWeight: 500, fill: theme.palette.text.secondary }}
            axisLine={{ stroke: theme.palette.divider }}
          />
          <YAxis 
            tick={{ fontSize: 16, fontWeight: 500, fill: theme.palette.text.secondary }}
            axisLine={{ stroke: theme.palette.divider }}
          />
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}
          />
          <Bar 
            dataKey="production" 
            fill={theme.palette.primary.main}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
