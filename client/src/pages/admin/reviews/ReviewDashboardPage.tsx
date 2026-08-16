import React, { useEffect, useState } from 'react';
import { 
  Star, ThumbsUp, ShieldAlert, MessageSquare, CheckCircle, AlertTriangle, 
  TrendingUp, Award, Clock, ArrowUpRight, Filter, Download
} from 'lucide-react';
import { reviewsApi } from '../../../api/reviews.api';

export const ReviewDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await reviewsApi.getDashboardMetrics();
      setData(res);
    } catch (err) {
      console.error("Failed to load review dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await reviewsApi.exportReviewsCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EstateFlow_Reviews_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export CSV", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const starDist = data?.star_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const sentiment = data?.sentiment_distribution || { positive: 0, neutral: 0, negative: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review & Reputation Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise feedback intelligence, rating distribution, and sentiment monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Rating</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.average_rating || '0.0'}</span>
              <span className="text-sm text-emerald-600 font-medium flex items-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline mr-0.5" /> / 5.0
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">From {metrics.total_reviews} total reviews</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Moderation</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.pending_reviews + metrics.flagged_reviews}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Triage</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{metrics.flagged_reviews} flagged by spam engine</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Rate</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.response_rate}%</span>
              <span className="text-xs text-indigo-600 font-medium">SLA ~4.2h</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Official replies published</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spam / Abuse Blocked</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-rose-600">{metrics.spam_reviews}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">Protected</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Filtered automatically</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Rating Breakdown & Sentiment Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Star Rating Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            Star Rating Distribution
          </h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starDist[star] || 0;
              const total = metrics.total_reviews || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-600 w-12 flex items-center gap-1">
                    {star} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                  </span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 w-16 text-right">
                    {count} ({percent}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentiment Analysis Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            AI Sentiment Analysis Engine
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-xs font-bold text-emerald-700 uppercase">Positive</span>
              <p className="text-2xl font-extrabold text-emerald-800 mt-1">{sentiment.positive}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-600 uppercase">Neutral</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{sentiment.neutral}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-center">
              <span className="text-xs font-bold text-rose-700 uppercase">Negative</span>
              <p className="text-2xl font-extrabold text-rose-800 mt-1">{sentiment.negative}</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
            💡 Sentiment score is calculated using dynamic keyword matching and rating correlation to track builder reputation trends and identify customer delight points.
          </div>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated Properties */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Top Rated Properties
          </h2>
          <div className="divide-y divide-slate-100">
            {(data?.top_properties || []).map((p: any) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.review_count} verified reviews</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {p.rating}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated Builders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Top Rated Builders
          </h2>
          <div className="divide-y divide-slate-100">
            {(data?.top_builders || []).map((b: any) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-600 text-sm">
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{b.name}</p>
                    <p className="text-xs text-slate-500">{b.city || 'Mumbai'} • {b.reviews_count} reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm">
                  <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                  {b.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
