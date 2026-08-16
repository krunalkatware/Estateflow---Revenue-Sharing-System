import React, { useState } from 'react';
import { TrendingUp, DollarSign, PieChart, ShieldCheck, ArrowUpRight, Calculator, Building, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockInvestmentTrend = [
  { month: 'Jan', value: 1000000, returnAmount: 10000 },
  { month: 'Feb', value: 1050000, returnAmount: 10500 },
  { month: 'Mar', value: 1120000, returnAmount: 11200 },
  { month: 'Apr', value: 1200000, returnAmount: 12000 },
  { month: 'May', value: 1280000, returnAmount: 12800 },
  { month: 'Jun', value: 1350000, returnAmount: 13500 },
  { month: 'Jul', value: 1450000, returnAmount: 14500 },
];

export function InvestmentPage() {
  const [calcAmount, setCalcAmount] = useState(500000);
  const [calcMonths, setCalcMonths] = useState(36);
  const [calcRate, setCalcRate] = useState(14);

  const monthlyReturn = Math.round((calcAmount * (calcRate / 100)) / 12);
  const totalReturn = monthlyReturn * calcMonths;
  const totalMaturityValue = calcAmount + totalReturn;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Real Estate Investment Portfolio</h1>
        <p className="text-sm text-slate-500">Track fractional ownership, rental yield distributions, and property appreciation</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invested</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-heading">₹12,50,000</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 2 Active Holdings
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Market Value</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-heading">₹14,50,000</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> +16.0% Total Gain
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Yield Earned</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2 font-heading">₹1,24,500</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Monthly Rental Direct Deposit
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Annualized Portfolio ROI</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-2 font-heading">14.2% p.a.</p>
          <div className="flex items-center gap-1 mt-2 text-indigo-600 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> Outperforming Benchmark
          </div>
        </div>
      </div>

      {/* Chart & ROI Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Portfolio Growth & Dividend Returns</h3>
          <p className="text-xs text-slate-500 mb-6">Historical market appreciation and cumulative payouts</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockInvestmentTrend}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v/100000}L`} />
                <Tooltip formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Portfolio Value']} />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROI Calculator Widget */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Calculator className="w-4 h-4" /> Smart ROI Calculator
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Investment Amount: ₹{calcAmount.toLocaleString()}</label>
                <input
                  type="range" min="100000" max="5000000" step="50000"
                  value={calcAmount} onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Lock-in Period: {calcMonths} Months ({calcMonths/12} Yrs)</label>
                <input
                  type="range" min="12" max="60" step="12"
                  value={calcMonths} onChange={(e) => setCalcMonths(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target ROI Rate: {calcRate}% Annual</label>
                <input
                  type="range" min="8" max="20" step="0.5"
                  value={calcRate} onChange={(e) => setCalcRate(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Projected Monthly Yield:</span>
              <span className="text-emerald-400 font-bold">₹{monthlyReturn.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Total Expected Maturity Value:</span>
              <span className="text-white font-extrabold text-sm">₹{totalMaturityValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
