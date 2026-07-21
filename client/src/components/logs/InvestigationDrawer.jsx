import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  User, Globe, Clock, Shield, FileText, AlertTriangle, CheckCircle, UserPlus, Sparkles, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { SeverityBadge, StatusBadge, RiskBadge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { logsApi } from '../../services/api';

export function InvestigationDrawer({ logId, open, onClose }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [investigator, setInvestigator] = useState('');
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !logId) {
      setLog(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await logsApi.getById(logId);
        if (!cancelled) {
          setLog(data);
          setNotes(data.investigationNotes || '');
          setInvestigator(data.assignedTo || '');
        }
      } catch {
        if (!cancelled) toast.error('Failed to load log details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, logId]);

  const updateMutation = useMutation({
    mutationFn: (data) => logsApi.update(logId, data),
    onMutate: async (newData) => {
      const previous = log;
      setLog((prev) => ({ ...prev, ...newData }));
      return { previous };
    },
    onSuccess: (data) => {
      setLog(data);
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['investigation'] });
      toast.success('Log updated successfully');
    },
    onError: (_, __, context) => {
      if (context?.previous) setLog(context.previous);
      toast.error('Failed to update log');
    },
  });

  const handleResolve = () => updateMutation.mutate({ status: 'Resolved' });
  const handleAssign = () => {
    if (!investigator.trim()) {
      toast.error('Enter investigator name');
      return;
    }
    updateMutation.mutate({ assignedTo: investigator, status: 'Investigating' });
  };
  const handleSaveNotes = () => updateMutation.mutate({ investigationNotes: notes });

  return (
    <Drawer open={open} onClose={onClose} title="Investigation Details" width="max-w-2xl">
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      ) : log ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <SeverityBadge severity={log.severity} />
                <StatusBadge status={log.status} />
                <RiskBadge score={log.riskScore} level={log.aiSummary?.riskLevel || 'Medium'} />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 light:text-slate-900">{log.action}</h3>
              <p className="text-sm text-slate-500 font-mono">{log.resource}</p>
            </div>
          </div>

          {/* AI Summary */}
          {log.aiSummary?.summary && (
            <div className="glass rounded-xl p-4 border border-primary-500/20 bg-primary-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">AI Investigation Summary</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{log.aiSummary.summary}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={User} label="Actor" value={log.actor} />
            <DetailItem icon={Shield} label="Role" value={log.role} />
            <DetailItem icon={Globe} label="IP Address" value={log.ipAddress} mono />
            <DetailItem icon={Globe} label="Region" value={log.region} />
            <DetailItem icon={Clock} label="Timestamp" value={format(new Date(log.timestamp), 'PPpp')} />
            <DetailItem icon={FileText} label="Resource Type" value={log.resourceType} />
            {log.assignedTo && (
              <DetailItem icon={UserPlus} label="Assigned To" value={log.assignedTo} />
            )}
          </div>

          {/* Timeline */}
          {log.timeline?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Actor Timeline (Past 24h)
              </h4>
              <div className="relative pl-4 space-y-4 max-h-64 overflow-y-auto">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-700/50" />
                {log.timeline.map((event) => (
                  <div key={event.id || event._id} className="relative pl-6 group">
                    <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-slate-600 group-hover:bg-primary-500 transition-colors z-10 ring-4 ring-navy-900" />
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/20 border border-slate-700/30 group-hover:border-slate-600/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-300">{event.action}</span>
                          <SeverityBadge severity={event.severity} />
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate">{event.resource}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5">
                        {format(new Date(event.timestamp), 'HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investigation Notes */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Investigation Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-navy-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors"
              placeholder="Add your findings, notes, or evidence here..."
            />
            <Button size="sm" className="mt-2" onClick={handleSaveNotes} loading={updateMutation.isPending}>
              Save Notes
            </Button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-700/50">
            <Button variant="primary" onClick={handleResolve} loading={updateMutation.isPending}>
              <CheckCircle className="w-4 h-4" /> Mark Resolved
            </Button>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Investigator name"
                value={investigator}
                onChange={(e) => setInvestigator(e.target.value)}
                className="w-40 h-10"
              />
              <Button variant="secondary" className="h-10" onClick={handleAssign} loading={updateMutation.isPending}>
                <UserPlus className="w-4 h-4" /> Assign
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-center py-8">Select an incident to view details</p>
      )}
    </Drawer>
  );
}

function DetailItem({ icon: Icon, label, value, mono }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <p className={`text-sm text-slate-200 ${mono ? 'font-mono text-xs' : ''} truncate`} title={value}>
        {value}
      </p>
    </div>
  );
}
