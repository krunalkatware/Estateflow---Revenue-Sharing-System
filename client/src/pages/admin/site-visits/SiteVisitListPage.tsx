import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Plus, Download, Eye, CheckCircle, XCircle,
  Clock, RefreshCw, ChevronLeft, ChevronRight, MapPin, Navigation,
  Trash2, UserCheck
} from 'lucide-react';
import useQuery from '../../../hooks/useQuery';
import { adminSiteVisitsApi } from '../../../api/admin-site-visits.api';

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  draft:       { label: 'Draft',       cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  scheduled:   { label: 'Scheduled',   cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  in_transit:  { label: 'In Transit',  cls: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  arrived:     { label: 'Arrived',     cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  completed:   { label: 'Completed',   cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  cancelled:   { label: 'Cancelled',   cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
  rescheduled: { label: 'Rescheduled', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  no_show:     { label: 'No Show',     cls: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
};

export default function SiteVisitListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const { data, loading, refetch } = useQuery(
    () => adminSiteVisitsApi.getSiteVisits({
      page,
      limit: 12,
      search,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined
    }),
    [page, search, statusFilter, priorityFilter]
  );

  const visits = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} site visits?`)) return;
    await adminSiteVisitsApi.bulkDelete(selected);
    setSelected([]);
    refetch();
  };

  const handleBulkAssign = async () => {
    const repIdStr = prompt("Enter Sales Representative ID to assign:");
    if (!repIdStr) return;
    const repId = Number(repIdStr);
    if (isNaN(repId)) return alert("Invalid Representative ID");
    await adminSiteVisitsApi.bulkAssign(selected, repId);
    setSelected([]);
    refetch();
  };

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Visits List</h1>
          <p className="text-slate-400 mt-1">{total} matches found</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => adminSiteVisitsApi.exportCSV()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-white transition-all text-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => navigate('/admin/site-visits/new')}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm">
            <Plus size={16} /> New Visit
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by visit number or customer name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm">
          <option value="">All Statuses</option>
          {Object.entries(STATUS_PILL).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm bg-slate-800/20">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Bulk Operations Bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
          <span className="text-sm text-indigo-300">{selected.length} items selected</span>
          <button onClick={handleBulkAssign} className="px-3 py-1.5 text-xs rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 flex items-center gap-1.5 font-semibold">
            <UserCheck size={14} /> Bulk Assign Rep
          </button>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 flex items-center gap-1.5 font-semibold">
            <Trash2 size={14} /> Bulk Delete
          </button>
          <button onClick={() => setSelected([])} className="ml-auto text-xs text-slate-400 hover:text-white">Clear</button>
        </div>
      )}

      {/* Grid List representation */}
      <div className="rounded-2xl border border-slate-700/50 overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <MapPin size={40} className="mb-3 opacity-50" />
            <p>No site visits scheduled yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="p-4 text-left">
                    <input type="checkbox" onChange={e => setSelected(e.target.checked ? visits.map((v: any) => v.id) : [])}
                      checked={selected.length === visits.length && visits.length > 0} className="w-4 h-4 rounded" />
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Visit No.</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Property Site</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type / Priority</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sales Executive</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {visits.map((v: any) => {
                  const pill = STATUS_PILL[v.status] ?? { label: v.status, cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
                  return (
                    <tr key={v.id} className="hover:bg-slate-800/30 transition-all group">
                      <td className="p-4">
                        <input type="checkbox" checked={selected.includes(v.id)} onChange={() => toggleSelect(v.id)} className="w-4 h-4 rounded" />
                      </td>
                      <td className="p-4 font-mono font-bold text-indigo-400 text-sm">
                        {v.visit_number}
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-white">{v.customer?.name ?? 'Anonymous'}</div>
                        <div className="text-xs text-slate-400">{v.customer?.phone ?? ''}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-white truncate max-w-48">{v.property?.title ?? 'N/A'}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} /> {v.property?.locality ?? ''}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-white capitalize">{v.visit_type}</div>
                        <div className={`text-[10px] uppercase font-bold mt-0.5 ${
                          v.priority === 'high' ? 'text-red-400' : v.priority === 'low' ? 'text-slate-500' : 'text-amber-400'
                        }`}>{v.priority}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-white">
                          {new Date(v.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-400">{v.scheduled_time ?? '10:00 AM'}</div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-300">
                        {v.sales_executive_name}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${pill.cls}`}>
                          {pill.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => navigate(`/admin/site-visits/${v.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50 bg-slate-900/10">
            <span className="text-xs text-slate-400">Page {page} of {pages} · {total} matches</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-40 transition-all">
                <ChevronLeft size={14} /> Prev
              </button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-40 transition-all">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
