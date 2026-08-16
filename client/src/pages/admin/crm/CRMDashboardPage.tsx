import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, Target, Flame, AlertCircle, CheckCircle2,
  DollarSign, Bell, Plus, Download, Filter, RefreshCw,
  PhoneCall, Calendar, ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { adminCRMApi, CRMStats } from '../../../api/admin-crm.api';

const STAGE_COLORS: Record<string, string> = {
  new: '#6366f1',
  contacted: '#3b82f6',
  interested: '#06b6d4',
  site_visit_scheduled: '#10b981',
  negotiation: '#f59e0b',
  booking_requested: '#f97316',
  booked: '#22c55e',
  lost: '#ef4444',
  closed: '#8b5cf6',
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  vip:    { label: 'VIP',    color: '#fff',    bg: '#7c3aed' },
  hot:    { label: 'Hot',    color: '#fff',    bg: '#ef4444' },
  high:   { label: 'High',   color: '#fff',    bg: '#f97316' },
  medium: { label: 'Medium', color: '#fff',    bg: '#3b82f6' },
  low:    { label: 'Low',    color: '#fff',    bg: '#6b7280' },
};

const SOURCE_COLORS = ['#6366f1','#3b82f6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delta?: string;
  positive?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, delta, positive, onClick }) => (
  <div
    className={`card p-5 cursor-pointer hover:shadow-md transition-all duration-200 border border-border ${onClick ? 'hover:-translate-y-0.5' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</span>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: color + '22' }}>
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
    <div className="text-2xl font-bold text-text-primary mb-1">{value}</div>
    {delta && (
      <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {delta}
      </div>
    )}
  </div>
);

export default function CRMDashboardPage() {
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminCRMApi.getStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load CRM stats', e);
    } finally {
      setLoading(false);
    }
  };

  const funnelData = stats
    ? Object.entries(stats.sales_funnel).map(([stage, count]) => ({
        name: stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: count,
        fill: STAGE_COLORS[stage] || '#6366f1',
      }))
    : [];

  const sourceData = stats?.lead_sources || [];

  const formatCurrency = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    return `₹${v.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-border rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-border rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">CRM Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Customer & Lead Management Analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadStats} className="btn-outline btn-sm gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => navigate('/admin/crm/leads/create')} className="btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats?.summary.total_leads ?? 0}
          icon={<Users className="w-5 h-5" />}
          color="#6366f1"
          delta="All pipeline stages"
          positive={true}
          onClick={() => navigate('/admin/crm/leads')}
        />
        <StatCard
          title="Hot Leads"
          value={stats?.summary.hot_leads ?? 0}
          icon={<Flame className="w-5 h-5" />}
          color="#ef4444"
          delta="High priority & VIP"
          positive={true}
          onClick={() => navigate('/admin/crm/leads?priority=hot')}
        />
        <StatCard
          title="New Today"
          value={stats?.summary.new_leads_today ?? 0}
          icon={<Plus className="w-5 h-5" />}
          color="#10b981"
          delta="Inbound today"
          positive={true}
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats?.summary.conversion_rate ?? 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="#f59e0b"
          delta="Leads → Booked"
          positive={(stats?.summary.conversion_rate ?? 0) > 10}
        />
        <StatCard
          title="Lost Leads"
          value={stats?.summary.lost_leads ?? 0}
          icon={<AlertCircle className="w-5 h-5" />}
          color="#ef4444"
          delta="Stage: Lost"
          positive={false}
        />
        <StatCard
          title="Booked Leads"
          value={stats?.summary.booked_leads ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="#22c55e"
          delta="Successfully closed"
          positive={true}
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(stats?.summary.estimated_pipeline_value ?? 0)}
          icon={<DollarSign className="w-5 h-5" />}
          color="#8b5cf6"
          delta="Estimated deal value"
          positive={true}
        />
        <StatCard
          title="Pending Reminders"
          value={stats?.summary.pending_reminders ?? 0}
          icon={<Bell className="w-5 h-5" />}
          color="#f97316"
          delta="Follow-up due"
          positive={false}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Pipeline Funnel */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-text-primary">Sales Pipeline</h3>
            <button onClick={() => navigate('/admin/crm/kanban')} className="btn-outline btn-xs gap-1">
              <Eye className="w-3 h-3" /> Kanban View
            </button>
          </div>
          {funnelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 80, right: 30, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v: any) => [`${v} leads`, 'Count']} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">No pipeline data</div>
          )}
        </div>

        {/* Lead Sources Pie Chart */}
        <div className="card p-6">
          <h3 className="font-heading font-semibold text-text-primary mb-4">Lead Sources</h3>
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={sourceData}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={3}
                  label={(entry: any) => `${entry.source} ${((entry.percent || 0) * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {sourceData.map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">No source data</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Manage Leads', icon: <Users className="w-4 h-4" />, href: '/admin/crm/leads', color: '#6366f1' },
          { label: 'Kanban Board', icon: <Target className="w-4 h-4" />, href: '/admin/crm/kanban', color: '#3b82f6' },
          { label: 'Customers', icon: <Users className="w-4 h-4" />, href: '/admin/crm/customers', color: '#10b981' },
          { label: 'Export CSV', icon: <Download className="w-4 h-4" />, href: null, color: '#f59e0b', action: () => adminCRMApi.exportCSV() },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => item.href ? navigate(item.href) : item.action?.()}
            className="card p-4 flex items-center gap-3 hover:shadow-md transition-all text-left hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.color + '22', color: item.color }}>
              {item.icon}
            </div>
            <span className="text-sm font-semibold text-text-primary">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
