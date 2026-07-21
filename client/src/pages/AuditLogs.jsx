import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Download, Filter, Search, FileDown } from 'lucide-react';
import { logsApi } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { exportToCSV, exportToPDF } from '../utils/export';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SeverityBadge, StatusBadge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { SEVERITIES, STATUSES, SORT_OPTIONS, PAGE_SIZE_OPTIONS } from '../utils/constants';

export default function AuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const searchInput = searchParams.get('search') || '';
  const severity = searchParams.get('severity') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'timestamp:desc';

  const [localSearch, setLocalSearch] = useState(searchInput);
  const debouncedSearch = useDebounce(localSearch, 500);

  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (newParams.search !== undefined || newParams.severity !== undefined || newParams.status !== undefined) {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  // Sync debounced search to URL
  useState(() => {
    if (debouncedSearch !== searchInput) {
      updateParams({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['logs', { page, limit, search: debouncedSearch, severity, status, sort }],
    queryFn: () => logsApi.getAll({ page, limit, search: debouncedSearch, severity, status, sort }),
    placeholderData: (prev) => prev,
  });

  const logs = data?.logs || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.pages || 1;

  const handleExportCSV = async () => {
    const allData = await logsApi.getAll({ limit: 500, search: debouncedSearch, severity, status, sort });
    exportToCSV(allData.logs, 'audit-logs');
  };

  const handleExportPDF = async () => {
    const allData = await logsApi.getAll({ limit: 500, search: debouncedSearch, severity, status, sort });
    exportToPDF(allData.logs, 'audit-logs');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 light:text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Loading records...' : `Showing ${logs.length} of ${total.toLocaleString()} records`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={!logs.length}>
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={!logs.length}>
            <FileDown className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-4 items-end bg-navy-800/80 border border-slate-700/50 light:bg-white light:border-slate-200">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-400 mb-1">Search</label>
          <Input
            icon={Search}
            placeholder="Search by IP, actor, action..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-xs font-medium text-slate-400 mb-1">Severity</label>
          <Select value={severity} onChange={(e) => updateParams({ severity: e.target.value })}>
            <option value="">All Severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="w-full md:w-48">
          <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
          <Select value={status} onChange={(e) => updateParams({ status: e.target.value })}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="w-full md:w-56">
          <label className="block text-xs font-medium text-slate-400 mb-1">Sort By</label>
          <Select value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          {isLoading && !isPlaceholderData ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700/50 text-xs uppercase tracking-wider text-slate-400 light:bg-slate-50 light:border-slate-200">
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 font-medium">Actor</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Resource</th>
                  <th className="p-4 font-medium">Severity</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm light:divide-slate-200">
                {logs.length > 0 ? logs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200 light:text-slate-800 group-hover:text-primary-400 transition-colors">
                        {log.actor}
                      </div>
                      <div className="text-xs text-slate-500">{log.role}</div>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">{log.action}</td>
                    <td className="p-4 text-slate-400 max-w-[200px] truncate" title={log.resource}>
                      {log.resource}
                    </td>
                    <td className="p-4"><SeverityBadge severity={log.severity} /></td>
                    <td className="p-4"><StatusBadge status={log.status} /></td>
                    <td className="p-4 font-mono text-xs text-slate-400">{log.ipAddress}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No logs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex items-center justify-between light:border-slate-200 light:bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Rows per page:</span>
              <Select
                className="w-20 py-1"
                value={limit}
                onChange={(e) => updateParams({ limit: e.target.value, page: '1' })}
              >
                {PAGE_SIZE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-400 font-medium px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
