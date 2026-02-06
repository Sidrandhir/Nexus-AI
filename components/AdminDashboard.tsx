
import React, { useMemo } from 'react';
import { AdminStats, AIModel } from '../types';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

interface AdminDashboardProps {
  stats: AdminStats;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats }) => {
  const COLORS = ['#10a37f', '#6366f1', '#f59e0b', '#ef4444'];
  
  const pieData = useMemo(() => [
    { name: 'GPT-4', value: stats.modelDistribution[AIModel.GPT4] },
    { name: 'Claude', value: stats.modelDistribution[AIModel.CLAUDE] },
    { name: 'Gemini', value: stats.modelDistribution[AIModel.GEMINI] },
  ].filter(d => d.value > 0), [stats.modelDistribution]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#171717] text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#2f2f2f] pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold flex items-center gap-3 flex-wrap">
              Admin Dashboard
              <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-widest">Live</span>
            </h1>

          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#666] font-bold uppercase tracking-widest">Last Refresh</p>
            <p className="text-xs font-mono">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Top Level Metrics */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
            { label: 'Msgs Today', value: stats.messagesToday, icon: '💬' },
            { label: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: '💰' },
            { label: 'Avg Latency', value: `${stats.avgResponseTime.toFixed(0)}ms`, icon: '⚡' },
            { label: 'Error Rate', value: `${stats.errorRate.toFixed(1)}%`, icon: '⚠️', color: stats.errorRate > 5 ? 'text-red-500' : 'text-[#10a37f]' },
            { label: 'Pro Ratio', value: `${((stats.totalRevenue / 29) / stats.totalUsers * 100 || 0).toFixed(0)}%`, icon: '⭐' },
          ].map((m, i) => (
            <div key={i} className="bg-[#2f2f2f]/50 p-4 rounded-2xl border border-[#4a4a4a] flex flex-col justify-between">
              <span className="text-2xl mb-2">{m.icon}</span>
              <div>
                <p className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-xl font-bold truncate ${m.color || ''}`}>{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-[#2f2f2f]/50 p-4 sm:p-6 rounded-3xl border border-[#4a4a4a]">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 sm:mb-6 text-[#8e8e93]">Revenue & Growth</h3>
            <div className="h-48 sm:h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.growthHistory}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10a37f" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10a37f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #4a4a4a', borderRadius: '12px' }}
                    itemStyle={{ color: '#ececec' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10a37f" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#2f2f2f]/50 p-4 sm:p-6 rounded-3xl border border-[#4a4a4a]">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 sm:mb-6 text-[#8e8e93]">Model Popularity</h3>
            <div className="h-56 sm:h-64 flex flex-col">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-auto space-y-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      {d.name}
                    </span>
                    <span className="font-bold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Logs Table */}
        <div className="bg-[#2f2f2f]/50 rounded-3xl border border-[#4a4a4a] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#4a4a4a] flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#8e8e93]">Error Logs</h3>
            <span className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 font-bold">
              {stats.errorLogs.length} Events Total
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto overflow-x-auto">
            {stats.errorLogs.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#2f2f2f] text-[#8e8e93] font-bold">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4a4a4a]">
                  {stats.errorLogs.map((log) => (
                    <tr key={log.id} className={`hover:bg-white/5 transition-colors ${log.critical ? 'text-red-400 font-medium' : 'text-[#ececec]'}`}>
                      <td className="px-6 py-4 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-bold ${log.critical ? 'bg-red-500 text-white' : 'bg-yellow-500/20 text-yellow-500'}`}>
                          {log.critical ? 'Critical' : 'Warning'}
                        </span>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[120px]">{log.model || 'System'}</td>
                      <td className="px-6 py-4">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 sm:p-12 text-center text-[#666] italic">No errors recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
