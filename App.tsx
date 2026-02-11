import React, { useState, useCallback, useEffect, useRef } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import Dashboard from './components/Dashboard';
import Pricing from './components/Pricing';
import Billing from './components/Billing';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import SettingsModal from './components/SettingsModal';
import MobileOnboarding from './components/MobileOnboarding';
import OnboardingSurvey from './components/OnboardingSurvey';
import ResetPasswordPage from './components/ResetPasswordPage';
import Toast, { ToastMessage } from './components/Toast';
import { ChatSession, Message, RouterResult, UserStats, User, AIModel, MessageImage, AttachedDocument } from './types';
import { getAIResponse, generateChatTitle, routePrompt, generateFollowUpSuggestions } from './services/aiService';
import { getStats } from './services/storageService';
import { getCurrentUser, logout } from './services/authService';
import { getAdminStats } from './services/analyticsService';
import { api } from './services/apiService';
import { Icons } from './constants';
import { isSupabaseConfigured as initialConfigured, supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [configured] = useState(initialConfigured);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isLoading, setIsLoading] = useState(false);
  const [routingInfo, setRoutingInfo] = useState<RouterResult | null>(null);
  const [view, setView] = useState<'chat' | 'dashboard' | 'pricing' | 'billing' | 'admin'>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('nexus_theme') as 'light' | 'dark') || 'dark');
  const [userSettings, setUserSettings] = useState(() => {
    const saved = localStorage.getItem('nexus_user_settings');
    return saved ? JSON.parse(saved) : { personification: 'Concise and professional', language: 'en' };
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev.filter(t => t.message !== message), { id, message, type }]);
  }, []);

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  const handleThemeToggle = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    if (!configured) {
      console.warn("Nexus AI: Supabase keys not detected in environment. Ensure .env is configured.");
      setIsAuthChecking(false);
      return;
    }

    // Detect password recovery from URL hash (Supabase redirects with #type=recovery&access_token=...)
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    if (hash.includes('type=recovery') || searchParams.get('type') === 'recovery') {
      setShowResetPassword(true);
      setIsAuthChecking(false);
      return;
    }

    // Listen for Supabase PASSWORD_RECOVERY auth event
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
      }
    });

    getCurrentUser().then(u => {
      setUser(u);
      if (u) {
        // Show survey for first-time users
        if (!localStorage.getItem('nexus_survey_done')) {
          setShowSurvey(true);
        }
        if (window.innerWidth < 1024 && !localStorage.getItem('nexus_onboarding_done')) {
          setShowOnboarding(true);
        }
      }
    }).finally(() => setIsAuthChecking(false));

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  useEffect(() => {
    if (user) {
      getStats(user.id).then(setUserStats);
      api.getConversations().then(async (convs) => {
        setSessions(convs);
        if (convs.length > 0) handleSelectSession(convs[0].id);
      });
    }
  }, [user]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
      if (dy < 100) {
        if (dx > 80 && !isSidebarOpen) setIsSidebarOpen(true); 
        else if (dx < -80 && isSidebarOpen) setIsSidebarOpen(false); 
      }
      touchStartRef.current = null;
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSidebarOpen]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleExportChat = useCallback(() => {
    if (!activeSession || activeSession.messages.length === 0) return;
    let md = `# ${activeSession.title || 'Chat Export'}\n\n`;
    md += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;
    activeSession.messages.forEach(msg => {
      const role = msg.role === 'user' ? '**You**' : '**Nexus AI**';
      md += `### ${role}\n\n${msg.content}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const filename = `${(activeSession.title || 'chat').replace(/[^a-z0-9]/gi, '_')}_export.md`;
    // iOS-safe download: use navigator.share on iOS where <a download> is ignored
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && navigator.share && navigator.canShare?.({ files: [new File([blob], filename)] })) {
      navigator.share({ files: [new File([blob], filename, { type: blob.type })] }).catch(() => {
        window.open(URL.createObjectURL(blob), '_blank');
      });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [activeSession]);

  const requestAIResponse = async (sessionId: string, currentHistory: Message[]) => {
    if (!user || isLoading) return;
    setIsLoading(true);
    abortControllerRef.current = new AbortController();
    
    const userMsg = currentHistory[currentHistory.length - 1];
    const previewRouting = routePrompt(userMsg.content, !!userMsg.image, (userMsg.documents?.length || 0) > 0);
    const assistantId = "assistant-" + Math.random().toString(36).substr(2, 9);
    
    setSessions(prev => prev.map(s => s.id === sessionId ? {
      ...s,
      messages: [...currentHistory, { 
        id: assistantId, role: 'assistant', content: "", timestamp: Date.now(), model: previewRouting.model 
      }]
    } : s));

    let accumulatedText = "";
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    const flushToUI = () => {
      const snapshot = accumulatedText;
      setSessions(prev => prev.map(s => s.id === sessionId ? {
        ...s,
        messages: s.messages.map(m => m.id === assistantId ? { ...m, content: snapshot } : m)
      } : s));
      flushTimer = null;
    };

    try {
      const response = await getAIResponse(
        userMsg.content,
        currentHistory.slice(0, -1),
        activeSession?.preferredModel || 'auto',
        (routing) => setRoutingInfo(routing),
        userMsg.image,
        userMsg.documents || [],
        userSettings.personification,
        (chunk) => {
          accumulatedText += chunk;
          // Throttle UI updates to ~8/sec — prevents markdown re-parse jank
          if (!flushTimer) {
            flushTimer = setTimeout(flushToUI, 120);
          }
        },
        abortControllerRef.current.signal
      );

      // Final flush to ensure all accumulated text is rendered
      if (flushTimer) clearTimeout(flushTimer);
      setSessions(prev => prev.map(s => s.id === sessionId ? {
        ...s,
        messages: s.messages.map(m => m.id === assistantId ? { ...m, content: accumulatedText } : m)
      } : s));

      // Fire suggestions in background — don't block the main response
      const suggestionsPromise = generateFollowUpSuggestions(response.content, previewRouting.intent).catch(() => []);

      const savedAssistantMsg = await api.saveMessage(sessionId, {
        role: 'assistant',
        content: response.content,
        model: response.model,
        tokensUsed: response.tokens,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        groundingChunks: response.groundingChunks,
        routingContext: response.routingContext,
        timestamp: Date.now(),
      });
      
      setSessions(prev => prev.map(s => s.id === sessionId ? {
        ...s,
        messages: s.messages.map(m => m.id === assistantId ? savedAssistantMsg : m)
      } : s));

      // Apply suggestions when they arrive (non-blocking)
      suggestionsPromise.then(suggestions => {
        if (suggestions.length > 0) {
          setSessions(prev => prev.map(s => s.id === sessionId ? {
            ...s,
            messages: s.messages.map(m => m.id === savedAssistantMsg.id ? { ...m, suggestions } : m)
          } : s));
        }
      });

      getStats(user.id).then(setUserStats);

      // Generate title in background — don't block UI
      if (currentHistory.length === 1 && (activeSession?.title === "New Chat" || !activeSession?.title)) {
        generateChatTitle(userMsg.content).then(newTitle => handleRenameSession(sessionId, newTitle)).catch(() => {});
      }
    } catch (error: any) {
      if (flushTimer) clearTimeout(flushTimer);
      if (error.name !== 'AbortError') {
        addToast(error.message, "error");
        setSessions(prev => prev.map(s => s.id === sessionId ? { 
          ...s, 
          messages: s.messages.filter(m => m.id !== assistantId) 
        } : s));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendMessage = async (content: string, image?: MessageImage, docs?: AttachedDocument[]) => {
    if (!user || !activeSessionId || !activeSession || isLoading) return;
    try {
      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        messages: s.messages.map(m => ({ ...m, suggestions: undefined }))
      } : s));

      const savedUserMsg = await api.saveMessage(activeSessionId, { role: 'user', content, timestamp: Date.now(), image, documents: docs });
      const updatedMessages = [...activeSession.messages, savedUserMsg];
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedMessages } : s));
      await requestAIResponse(activeSessionId, updatedMessages);
    } catch (error: any) { addToast(error.message, "error"); }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!activeSession || isLoading) return;
    const msgIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    try {
      const savedUserMsg = await api.saveMessage(activeSessionId, { role: 'user', content: newContent, timestamp: Date.now() });
      const updatedHistory = [...activeSession.messages.slice(0, msgIndex), savedUserMsg];
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedHistory } : s));
      await requestAIResponse(activeSessionId, updatedHistory);
    } catch (error: any) { addToast(error.message, "error"); }
  };

  const handleRegenerate = async (messageId: string) => {
    if (!activeSession || isLoading) return;
    const msgIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const history = activeSession.messages.slice(0, msgIndex);
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: history } : s));
    await requestAIResponse(activeSessionId, history);
  };

  const handleFeedback = (messageId: string, feedback: 'good' | 'bad' | null) => {
    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
      ...s,
      messages: s.messages.map(m => m.id === messageId ? { ...m, feedback } : m)
    } : s));
  };

  const handleNewChat = async () => { if (!user) return; const s = await api.createConversation("New Chat"); setSessions(p => [s, ...p]); setActiveSessionId(s.id); setView('chat'); if (window.innerWidth < 1024) setIsSidebarOpen(false); };
  const handleSelectSession = (id: string) => { setActiveSessionId(id); api.getMessages(id).then(m => setSessions(p => p.map(s => s.id === id ? { ...s, messages: m } : s))); };
  const handleDeleteSession = (id: string) => api.deleteConversation(id).then(() => { setSessions(p => p.filter(s => s.id !== id)); if (activeSessionId === id) setActiveSessionId(''); });
  const handleRenameSession = (id: string, t: string) => api.updateConversation(id, { title: t }).then(() => setSessions(p => p.map(s => s.id === id ? { ...s, title: t } : s)));
  const handleToggleFavorite = (id: string) => { const s = sessions.find(s => s.id === id); if (s) api.updateConversation(id, { isFavorite: !s.isFavorite }).then(() => setSessions(p => p.map(x => x.id === id ? { ...x, isFavorite: !x.isFavorite } : x))); };
  const handleModelChange = (m: AIModel | 'auto') => { if (activeSessionId) api.updateConversation(activeSessionId, { preferredModel: m }).then(() => setSessions(p => p.map(s => s.id === activeSessionId ? { ...s, preferredModel: m } : s))); };
  const handleLogout = () => logout().then(() => { setUser(null); setSessions([]); setView('chat'); setIsSettingsOpen(false); });

  const completeOnboarding = () => { setShowOnboarding(false); localStorage.setItem('nexus_onboarding_done', 'true'); };

  const handleSurveyComplete = (personification: string) => {
    const updatedSettings = { ...userSettings, personification };
    setUserSettings(updatedSettings);
    localStorage.setItem('nexus_user_settings', JSON.stringify(updatedSettings));
    localStorage.setItem('nexus_survey_done', 'true');
    setShowSurvey(false);
  };

  if (isAuthChecking) return <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-primary)]"><div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>;
  
  if (showResetPassword) {
    return (
      <ResetPasswordPage 
        onResetSuccess={() => {
          setShowResetPassword(false);
          setShowAuth(true);
          // Clean up URL hash/params
          window.history.replaceState(null, '', window.location.pathname);
        }}
        onBackToAuth={() => {
          setShowResetPassword(false);
          setShowAuth(true);
          window.history.replaceState(null, '', window.location.pathname);
        }}
      />
    );
  }

  if (!user) {
    return showAuth ? <AuthPage onAuthSuccess={(u) => { setUser(u); setShowAuth(false); if (!localStorage.getItem('nexus_survey_done')) setShowSurvey(true); }} /> : <LandingPage onOpenAuth={() => setShowAuth(true)} />;
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans relative">
      {showSurvey && <OnboardingSurvey onComplete={handleSurveyComplete} userName={user.personification || user.email} />}
      <Sidebar sessions={sessions} activeSessionId={activeSessionId} onNewChat={handleNewChat} onSelectSession={handleSelectSession} view={view} onSetView={setView} stats={userStats} onDeleteSession={handleDeleteSession} onRenameSession={handleRenameSession} onToggleFavorite={handleToggleFavorite} onOpenSettings={() => setIsSettingsOpen(true)} searchInputRef={null as any} isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
      <main className="flex-1 flex flex-col min-w-0 relative">
        {view === 'chat' && activeSession ? (
          <>
            <ChatArea session={activeSession} isLoading={isLoading} routingInfo={routingInfo} onExport={handleExportChat} onShare={() => {}} onModelChange={handleModelChange} onToggleSidebar={() => setIsSidebarOpen(true)} isSidebarOpen={isSidebarOpen} onRegenerate={handleRegenerate} onEditMessage={handleEditMessage} onFeedback={handleFeedback} theme={theme} onThemeToggle={handleThemeToggle} onSuggestionClick={(txt) => handleSendMessage(txt)} />
            <MessageInput onSendMessage={handleSendMessage} onStop={() => abortControllerRef.current?.abort()} isDisabled={isLoading} preferredModel={activeSession.preferredModel} onModelChange={handleModelChange} activeSessionId={activeSessionId} />
          </>
        ) : view === 'dashboard' ? (
          <Dashboard stats={userStats!} onUpgrade={() => setView('pricing')} />
        ) : view === 'pricing' ? (
          <Pricing onUpgrade={() => setView('billing')} onClose={() => setView('chat')} />
        ) : view === 'billing' ? (
          <Billing stats={userStats!} onCancel={() => {}} onUpgrade={() => setView('pricing')} onClose={() => setView('chat')} />
        ) : view === 'admin' ? (
          <AdminDashboard stats={getAdminStats()} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 bg-emerald-500/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
              <Icons.Robot className="w-10 h-10 text-emerald-500/40" />
            </div>
            <button onClick={handleNewChat} className="px-10 py-4 bg-emerald-500 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all">New Chat</button>
          </div>
        )}
      </main>
      
      {showOnboarding && <MobileOnboarding onComplete={completeOnboarding} />}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userSettings={userSettings} onSave={(s) => { setUserSettings(s); localStorage.setItem('nexus_user_settings', JSON.stringify(s)); }} onPurgeHistory={() => api.purgeAllConversations().then(() => { setSessions([]); setActiveSessionId(''); })} onUpgrade={() => { setIsSettingsOpen(false); setView('pricing'); }} onLogout={handleLogout} user={user} stats={userStats} onThemeToggle={handleThemeToggle} theme={theme} />
      <Toast toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  );
};

export default App;