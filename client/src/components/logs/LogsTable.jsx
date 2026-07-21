import { useState } from 'react';
import { Search, Filter, X, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { SeverityBadge, StatusBadge, RiskBadge } from '../ui/Badge';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { SEVERITIES, STATUSES, SORT_OPTIONS, PAGE_SIZE_OPTIONS } from '../../utils/constants';

export function LogsFilters({ filters, onChange, filterOptions }) {
  const [showFilters, setShowFilters] = useState(false);

  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            icon={Search}
            placeholder="Global search..."
            value={filters.search || ''}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>
        <Select
          value={`${filters.sortBy || 'timestamp'}:${filters.sortOrder || 'desc'}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(':');
            update('sortBy', sortBy);
            onChange({ ...filters, sortBy, sortOrder, page: 1 });
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </div>

      {showFilters && (
        <div className="glass rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <FilterSelect label="Severity" value={filters.severity} onChange={(v) => update('severity', v)}>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </FilterSelect>
          <FilterSelect label="Status" value={filters.status} onChange={(v) => update('status', v)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </FilterSelect>
          <FilterSelect label="Role" value={filters.role} onChange={(v) => update('role', v)}>
            {filterOptions?.roles?.map((r) => <option key={r} value={r}>{r}</option>)}
          </FilterSelect>
          <FilterSelect label="Region" value={filters.region} onChange={(v) => update('region', v)}>
            {filterOptions?.regions?.map((r) => <option key={r} value={r}>{r}</option>)}
          </FilterSelect>
          <FilterSelect label="Action" value={filters.action} onChange={(v) => update('action', v)}>
            {filterOptions?.actions?.map((a) => <option key={a} value={a}>{a}</option>)}
          </FilterSelect>
          <FilterSelect label="Resource Type" value={filters.resourceType} onChange={(v) => update('resourceType', v)}>
            {filterOptions?.resourceTypes?.map((t) => <option key={t} value={t}>{t}</option>)}
          </FilterSelect>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Date From</label>
            <Input type="date" value={filters.dateFrom || ''} onChange={(e) => update('dateFrom', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Date To</label>
            <Input type="date" value={filters.dateTo || ''} onChange={(e) => update('dateTo', e.target.value)} />
          </div>
          <div className="col-span-full">
            <Button variant="ghost" size="sm" onClick={() => onChange({ page: 1, limit: filters.limit || 25, sortBy: 'timestamp', sortOrder: 'desc' })}>
              <X className="w-4 h-4" /> Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <div>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      <Select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {children}
      </Select>
    </div>
  );
}

export function LogsTable({ logs, loading, pagination, filters, onFilterChange, onSort, onViewLog }) {
  const handleSort = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onSort(field, newOrder);
  };

  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field) return null;
    return filters.sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  if (loading) return <TableSkeleton rows={10} cols={8} />;

  if (!logs?.length) {
    return (
      <EmptyState
        title="No audit logs found"
        description="Upload log files or adjust your filters to see results."
        actionLabel="Upload Logs"
        action={() => window.location.href = '/upload'}
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-700/50 light:border-slate-200">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-navy-800/95 backdrop-blur light:bg-slate-100">
            <tr className="border-b border-slate-700/50 light:border-slate-200">
              {[
                { key: 'actor', label: 'Actor' },
                { key: 'role', label: 'Role' },
                { key: 'action', label: 'Action' },
                { key: 'resource', label: 'Resource', sortable: false },
                { key: 'resourceType', label: 'Type', sortable: false },
                { key: 'ipAddress', label: 'IP Address', sortable: false },
                { key: 'region', label: 'Region' },
                { key: 'severity', label: 'Severity' },
                { key: 'status', label: 'Status' },
                { key: 'timestamp', label: 'Timestamp' },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 whitespace-nowrap"
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label} {col.sortable !== false && <SortIcon field={col.key} />}
                  </span>
                </th>
              ))}
              <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase">Risk</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30 light:divide-slate-200">
            {logs.map((log) => (
              <tr
                key={log.id || log._id}
                className="hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onViewLog(log.id || log._id)}
              >
                <td className="px-3 py-2.5 text-slate-300 max-w-[180px] truncate">{log.actor}</td>
                <td className="px-3 py-2.5 text-slate-400 capitalize">{log.role}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-primary-400">{log.action}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-slate-500 max-w-[150px] truncate">{log.resource}</td>
                <td className="px-3 py-2.5 text-slate-400">{log.resourceType}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-slate-400">{log.ipAddress}</td>
                <td className="px-3 py-2.5 text-slate-400">{log.region}</td>
                <td className="px-3 py-2.5"><SeverityBadge severity={log.severity} /></td>
                <td className="px-3 py-2.5"><StatusBadge status={log.status} /></td>
                <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                  {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="px-3 py-2.5"><RiskBadge score={log.riskScore} level={log.riskLevel} /></td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewLog(log.id || log._id); }}
                    className="p-1.5 rounded-lg hover:bg-primary-500/20 text-primary-400"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Rows per page:</span>
          <Select
            value={filters.limit || 25}
            onChange={(e) => onFilterChange({ ...filters, limit: parseInt(e.target.value), page: 1 })}
            className="w-20"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </Select>
          <span>
            {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onFilterChange({ ...filters, page: pagination.page - 1 })}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onFilterChange({ ...filters, page: pagination.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
