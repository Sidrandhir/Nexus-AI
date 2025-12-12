import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { X, Users, MessageSquare, DollarSign, Activity, AlertCircle, TrendingUp } from 'lucide-react';
import { getSystemMetrics, getAverageResponseTime, getErrorRate } from '../services/monitoringService';
import { GlobalStats } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [metrics, setMetrics] = useState<GlobalStats | null>(null);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [errorRate, setErrorRate] = useState(0);

  useEffect(() => {
    // Load metrics
    setMetrics(getSystemMetrics());
    setAvgResponseTime(getAverageResponseTime());
    setErrorRate(getErrorRate());

    // Refresh every 30s
    const interval = setInterval(() => {
      setMetrics(getSystemMetrics());
      setErrorRate(getErrorRate());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  // Prepare data for Model Pie Chart
  const modelData = Object.entries(metrics.modelCounts).map(([name, value]) => ({
    name,
    value: value as number
  }));

  return (
    <div className="fixed inset-0 z-[70] bg-nexus-900 flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-nexus-800 flex items-center justify-between px-6 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-nexus-primary/20 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-nexus-primary" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">Admin Console</h1>
            <p className="text-xs text-gray-400">System Monitoring & Analytics</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-nexus-800 border border-white/5 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-white mt-1">${metrics.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12% from last week
              </div>
            </div>

            <div className="bg-nexus-800 border border-white/5 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Users</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{metrics.totalUsers.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="text-xs text-blue-400 flex items-center gap-1">
                 Active today: {metrics.dailyStats[metrics.dailyStats.length - 1]?.users || 0}
              </div>
            </div>

            <div className="bg-nexus-800 border border-white/5 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Messages</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{metrics.totalMessages.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div className="text-xs text-purple-400 flex items-center gap-1">
                 Avg Resp Time: {avgResponseTime}ms
              </div>
            </div>

            <div className="bg-nexus-800 border border-white/5 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">System Health</p>
                  <h3 className="text-2xl font-bold text-white mt-1">99.9%</h3>
                </div>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                 Error Rate: {errorRate.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* User Growth & Activity */}
            <div className="bg-nexus-800 border border-white/5 rounded-xl p-6 shadow-lg min-h-[350px]">
              <h3 className="text-lg font-bold text-white mb-6">User Activity & Growth</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.dailyStats}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                    <Area type="monotone" dataKey="messages" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMsgs)" name="Messages" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-nexus-800 border border-white/5 rounded-xl p-6 shadow-lg min-h-[350px]">
              <h3 className="text-lg font-bold text-white mb-6">Revenue Trend</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Daily Revenue ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Model Distribution */}
            <div className="bg-nexus-800 border border-white/5 rounded-xl p-6 shadow-lg min-h-[350px]">
              <h3 className="text-lg font-bold text-white mb-6">Model Popularity</h3>
              <div className="h-[250px] w-full flex items-center justify-center">
                {modelData.length > 0 && modelData.some(d => d.value > 0) ? (
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {modelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-sm">No model usage data yet</p>
                )}
              </div>
            </div>

            {/* Error Logs */}
            <div className="lg:col-span-2 bg-nexus-800 border border-white/5 rounded-xl p-6 shadow-lg min-h-[350px] flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" /> Recent System Errors
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-nexus-900/50 rounded-lg border border-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-gray-400 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="text-left py-2 px-4 font-medium">Time</th>
                      <th className="text-left py-2 px-4 font-medium">Error Message</th>
                      <th className="text-right py-2 px-4 font-medium">User ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {metrics.errors.length > 0 ? (
                      metrics.errors.map((err) => (
                        <tr key={err.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 px-4 text-gray-500 whitespace-nowrap">
                            {new Date(err.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-4 text-red-300 font-mono text-xs">
                            {err.message.substring(0, 60)}{err.message.length > 60 ? '...' : ''}
                          </td>
                          <td className="py-2 px-4 text-right text-gray-500 font-mono text-xs">
                            {err.userId ? err.userId.substring(0, 8) + '...' : 'System'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-500 italic">
                          No errors recorded. System healthy.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;