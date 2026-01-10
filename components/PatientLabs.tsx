
import React from 'react';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Microscope, 
  TrendingUp, 
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { Patient, Language, Theme } from '../types';
import { useI18n } from '../i18n';

interface PatientLabsProps {
  patient: Patient;
  onBack: () => void;
  lang: Language;
  theme: Theme;
}

const PatientLabs: React.FC<PatientLabsProps> = ({ patient, onBack, lang, theme }) => {
  const t = useI18n(lang);
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  const labs = [
    {
      category: 'Comprehensive Metabolic Panel',
      date: 'Oct 24, 2024',
      status: t.final,
      results: [
        { name: 'Glucose', value: '112', unit: 'mg/dL', range: '65-99', status: 'High', trend: 'up' },
        { name: 'Potassium', value: '4.2', unit: 'mmol/L', range: '3.5-5.1', status: 'Normal', trend: 'stable' },
        { name: 'Sodium', value: '138', unit: 'mmol/L', range: '135-145', status: 'Normal', trend: 'stable' },
        { name: 'Calcium', value: '9.4', unit: 'mg/dL', range: '8.5-10.2', status: 'Normal', trend: 'stable' },
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-3 lg:gap-4 overflow-hidden ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
          <button onClick={onBack} className={`p-2 border rounded-lg transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}>
            <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <div className="truncate">
            <h1 className={`text-xl lg:text-2xl font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{t.labResults}</h1>
            <p className="text-slate-500 text-[11px] lg:text-sm font-medium">{patient.firstName} {patient.lastName} • {patient.mrn}</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <button className={`flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-xs font-bold transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}>
            <Download className="w-4 h-4" />
            <span className="hidden xs:inline">CSV</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <Printer className="w-4 h-4" />
            <span className="hidden xs:inline">Print</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {labs.map((report, idx) => (
          <div key={idx} className={`rounded-2xl border shadow-xl overflow-hidden flex flex-col transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between transition-colors ${
              isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/50'
            } ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                <div className={`p-1.5 rounded-lg border transition-colors ${
                  isDark ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  <Microscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{report.category}</h3>
                  <div className={`flex gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span>{report.date}</span>
                      <span>•</span>
                      <span className="text-emerald-500">{report.status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`overflow-x-auto touch-pan-x transition-colors ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <table className={`w-full text-left min-w-[600px] ${isRtl ? 'text-right' : ''}`}>
                <thead>
                  <tr className={`border-b transition-colors ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.test}</th>
                    <th className={`px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${isRtl ? 'text-left' : 'text-right'}`}>{t.result}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.units}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.status}</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">{t.trend}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                  {report.results.map((r, rIdx) => (
                    <tr key={rIdx} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                      <td className={`px-6 py-4 text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{r.name}</td>
                      <td className={`px-6 py-4 text-xs font-bold ${isRtl ? 'text-left' : 'text-right'} ${r.status === 'High' ? 'text-red-400' : (isDark ? 'text-slate-100' : 'text-slate-900')}`}>
                        {r.value}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-500 tracking-wider">{r.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          r.status === 'Normal' 
                            ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100') 
                            : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100')
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {r.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-red-400 mx-auto" />}
                        {r.trend === 'stable' && <div className={`w-3 h-0.5 mx-auto rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>}
                        {r.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-emerald-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientLabs;
