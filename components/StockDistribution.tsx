import React from 'react';
import { STOCK_DATA } from '../constants';

const StockDistribution: React.FC = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full">
      <h3 className="text-text-main dark:text-white text-lg font-bold mb-4">Stok Dağılımı</h3>
      <div className="flex-1 flex flex-col justify-center gap-6">
        {STOCK_DATA.map((item) => {
            const percentage = Math.round((item.count / item.total) * 100);
            return (
                <div key={item.category} className="group">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-text-main dark:text-gray-300">{item.category}</span>
                        <span className="text-text-secondary dark:text-gray-500">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`${item.colorClass} h-2.5 rounded-full transition-all duration-1000 ease-out`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default StockDistribution;