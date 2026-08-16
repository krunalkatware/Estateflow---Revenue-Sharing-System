import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Eye, MoreVertical, ChevronRight, Flame, Star,
  Phone, Mail, MapPin, Clock, RefreshCw, ArrowRight
} from 'lucide-react';
import { adminCRMApi, LeadItem } from '../../../api/admin-crm.api';

const STAGES = [
  { key: 'new',                   label: 'New',                  color: '#6366f1', bg: '#eef2ff' },
  { key: 'contacted',             label: 'Contacted',            color: '#3b82f6', bg: '#eff6ff' },
  { key: 'interested',            label: 'Interested',           color: '#06b6d4', bg: '#ecfeff' },
  { key: 'site_visit_scheduled',  label: 'Site Visit',           color: '#10b981', bg: '#ecfdf5' },
  { key: 'negotiation',           label: 'Negotiation',          color: '#f59e0b', bg: '#fffbeb' },
  { key: 'booking_requested',     label: 'Booking Req.',         color: '#f97316', bg: '#fff7ed' },
  { key: 'booked',                label: 'Booked',               color: '#22c55e', bg: '#f0fdf4' },
  { key: 'lost',                  label: 'Lost',                 color: '#ef4444', bg: '#fef2f2' },
  { key: 'closed',                label: 'Closed',               color: '#8b5cf6', bg: '#f5f3ff' },
];

const PRIORITY_BADGES: Record<string, { label: string; cls: string }> = {
  vip:    { label: '⭐ VIP',    cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  hot:    { label: '🔥 Hot',    cls: 'bg-red-100 text-red-700 border-red-200' },
  high:   { label: '↑ High',   cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  medium: { label: '~ Medium', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  low:    { label: '↓ Low',    cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

interface KanbanCardProps {
  lead: LeadItem;
  onMove: (id: number, newStage: string) => void;
  onView: (id: number) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, onMove, onView }) => {
  const badge = PRIORITY_BADGES[lead.priority] || PRIORITY_BADGES.medium;
  const formatBudget = (v?: number) => {
    if (!v) return '—';
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    return `₹${v.toLocaleString()}`;
  };

  return (
    <div className="bg-white dark:bg-surface rounded-xl border border-border p-3 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {lead.first_name[0]}{lead.last_name?.[0] || ''}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{lead.full_name}</p>
            <p className="text-xs text-text-secondary">{lead.lead_number}</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${badge.cls} flex-shrink-0`}>
          {badge.label}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1 text-xs text-text-secondary mb-3">
        {lead.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}
        {lead.city && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.locality || lead.city}</span>
          </div>
        )}
        {lead.budget_max && (
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">{formatBudget(lead.budget_max)}</span>
            {lead.preferred_bhk && <span className="text-text-secondary">• {lead.preferred_bhk} BHK</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
        <button
          onClick={() => onView(lead.id)}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Eye className="w-3 h-3" /> View
        </button>
        <span className="text-xs text-text-secondary">{lead.source.replace(/_/g, ' ')}</span>
      </div>
    </div>
  );
};

export default function LeadKanbanPage() {
  const [allLeads, setAllLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragLeadId, setDragLeadId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAllLeads();
  }, []);

  const loadAllLeads = async () => {
    setLoading(true);
    try {
      const res = await adminCRMApi.getLeads({ limit: 200 });
      setAllLeads(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getLeadsForStage = (stage: string) =>
    allLeads.filter(l => l.stage === stage);

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    setDragLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    if (!dragLeadId) return;

    const lead = allLeads.find(l => l.id === dragLeadId);
    if (!lead || lead.stage === newStage) {
      setDragLeadId(null);
      setDragOverStage(null);
      return;
    }

    // Optimistic update
    setAllLeads(prev => prev.map(l => l.id === dragLeadId ? { ...l, stage: newStage } : l));

    try {
      await adminCRMApi.updateStage(dragLeadId, newStage);
    } catch (e) {
      // Revert on error
      setAllLeads(prev => prev.map(l => l.id === dragLeadId ? { ...l, stage: lead.stage } : l));
      console.error('Stage update failed', e);
    }

    setDragLeadId(null);
    setDragOverStage(null);
  };

  const handleDragLeave = () => setDragOverStage(null);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(s => (
            <div key={s.key} className="flex-shrink-0 w-64">
              <div className="h-8 bg-border rounded-xl mb-3 animate-pulse" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-border rounded-xl animate-pulse" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Lead Pipeline</h1>
          <p className="text-sm text-text-secondary mt-0.5">Drag & drop leads between stages</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadAllLeads} className="btn-outline btn-sm gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => navigate('/admin/crm/leads/create')} className="btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {STAGES.map(stage => {
          const stageLeads = getLeadsForStage(stage.key);
          const isOver = dragOverStage === stage.key;

          return (
            <div
              key={stage.key}
              className={`flex-shrink-0 w-64 flex flex-col rounded-2xl transition-all duration-200 ${isOver ? 'ring-2 ring-offset-1' : ''}`}
              style={{ background: stage.bg }}
              onDragOver={e => handleDragOver(e, stage.key)}
              onDrop={e => handleDrop(e, stage.key)}
              onDragLeave={handleDragLeave}
            >
              {/* Column Header */}
              <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                  <span className="text-xs font-bold text-text-primary truncate">{stage.label}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: stage.color }}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)] min-h-[200px]">
                {stageLeads.length === 0 && (
                  <div className="h-24 flex items-center justify-center text-xs text-text-secondary border-2 border-dashed border-border/50 rounded-xl mx-1 mt-1">
                    Drop leads here
                  </div>
                )}
                {stageLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={e => handleDragStart(e, lead.id)}
                    className={`cursor-grab active:cursor-grabbing transition-opacity ${dragLeadId === lead.id ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <KanbanCard
                      lead={lead}
                      onMove={(id, newStage) => adminCRMApi.updateStage(id, newStage).then(loadAllLeads)}
                      onView={id => navigate(`/admin/crm/leads/${id}`)}
                    />
                  </div>
                ))}
              </div>

              {/* Add button */}
              <button
                onClick={() => navigate('/admin/crm/leads/create')}
                className="mx-2 mb-2 py-1.5 text-xs font-medium rounded-xl border border-dashed border-border/60 hover:border-current transition-colors flex items-center justify-center gap-1"
                style={{ color: stage.color }}
              >
                <Plus className="w-3 h-3" /> Add Lead
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
