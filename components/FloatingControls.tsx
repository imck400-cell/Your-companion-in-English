import React, { useState, useEffect } from 'react';
import { Home, ArrowUp, Moon, Sun, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  toggleTheme: () => void;
  isDark: boolean;
  toggleSidebar?: () => void;
}

const FloatingControls: React.FC<Props> = ({ toggleTheme, isDark, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const btnClass = `p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
    isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-indigo-50 text-indigo-600'
  } border border-transparent hover:border-indigo-200`;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
       {/* Sidebar Toggle (Mobile) */}
      {toggleSidebar && (
        <button onClick={toggleSidebar} className={`${btnClass} md:hidden`}>
            <Menu size={20} />
        </button>
      )}

      {/* Scroll Top */}
      <button 
        onClick={scrollTop} 
        className={`${btnClass} ${showScroll ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <ArrowUp size={20} />
      </button>

      {/* Theme Toggle */}
      <button onClick={toggleTheme} className={btnClass}>
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Home */}
      <button onClick={() => navigate('/')} className={btnClass}>
        <Home size={20} />
      </button>
    </div>
  );
};

export default FloatingControls;