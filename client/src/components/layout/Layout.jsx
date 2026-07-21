import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { LiveAlertTicker } from './LiveAlertTicker';
import { cn } from '../../utils/cn';
import { useKeyboardShortcut } from '../../hooks/useDebounce';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sw-sidebar') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem('sw-sidebar', String(sidebarCollapsed));
    } catch {
      // ignore
    }
  }, [sidebarCollapsed]);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useKeyboardShortcut({
    'ctrl+k': () => {
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.focus();
    },
    'ctrl+/': toggleSidebar,
  });

  return (
    <div className="min-h-screen bg-navy-900 light:bg-slate-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'
        )}
      >
        {/* Global Live Alert Ticker — visible on every page */}
        <LiveAlertTicker />

        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setMobileOpen(!mobileOpen)}
        />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
