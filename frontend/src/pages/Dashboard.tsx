import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import {
  Users,
  Compass,
  Wrench,
  Calendar,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC = () => {
  // Fetch KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const res = await api.get('/dashboard/kpis');
      return res.data;
    },
  });

  // Fetch Charts Data
  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['charts'],
    queryFn: async () => {
      const res = await api.get('/dashboard/charts');
      return res.data;
    },
  });

  // Fetch Activities
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await api.get('/dashboard/activities');
      return res.data;
    },
  });

  if (kpisLoading || chartsLoading || activitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 animate-pulse rounded-2xl"></div>
          <div className="h-96 bg-slate-200 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Customers', value: kpis?.totalCustomers || 0, icon: Users, color: 'bg-blue-500/10 text-blue-600' },
    { title: 'Machines Installed', value: kpis?.installedMachines || 0, icon: Compass, color: 'bg-emerald-500/10 text-emerald-600' },
    { title: 'Active Tickets', value: kpis?.pendingCalls || 0, icon: Wrench, color: 'bg-amber-500/10 text-amber-600' },
    { title: 'PM Visits Due', value: kpis?.pmDue || 0, icon: Calendar, color: 'bg-indigo-500/10 text-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Real-time telemetry and service status metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold flex items-center gap-2">
            <span className="h-2 w-2 bg-emerald-400 rounded-full animate-ping"></span> Live Server
          </span>
        </div>
      </div>

      {/* Stats Counter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="premium-card p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-2 font-display">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Card (Full Width on Large Devices) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue KPI box */}
        <div className="premium-card p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:transform-none">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">System Revenues</span>
            <IndianRupee className="h-5 w-5 text-blue-200" />
          </div>
          <h2 className="text-3xl font-extrabold mt-4 font-display">INR {kpis?.revenue?.totalRevenue?.toLocaleString('en-IN') || '0.00'}</h2>
          <p className="text-xs text-blue-200 mt-1">Paid Service & AMC Contracts Ledger</p>

          <div className="mt-8 space-y-3 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-200">Base Services:</span>
              <span className="font-bold">INR {kpis?.revenue?.serviceRevenue?.toLocaleString('en-IN') || '0.00'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-200">Taxes (18%):</span>
              <span className="font-bold">INR {kpis?.revenue?.taxRevenue?.toLocaleString('en-IN') || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* PM and Warranty expirations widgets */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Critical Expiry Reminders</h3>
              <p className="text-slate-400 text-[10px]">Contracts expiring in 30 days</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-600 font-medium">Warranty Cards Expiring</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-mono font-bold text-xs rounded">
                {kpis?.warrantyExpiring || 0} Machine(s)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-600 font-medium">AMCs Ending Soon</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 font-mono font-bold text-xs rounded">
                {kpis?.amcExpiring || 0} Contract(s)
              </span>
            </div>
          </div>
        </div>

        {/* Quick telemetry status */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Service Call Metrics</h3>
              <p className="text-slate-400 text-[10px]">Today's ticketing activity</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Today's Inflow</span>
              <span className="text-2xl font-extrabold text-slate-700 mt-1 block font-display">{kpis?.todaysCalls || 0}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Total Completed</span>
              <span className="text-2xl font-extrabold text-slate-700 mt-1 block font-display">{kpis?.completedCalls || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Graphical Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="premium-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-sm">Monthly Revenue Trend</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Paid Invoices
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.revenueTrend || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine Brands Breakdown */}
        <div className="premium-card p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-6">Installation Brands Share</h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.brandDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.brandDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {(charts?.brandDistribution || []).map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities & Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audits Ledger */}
        <div className="premium-card p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-800 text-sm mb-6">System Security Audit Ledger</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {activities && activities.length > 0 ? (
              activities.map((log: any) => (
                <div key={log.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100/50 transition-colors">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-800">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{log.details}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                        User: {log.user?.name || 'System'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">IP: {log.ipAddress || '127.0.0.1'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs py-4 text-center">No recent activities found.</p>
            )}
          </div>
        </div>

        {/* Service status bar chart */}
        <div className="premium-card p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-6">Tickets Status Split</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.callsDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {(charts?.callsDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
