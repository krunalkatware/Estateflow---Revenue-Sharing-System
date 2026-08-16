import React, { useState, useEffect, useCallback, Fragment } from 'react';
import {
  Plus, Edit2, CheckCircle2, XCircle, Search, Shield, X,
  Save, AlertCircle, RefreshCw, Loader2, Calculator,
} from 'lucide-react';
import {
  listRevenueRules,
  createRevenueRule,
  updateRevenueRule,
  deleteRevenueRule,
  type RevenueRule,
  type RevenueRuleCreate,
} from '../../../api/admin-revenue.api';
import { RevenueCalculatorModal } from '../../../components/revenue/RevenueCalculatorModal';

const ROLES = [
  { value: 'broker', label: 'Broker' },
  { value: 'sales_executive', label: 'Sales Executive' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'channel_partner', label: 'Channel Partner' },
  { value: 'referral', label: 'Referral' },
  { value: 'platform', label: 'Platform' },
  { value: 'builder', label: 'Builder' },
];

const EMPTY_FORM: RevenueRuleCreate = {
  name: '',
  description: '',
  role: 'broker',
  commission_type: 'percentage',
  value: 0,
  min_booking_value: undefined,
  max_commission_cap: undefined,
  property_type: '',
  city: '',
  priority: 5,
  is_active: true,
};

function RuleModal({
  open, initial, onClose, onSave,
}: {
  open: boolean;
  initial?: RevenueRule;
  onClose: () => void;
  onSave: (data: RevenueRuleCreate, id?: number) => Promise<void>;
}) {
  const [form, setForm] = useState<RevenueRuleCreate>(initial ? {
    name: initial.name,
    description: initial.description || '',
    role: initial.role,
    commission_type: initial.commission_type,
    value: initial.value,
    min_booking_value: initial.min_booking_value,
    max_commission_cap: initial.max_commission_cap,
    property_type: initial.property_type || '',
    city: initial.city || '',
    priority: initial.priority,
    is_active: initial.is_active,
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        name: initial.name, description: initial.description || '',
        role: initial.role, commission_type: initial.commission_type,
        value: initial.value, min_booking_value: initial.min_booking_value,
        max_commission_cap: initial.max_commission_cap,
        property_type: initial.property_type || '', city: initial.city || '',
        priority: initial.priority, is_active: initial.is_active,
      } : EMPTY_FORM);
      setError(null);
    }
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Rule name is required'); return; }
    if (form.value <= 0) { setError('Commission value must be greater than 0'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(form, initial?.id);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save commission rule');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            {initial ? 'Edit Commission Rule' : 'Create Commission Rule'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Rule Name *</label>
            <input
              type="text" required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Standard Broker Commission"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Target Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              >
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Commission Type *</label>
              <select
                value={form.commission_type}
                onChange={(e) => setForm({ ...form, commission_type: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Value * {form.commission_type === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <input
                type="number" step="0.01" min="0" required
                value={form.value}
                onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Priority</label>
              <input
                type="number" min="1" max="100"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Min Booking Value (₹)</label>
              <input
                type="number" min="0"
                value={form.min_booking_value ?? ''}
                onChange={(e) => setForm({ ...form, min_booking_value: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="No minimum"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Max Cap (₹)</label>
              <input
                type="number" min="0"
                value={form.max_commission_cap ?? ''}
                onChange={(e) => setForm({ ...form, max_commission_cap: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="No cap"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Property Type</label>
              <input
                type="text"
                value={form.property_type ?? ''}
                onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                placeholder="All / Residential / Commercial"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">City / Region</label>
              <input
                type="text"
                value={form.city ?? ''}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="All cities"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              rows={2}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded accent-primary"
            />
            <label htmlFor="is_active" className="text-sm text-slate-300">Active (applies to new bookings immediately)</label>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition shadow-glow-primary disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CommissionRulesPage() {
  const [rules, setRules] = useState<RevenueRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RevenueRule | undefined>(undefined);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listRevenueRules({ limit: 100 });
      setRules(data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load commission rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const handleSave = async (data: RevenueRuleCreate, id?: number) => {
    if (id) {
      const updated = await updateRevenueRule(id, data);
      setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } else {
      const created = await createRevenueRule(data);
      setRules((prev) => [...prev, created]);
    }
  };

  const toggleStatus = async (rule: RevenueRule) => {
    setToggling(rule.id);
    try {
      const updated = await updateRevenueRule(rule.id, { is_active: !rule.is_active });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    } catch {
      // ignore
    } finally {
      setToggling(null);
    }
  };

  const openCreate = () => { setEditTarget(undefined); setModalOpen(true); };
  const openEdit = (rule: RevenueRule) => { setEditTarget(rule); setModalOpen(true); };
  const [calcModalOpen, setCalcModalOpen] = useState(false);

  const filtered = rules.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.role.includes(search.toLowerCase());
    const matchRole = !roleFilter || r.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <RuleModal
        open={modalOpen}
        initial={editTarget}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <RevenueCalculatorModal
        isOpen={calcModalOpen}
        onClose={() => setCalcModalOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Commission Rules &amp; Logic</h1>
          <p className="text-sm text-slate-400 mt-0.5">Configure multi-tier percentage &amp; flat payout rules by role &amp; property type</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCalcModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-sm font-semibold rounded-xl border border-emerald-500/30 transition"
          >
            <Calculator className="w-4 h-4" />
            Revenue Calculator
          </button>
          <button
            onClick={fetchRules}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition shadow-glow-primary"
          >
            <Plus className="w-4 h-4" />
            Create Commission Rule
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={fetchRules} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <span className="text-xs text-slate-500">{filtered.length} rules</span>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="space-y-px">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse border-b border-slate-800/60">
                <div className="w-40 h-4 bg-slate-800 rounded" />
                <div className="w-24 h-5 bg-slate-800 rounded-full" />
                <div className="w-16 h-4 bg-slate-800 rounded ml-auto" />
                <div className="w-20 h-5 bg-slate-800 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No commission rules found</p>
            <p className="text-xs mt-1">Click "Create Commission Rule" to add your first rule</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Rule Name</th>
                <th className="px-6 py-3.5">Target Role</th>
                <th className="px-6 py-3.5">Payout Value</th>
                <th className="px-6 py-3.5">Min Booking</th>
                <th className="px-6 py-3.5">Property Scope</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{rule.name}</p>
                    {rule.description && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{rule.description}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      {ROLES.find((r) => r.value === rule.role)?.label || rule.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-400">
                    {rule.commission_type === 'percentage'
                      ? `${rule.value}%`
                      : `₹${rule.value.toLocaleString('en-IN')}`}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {rule.min_booking_value
                      ? `₹${(rule.min_booking_value / 100000).toFixed(1)}L+`
                      : 'No minimum'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300">{rule.property_type || 'All'}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">P-{rule.priority}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(rule)}
                      disabled={toggling === rule.id}
                      className="cursor-pointer disabled:opacity-50"
                    >
                      {toggling === rule.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : rule.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(rule)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
