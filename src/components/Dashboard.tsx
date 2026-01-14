'use client';

import React from 'react';
import { AnalysisResult } from '@/types';
import CategoryPieChart from './CategoryPieChart';
import SpendingBarChart from './SpendingBarChart';
import InsightsList from './InsightsList';

interface DashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div style={{
      padding: '24px',
      borderRadius: '16px',
      transition: 'all 0.3s ease',
      cursor: 'default',
      backgroundColor: 'var(--card-bg)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      border: '1px solid var(--card-border)'
    }}
    className="dark:bg-slate-800 dark:border-slate-700 dark:shadow-lg"
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.10)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
    }}>
        <p style={{ fontSize: '13px', margin: '0 0 8px 0', fontWeight: '500', letterSpacing: '0.3px' }} className="text-slate-600 dark:text-slate-400">{title}</p>
        <p style={{ fontSize: '32px', fontWeight: '600', color: '#2563eb', margin: 0 }} className="dark:text-blue-400">{value}</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ result, onReset }) => {
  const topCategory = [...result.categorySpending].sort((a, b) => b.value - a.value)[0];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }} className="text-slate-900 dark:text-white">Financial Dashboard</h2>
            <button
                onClick={onReset}
                style={{
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '500',
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
                }}
            >
                Analyze Another
            </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <StatCard title="Total Spending" value={`$${result.totalSpending.toFixed(2)}`} />
            <StatCard title="Transactions" value={result.transactionCount} />
            <StatCard title="Top Category" value={topCategory?.name || 'N/A'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', gridAutoFlow: 'dense' }}>
            <div style={{ gridColumn: 'span 1', padding: '28px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }} className="dark:bg-slate-800 dark:border-slate-700">
                <h3 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 20px 0' }} className="text-slate-900 dark:text-white">Spending by Category</h3>
                <CategoryPieChart data={result.categorySpending} />
            </div>
             <div style={{ gridColumn: 'span 1', padding: '28px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }} className="dark:bg-slate-800 dark:border-slate-700">
                <h3 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 20px 0' }} className="text-slate-900 dark:text-white">Spending Trend</h3>
                <SpendingBarChart monthlyData={result.monthlySpending} dailyData={result.dailySpending} weeklyData={result.weeklySpending} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', alignItems: 'start' }}>
            <InsightsList title="AI Insights" items={result.aiSummary.insights} type="insight" />
            <InsightsList title="Recommendations" items={result.aiSummary.recommendations} type="recommendation" />
        </div>
    </div>
  );
};

export default Dashboard;
