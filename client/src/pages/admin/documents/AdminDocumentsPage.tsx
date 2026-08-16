import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Search, CheckCircle2, Clock, XCircle, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../../api/axios';
import { toast } from '../../../contexts/ToastContext';

interface DocItem {
  id: number;
  uuid?: string;
  booking_id: number;
  booking_number: string;
  customer_name: string;
  property_name: string;
  document_type: string;
  title: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number;
  mime_type: string;
  is_verified: boolean;
  verification_notes?: string;
  created_at: string;
}

const mockDocs: DocItem[] = [
  { id: 101, booking_id: 1, booking_number: 'EFL-BK-202608-1001', customer_name: 'Rajesh Kumar', property_name: 'Skyline Villa #402', document_type: 'customer_kyc', title: 'Customer_KYC_Rajesh_Kumar.pdf', file_name: 'Customer_KYC_Rajesh_Kumar.pdf', file_url: '/api/files/download/kyc/sample.pdf', file_size_bytes: 1250000, mime_type: 'application/pdf', is_verified: false, created_at: new Date().toISOString() },
  { id: 102, booking_id: 2, booking_number: 'EFL-BK-202608-1002', customer_name: 'Priya Sharma', property_name: 'Grand Horizon Penthouse', document_type: 'sale_agreement', title: 'Builder_Agreement_Priya.pdf', file_name: 'Builder_Agreement_Priya.pdf', file_url: '/api/files/download/agreements/sample.pdf', file_size_bytes: 2400000, mime_type: 'application/pdf', is_verified: true, verification_notes: 'Verified by Legal Team', created_at: new Date().toISOString() },
];

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>(mockDocs);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/bookings/documents/all');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setDocs(res.data);
      }
    } catch (err) {
      console.warn('Using default document list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleVerify = async (action: 'verified' | 'rejected' | 'resubmission_required') => {
    if (!selectedDoc) return;
    if ((action === 'rejected' || action === 'resubmission_required') && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection or resubmission request.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/bookings/documents/${selectedDoc.id}/verify`, {
        status: action,
        rejection_reason: rejectionReason,
        notes: rejectionReason || `Marked as ${action}`,
      });
      toast.success(`Document marked as ${action.replace('_', ' ')}!`);
      setSelectedDoc(null);
      setRejectionReason('');
      fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update document verification status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = docs.filter(d => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      d.booking_number.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'verified') return matchesSearch && d.is_verified;
    if (statusFilter === 'pending') return matchesSearch && !d.is_verified;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Admin Document Verification Center</h1>
          <p className="text-sm text-slate-400">Review, verify, and manage customer identity, tax, and booking agreement documents</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, customer, or booking #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${statusFilter === 'all' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
          >
            All Documents ({docs.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${statusFilter === 'pending' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Under Review ({docs.filter(d => !d.is_verified).length})
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${statusFilter === 'verified' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Verified ({docs.filter(d => d.is_verified).length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Document Title</th>
              <th className="px-6 py-3.5">Booking / Customer</th>
              <th className="px-6 py-3.5">Property</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-slate-800/40 transition">
                <td className="px-6 py-4 font-semibold text-white">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">{d.title}</p>
                      <p className="text-xs text-slate-400">{d.file_name} • {(d.file_size_bytes / (1024 * 1024)).toFixed(1)} MB</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-white">{d.customer_name}</p>
                  <p className="text-xs text-indigo-400 font-mono">{d.booking_number}</p>
                </td>
                <td className="px-6 py-4 text-xs text-slate-300">{d.property_name}</td>
                <td className="px-6 py-4 text-xs text-slate-400 capitalize">{d.document_type.replace('_', ' ')}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    d.is_verified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {d.is_verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {d.is_verified ? 'VERIFIED' : 'UNDER REVIEW'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedDoc(d)}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold transition border border-indigo-500/30 flex items-center gap-1 ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">Review Customer Document</h3>
                  <p className="text-xs text-slate-400">{selectedDoc.booking_number} • {selectedDoc.customer_name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Document Title:</span>
                <span className="font-bold text-white">{selectedDoc.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-indigo-400 uppercase">{selectedDoc.document_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Property:</span>
                <span className="font-bold text-white">{selectedDoc.property_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className={`font-bold ${selectedDoc.is_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedDoc.is_verified ? 'Verified' : 'Under Review'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Rejection / Resubmission Reason (Required if Rejecting)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Document image is blurry. Please upload a clear color PDF or image."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[80px]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => handleVerify('verified')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-glow-primary"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Verify
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleVerify('rejected')}
                className="flex-1 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
