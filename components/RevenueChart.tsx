import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { CHART_DATA } from '../constants';

const RevenueChart: React.FC = () => {
  return (
    <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-text-main dark:text-white text-lg font-bold mb-1">Gelir/Gider Analizi</h3>
          <p className="text-text-secondary dark:text-gray-400 text-sm">Son 6 aylık performans</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-text-main dark:text-white tracking-tight">₺450,000</p>
          <p className="text-green-600 text-sm font-medium flex items-center justify-end gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span> +15%
          </p>
        </div>
      </div>
      
      <div className="relative w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6857ea" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6857ea" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                dy={10}
            />
            {/* Hidden YAxis to keep scale but remove UI clutter */}
            <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#1e1b36', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
                itemStyle={{ color: '#fff' }}
                cursor={{ stroke: '#6857ea', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6857ea" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;