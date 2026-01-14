import React, { useState } from 'react';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { AlertIcon } from './icons/AlertIcon';

interface InsightsListProps {
  title: string;
  items: string[];
  type: 'insight' | 'recommendation';
}

const InsightsList: React.FC<InsightsListProps> = ({ title, items, type }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const icon = type === 'insight' 
        ? <LightbulbIcon style={{ width: '20px', height: '20px', color: '#2563eb' }} /> 
        : <AlertIcon style={{ width: '20px', height: '20px', color: '#10b981' }} />;
    
    const borderColor = type === 'insight' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)';
    const bgColor = type === 'insight' ? 'rgba(37, 99, 235, 0.05)' : 'rgba(16, 185, 129, 0.05)';

    return (
        <div 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: '28px',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--card-bg)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              height: isExpanded ? '425px' : '80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              overflow: isExpanded ? 'auto' : 'hidden'
            }}
            className="dark:bg-slate-800 dark:border-slate-700"
            onMouseEnter={(e) => {
              if (!isExpanded) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.10)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isExpanded) {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
              }
            }}
        >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: isExpanded ? '20px' : '0' }}>
                <div style={{
                  flexShrink: 0,
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                   {icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }} className="text-slate-900 dark:text-white">{title}</h3>
                <span style={{ marginLeft: 'auto', fontSize: '20px', transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} className="text-slate-400 dark:text-slate-500">▼</span>
            </div>
            
            {isExpanded && (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.map((item, index) => (
                        <li key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{
                              flexShrink: 0,
                              marginTop: '2px',
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: bgColor,
                              border: `1px solid ${borderColor}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                               {icon}
                            </div>
                            <span style={{ fontSize: '15px', lineHeight: '1.6' }} className="text-slate-600 dark:text-slate-300">{item}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default InsightsList;
