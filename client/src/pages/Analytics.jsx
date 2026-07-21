import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';
import { Card, CardHeader } from '../components/ui/Card';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { LogsPerDayChart, HeatmapChart } from '../components/charts/Charts';
import { Users, Globe, Activity } from 'lucide-react';

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsApi.getAnalytics,
  });

  if (isLoading) return <DashboardSkeleton />;

  const { logsPerDay, regionHeatmap, mostActiveUsers, topIPs } = data || {};
  
  const timeSeriesData = logsPerDay || [];
  const riskHeatmap = regionHeatmap || [];
  const topUsers = mostActiveUsers || [];

  const summary = {
    totalEvents: logsPerDay?.reduce((acc, curr) => acc + curr.count, 0) || 0,
    topActor: mostActiveUsers?.[0]?.actor || 'N/A',
    topRegion: regionHeatmap?.sort((a, b) => b.count - a.count)[0]?.region || 'N/A',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 light:text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Deep dive into security patterns and trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Events Analyzed</p>
            <p className="text-2xl font-bold text-slate-100">{summary.totalEvents.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Most Active Actor</p>
            <p className="text-lg font-bold text-slate-100 truncate w-48" title={summary.topActor}>
              {summary.topActor}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Busiest Region</p>
            <p className="text-lg font-bold text-slate-100 uppercase">{summary.topRegion}</p>
          </div>
        </Card>
      </div>

      <Card className="h-[400px]">
        <CardHeader title="Event Timeline" subtitle="Activity volume over the last 30 days" />
        <div className="h-[320px]">
          <LogsPerDayChart data={timeSeriesData} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-[400px]">
          <CardHeader title="Risk Heatmap" subtitle="Severity by Region" />
          <div className="h-[320px]">
            <HeatmapChart data={riskHeatmap} />
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Top Actors by Alert Volume" />
            <div className="space-y-4">
              {topUsers.map((user, i) => (
                <div key={user.actor} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-slate-500">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{user.actor}</p>
                      <p className="text-xs text-slate-500">Last seen: {new Date(user.lastSeen).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-300">{user.count.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Top Suspicious IPs" />
            <div className="space-y-4">
              {topIPs?.map((ip, i) => (
                <div key={ip.ipAddress} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-slate-500">#{i + 1}</span>
                    <p className="text-sm font-mono font-medium text-slate-200">{ip.ipAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-300">{ip.count.toLocaleString()}</p>
                    <p className="text-xs text-red-400">{ip.regions?.length || 0} regions</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
