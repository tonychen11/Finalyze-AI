import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CategorySpending } from '@/types';

interface CategoryPieChartProps {
  data: CategorySpending[];
}

const COLORS = ['#00BCD4', '#2196F3', '#3F51B5', '#673AB7', '#9C27B0', '#E91E63', '#FF5722', '#FF9800'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: 'none'
            }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
                  {`${data.name}: $${data.value.toFixed(2)}`}
                </p>
            </div>
        );
    }
    return null;
};


const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  // Sort data by value in descending order for legend
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Pie Chart Section */}
      <div style={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <Pie
              data={sortedData as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={95}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              stroke="none"
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
      }}
      className="dark:border-slate-700">
        {sortedData.map((item, index) => (
          <div 
            key={`legend-item-${index}`} 
            style={{ 
              fontSize: '15px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontWeight: '400',
              letterSpacing: '0.3px'
            }}
            className="text-slate-600 dark:text-slate-200"
          >
            <span style={{ 
              display: 'inline-block', 
              width: '12px', 
              height: '12px', 
              backgroundColor: COLORS[index % COLORS.length], 
              borderRadius: '2px',
              flexShrink: 0
            }} />
            <span style={{ flex: 1 }}>{item.name}</span>
            <span style={{ fontWeight: '500', minWidth: '80px', textAlign: 'right' }} className="text-slate-900 dark:text-slate-300">${item.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
