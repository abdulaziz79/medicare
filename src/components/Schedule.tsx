
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  User,
  MoreVertical,
  CheckCircle2,
  Circle,
  LayoutGrid,
  List,
  X,
  Stethoscope
} from 'lucide-react';
import { MOCK_PATIENTS } from '../constants';
import { Appointment, Patient, Language, Theme } from '../types';
import { useI18n } from '../utils/i18n';

interface ScheduleProps {
  onSelectPatient: (patient: Patient) => void;
  appointments: Appointment[];
  onAddAppointment: (apt: Appointment) => void;
  lang: Language;
  theme: Theme;
}

const Schedule: React.FC<ScheduleProps> = ({ onSelectPatient, appointments, onAddAppointment, lang, theme }) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [newApt, setNewApt] = useState({ patientId: '1', time: '09:00 AM', type: 'Follow-up' as any });

  const t = useI18n(lang);
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ 
        day: i, 
        date: new Date(year, month, i) 
      });
    }
    return days;
  }, [viewDate]);

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const dayAppointments = (date: Date | null) => {
    if (!date) return [];
    const dateStr = getLocalDateString(date);
    return appointments.filter(apt => apt.date === dateStr);
  };

  const selectedDayAppointments = useMemo(() => {
    return dayAppointments(selectedDate).sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.time}`).getTime();
      const timeB = new Date(`2000/01/01 ${b.time}`).getTime();
      return timeA - timeB;
    });
  }, [appointments, selectedDate]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = MOCK_PATIENTS.find(p => p.id === newApt.patientId);
    if (!patient) return;

    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: getLocalDateString(selectedDate),
      time: newApt.time,
      type: newApt.type,
      status: 'Scheduled'
    };
    onAddAppointment(appointment);
    setIsAddingAppointment(false);
  };

  const monthName = viewDate.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
  const weekDays = isRtl 
    ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative">
      {/* Header Controls */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-slate-900 text-blue-400 border border-slate-800' : 'bg-white text-blue-600 border border-slate-200'} shadow-sm`}>
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div className={isRtl ? 'text-right' : ''}>
            <h1 className={`text-xl lg:text-2xl font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{t.schedule}</h1>
            <p className="text-slate-500 text-sm font-medium">{monthName}</p>
          </div>
        </div>

        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* View Toggle */}
          <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'calendar' ? (isDark ? 'bg-slate-800 text-blue-400 shadow' : 'bg-white text-blue-600 shadow') : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-800 text-blue-400 shadow' : 'bg-white text-blue-600 shadow') : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className={`flex items-center border rounded-xl shadow-sm transition-colors overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} ${isRtl ? 'flex-row-reverse' : ''}`}>
            <button onClick={handlePrevMonth} className={`p-2.5 transition-colors hover:bg-opacity-50 ${isDark ? 'hover:bg-slate-800 border-slate-800 text-slate-400' : 'hover:bg-slate-100 border-slate-200 text-slate-500'} ${isRtl ? 'border-l' : 'border-r'}`}>
              <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={() => setViewDate(new Date())} className={`px-5 py-2 text-xs font-bold transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'} ${isRtl ? 'border-l' : 'border-r'} ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              {lang === 'ar' ? 'اليوم' : 'Today'}
            </button>
            <button onClick={handleNextMonth} className={`p-2.5 transition-colors hover:bg-opacity-50 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
              <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <button 
            onClick={() => setIsAddingAppointment(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.addPatient}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main View Container */}
        <div className={`xl:col-span-2 rounded-2xl border shadow-xl overflow-hidden transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          {viewMode === 'calendar' ? (
            <>
              <div className={`grid grid-cols-7 border-b ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                {weekDays.map(day => (
                  <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((d, i) => {
                  const appts = dayAppointments(d.date);
                  const isSelected = d.date && getLocalDateString(d.date) === getLocalDateString(selectedDate);
                  const isToday = d.date && getLocalDateString(d.date) === getLocalDateString(new Date());
                  
                  return (
                    <div 
                      key={i} 
                      onClick={() => d.date && setSelectedDate(d.date)}
                      className={`min-h-[80px] lg:min-h-[110px] p-2 border-r border-b transition-all cursor-pointer relative ${
                        isDark ? 'border-slate-800' : 'border-slate-100'
                      } ${!d.day ? (isDark ? 'bg-slate-950/20' : 'bg-slate-50/50') : (isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50')} ${
                        isSelected ? (isDark ? 'bg-blue-600/10' : 'bg-blue-50') : ''
                      }`}
                    >
                      <div className={`text-xs font-bold mb-2 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                          isToday ? 'bg-blue-600 text-white' : (isSelected ? 'text-blue-500' : (isDark ? 'text-slate-400' : 'text-slate-600'))
                        }`}>
                          {d.day}
                        </span>
                        {appts.length > 0 && (
                          <span className={`w-2 h-2 rounded-full bg-blue-500 ${isDark ? 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`}></span>
                        )}
                      </div>
                      
                      <div className="space-y-1 hidden lg:block overflow-hidden">
                        {appts.slice(0, 2).map((a, idx) => (
                          <div key={idx} className={`text-[9px] px-1.5 py-0.5 rounded truncate font-medium ${
                            isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {a.time.split(' ')[0]} {a.patientName.split(' ').pop()}
                          </div>
                        ))}
                        {appts.length > 2 && (
                          <div className="text-[8px] text-slate-500 font-bold px-1.5 uppercase tracking-tighter">
                            + {appts.length - 2} {isRtl ? 'آخرين' : 'more'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[700px]">
               <div className={`p-4 font-bold border-b ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  Upcoming Encounters
               </div>
               <div className="divide-y divide-slate-800/10">
                  {appointments.sort((a,b) => a.date.localeCompare(b.date)).map(apt => (
                    <div 
                      key={apt.id} 
                      onClick={() => onSelectPatient(MOCK_PATIENTS.find(p => p.id === apt.patientId) || MOCK_PATIENTS[0])}
                      className={`p-4 flex items-center gap-4 transition-colors cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                    >
                      <div className="text-center min-w-[60px]">
                        <div className="text-xs font-bold text-blue-500 uppercase">{apt.date.split('-').slice(1).join('/')}</div>
                        <div className="text-[10px] font-medium text-slate-500">{apt.time}</div>
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{apt.patientName}</div>
                        <div className="text-[10px] text-slate-500">{apt.type}</div>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        {apt.status}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Selected Day Sidebar */}
        <div className={`rounded-2xl border shadow-xl flex flex-col transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`p-5 border-b flex items-center justify-between transition-colors ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'} ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div>
              <h2 className={`font-bold text-sm lg:text-base ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                {selectedDate.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedDate.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long' })}</p>
            </div>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${isDark ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              {selectedDayAppointments.length} {isRtl ? 'مواعيد' : 'Appts'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
            {selectedDayAppointments.length > 0 ? (
              selectedDayAppointments.map((apt) => {
                const patient = MOCK_PATIENTS.find(p => p.id === apt.patientId);
                return (
                  <div 
                    key={apt.id} 
                    onClick={() => patient && onSelectPatient(patient)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3 ${
                      isDark ? 'bg-slate-950/30 border-slate-800 hover:border-blue-500/30' : 'bg-slate-50/50 border-slate-100 hover:border-blue-200'
                    } ${isRtl ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center justify-between mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className={`text-[10px] font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Clock className="w-3 h-3 text-blue-500" /> {apt.time}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${apt.status === 'Checked-in' ? 'bg-blue-500' : (apt.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-400')}`}></div>
                      </div>
                      <h4 className={`font-bold text-sm truncate group-hover:text-blue-500 transition-colors ${isDark ? 'text-slate-100' : 'text-slate-900'} ${isRtl ? 'text-right' : ''}`}>
                        {apt.patientName}
                      </h4>
                      <p className={`text-[10px] font-medium opacity-60 mt-1 ${isRtl ? 'text-right' : ''}`}>{apt.type}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                <Clock className="w-12 h-12 mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">{isRtl ? 'لا توجد مواعيد' : 'No Appointments'}</p>
              </div>
            )}
          </div>

          <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <button 
              onClick={() => setIsAddingAppointment(true)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> {isRtl ? 'حجز موعد جديد' : 'Schedule New'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Appointment Slide-over / Modal Backdrop */}
      {isAddingAppointment && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setIsAddingAppointment(false)}></div>
          <div className={`fixed inset-y-0 ${isRtl ? 'left-0' : 'right-0'} w-full max-w-md z-[70] transition-transform duration-300 transform translate-x-0 ${
            isDark ? 'bg-slate-900 text-slate-100 border-l border-slate-800' : 'bg-white text-slate-900 border-l border-slate-200'
          }`}>
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-500" />
                  {isRtl ? 'جدولة موعد جديد' : 'New Appointment'}
                </h2>
                <button onClick={() => setIsAddingAppointment(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="flex-1 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Patient</label>
                  <select 
                    value={newApt.patientId}
                    onChange={e => setNewApt({...newApt, patientId: e.target.value})}
                    className={`w-full p-3 rounded-xl border text-sm ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  >
                    {MOCK_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Time</label>
                    <input 
                      type="time" 
                      onChange={e => {
                         const [h, m] = e.target.value.split(':');
                         const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
                         const displayH = String(parseInt(h) % 12 || 12).padStart(2, '0');
                         setNewApt({...newApt, time: `${displayH}:${m} ${ampm}`});
                      }}
                      className={`w-full p-3 rounded-xl border text-sm ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Visit Type</label>
                    <select 
                      value={newApt.type}
                      onChange={e => setNewApt({...newApt, type: e.target.value as any})}
                      className={`w-full p-3 rounded-xl border text-sm ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <option>Follow-up</option>
                      <option>Initial</option>
                      <option>Procedure</option>
                      <option>Consult</option>
                    </select>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                  <p className="text-xs font-bold text-blue-500 mb-1">Date Confirmed</p>
                  <p className="text-sm font-medium">{getLocalDateString(selectedDate)}</p>
                </div>

                <div className="pt-8 space-y-3">
                  <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
                    {isRtl ? 'تأكيد الموعد' : 'Confirm Appointment'}
                  </button>
                  <button type="button" onClick={() => setIsAddingAppointment(false)} className="w-full py-4 text-slate-500 font-bold hover:text-slate-400">
                    {t.discard}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Schedule;
