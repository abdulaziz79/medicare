
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Calendar, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { Language, Theme } from '../types';
import { useI18n } from '../utils/i18n';

interface AnalyticsProps {
    lang: Language;
    theme: Theme;
}

const Analytics: React.FC<AnalyticsProps> = ({ lang, theme }) => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const t = useI18n(lang);
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  // Mock Data
  const volumeData = [
    { name: 'W1', volume: 120 },
    { name: 'W2', volume: 132 },
    { name: 'W3', volume: 101 },
    { name: 'W4', volume: 145 },
  ];

  const diagnosisData = [
    { name: 'HTN', count: 85 },
    { name: 'T2D', count: 64 },
    { name: 'HLD', count: 52 },
    { name: 'Asthma', count: 38 },
  ];

  const ageData = [
    { name: '0-18', value: 15 },
    { name: '19-35', value: 25 },
    { name: '36-55', value: 35 },
    { name: '56+', value: 25 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const stats = [
    { label: 'Total RVUs', value: '3,482', change: '+12.5%', trend: 'up', icon: TrendingUp, color: 'blue' },
    { label: 'Patient Vol', value: '498', change: '+5.2%', trend: 'up', icon: Users, color: 'emerald' },
    { label: 'Wait Time', value: '14.2m', change: '-8.1%', trend: 'down', icon: Clock, color: 'amber' },
    { label: 'Practice Rev', value: '$142k', change: '+2.4%', trend: 'up', icon: DollarSign, color: 'indigo' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
        <div className="overflow-hidden">
          <h1 className={`text-xl lg:text-2xl font-bold transition-colors ${isDark ? 'text-slate-50' : 'text-slate-900'} truncate`}>{t.analytics}</h1>
          <p className="text-slate-500 text-[11px] lg:text-sm mt-1 truncate">Clinical performance and demographic insights</p>
        </div>
        <div className={`flex items-center gap-2 lg:gap-3 overflow-x-auto pb-1 lg:pb-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`border rounded-lg p-1 shadow-sm flex flex-shrink-0 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            {['7D', '30D', 'YTD'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-[10px] lg:text-xs font-bold rounded-md transition-all ${
                  timeRange === range || (timeRange.includes('30') && range === '30D') || (timeRange.includes('7') && range === '7D') || (timeRange.includes('Year') && range === 'YTD')
                    ? (isDark ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700' : 'bg-white text-slate-900 shadow-md border border-slate-200') 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className={`flex-shrink-0 flex items-center gap-2 px-3 lg:px-4 py-2 border rounded-lg text-[10px] lg:text-sm font-bold shadow-sm transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}>
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-4 lg:p-6 rounded-2xl border shadow-sm relative overflow-hidden group hover:border-slate-400 transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className={`flex justify-between items-start mb-3 lg:mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 lg:p-3 rounded-xl border transition-colors ${
                isDark ? `bg-${stat.color}-500/10 text-${stat.color}-400 border-${stat.color}-500/20` : `bg-${stat.color}-50 text-${stat.color}-600 border-${stat.color}-100`
              }`}>
                <stat.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div className={`flex items-center gap-0.5 lg:gap-1 text-[9px] lg:text-xs font-bold ${stat.trend === 'up' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-blue-400' : 'text-blue-600')}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className={`text-lg lg:text-2xl font-bold mt-0.5 lg:mt-1 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Patient Volume Trend */}
        <div className={`xl:col-span-2 rounded-2xl border shadow-xl overflow-hidden flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-4 lg:p-6 border-b flex items-center justify-between transition-colors ${isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'} ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h3 className={`font-bold text-sm lg:text-base flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <Calendar className="w-4 h-4 text-blue-500" />
              Encounter Volume
            </h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Completed Visits</span>
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-6 h-[250px] lg:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                    borderRadius: '12px', 
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
                    fontSize: '12px', 
                    color: isDark ? '#f1f5f9' : '#1e293b' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnosis Distribution */}
        <div className={`rounded-2xl border shadow-xl overflow-hidden flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-4 lg:p-6 border-b transition-colors ${isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'} ${isRtl ? 'text-right' : ''}`}>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <Stethoscope className="w-4 h-4 text-emerald-500" />
              Prevalent Conditions
            </h3>
          </div>
          <div className="p-4 lg:p-6 h-[250px] lg:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnosisData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={60} 
                  tick={{fontSize: 10, fontWeight: 700, fill: isDark ? '#64748b' : '#475569'}}
                />
                <Tooltip 
                  cursor={{fill: isDark ? '#1e293b' : '#f8fafc'}}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                    borderRadius: '12px', 
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
                    fontSize: '12px' 
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics */}
        <div className={`rounded-2xl border shadow-xl overflow-hidden flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-4 lg:p-6 border-b transition-colors ${isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'} ${isRtl ? 'text-right' : ''}`}>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <Users className="w-4 h-4 text-indigo-500" />
              Age Cohorts
            </h3>
          </div>
          <div className="p-4 lg:p-6 h-[250px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderRadius: '12px', border: 'none', fontSize: '10px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Efficiency Insights */}
        <div className={`xl:col-span-2 border rounded-2xl shadow-xl overflow-hidden transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-4 lg:p-6 border-b flex items-center justify-between transition-colors ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/50'} ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
            <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Clinical Workflow Efficiency</h3>
          </div>
          <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-5 lg:space-y-6">
              {[
                { label: 'SOAP Note Accuracy', value: 98.4, color: 'emerald' },
                { label: 'Patient Interaction', value: 84.2, color: 'blue' },
                { label: 'Portal Engagement', value: 72.5, color: 'indigo' },
              ].map((item, i) => (
                <div key={i}>
                  <div className={`flex justify-between text-[10px] font-bold mb-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span className="text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <span className={`${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.value}%</span>
                  </div>
                  <div className={`h-1.5 lg:h-2 rounded-full overflow-hidden border transition-colors ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                    <div 
                      className={`h-full bg-${item.color}-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.2)]`} 
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`rounded-2xl p-4 lg:p-6 border flex flex-col justify-center transition-colors ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
               <h4 className={`font-bold text-[11px] lg:text-sm mb-2 lg:mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse text-right' : ''} ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                 <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                 AI Performance Insight
               </h4>
               <p className={`text-[11px] lg:text-sm text-slate-500 leading-relaxed ${isRtl ? 'text-right' : ''}`}>
                 Practice data suggests that AI-assisted documentation has reclaimed <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>12.4 hours</span> per doctor this month, equating to a <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>18% capacity lift</span>.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
