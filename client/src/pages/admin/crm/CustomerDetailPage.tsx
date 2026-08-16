import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, Star, Calendar,
  TrendingUp, Home, Eye, DollarSign, Clock
} from 'lucide-react';
import { adminCRMApi } from '../../../api/admin-crm.api';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const data = await adminCRMApi.getCustomerDetail(parseInt(id!));
      setCustomer(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatCurrency = (v?: number) => {
    if (!v) return '—';
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
    return `₹${v.toLocaleString()}`;
  };

  if (loading) return <div className="p-6 animate-pulse space-y-4"><div className="h-8 bg-border rounded-xl w-64" /><div className="h-48 bg-border rounded-2xl" /></div>;
  if (!customer) return <div className="p-6 text-center text-text-secondary">Customer not found.</div>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <button onClick={() => navigate('/admin/crm/customers')} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {customer.full_name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-heading font-bold text-text-primary">{customer.full_name || 'Unknown'}</h1>
              {customer.customer_number && (
                <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded-full border border-border">{customer.customer_number}</span>
              )}
              {customer.is_premium && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Premium
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
              {customer.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{customer.phone}</span>}
              {customer.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{customer.email}</span>}
              {customer.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{customer.city}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: customer.total_leads || 0, icon: <TrendingUp className="w-5 h-5" />, color: '#6366f1' },
          { label: 'Total Bookings', value: customer.total_bookings || 0, icon: <Home className="w-5 h-5" />, color: '#22c55e' },
          { label: 'Site Visits', value: customer.total_site_visits || 0, icon: <Eye className="w-5 h-5" />, color: '#3b82f6' },
          { label: 'Avg Lead Score', value: customer.avg_lead_score ? Math.round(customer.avg_lead_score) : '—', icon: <Star className="w-5 h-5" />, color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">{stat.label}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: stat.color + '22', color: stat.color }}>{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lead History */}
      {customer.leads?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-heading font-semibold text-text-primary mb-4">Lead History ({customer.leads.length})</h3>
          <div className="space-y-3">
            {customer.leads.map((lead: any) => (
              <div
                key={lead.id}
                onClick={() => navigate(`/admin/crm/leads/${lead.id}`)}
                className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border cursor-pointer hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-text-primary">{lead.lead_number}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                      {lead.stage?.replace(/_/g,' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{lead.source} • Budget: {formatCurrency(lead.budget_max)}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: lead.priority === 'hot' ? '#ef4444' : lead.priority === 'vip' ? '#7c3aed' : '#6b7280' }}>
                  {lead.priority?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
