import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlySpending, DailySpending, WeeklySpending } from '@/utils/csvParser';

interface SpendingBarChartProps {
  monthlyData: MonthlySpending[];
  dailyData: DailySpending[];
  weeklyData: WeeklySpending[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: 'none'
            }}>
                <p style={{ margin: '0 0 4px 0', color: '#1f2937', fontWeight: '500', fontSize: '16px' }}>{`${label}`}</p>
                <p style={{ margin: 0, color: '#2563eb', fontSize: '16px' }}>{`Spending: $${payload[0].value.toFixed(2)}`}</p>
            </div>
        );
    }
    return null;
};

const SpendingBarChart: React.FC<SpendingBarChartProps> = ({ monthlyData, dailyData, weeklyData }) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  const getData = () => {
    switch (period) {
      case 'day':
        console.log('Daily data:', dailyData);
        return dailyData;
      case 'week':
        console.log('Weekly data:', weeklyData);
        return weeklyData;
      case 'month':
        console.log('Monthly data:', monthlyData);
        return monthlyData;
    }
  };

  const data = getData();

  // Smart label display: show very few labels to avoid crowding
  // Focus on first, last, and key interval labels
  const getSmartLabelInterval = () => {
    const dataLength = data.length;
    if (dataLength <= 7) return 1; // Show all for small datasets
    if (dataLength <= 15) return 2; // Every 2nd
    if (dataLength <= 30) return 5; // Every 5th (6 labels max)
    return 7; // Every 7th (4-5 labels max)
  };

  const labelInterval = getSmartLabelInterval();

  const SmartXAxis = (props: any) => {
    const { x, y, payload } = props;
    const index = data.findIndex((d) => d.name === payload.value);
    const shouldShow = index % labelInterval === 0;
    
    if (!shouldShow) {
      return null;
    }
    
    return (
      <text
        x={x}
        y={y}
        fill="#9ca3af"
        fontSize="13px"
        textAnchor="middle"
        dy={4}
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Toggle Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        justifyContent: 'center'
      }}>
        {(['day', 'week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: period === p ? '#2563eb' : '#e5e7eb',
              color: period === p ? 'white' : '#374151',
              fontWeight: period === p ? '600' : '500',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 500, paddingTop: '40px' }}>
        <ResponsiveContainer>
          <BarChart
            data={data as any}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={<SmartXAxis />} stroke="#f0f0f0" interval={0} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: '14px' }} stroke="#f0f0f0" />
            <Tooltip cursor={{fill: 'rgba(37, 99, 235, 0.05)'}} content={<CustomTooltip />} />
            <Bar dataKey="spending" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingBarChart;
