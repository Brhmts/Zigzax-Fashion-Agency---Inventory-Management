import React from 'react';
import { RECENT_TRANSACTIONS } from '../constants';

const TransactionsTable: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-text-main dark:text-white text-lg font-bold leading-tight">Son İşlemler</h3>
        <button className="text-primary text-sm font-semibold hover:text-primary-light transition-colors">
            Tümünü Gör
        </button>
      </div>
      
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-gray-500 uppercase tracking-wider">İşlem ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-gray-500 uppercase tracking-wider">Müşteri / Tedarikçi</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-gray-500 uppercase tracking-wider">Tutar</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary dark:text-gray-500 uppercase tracking-wider text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {RECENT_TRANSACTIONS.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-text-main dark:text-white">{trx.id}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary dark:text-gray-400">{trx.date}</td>
                  <td className="px-6 py-4 text-sm text-text-main dark:text-gray-200">
                    <div className="flex items-center gap-3">
                        {trx.entityAvatar ? (
                             <div 
                                className="bg-gray-200 rounded-full size-8 overflow-hidden bg-cover bg-center border border-gray-100 dark:border-gray-700" 
                                style={{ backgroundImage: `url("${trx.entityAvatar}")` }}
                             ></div>
                        ) : (
                            <div className={`rounded-full size-8 flex items-center justify-center text-[10px] font-bold ${trx.initialsColorClass || 'bg-gray-100 text-gray-500'}`}>
                                {trx.initials}
                            </div>
                        )}
                      <span className="font-medium">{trx.entityName}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold ${trx.amountValue < 0 ? 'text-text-main dark:text-white' : 'text-text-main dark:text-white'}`}>
                    {trx.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                        trx.statusColor === 'green' 
                            ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50' 
                        : trx.statusColor === 'yellow' 
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50'
                        : 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                    }`}>
                      <span className={`size-1.5 rounded-full ${
                          trx.statusColor === 'green' ? 'bg-green-500' : trx.statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></span>
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-text-secondary hover:text-primary transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;