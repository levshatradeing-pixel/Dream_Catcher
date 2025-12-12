import React from 'react';
import { Book, Moon, User, HelpCircle } from 'lucide-react';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeScreen, onNavigate }) => {
  return (
    <div className="flex flex-col h-screen bg-night-900 text-slate-100 max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-800">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-night-800 border-t border-slate-700 h-16 flex justify-around items-center z-50">
        <button 
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center p-2 transition-colors ${activeScreen === 'home' || activeScreen === 'input' ? 'text-mystic-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Moon size={24} />
          <span className="text-xs mt-1">Сон</span>
        </button>
        
        <button 
          onClick={() => onNavigate('journal')}
          className={`flex flex-col items-center p-2 transition-colors ${activeScreen === 'journal' ? 'text-mystic-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Book size={24} />
          <span className="text-xs mt-1">Дневник</span>
        </button>
        
        <button 
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center p-2 transition-colors ${activeScreen === 'profile' ? 'text-mystic-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Профиль</span>
        </button>

        <button 
          onClick={() => onNavigate('help')}
          className={`flex flex-col items-center p-2 transition-colors ${activeScreen === 'help' ? 'text-mystic-500' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <HelpCircle size={24} />
          <span className="text-xs mt-1">Помощь</span>
        </button>
      </nav>
    </div>
  );
};
