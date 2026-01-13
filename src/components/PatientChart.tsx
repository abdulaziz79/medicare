
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { VitalRecord, Theme } from '../types';

interface PatientChartProps {
  data: VitalRecord[];
  theme: Theme;
}

const PatientChart: React.FC<PatientChartProps> = ({ data, theme }) => {
  const isDark = theme === 'dark';
  const chartData = [...data].reverse().map(v => ({
    name: v.timestamp.split('-').slice(1).join('/'), 
    HR: v.hr,
    Temp: v.temp,
    Weight: v.weight,
    SBP: parseInt(v.bp.split('/')[0]),
    DBP: parseInt(v.bp.split('/')[1]),
  }));

  return (
    <div className="h-48 sm:h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
          <XAxis 
            dataKey="name" 
            tick={{fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8'}} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            tick={{fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8'}} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#0f172a' : '#ffffff', 
              borderRadius: '12px', 
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
              boxShadow: isDark ? '0 10px 15px -3px rgb(0 0 0 / 0.5)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
              fontSize: '12px', 
              color: isDark ? '#f1f5f9' : '#1e293b' 
            }}
            itemStyle={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle" 
            wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }} 
          />
          <Line 
            type="monotone" 
            dataKey="SBP" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={{r: 3, fill: '#ef4444'}} 
            activeDot={{r: 5}} 
            name="SBP"
          />
          <Line 
            type="monotone" 
            dataKey="DBP" 
            stroke="#f87171" 
            strokeWidth={2} 
            dot={{r: 3, fill: '#f87171'}} 
            activeDot={{r: 5}} 
            name="DBP"
          />
          <Line 
            type="monotone" 
            dataKey="HR" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={{r: 3, fill: '#3b82f6'}} 
            activeDot={{r: 5}} 
            name="HR"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PatientChart;
