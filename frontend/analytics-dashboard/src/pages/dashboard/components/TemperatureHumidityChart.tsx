import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard } from './ChartCard';
import { useTheme } from '@mui/material';

const chartData = (() => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
            day: date.toLocaleDateString('th-TH', { weekday: 'short' }),
            temperature: 20 + Math.random() * 10 + Math.sin(i * 0.5) * 3,
            humidity: 60 + Math.random() * 20 + Math.cos(i * 0.3) * 10,
        });
    }
    return data;
})();

export const TemperatureHumidityChart = () => {
  const theme = useTheme();

  return (
    <ChartCard title="อุณหภูมิและความชื้น 7 วัน">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              fontSize: '14px'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="temperature" 
            stackId="1"
            stroke={theme.palette.primary.main}
            fill={theme.palette.primary.main}
            fillOpacity={0.6}
            strokeWidth={3}
          />
          <Area 
            type="monotone" 
            dataKey="humidity" 
            stackId="2"
            stroke={theme.palette.secondary.main}
            fill={theme.palette.secondary.main}
            fillOpacity={0.4}
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
