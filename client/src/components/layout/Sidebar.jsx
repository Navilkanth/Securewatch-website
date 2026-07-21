import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Search, Bell, Upload, BarChart3, Settings,
  Shield, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '../../utils/cn';
import { NAV_ITEMS } from '../../utils/constants';
import { alertsApi } from '../../services/api';

const ICONS = {
  LayoutDashboard, FileText, Search, Bell, Upload, BarChart3, Settings,
};

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { data: alertsData } = useQuery({
    queryKey: ['alertCount'],
    queryFn: () => alertsApi.getAll({ limit: 1 }),
    refetchInterval: 30000,
  });

  const alertCount = alertsData?.pagination?.total || 0;

  return (
    <motion.aside
      animate={{ 
        width: collapsed ? 72 : 240,
        x: window.innerWidth < 1024 ? (mobileOpen ? 0 : -240) : 0
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        "fixed left-0 top-0 h-full z-30 flex flex-col bg-navy-800/95 backdrop-blur-xl border-r border-slate-700/50 light:bg-white light:border-slate-200",
        window.innerWidth < 1024 && !mobileOpen ? "-translate-x-full" : "translate-x-0"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-700/50 light:border-slate-200">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary-400" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-sm font-bold text-slate-100 light:text-slate-900">SecureWatch</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">SOC Platform</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isAlerts = item.path === '/alerts';
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => window.innerWidth < 1024 && onMobileClose?.()}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative',
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20 light:bg-primary-50 light:text-primary-700 light:border-primary-200'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100'
                )
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="flex-1 flex items-center justify-between">
                  {item.label}
                  {isAlerts && alertCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {alertCount > 99 ? '99+' : alertCount}
                    </span>
                  )}
                </span>
              )}
              {collapsed && isAlerts && alertCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-navy-800" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="hidden lg:flex items-center justify-center h-12 border-t border-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors light:border-slate-200"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </motion.aside>
  );
}
