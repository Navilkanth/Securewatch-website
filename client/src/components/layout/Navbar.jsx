import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '../ui/Input';
import { useTheme } from '../../context/ThemeContext';
import { useLiveClock, useDebounce } from '../../hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '../../services/api';

export function Navbar({ sidebarCollapsed, onMenuClick }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const clock = useLiveClock();

  const { data: alertsData } = useQuery({
    queryKey: ['alertCount'],
    queryFn: () => alertsApi.getAll({ limit: 1 }),
    refetchInterval: 30000,
  });

  const alertCount = alertsData?.pagination?.total || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (debouncedSearch.trim()) {
      navigate(`/audit-logs?search=${encodeURIComponent(debouncedSearch.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 lg:px-6 bg-navy-900/80 backdrop-blur-xl border-b border-slate-700/50 light:bg-white/80 light:border-slate-200">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="hidden sm:block flex-1 max-w-md relative">
          <Input
            id="global-search-input"
            icon={Search}
            placeholder="Search actor, IP, resource, action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800/50 border border-slate-700/50 rounded light:bg-slate-100 light:border-slate-200 light:text-slate-500">
              Ctrl+K
            </kbd>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 text-xs font-mono text-slate-400 light:bg-slate-100 light:text-slate-600">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {format(clock, 'HH:mm:ss')} UTC
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-white/5 light:hover:bg-black/5 text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-lg hover:bg-white/5 light:hover:bg-black/5 text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow-sm">
              {alertCount > 99 ? '99+' : alertCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-700/50 light:border-slate-200">
          <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center text-xs font-bold text-primary-400 border border-primary-500/20">
            SE
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-slate-200 light:text-slate-800">Security Engineer</p>
            <p className="text-[10px] text-slate-500 light:text-slate-500">admin@securewatch.io</p>
          </div>
        </div>
      </div>
    </header>
  );
}
