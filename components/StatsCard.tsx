import React from 'react';
import { StatCardData } from '../types';

const StatsCard: React.FC<{ data: StatCardData }> = ({ data }) => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${data.iconBgColor} ${data.iconColor}`}>
          <span className="material-symbols-outlined">{data.icon}</span>
        </div>
        
        {data.trendDirection === 'up' || data.trendDirection === 'down' ? (
           data.subtitle ? (
            <span className="text-text-secondary dark:text-gray-500 text-xs font-medium self-center">
                {data.subtitle}
            </span>
           ) : (
            <span className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                data.trendColor === 'green' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'
            }`}>
                <span className="material-symbols-outlined text-[16px] mr-1">
                {data.trendDirection === 'up' ? 'trending_up' : 'trending_down'}
                </span>
                {data.trend}
            </span>
           )
        ) : null}
      </div>
      <div>
        <p className="text-text-secondary dark:text-gray-400 text-sm font-medium mb-1">{data.title}</p>
        <h3 className="text-text-main dark:text-white text-2xl font-bold">{data.value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;