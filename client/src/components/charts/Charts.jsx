import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    border: '1px solid rgba(51, 65, 85, 0.8)',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backdropFilter: 'blur(8px)',
  },
  labelStyle: { color: '#94a3b8', fontWeight: 600, marginBottom: '4px' },
};

function GradientDefs() {
  return (
    <defs>
      <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
      </linearGradient>
      <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
      </linearGradient>
      <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
      </linearGradient>
      <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
      </linearGradient>
      <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
      </linearGradient>
    </defs>
  );
}

export function SeverityBarChart({ data }) {
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: '#334155', opacity: 0.2 }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
          {data.map((entry, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RegionPieChart({ data }) {
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={{ stroke: '#64748b' }}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StatusDonutChart({ data }) {
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={75}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={['#22c55e', '#ef4444', '#3b82f6'][i % 3]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ActionsBarChart({ data }) {
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: '#334155', opacity: 0.2 }} />
        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LogsPerHourChart({ data }) {
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <GradientDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorBlue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LogsPerDayChart({ data }) {
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#1e293b', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SeverityTrendChart({ data }) {
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <GradientDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
        <Area type="monotone" dataKey="CRITICAL" stackId="1" stroke="#ef4444" strokeWidth={2} fill="url(#colorCritical)" />
        <Area type="monotone" dataKey="HIGH" stackId="1" stroke="#f97316" strokeWidth={2} fill="url(#colorHigh)" />
        <Area type="monotone" dataKey="MEDIUM" stackId="1" stroke="#eab308" strokeWidth={2} fill="url(#colorMedium)" />
        <Area type="monotone" dataKey="LOW" stackId="1" stroke="#22c55e" strokeWidth={2} fill="url(#colorLow)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
      No chart data available
    </div>
  );
}

export function HeatmapChart({ data }) {
  if (!data?.length) return <EmptyChart />;

  const regions = [...new Set(data.map((d) => d.region))];
  const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const severityColors = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' };
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="overflow-x-auto h-full flex items-center">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left p-2 text-slate-500 font-medium border-b border-slate-700/50">Region</th>
            {severities.map((s) => (
              <th key={s} className="p-2 text-slate-500 font-medium border-b border-slate-700/50">{s}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/20">
          {regions.map((region) => (
            <tr key={region} className="hover:bg-slate-800/30 transition-colors">
              <td className="p-3 font-mono text-slate-400">{region}</td>
              {severities.map((sev) => {
                const item = data.find((d) => d.region === region && d.severity === sev);
                const count = item?.count || 0;
                const opacity = count / maxCount;
                return (
                  <td key={sev} className="p-2">
                    <div
                      className="rounded-md w-full h-8 flex items-center justify-center font-medium transition-all"
                      style={{
                        backgroundColor: count > 0 ? `${severityColors[sev]}${Math.round(opacity * 60 + 40).toString(16).padStart(2, '0')}` : '#1e293b',
                        color: count > 0 ? '#fff' : '#64748b',
                        border: count > 0 ? `1px solid ${severityColors[sev]}40` : '1px solid transparent'
                      }}
                      title={`${region} - ${sev}: ${count}`}
                    >
                      {count > 0 ? count : '-'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
