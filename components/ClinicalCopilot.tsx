
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { clinicalCopilotChat } from '../services/gemini';
import { Message, Language, Theme } from '../types';
import { useI18n } from '../i18n';

interface ClinicalCopilotProps {
  lang: Language;
  theme: Theme;
}

const ClinicalCopilot: React.FC<ClinicalCopilotProps> = ({ lang, theme }) => {
  const t = useI18n(lang);
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'AI', 
      content: isRtl ? "مرحباً د. طومسون. أنا مساعدك السريري. كيف يمكنني مساعدتك اليوم؟" : "Hello Dr. Thompson. I'm your Clinical Copilot. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), sender: 'User', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await clinicalCopilotChat([], input);
      const aiMessage: Message = { id: Date.now().toString(), sender: 'AI', content: response || "I'm processing that medical query...", timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { text: t.interactionCheck, icon: AlertCircle },
    { text: t.dosageCalc, icon: AlertCircle },
  ];

  return (
    <div className={`flex flex-col h-[calc(100vh-10rem)] rounded-2xl shadow-xl border overflow-hidden transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className={`p-4 border-b flex items-center justify-between transition-colors ${
        isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'
      } ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
            isDark ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'
          }`}>
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`font-semibold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t.copilot}</h2>
            <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.online}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className={`px-3 py-1 text-[10px] font-bold border rounded-md transition-all ${
          isDark ? 'text-slate-400 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-slate-100' : 'text-slate-500 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-700'
        }`}>
          {t.clear}
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 transition-colors ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${m.sender === 'User' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg transition-colors ${
                m.sender === 'User' ? (isDark ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white') : 'bg-blue-600 text-white'
              }`}>
                {m.sender === 'User' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm transition-all ${
                m.sender === 'User' 
                  ? 'bg-blue-600 text-white' 
                  : (isDark ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'bg-slate-100 text-slate-800 border border-slate-200')
              } ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
                <div className={`text-[9px] mt-2 opacity-40 font-bold uppercase ${m.sender === 'User' ? (isRtl ? 'text-right' : 'text-left') : (isRtl ? 'text-left' : 'text-right')}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className={`flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse">
                        <Bot className="w-4 h-4" />
                    </div>
                    <div className={`p-4 rounded-2xl border transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-4 border-t transition-colors ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`mb-3 flex overflow-x-auto gap-2 pb-1 scrollbar-hide ${isRtl ? 'flex-row-reverse' : ''}`}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s.text)} className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 border rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/30' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200'
            }`}>
              <s.icon className="w-3 h-3" />
              {s.text}
            </button>
          ))}
        </div>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={t.askQuestion}
            className={`w-full p-3 transition-all ${
              isRtl ? 'pr-3 pl-12 text-right' : 'pr-12 pl-3'
            } border rounded-xl text-sm focus:outline-none focus:ring-2 min-h-[50px] resize-none ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-100 focus:ring-blue-500/20 focus:border-blue-500' 
                : 'bg-white border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-400'
            }`}
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className={`absolute ${isRtl ? 'left-2' : 'right-2'} bottom-2 p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/20`}>
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className={`text-[9px] text-center mt-2 flex items-center justify-center gap-1 uppercase tracking-widest font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            <ShieldCheck className="w-3 h-3"/> {t.hippa}
        </p>
      </div>
    </div>
  );
};

export default ClinicalCopilot;
