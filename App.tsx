import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import RevenueChart from './components/RevenueChart';
import StockDistribution from './components/StockDistribution';
import TransactionsTable from './components/TransactionsTable';
import ProductAdd from './components/ProductAdd';
import Settings from './components/Settings';
import { STATS_DATA } from './constants';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
        case 'add-product':
            return <ProductAdd />;
        case 'settings':
            return <Settings />;
        case 'dashboard':
        default:
            return (
                <div className="mx-auto max-w-7xl flex flex-col gap-8 animate-fadeIn">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STATS_DATA.map((stat, index) => (
                        <StatsCard key={index} data={stat} />
                    ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <RevenueChart />
                    <StockDistribution />
                    </div>

                    {/* Transactions Section */}
                    <TransactionsTable />
                </div>
            );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:static lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
         <Sidebar currentView={currentView} onNavigate={(view) => {
             setCurrentView(view);
             setIsSidebarOpen(false);
         }} />
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            onNewTransactionClick={() => setCurrentView('add-product')}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 scroll-smooth pb-20">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;