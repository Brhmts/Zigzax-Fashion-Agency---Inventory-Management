import React from 'react';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
    currentView?: string;
    onNavigate?: (viewId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView = 'dashboard', onNavigate }) => {
  return (
    <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-gray-800 h-full flex-shrink-0 z-20">
      <div className="flex h-full flex-col justify-between p-4">
        {/* Logo & Nav */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="bg-primary aspect-square rounded-lg size-10 flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-[24px]">diamond</span>
            </div>
            <h1 className="text-white text-lg font-bold leading-normal tracking-tight">Zigzax Fashion</h1>
          </div>
          
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = currentView === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                      e.preventDefault();
                      if (onNavigate) onNavigate(item.id);
                  }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`material-symbols-outlined ${isActive ? 'filled-icon' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-800 pt-4 px-2">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDQTESIlL9ONI6aQzjg2LPOKsW2-onnYuwKNDZO5JpgsVT7zZXjuCAWVsv5UnjDBbOl0EMNzpUX9cl2xorGzuPWWjrl7nK1HNGUM2lCV_xUwO0QNOCAJI5CWcrY2tVWlLVUHO60WofLy34Ztsyn6RF-fZmSecmqWTdTBGe8c5TxYtHDVp1U-eY0T6qKj2-Xifv6114hmmV3h6eN6UWV5KjlbWK42BippoH7Hk-PNwMRz4IAdl0ZCvxzF-jEhil1HK9wzUnz3Uc5bGs")'
              }}
            ></div>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">Ahmet Yılmaz</p>
              <p className="text-xs text-gray-400">Yönetici</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;