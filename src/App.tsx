
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import ClinicalCopilot from './components/ClinicalCopilot';
import PatientChart from './components/PatientChart';
import Schedule from './components/Schedule';
import Analytics from './components/Analytics';
import PatientLabs from './components/PatientLabs';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS } from './constants';
import { Patient, Appointment, Language, Theme } from './types';
import { generateSOAPNote, analyzeVitals } from './services/gemini';
import { logConnectionStatus } from './services/supabase';
import { useI18n } from './utils/i18n';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  ArrowRight, 
  Search, 
  Activity, 
  FileText, 
  Stethoscope, 
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Users,
  TrendingUp,
  Microscope,
  Mic,
  Save,
  Loader2,
  Sparkles
} from 'lucide-react';
// import { AuthProvider } from './contexts/AuthContext';
import { getCurrentUser } from './services/auth';

const AppContent: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('medi-pro-theme') as Theme) || 'dark';
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  
  const navigate = useNavigate();
  const t = useI18n(lang);
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  useEffect(() => {
    document.body.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.className = theme;
    localStorage.setItem('medi-pro-theme', theme);
  }, [lang, theme]);

  // Test Supabase connection on app startup
  useEffect(() => {
    logConnectionStatus().catch(console.error);
  }, []);

  const filteredPatients = useMemo(() => {
    if (!globalSearch) return MOCK_PATIENTS;
    const term = globalSearch.toLowerCase();
    return MOCK_PATIENTS.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) ||
      p.mrn.toLowerCase().includes(term) ||
      p.dob.includes(term)
    );
  }, [globalSearch]);

  const handlePatientSelect = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
    setGlobalSearch(''); 
  };

  // Dashboard Component
  const DashboardView: React.FC = () => (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{t.goodMorning}</h1>
          <p className="text-slate-500 mt-1 font-medium">{t.appointmentsToday(appointments.length)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => navigate('/schedule')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold shadow-sm transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            {t.schedule}
          </button>
          <button 
            onClick={() => navigate('/patients')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            {t.newEncounter}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: t.totalPatients, value: '1,284', change: '+12', icon: Activity, color: 'blue' },
          { label: t.avgPatientTime, value: '18m', change: '-2m', icon: Clock, color: 'purple' },
          { label: t.pendingResults, value: '24', change: '8 critical', icon: Microscope, color: 'amber' },
          { label: t.productivity, value: '342', change: '104%', icon: TrendingUp, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 lg:p-6 rounded-2xl shadow-sm border transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-200'
          }`}>
            <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 lg:p-2.5 rounded-xl ${isDark ? `bg-${stat.color}-500/10 text-${stat.color}-400` : `bg-${stat.color}-50 text-${stat.color}-600`}`}>
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <span className={`text-[10px] lg:text-xs font-bold px-2 py-1 rounded-full ${
                stat.change.includes('critical') 
                  ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600') 
                  : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500')
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-slate-500 text-xs lg:text-sm font-medium">{stat.label}</h3>
            <p className={`text-xl lg:text-2xl font-bold mt-1 ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`p-4 lg:p-6 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-50'} ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h2 className={`font-bold text-lg ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{t.todaysSchedule}</h2>
              <button onClick={() => navigate('/schedule')} className="text-sm font-semibold text-blue-600 hover:text-blue-500">{t.viewAll}</button>
            </div>
            <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
              {appointments.slice(0, 5).map((apt) => {
                const patient = MOCK_PATIENTS.find(p => p.id === apt.patientId) || MOCK_PATIENTS[0];
                return (
                  <div key={apt.id} className={`p-4 transition-colors cursor-pointer group ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`} onClick={() => handlePatientSelect(patient)}>
                    <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                      <div className={`flex items-center gap-3 lg:gap-4 overflow-hidden ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold transition-colors ${
                          isDark ? 'bg-slate-800 text-slate-400 group-hover:bg-blue-600/10 group-hover:text-blue-400' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                        }`}>
                          {apt.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="truncate">
                          <p className={`font-bold text-sm lg:text-base transition-colors truncate ${isDark ? 'text-slate-100 group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>{apt.patientName}</p>
                          <div className={`flex items-center gap-2 lg:gap-3 mt-0.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] lg:text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {apt.time}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>{apt.type}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-all ${isRtl ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-2xl p-6 shadow-xl relative overflow-hidden border ${isDark ? 'bg-slate-900 border-blue-500/20 text-white' : 'bg-blue-600 text-white border-blue-700'}`}>
             <div className="relative z-10">
              <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-blue-400' : 'text-white'}`}>{t.copilot}</h3>
              <p className={`${isDark ? 'text-slate-400' : 'text-blue-100'} text-sm mb-6`}>{t.askQuestion}</p>
              <button 
                onClick={() => navigate('/copilot')}
                className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
                } ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                {t.viewAll}
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
             </div>
             <Sparkles className={`absolute -top-4 ${isRtl ? '-left-4' : '-right-4'} w-24 h-24 ${isDark ? 'text-blue-500/5' : 'text-white/10'}`} />
          </div>

          <div className={`rounded-2xl p-5 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''} ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t.criticalAlerts}
            </h3>
            <div className="space-y-4">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-100'} ${isRtl ? 'text-right' : ''}`}>
                <p className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>Critical Lab: Potassium</p>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-amber-500/60' : 'text-amber-700'}`}>Sarah Johnson</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Patients List Component
  const PatientsListView: React.FC = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={isRtl ? 'text-right' : ''}>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{t.patientDirectory}</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and search hospital patient records</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
          <Plus className="w-4 h-4" />
          {t.addPatient}
        </button>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
          {filteredPatients.map((patient) => (
            <div key={patient.id} className={`p-4 transition-colors cursor-pointer group flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''} ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`} onClick={() => handlePatientSelect(patient)}>
              <div className={`flex items-center gap-4 overflow-hidden ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold transition-colors ${
                  isDark ? 'bg-slate-800 text-slate-500 group-hover:bg-blue-600/10 group-hover:text-blue-400' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}>
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div className="truncate">
                  <h3 className={`font-bold truncate transition-colors ${isDark ? 'text-slate-100 group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>{patient.firstName} {patient.lastName}</h3>
                  <div className={`flex gap-3 text-[10px] text-slate-500 mt-0.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span>{t.mrn}: {patient.mrn}</span>
                    <span className="opacity-30">|</span>
                    <span>{t.dob}: {patient.dob}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-all ${isRtl ? 'rotate-180' : ''}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Patient Detail Component
  const PatientDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const selectedPatient = MOCK_PATIENTS.find(p => p.id === id);
    const [isGeneratingNote, setIsGeneratingNote] = useState(false);
    const [generatedNote, setGeneratedNote] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const docSectionRef = useRef<HTMLDivElement>(null);

    if (!selectedPatient) {
      return <Navigate to="/patients" replace />;
    }

    const handleGenerateSOAP = async () => {
      setIsGeneratingNote(true);
      try {
        const transcript = `Patient presents with worsening shortness of breath and a persistent cough for 4 days. Denies fever. BP 138/88. Heart rate slightly elevated. Auscultation reveals minor wheezing in lower lobes. History of mild asthma.`;
        const note = await generateSOAPNote(transcript);
        setGeneratedNote(note || '');
      } catch (error) {
        console.error(error);
      } finally {
        setIsGeneratingNote(false);
      }
    };

    const handleAnalyzeVitals = async () => {
      setIsAnalyzing(true);
      try {
        const res = await analyzeVitals(selectedPatient.vitals);
        setAnalysis(res || '');
      } catch (error) {
        console.error(error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleStartEncounter = () => {
      docSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
      <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-start lg:items-center gap-4 lg:gap-5 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
            <button onClick={() => navigate('/patients')} className={`p-2 border rounded-lg transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <div className={`w-14 h-14 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-xl font-bold border transition-colors ${
              isDark ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
              {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
            </div>
            <div>
              <h1 className={`text-xl lg:text-3xl font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{selectedPatient.firstName} {selectedPatient.lastName}</h1>
              <div className={`flex flex-wrap gap-x-4 mt-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] lg:text-sm text-slate-500 font-medium">{t.mrn}: <span className={`${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{selectedPatient.mrn}</span></span>
                <span className="text-[10px] lg:text-sm text-slate-500 font-medium">{t.dob}: <span className={`${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{selectedPatient.dob}</span></span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleStartEncounter} className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700">
              {t.newEncounter}
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 ${isRtl ? 'xl:grid-cols-[1fr_2fr]' : ''}`}>
          <div className="xl:col-span-2 space-y-6">
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/30'} ${isRtl ? 'flex-row-reverse' : ''}`}>
                <h2 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t.vitalsTrends}</h2>
                <button onClick={handleAnalyzeVitals} className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                  isDark ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600/20' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                }`}>
                  {isAnalyzing ? <Loader2 className="w-3 animate-spin" /> : <Sparkles className="w-3" />}
                  {t.aiAnalysis}
                </button>
              </div>
              <div className="p-4 lg:p-6 overflow-hidden">
                <PatientChart data={selectedPatient.vitals} theme={theme} />
              </div>
            </div>

            <div ref={docSectionRef} className={`rounded-2xl border shadow-sm overflow-hidden scroll-mt-8 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/30'} ${isRtl ? 'flex-row-reverse' : ''}`}>
                <h2 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t.documentation}</h2>
                <button onClick={handleGenerateSOAP} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/10">
                  {isGeneratingNote ? <Loader2 className="w-4 animate-spin" /> : <Sparkles className="w-4" />}
                  {t.generateSOAP}
                </button>
              </div>
              <div className={`p-4 lg:p-8 min-h-[250px] ${isDark ? 'bg-slate-950/30' : 'bg-slate-50/50'}`}>
                {generatedNote ? (
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'} ${isRtl ? 'text-right' : ''}`}>
                    {generatedNote}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className={`w-12 h-12 mb-2 ${isDark ? 'text-slate-800' : 'text-slate-200'}`} />
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{isRtl ? 'لم يتم إنشاء ملاحظات بعد' : 'Waiting for encounter data...'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`p-4 border-b ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'} ${isRtl ? 'text-right' : ''}`}>
                <h3 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t.clinicalOverview}</h3>
              </div>
              <div className={`p-4 space-y-6 ${isRtl ? 'text-right' : ''}`}>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.allergies}</h4>
                  <div className={`flex flex-wrap gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    {selectedPatient.allergies.map(a => <span key={a} className={`px-2 py-1 rounded text-xs font-bold border ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-100'}`}>{a}</span>)}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t.medications}</h4>
                  <div className="space-y-1">
                    {selectedPatient.medications.map(m => <div key={m} className={`p-2.5 rounded border text-xs font-medium ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>{m}</div>)}
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl p-5 shadow-xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-800 text-white border-slate-700'}`}>
               <h3 className={`font-bold mb-4 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                {t.labs} <Microscope className="w-5 h-5 text-blue-400" />
              </h3>
              <div className="space-y-2 mb-6">
                 <div className={`flex justify-between text-xs py-2 border-b border-white/10 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span className="text-slate-400">Glucose</span>
                    <span className="text-red-400 font-bold">112 mg/dL</span>
                 </div>
                 <div className={`flex justify-between text-xs py-2 border-b border-white/10 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span className="text-slate-400">Potassium</span>
                    <span className="text-slate-100 font-bold">4.2 mmol/L</span>
                 </div>
              </div>
              <button onClick={() => navigate(`/patients/${id}/labs`)} className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                isDark ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white/10 border border-white/10 text-white hover:bg-white/20'
              }`}>
                {t.viewAllResults}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Patient Labs Component
  const PatientLabsView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const selectedPatient = MOCK_PATIENTS.find(p => p.id === id);

    if (!selectedPatient) {
      return <Navigate to="/patients" replace />;
    }

    return (
      <PatientLabs 
        theme={theme} 
        lang={lang} 
        patient={selectedPatient} 
        onBack={() => navigate(`/patients/${id}`)} 
      />
    );
  };

  return (
    <Routes>
      <Route path="/login" element={<Login theme={theme} />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout
              lang={lang}
              setLang={setLang}
              theme={theme}
              setTheme={setTheme}
              searchTerm={globalSearch}
              onSearch={setGlobalSearch}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard theme={theme} lang={lang} />
                  </ProtectedRoute>
                } />
                <Route path="/patients" element={<PatientsListView />} />
                <Route path="/patients/:id" element={<PatientDetailView />} />
                <Route path="/patients/:id/labs" element={<PatientLabsView />} />
                <Route path="/copilot" element={<ClinicalCopilot theme={theme} lang={lang} />} />
                <Route
                  path="/schedule"
                  element={
                    <Schedule
                      theme={theme}
                      lang={lang}
                      appointments={appointments}
                      onAddAppointment={(a) => setAppointments([...appointments, a])}
                      onSelectPatient={handlePatientSelect}
                    />
                  }
                />
                <Route path="/analytics" element={<Analytics theme={theme} lang={lang} />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

// Main App component wrapped with AuthProvider
const App: React.FC = () => {
  return (
    /* <AuthProvider> */
      <AppContent />
    /* </AuthProvider> */
  );
};

export default App;
