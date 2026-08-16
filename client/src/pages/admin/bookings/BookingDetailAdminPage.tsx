import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Clock, XCircle, DollarSign, FileText,
  MessageSquare, Bell, Printer, Download, Edit, User, Building2,
  Calendar, IndianRupee, Tag, MoreVertical, Trash2, Plus, Phone,
  Mail, Hash, Layers, RefreshCw, Send, ChevronRight
} from 'lucide-react';
import useQuery from '../../../hooks/useQuery';
import { adminBookingsApi } from '../../../api/admin-bookings.api';

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  draft:               { label: 'Draft',              cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  requested:           { label: 'Requested',          cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  pending_approval:    { label: 'Pending Approval',   cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  approved:            { label: 'Approved',           cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  agreement_generated: { label: 'Agreement Generated', cls: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  payment_pending:     { label: 'Payment Pending',    cls: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  token_paid:          { label: 'Token Paid',         cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  installment_running: { label: 'Installment Running', cls: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  completed:           { label: 'Completed',          cls: 'bg-green-500/20 text-green-300 border-green-500/30' },
  rejected:            { label: 'Rejected',           cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
  cancelled:           { label: 'Cancelled',          cls: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
};

const NEXT_STATUS: Record<string, string[]> = {
  draft: ['requested'],
  requested: ['pending_approval', 'rejected'],
  pending_approval: ['approved', 'rejected'],
  approved: ['agreement_generated', 'rejected'],
  agreement_generated: ['token_paid', 'payment_pending'],
  payment_pending: ['token_paid'],
  token_paid: ['installment_running'],
  installment_running: ['completed', 'cancelled'],
  completed: [],
  rejected: [],
  cancelled: ['refund_initiated'],
};

function formatINR(v: number) {
  return `₹${v.toLocaleString('en-IN')}`;
}

function Section({ title, children, icon: Icon }: any) {
  return (
    <div className="rounded-2xl border border-slate-700/50 overflow-hidden" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-700/50">
        <Icon size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/30 last:border-0 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`text-white font-medium ${mono ? 'font-mono text-indigo-400' : ''}`}>{value}</span>
    </div>
  );
}

export default function BookingDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'documents' | 'timeline' | 'comments'>('overview');
  const [transitioning, setTransitioning] = useState(false);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const { data: booking, loading, refetch } = useQuery(() => adminBookingsApi.getBooking(Number(id)), [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Transition booking to "${newStatus}"?`)) return;
    setTransitioning(true);
    try {
      await adminBookingsApi.updateStatus(Number(id), newStatus);
      refetch();
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Status transition failed');
    } finally {
      setTransitioning(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setAddingComment(true);
    try {
      await adminBookingsApi.addComment(Number(id), comment);
      setComment('');
      refetch();
    } catch {}
    setAddingComment(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="flex items-center justify-center min-h-96 text-slate-400">Booking not found</div>
  );

  const pill = STATUS_PILL[booking.status] || { label: booking.status, cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
  const nextStatuses = NEXT_STATUS[booking.status] || [];
  const paymentProgress = booking.net_total > 0 ? (booking.paid_amount / booking.net_total) * 100 : 0;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Hash },
    { id: 'payments', label: 'Payments', icon: IndianRupee },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" style={{ minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <button onClick={() => navigate('/admin/bookings/list')} className="hover:text-white transition-colors flex items-center gap-1.5">
          <ArrowLeft size={14} /> All Bookings
        </button>
        <ChevronRight size={12} />
        <span className="text-white font-mono">{booking.booking_number}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white font-mono">{booking.booking_number}</h1>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${pill.cls}`}>{pill.label}</span>
          </div>
          <p className="text-slate-400 text-sm">{booking.property?.name || 'N/A'} · Unit {booking.unit_number} · {booking.bhk_type}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-all">
            <Printer size={14} /> Print
          </button>
          <button onClick={() => adminBookingsApi.downloadAgreement(Number(id))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-all">
            <Download size={14} /> Agreement PDF
          </button>
        </div>
      </div>

      {/* Status Transition Bar */}
      {nextStatuses.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-700/50" style={{ background: 'var(--bg-card)' }}>
          <span className="text-sm text-slate-400 mr-2">Transition Status:</span>
          {nextStatuses.map(s => {
            const p = STATUS_PILL[s] || { label: s, cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
            return (
              <button key={s} disabled={transitioning} onClick={() => handleStatusChange(s)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium border ${p.cls} hover:opacity-80 transition-all disabled:opacity-40`}>
                {transitioning ? '...' : `→ ${p.label}`}
              </button>
            );
          })}
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Net Total', value: formatINR(booking.net_total), color: 'text-white', bg: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/20' },
          { label: 'Paid Amount', value: formatINR(booking.paid_amount), color: 'text-emerald-400', bg: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20' },
          { label: 'Remaining', value: formatINR(booking.remaining_amount), color: 'text-amber-400', bg: 'from-amber-500/10 to-orange-500/10 border-amber-500/20' },
          { label: 'Token Amount', value: formatINR(booking.token_amount), color: 'text-cyan-400', bg: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20' },
        ].map((item, i) => (
          <div key={i} className={`rounded-2xl p-4 border bg-gradient-to-br ${item.bg}`}>
            <div className="text-xs text-slate-400 mb-1.5">{item.label}</div>
            <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Payment Progress Bar */}
      <div className="rounded-2xl border border-slate-700/50 p-4" style={{ background: 'var(--bg-card)' }}>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Payment Progress</span>
          <span className="text-white font-medium">{paymentProgress.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(paymentProgress, 100)}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-700/50">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="Customer Details" icon={User}>
            {booking.customer ? (
              <div className="space-y-2">
                <InfoRow label="Name" value={booking.customer.name} />
                <InfoRow label="Email" value={booking.customer.email} />
                <InfoRow label="Phone" value={booking.customer.phone} />
              </div>
            ) : <p className="text-slate-500 text-sm">No customer linked</p>}
          </Section>

          <Section title="Property Details" icon={Building2}>
            <div className="space-y-2">
              <InfoRow label="Property" value={booking.property?.name || '—'} />
              <InfoRow label="Locality" value={booking.property?.locality || '—'} />
              <InfoRow label="Unit Number" value={booking.unit_number || '—'} />
              <InfoRow label="Floor" value={booking.floor_number} />
              <InfoRow label="BHK Type" value={booking.bhk_type} />
              <InfoRow label="Super Builtup" value={`${booking.super_builtup_area} sq.ft`} />
              <InfoRow label="Carpet Area" value={`${booking.carpet_area} sq.ft`} />
            </div>
          </Section>

          <Section title="Pricing Breakdown" icon={IndianRupee}>
            <div className="space-y-1">
              <InfoRow label="Base Price" value={formatINR(booking.base_price)} />
              <InfoRow label="Floor Rise" value={formatINR(booking.floor_rise_charges || 0)} />
              <InfoRow label="PLC Charges" value={formatINR(booking.plc_charges || 0)} />
              <InfoRow label="Parking" value={formatINR(booking.parking_charges || 0)} />
              <InfoRow label="Club Membership" value={formatINR(booking.club_membership_charges || 0)} />
              <InfoRow label="Other Charges" value={formatINR(booking.other_charges || 0)} />
              <InfoRow label="Gross Total" value={formatINR(booking.gross_total || 0)} />
              <InfoRow label="Discount" value={`-${formatINR(booking.discount_amount || 0)}`} />
              <InfoRow label="GST" value={`${booking.gst_percent || 0}%`} />
              <InfoRow label="Stamp Duty" value={`${booking.stamp_duty_percent || 5}%`} />
              <div className="h-px bg-slate-700 my-2" />
              <div className="flex justify-between items-center text-base font-bold">
                <span className="text-white">Net Total</span>
                <span className="text-indigo-400">{formatINR(booking.net_total)}</span>
              </div>
            </div>
          </Section>

          <Section title="Booking Meta" icon={Hash}>
            <div className="space-y-2">
              <InfoRow label="Booking Number" value={booking.booking_number} mono />
              <InfoRow label="Status" value={pill.label} />
              <InfoRow label="Payment Mode" value={booking.preferred_payment_mode || '—'} />
              <InfoRow label="Created" value={new Date(booking.created_at).toLocaleString('en-IN')} />
              <InfoRow label="Last Updated" value={new Date(booking.updated_at).toLocaleString('en-IN')} />
              <InfoRow label="Source" value={booking.booking_source || 'admin'} />
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          {(booking.payments || []).length === 0 ? (
            <div className="rounded-2xl border border-slate-700/50 p-10 text-center" style={{ background: 'var(--bg-card)' }}>
              <IndianRupee size={40} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">No payments recorded yet</p>
            </div>
          ) : (
            booking.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-700/50" style={{ background: 'var(--bg-card)' }}>
                <div>
                  <div className="text-sm font-semibold text-white">{formatINR(p.amount)}</div>
                  <div className="text-xs text-slate-400">{p.payment_type} · {p.payment_mode}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">{p.transaction_reference || 'No reference'}</div>
                  <div className={`text-xs font-medium mt-1 ${p.verification_status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {p.verification_status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          {(booking.documents || []).length === 0 ? (
            <div className="rounded-2xl border border-slate-700/50 p-10 text-center" style={{ background: 'var(--bg-card)' }}>
              <FileText size={40} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">No documents uploaded yet</p>
            </div>
          ) : (
            booking.documents.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-700/50" style={{ background: 'var(--bg-card)' }}>
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-slate-500" />
                  <div>
                    <div className="text-sm font-medium text-white">{d.document_name}</div>
                    <div className="text-xs text-slate-400">{d.document_type}</div>
                  </div>
                </div>
                <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1">
                  <Download size={12} /> Download
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-3">
          {(booking.timeline || []).length === 0 ? (
            <div className="rounded-2xl border border-slate-700/50 p-10 text-center" style={{ background: 'var(--bg-card)' }}>
              <Clock size={40} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">No timeline events yet</p>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-700/50" />
              {booking.timeline.map((t: any, i: number) => (
                <div key={t.id} className="relative mb-4 pl-5">
                  <div className="absolute -left-4 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900" style={{ top: '4px' }} />
                  <div className="p-4 rounded-2xl border border-slate-700/50" style={{ background: 'var(--bg-card)' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-white">{t.title}</div>
                        {t.description && <div className="text-xs text-slate-400 mt-0.5">{t.description}</div>}
                      </div>
                      <div className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-4">
          {/* Add Comment */}
          <div className="rounded-2xl border border-slate-700/50 p-4" style={{ background: 'var(--bg-card)' }}>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              rows={3} placeholder="Add a comment or note..."
              className="w-full bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none resize-none" />
            <div className="flex justify-end mt-3">
              <button disabled={addingComment || !comment.trim()} onClick={handleAddComment}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-40 transition-all">
                <Send size={14} /> {addingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>

          {(booking.comments || []).length === 0 ? (
            <div className="rounded-2xl border border-slate-700/50 p-8 text-center" style={{ background: 'var(--bg-card)' }}>
              <MessageSquare size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-slate-400">No comments yet</p>
            </div>
          ) : (
            booking.comments.map((c: any) => (
              <div key={c.id} className="p-4 rounded-2xl border border-slate-700/50" style={{ background: 'var(--bg-card)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {(c.commenter?.name || 'A')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">{c.commenter?.name || 'Admin'}</span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-sm text-slate-300">{c.comment}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
