'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  calls?: number;
  duration?: number;
}

interface CallChartProps {
  data: ChartDataPoint[];
  metric: 'calls' | 'duration';
}

export default function CallChart({ data, metric }: CallChartProps) {
  const metricConfig = {
    calls: {
      dataKey: 'calls',
      name: 'Number of Calls',
      stroke: '#4F46E5', // Indigo
    },
    duration: {
      dataKey: 'duration',
      name: 'Average Duration (s)',
      stroke: '#10B981', // Emerald
    },
  };

  const currentMetric = metricConfig[metric];

  return (
    <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm" style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={currentMetric.dataKey}
            name={currentMetric.name}
            stroke={currentMetric.stroke}
            strokeWidth={2}
            dot={{ r: 4, fill: currentMetric.stroke }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
