import { useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { exportToCSV, exportToPDF } from '../utils/export';
import { logsApi } from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [retention, setRetention] = useState('90');
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.loading(`Preparing ${exportFormat.toUpperCase()} export...`, { id: 'export' });
      // Fetch up to 500 records for the export
      const allData = await logsApi.getAll({ limit: 500 });
      if (exportFormat === 'csv') {
        exportToCSV(allData.logs, 'securewatch-all-logs');
      } else {
        await exportToPDF(allData.logs, 'securewatch-all-logs');
      }
      toast.success('Export downloaded', { id: 'export' });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed', { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 light:text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your preferences and workspace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Appearance" subtitle="Customize the dashboard look" />
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-slate-200">Theme Mode</p>
              <p className="text-xs text-slate-500">Currently using {theme} mode</p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Notifications" subtitle="Alert and email preferences" />
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-slate-200">In-App Alerts</p>
              <p className="text-xs text-slate-500">Receive popup notifications for high risk</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notifications} 
                onChange={() => setNotifications(!notifications)} 
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </Card>

        <Card>
          <CardHeader title="Data Retention" subtitle="How long to keep audit logs" />
          <div className="space-y-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-slate-200 mb-2">Retention Period</p>
              <select 
                className="w-full bg-navy-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-primary-500 focus:border-primary-500"
                value={retention}
                onChange={(e) => setRetention(e.target.value)}
              >
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="180">180 Days</option>
                <option value="365">1 Year</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Data Export" subtitle="Download your workspace data" />
          <div className="space-y-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-slate-200 mb-2">Export Format</p>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="format" value="csv" checked={exportFormat === 'csv'} onChange={(e) => setExportFormat(e.target.value)} className="text-primary-600 bg-slate-800 border-slate-600" />
                  <span className="text-sm text-slate-300">CSV File</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="format" value="pdf" checked={exportFormat === 'pdf'} onChange={(e) => setExportFormat(e.target.value)} className="text-primary-600 bg-slate-800 border-slate-600" />
                  <span className="text-sm text-slate-300">PDF Report</span>
                </label>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleExport} loading={isExporting}>
                Download All Logs
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="ghost">Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
