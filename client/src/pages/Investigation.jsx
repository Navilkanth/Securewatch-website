import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ShieldAlert } from 'lucide-react';
import { logsApi } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { Input, Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RiskBadge, SeverityBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { InvestigationDrawer } from '../components/logs/InvestigationDrawer';
import { SEVERITIES, STATUSES } from '../utils/constants';

export default function Investigation() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['investigation', { search: debouncedSearch, severity, status }],
    // If no search is provided, sort by riskScore descending to show highest risks automatically
    queryFn: () => logsApi.getAll({ 
      search: debouncedSearch, 
      severity, 
      status, 
      limit: 20, 
      sort: debouncedSearch ? 'timestamp:desc' : 'riskScore:desc' 
    }),
  });

  const logs = data?.data || [];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-100 light:text-slate-900 mb-4">Investigation Desk</h1>
        
        <Card className="p-4 flex flex-col md:flex-row gap-4 bg-navy-800/80">
          <div className="flex-1 w-full">
            <Input
              icon={Search}
              placeholder="Search by IP, actor email, or specific resource to start investigation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={severity} onChange={(e) => setSeverity(e.target.value)} className="h-11">
              <option value="">All Severities</option>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11">
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </Card>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : logs.length > 0 ? (
          <>
            {!debouncedSearch && !severity && !status && (
              <div className="mb-4 text-sm font-medium text-slate-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                Showing top 20 highest risk events
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {logs.map((log) => (
                <Card 
                  key={log._id || log.id} 
                  hover 
                  className="!p-0 border border-slate-700/50 hover:border-primary-500/50 transition-colors group overflow-hidden"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <RiskBadge score={log.riskScore} level={log.aiSummary?.riskLevel || 'Low'} />
                      <SeverityBadge severity={log.severity} />
                    </div>
                    <h3 className="font-mono text-sm text-slate-200 truncate group-hover:text-primary-400 transition-colors">
                      {log.action}
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Actor</p>
                        <p className="text-slate-300 truncate" title={log.actor}>{log.actor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">IP Address</p>
                        <p className="text-slate-300 font-mono text-xs">{log.ipAddress}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 mb-0.5">Resource</p>
                        <p className="text-slate-300 truncate text-xs" title={log.resource}>{log.resource}</p>
                      </div>
                    </div>
                    {log.aiSummary?.summary && (
                      <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {log.aiSummary.summary}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={Search}
              title="No incidents found"
              description="Adjust your search filters to find what you're looking for."
            />
          </div>
        )}
      </div>

      <InvestigationDrawer
        log={selectedLog}
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
