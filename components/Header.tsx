import React from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
  onNewTransactionClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onNewTransactionClick }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-8 w-full">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-text-main dark:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        
        <h2 className="hidden md:block text-text-main dark:text-white text-xl font-bold leading-tight tracking-tight">
          Yönetici Paneli
        </h2>
        
        <div className="flex flex-1 max-w-md ml-4">
          <div className="relative w-full text-text-secondary focus-within:text-primary transition-colors">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              className="block w-full h-11 pl-10 pr-3 py-2 border-none rounded-lg bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-shadow"
              placeholder="Cari, stok veya işlem ara..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-surface-dark animate-pulse"></span>
        </button>
        
        <button 
          onClick={onNewTransactionClick}
          className="hidden sm:flex h-10 px-4 items-center justify-center rounded-lg bg-primary text-white gap-2 text-sm font-bold hover:bg-primary-light transition-all shadow-lg shadow-primary/30 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Yeni İşlem</span>
        </button>
      </div>
    </header>
  );
};

export default Header;