import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { alertsApi } from '../services/api';
import { Card } from '../components/ui/Card';
import { SeverityBadge, StatusBadge, RiskBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { InvestigationDrawer } from '../components/logs/InvestigationDrawer';
import { useState } from 'react';

export default function Alerts() {
  const queryClient = useQueryClient();
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAll({ limit: 50, sortBy: 'timestamp', sortOrder: 'desc' }),
    refetchInterval: 30000,
  });

  const dismissMutation = useMutation({
    mutationFn: alertsApi.dismiss,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['alerts'] });
      const previous = queryClient.getQueryData(['alerts']);
      queryClient.setQueryData(['alerts'], (old) => ({
        ...old,
        logs: old.logs.filter((l) => (l.id || l._id) !== id),
        pagination: { ...old.pagination, total: old.pagination.total - 1 },
      }));
      return { previous };
    },
    onSuccess: () => {
      toast.success('Alert dismissed');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (_, __, context) => {
      if (context?.previous) queryClient.setQueryData(['alerts'], context.previous);
      toast.error('Failed to dismiss alert');
    },
  });

  const alerts = data?.logs || [];
  const alertCount = data?.pagination?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 light:text-slate-900">Security Alerts</h1>
          <p className="text-sm text-slate-500 mt-1">High severity & critical unresolved incidents</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <Bell className="w-5 h-5 text-red-400" />
          <span className="text-lg font-bold text-red-400">{alertCount}</span>
          <span className="text-xs text-red-400/70">Active Alerts</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Active Alerts"
          description="All critical and high severity incidents have been resolved."
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id || alert._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="!p-0 overflow-hidden">
                <div className="flex items-stretch">
                  <div className={`w-1 ${alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'}`} />
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <SeverityBadge severity={alert.severity} />
                            <StatusBadge status={alert.status} />
                            <RiskBadge score={alert.riskScore} level={alert.riskLevel} />
                          </div>
                          <h3 className="font-semibold text-slate-200">{alert.action}</h3>
                          <p className="text-sm text-slate-400 mt-1">{alert.actor} • {alert.ipAddress} • {alert.region}</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">{alert.resource}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {format(new Date(alert.timestamp), 'PPpp')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedLogId(alert.id || alert._id); setDrawerOpen(true); }}
                        >
                          Investigate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissMutation.mutate(alert.id || alert._id)}
                          loading={dismissMutation.isPending}
                        >
                          <X className="w-4 h-4" /> Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <InvestigationDrawer
        logId={selectedLogId}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedLogId(null); }}
      />
    </div>
  );
}
