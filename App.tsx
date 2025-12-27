
import React, { useState, useRef, useEffect } from 'react';
import { LawSystem, AppTheme } from './types';
import { analyzeLegalCase, AnalysisResult } from './services/geminiService';

const Header: React.FC<{ 
  onLogout: () => void; 
  theme: AppTheme; 
  setTheme: (t: AppTheme) => void 
}> = ({ onLogout, theme, setTheme }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className={`flex justify-between items-center p-6 w-full max-w-6xl mx-auto border-b transition-all duration-500 no-print ${theme === 'dark' ? 'border-slate-800/50' : 'border-slate-200'}`}>
      <div className="flex gap-3 relative">
         <button 
          onClick={onLogout}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all text-sm shadow-lg active:scale-95 ${
            theme === 'dark' 
            ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white' 
            : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white'
          }`}
        >
          <span>تسجيل خروج</span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 border rounded-xl transition-all ${
              theme === 'dark' ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
          
          {showSettings && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)}></div>
              <div className={`absolute right-0 mt-3 w-48 rounded-2xl shadow-2xl z-50 p-4 border ${
                theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <p className="text-[10px] font-black uppercase mb-3 opacity-50 text-center">تغيير المظهر</p>
                <div className="space-y-1">
                  <button 
                    onClick={() => { setTheme('dark'); setShowSettings(false); }}
                    className={`w-full text-right p-2 rounded-lg text-xs font-bold transition-colors ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-100'}`}
                  >
                    الوضع الذهبي
                  </button>
                  <button 
                    onClick={() => { setTheme('light-green'); setShowSettings(false); }}
                    className={`w-full text-right p-2 rounded-lg text-xs font-bold transition-colors ${theme === 'light-green' ? 'bg-green-100 text-green-700' : 'hover:bg-slate-100'}`}
                  >
                    الوضع الرسمي
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>واعد <span className="text-amber-500">IA</span></h2>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${
          theme === 'dark' ? 'bg-slate-900 border-amber-500/30 shadow-amber-500/10' : 'bg-green-700 border-green-800 shadow-green-700/10'
        }`}>
          <span className={`text-xl font-black ${theme === 'dark' ? 'text-amber-500' : 'text-white'}`}>IA</span>
        </div>
      </div>
    </header>
  );
};

export default function App() {
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [lawSystem, setLawSystem] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sessionActive = sessionStorage.getItem('waed_session_active');
    if (sessionActive === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#0a0f1e' : '#ffffff';
  }, [theme]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const user = username.trim().toUpperCase();
    const pass = password.trim();

    if (
      (user === 'ADMIN1' && pass === 'ADMIN1') ||
      (user === 'ADMIN' && pass === 'ADMIN 6787')
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem('waed_session_active', 'true');
    } else {
      setLoginError('خطأ: يرجى التأكد من اسم المستخدم وكلمة المرور.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawSystem || !details.trim()) return;

    setResult(null);
    setIsLoading(true);
    
    try {
      const analysisResult = await analyzeLegalCase(lawSystem, details);
      setResult(analysisResult);
    } catch (err: any) {
      setResult({ text: "تعذر الاتصال بالذكاء الاصطناعي. يرجى المحاولة لاحقاً.", sources: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const themeClasses = {
    bg: theme === 'dark' ? 'bg-[#0a0f1e] text-white' : 'bg-white text-slate-900',
    card: theme === 'dark' ? 'bg-slate-900/80 border-slate-800 shadow-2xl backdrop-blur-md' : 'bg-white border-slate-200 shadow-2xl',
    input: theme === 'dark' ? 'bg-black/50 border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-green-600',
    primary: theme === 'dark' ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-green-700 text-white hover:bg-green-800',
    accent: theme === 'dark' ? 'text-amber-500' : 'text-green-700'
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${themeClasses.bg}`}>
        <div className={`w-full max-w-md border p-12 rounded-[2.5rem] animate-fade-in ${themeClasses.card}`}>
          <div className="flex flex-col items-center mb-10">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border shadow-2xl ${theme === 'dark' ? 'border-amber-500/40 bg-amber-500/5' : 'border-green-200 bg-green-50'}`}>
               <span className={`text-4xl font-black ${themeClasses.accent}`}>IA</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">نظام واعد</h1>
            <p className="text-sm opacity-50 mt-2">تسجيل الدخول للمستشار القانوني</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold mr-2 opacity-60">اسم المستخدم</label>
              <input
                type="text"
                placeholder="ADMIN..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl border focus:outline-none transition-all font-bold ${themeClasses.input}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold mr-2 opacity-60">كلمة المرور</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl border focus:outline-none transition-all font-bold ${themeClasses.input}`}
              />
            </div>
            {loginError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                {loginError}
              </div>
            )}
            <button type="submit" className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.97] ${themeClasses.primary}`}>
              دخول المنصة
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${themeClasses.bg}`}>
      <Header onLogout={() => {
        sessionStorage.removeItem('waed_session_active');
        setIsAuthenticated(false);
      }} theme={theme} setTheme={setTheme} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-16 animate-fade-in">
        <div className="text-center mb-16 no-print">
          <h1 className="text-7xl font-black mb-4 tracking-tighter">واعد <span className={themeClasses.accent}>IA</span></h1>
          <p className="opacity-60 text-lg font-medium">الذكاء الاصطناعي في خدمة القانون السعودي</p>
        </div>

        <form onSubmit={handleSubmit} className={`p-10 rounded-[3.5rem] border shadow-2xl no-print ${themeClasses.card}`}>
          <div className="space-y-10">
            <div>
              <label className="block mb-4 mr-3 font-black text-sm uppercase tracking-wider opacity-60">النظام القانوني المختص</label>
              <div className="relative">
                <select
                  value={lawSystem}
                  onChange={(e) => setLawSystem(e.target.value)}
                  className={`w-full px-8 py-5 rounded-2.5xl border appearance-none focus:outline-none font-bold text-lg cursor-pointer ${themeClasses.input}`}
                >
                  <option value="" disabled>اختر النظام المراد تحليله...</option>
                  {Object.values(LawSystem).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className={`absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none ${themeClasses.accent}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block mb-4 mr-3 font-black text-sm uppercase tracking-wider opacity-60">تفاصيل الحالة القانونية</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={6}
                className={`w-full px-8 py-6 rounded-3xl border focus:outline-none resize-none text-lg leading-relaxed shadow-inner ${themeClasses.input}`}
                placeholder="يرجى كتابة تفاصيل استفسارك القانوني بدقة..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !lawSystem || !details.trim()}
              className={`w-full py-7 rounded-3xl font-black text-2xl shadow-3xl transition-all active:scale-[0.98] ${themeClasses.primary} disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>جاري التحليل...</span>
                </div>
              ) : 'بدء التحليل الذكي'}
            </button>
          </div>
        </form>

        {result && (
          <div ref={resultRef} className="mt-20 animate-fade-in">
            <div className={`p-14 rounded-[4rem] border shadow-3xl ${themeClasses.card}`}>
              <div className="flex justify-between items-center mb-12 pb-8 border-b border-slate-700/20">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-amber-500 text-black' : 'bg-green-700 text-white'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="text-3xl font-black">نتيجة التحليل القانوني</h2>
                </div>
                <button 
                  onClick={() => window.print()} 
                  className={`px-8 py-4 rounded-2xl font-bold text-sm no-print transition-all active:scale-95 shadow-lg ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  حفظ بصيغة PDF
                </button>
              </div>
              
              <div className={`text-2xl leading-[2.3] whitespace-pre-wrap font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {result.text}
              </div>
              
              {result.sources.length > 0 && (
                <div className="mt-16 p-10 bg-black/30 rounded-[3rem] no-print border border-slate-700/30">
                  <h3 className={`text-sm font-black mb-8 uppercase tracking-widest ${themeClasses.accent}`}>المصادر القانونية المعتمدة:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {result.sources.map((s, i) => (
                      <a 
                        key={i} 
                        href={s.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`p-5 border rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] truncate flex items-center gap-3 ${
                          theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200 hover:border-green-600'
                        }`}
                      >
                        <svg className="w-4 h-4 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center no-print">
        <p className="text-[11px] font-bold opacity-30 uppercase tracking-[0.3em]">
          واعد IA | منظومة قانونية مدعومة بالذكاء الاصطناعي © ٢٠٢٥
        </p>
        <p className="mt-2 text-xs font-bold opacity-40">دعم فني: ٠٥٤٠٤١١١٩٥</p>
      </footer>
    </div>
  );
}
