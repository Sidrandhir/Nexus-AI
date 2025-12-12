
import React, { useState, useEffect, useRef } from 'react';
import { Menu, Send, Sparkles, AlertTriangle, Download, Share2, CheckCircle2, Mic, MicOff, X, Paperclip, ImageIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MessageItem from './components/MessageItem';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';
import Pricing from './components/Pricing';
import Billing from './components/Billing';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import ModelSelector from './components/ModelSelector';

import { Message, Conversation, Role, ModelProvider, UsageData, User, RoutingMode, Attachment } from './types';
import { callGemini } from './services/geminiService';
import { callOpenAI } from './services/openaiService';
import { callClaude } from './services/anthropicService';
import { routeMessage } from './services/aiRouter';
import { getUsage, incrementUsage, checkLimit, upgradeToPro } from './services/usageService';
import { exportAsText, exportAsJSON } from './services/exportService';
import { handlePaymentSuccess } from './services/stripeService';
import { getCurrentUser } from './services/authService';
import { initGA, trackPageView, trackMessageSent, trackError, trackRevenue } from './services/analyticsService';
import { fetchConversations, createConversation, updateConversation, deleteConversation, saveMessage } from './services/dataService';

const generateId = () => Math.random().toString(36).substring(2, 9);

// Add TypeScript support for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const App: React.FC = () => {
  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // File Upload State
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Views/Modals
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  
  // Success notification
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 0. Initialize Analytics
  useEffect(() => {
    initGA();
    trackPageView('/');
  }, []);

  // 1. Init Auth
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoadingAuth(false);
  }, []);

  // 2. Load User Data when currentUser changes
  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        setUsage(getUsage(currentUser.id));
        
        try {
            const fetchedConvs = await fetchConversations(currentUser.id);
            setConversations(fetchedConvs);
            if (fetchedConvs.length > 0) {
                setActiveConversationId(fetchedConvs[0].id);
            } else {
                handleNewChat();
            }
        } catch (e) {
            console.error("Failed to load conversations", e);
            setConversations([]);
        }
      } else {
        setConversations([]);
        setUsage(null);
      }
    };
    loadData();
  }, [currentUser]);

  // Handle Payment Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && currentUser) {
      const verify = async () => {
        await handlePaymentSuccess(currentUser.id);
        trackRevenue(29); // Track revenue for analytics
        setUsage(getUsage(currentUser.id)); // Reload usage
        setShowSuccessToast(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => setShowSuccessToast(false), 5000);
      }
      verify();
    }
  }, [currentUser]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        if (!sidebarOpen) setSidebarOpen(true);
        // Only focus search if sidebar is not collapsed
        if (!isSidebarCollapsed) {
           setTimeout(() => document.getElementById('sidebar-search')?.focus(), 100);
        }
      }
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setShowDashboard(false);
        setDeleteModalOpen(false);
        setShowPricing(false);
        setShowBilling(false);
        setShowAdmin(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, currentUser, isSidebarCollapsed]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversationId, isProcessing]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleNewChat = async () => {
    if (!currentUser) return;
    const newId = generateId();
    const newConv: Conversation = {
      id: newId,
      userId: currentUser.id,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now(),
      preferredModel: 'AUTO'
    };
    
    // Optimistic Update
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
    
    // API Call
    try {
        await createConversation(currentUser.id, newConv);
    } catch (e) {
        console.error("Failed to create conversation", e);
    }

    setShowDashboard(false);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteRequest = (id: string) => {
    setConversationToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (conversationToDelete && currentUser) {
      const prevConvs = [...conversations];
      
      // Optimistic Update
      setConversations(prev => {
        const newConvs = prev.filter(c => c.id !== conversationToDelete);
        if (activeConversationId === conversationToDelete) {
          if (newConvs.length > 0) {
            setActiveConversationId(newConvs[0].id);
          } else {
             // Will trigger new chat creation separately if needed
             setTimeout(handleNewChat, 0);
          }
        }
        return newConvs;
      });

      // API Call
      try {
          await deleteConversation(currentUser.id, conversationToDelete);
      } catch (e) {
          console.error("Failed to delete", e);
          setConversations(prevConvs); // Revert
      }

      setDeleteModalOpen(false);
      setConversationToDelete(null);
    }
  };

  const updateConversationState = async (updatedConv: Conversation) => {
      if (!currentUser) return;
      
      setConversations(prev => prev.map(c => 
        c.id === updatedConv.id ? updatedConv : c
      ));

      try {
          await updateConversation(currentUser.id, updatedConv);
      } catch (e) {
          console.error("Failed to update conversation", e);
      }
  };

  const handleRename = (id: string, newTitle: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) updateConversationState({ ...conv, title: newTitle, lastModified: Date.now() });
  };

  const handleArchive = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) updateConversationState({ ...conv, isArchived: !conv.isArchived, lastModified: Date.now() });
  };

  const handleStar = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) updateConversationState({ ...conv, isStarred: !conv.isStarred, lastModified: Date.now() });
  };

  const handleModelSelect = (mode: RoutingMode) => {
    const conv = conversations.find(c => c.id === activeConversationId);
    if (conv) updateConversationState({ ...conv, preferredModel: mode, lastModified: Date.now() });
  };

  const handleExport = (format: 'txt' | 'json') => {
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    if (!activeConversation) return;
    if (format === 'txt') exportAsText(activeConversation);
    else exportAsJSON(activeConversation);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert("Link copied to clipboard");
    });
  };

  // --- Voice Input Logic ---
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      // Suppress network errors in console by handling them gracefully
      if (event.error === 'network') {
          console.log("Speech recognition network error (offline or blocked).");
          setIsListening(false);
          return;
      }
      if (event.error === 'not-allowed') {
          alert("Microphone access blocked. Please allow permissions.");
          setIsListening(false);
          return;
      }
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
          // Log other errors quietly
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
      }
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setInputValue(prev => {
          const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + spacer + finalTranscript;
        });
      }
    };

    recognitionRef.current = recognition;
    try {
        recognition.start();
    } catch (e) {
        console.warn("Failed to start speech recognition:", e);
        setIsListening(false);
    }
  };

  // --- File Upload Logic ---
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage({
        type: 'image',
        url: result,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  const handleSendMessage = async () => {
    const hasImage = !!selectedImage;
    if (!currentUser || !usage || (!inputValue.trim() && !hasImage) || isProcessing) return;

    if (isListening) {
       if (recognitionRef.current) {
         recognitionRef.current.stop();
         recognitionRef.current = null;
       }
       setIsListening(false);
    }

    if (!checkLimit(currentUser.id)) {
      setShowPricing(true);
      return;
    }

    const currentConv = conversations.find(c => c.id === activeConversationId);
    if (!currentConv) return;

    const userMsgContent = inputValue.trim();
    const messageAttachment = selectedImage;

    setInputValue('');
    setSelectedImage(null);
    setIsProcessing(true);

    const userMessage: Message = {
      id: generateId(),
      role: Role.USER,
      content: userMsgContent,
      timestamp: Date.now(),
      attachment: messageAttachment || undefined
    };

    // 1. Update UI immediately
    let updatedConv = { ...currentConv };
    const isFirstMessage = updatedConv.messages.length === 0;

    if (isFirstMessage) {
        updatedConv.title = userMsgContent ? userMsgContent.substring(0, 40) + (userMsgContent.length > 40 ? '...' : '') : 'Image Analysis';
    }
    
    updatedConv.messages = [...updatedConv.messages, userMessage];
    updatedConv.lastModified = Date.now();

    updateConversationState(updatedConv);
    saveMessage(currentUser.id, updatedConv.id, userMessage).catch(console.error);

    // 2. Routing Logic
    const preferredMode = currentConv.preferredModel || 'AUTO';
    let selectedProvider: ModelProvider;

    if (preferredMode === 'AUTO') {
      const routingId = generateId();
      const routingMessage: Message = {
        id: routingId,
        role: Role.ASSISTANT,
        content: '',
        timestamp: Date.now(),
        isRouting: true
      };
      
      setConversations(prev => prev.map(c => 
        c.id === activeConversationId 
          ? { ...c, messages: [...c.messages, routingMessage] }
          : c
      ));

      await new Promise(r => setTimeout(r, 600)); 
      
      const decision = routeMessage(userMsgContent, !!messageAttachment);
      selectedProvider = decision.provider;

      // Remove routing message
      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId) {
            return { ...c, messages: c.messages.filter(m => m.id !== routingId) };
        }
        return c;
      }));

    } else {
      selectedProvider = preferredMode;
      if (messageAttachment && selectedProvider !== ModelProvider.GEMINI) {
         selectedProvider = ModelProvider.GEMINI;
      }
    }

    try {
      const historyContext = updatedConv.messages;
      
      let responseText = '';
      if (selectedProvider === ModelProvider.GEMINI) {
        const needsSearch = preferredMode === 'AUTO' 
             ? (routeMessage(userMsgContent).requiresSearch || false)
             : (userMsgContent.toLowerCase().includes('news') || userMsgContent.toLowerCase().includes('current'));
             
        responseText = await callGemini(historyContext, userMsgContent, needsSearch, messageAttachment || undefined);
      } else if (selectedProvider === ModelProvider.CLAUDE) {
        responseText = await callClaude(historyContext, userMsgContent);
      } else {
        responseText = await callOpenAI(historyContext, userMsgContent);
      }

      // Track usage
      const totalWords = userMsgContent.split(/\s+/).length + responseText.split(/\s+/).length;
      const newUsage = incrementUsage(currentUser.id, selectedProvider, totalWords);
      setUsage(newUsage);
      trackMessageSent(selectedProvider);

      const finalMessage: Message = {
        id: generateId(),
        role: Role.ASSISTANT,
        content: responseText,
        timestamp: Date.now(),
        model: selectedProvider
      };

      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId) {
            const updated = { ...c, messages: [...c.messages, finalMessage], lastModified: Date.now() };
            saveMessage(currentUser.id, updated.id, finalMessage).catch(console.error);
            return updated;
        }
        return c;
      }));

    } catch (error) {
      console.error(error);
      trackError((error as Error).message, (error as Error).stack, currentUser.id);
      
      const errorMessage: Message = {
        id: generateId(),
        role: Role.ASSISTANT,
        content: "Sorry, I encountered an error processing your request.",
        timestamp: Date.now(),
        model: ModelProvider.GPT4 
      };
      
      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId) {
          return { ...c, messages: [...c.messages, errorMessage] };
        }
        return c;
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingAuth) {
    return <div className="h-screen bg-nexus-900 flex items-center justify-center text-nexus-primary"><Sparkles className="animate-spin w-8 h-8" /></div>;
  }

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  if (!usage) return null;

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];
  const currentMode = activeConversation?.preferredModel || 'AUTO';

  return (
    <div className="flex h-screen bg-nexus-900 text-gray-100 font-sans overflow-hidden">
      
      <Modal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />

      {showDashboard && (
        <Dashboard 
          usage={usage} 
          onClose={() => setShowDashboard(false)} 
          onUpgrade={() => { setShowDashboard(false); setShowPricing(true); }}
          onOpenBilling={() => { setShowDashboard(false); setShowBilling(true); }}
        />
      )}

      {showAdmin && currentUser.isAdmin && (
        <AdminDashboard onClose={() => setShowAdmin(false)} />
      )}

      {showPricing && (
        <Pricing 
          currentTier={usage.tier}
          onClose={() => setShowPricing(false)} 
        />
      )}

      {showBilling && (
        <Billing
          usage={usage}
          onClose={() => setShowBilling(false)}
          onViewPricing={() => {
            setShowBilling(false);
            setShowPricing(true);
          }}
        />
      )}
      
      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-[slideDown_0.3s_ease-out]">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Plan Upgraded Successfully!</span>
        </div>
      )}

      <Sidebar 
        conversations={conversations} 
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        usage={usage}
        user={currentUser}
        onOpenDashboard={() => setShowDashboard(true)}
        onDeleteConversation={handleDeleteRequest}
        onRenameConversation={handleRename}
        onArchiveConversation={handleArchive}
        onStarConversation={handleStar}
        onLogout={() => setCurrentUser(null)}
      />

      <main className="flex-1 flex flex-col h-full relative w-full transition-all">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-nexus-900/50 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-semibold text-lg tracking-tight flex items-center gap-2">
              NEXUS <span className="text-nexus-primary">AI</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center gap-1 mr-2 bg-white/5 rounded-lg p-1">
                 <button onClick={() => handleExport('txt')} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors" title="Export as Text">
                    <Download className="w-4 h-4" />
                 </button>
                 <button onClick={handleShare} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors" title="Share">
                    <Share2 className="w-4 h-4" />
                 </button>
             </div>
            
            <div className="block">
               <UserProfile 
                    user={currentUser} 
                    tier={usage.tier} 
                    onLogout={() => setCurrentUser(null)}
                    compact={true}
                    onOpenAdmin={() => setShowAdmin(true)}
                />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
              <div className="w-20 h-20 bg-gradient-to-br from-nexus-800 to-nexus-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-nexus-primary/10 border border-white/5">
                 <Sparkles className="w-10 h-10 text-nexus-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Welcome back, {currentUser.name?.split(' ')[0]}</h2>
              <p className="text-gray-400 max-w-md mb-10 text-lg">
                Your intelligent gateway to the world's most powerful AI models.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full text-left">
                <button className="group p-5 bg-nexus-800/30 hover:bg-nexus-800/60 rounded-xl border border-white/5 hover:border-nexus-primary/30 transition-all cursor-pointer" onClick={() => setInputValue("Write a Python script to scrape a website")}>
                   <div className="text-nexus-primary mb-2 font-mono text-xs flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-nexus-primary"></span> CLAUDE 3.5
                   </div>
                   <div className="text-sm font-medium group-hover:text-white transition-colors">Write a Python script to scrape data</div>
                </button>
                <button className="group p-5 bg-nexus-800/30 hover:bg-nexus-800/60 rounded-xl border border-white/5 hover:border-blue-400/30 transition-all cursor-pointer" onClick={() => setInputValue("Who won the Super Bowl in 2024?")}>
                   <div className="text-blue-400 mb-2 font-mono text-xs flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-400"></span> GEMINI + SEARCH
                   </div>
                   <div className="text-sm font-medium group-hover:text-white transition-colors">Recent events & live info</div>
                </button>
                <button className="group p-5 bg-nexus-800/30 hover:bg-nexus-800/60 rounded-xl border border-white/5 hover:border-green-400/30 transition-all cursor-pointer" onClick={() => setInputValue("Analyze this image")}>
                   <div className="text-green-400 mb-2 font-mono text-xs flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-400"></span> GEMINI VISION
                   </div>
                   <div className="text-sm font-medium group-hover:text-white transition-colors">Image analysis & extraction</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col pb-4">
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              {isProcessing && (
                 <div className="w-full py-6 md:py-8 border-b border-black/5 dark:border-white/5 bg-nexus-800/30 animate-[fadeIn_0.3s_ease-out]">
                   <div className="max-w-3xl mx-auto px-4 md:px-6 flex gap-4 md:gap-6">
                     <div className="w-8 h-8 rounded-sm bg-nexus-primary flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
                     </div>
                     <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-700/50 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-1/2 animate-pulse"></div>
                     </div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Voice Recording Overlay */}
        {isListening && (
          <div className="absolute bottom-24 left-0 right-0 z-50 flex justify-center animate-[slideUp_0.2s_ease-out] pointer-events-none">
            <div className="bg-nexus-800 border border-red-500/50 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-red-500 rounded-full animate-[wave_0.8s_ease-in-out_infinite]"></div>
                <div className="w-1 h-5 bg-red-500 rounded-full animate-[wave_0.8s_ease-in-out_0.1s_infinite]"></div>
                <div className="w-1 h-7 bg-red-500 rounded-full animate-[wave_0.8s_ease-in-out_0.2s_infinite]"></div>
                <div className="w-1 h-5 bg-red-500 rounded-full animate-[wave_0.8s_ease-in-out_0.3s_infinite]"></div>
                <div className="w-1 h-3 bg-red-500 rounded-full animate-[wave_0.8s_ease-in-out_0.4s_infinite]"></div>
              </div>
              <span className="text-red-400 font-medium text-sm animate-pulse">Listening...</span>
              <span className="text-gray-500 text-xs">Click mic to stop</span>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="w-full border-t border-white/5 bg-nexus-900 p-4 relative z-20">
          <div className="max-w-3xl mx-auto relative">
             <div className="flex justify-between items-center mb-2 px-1">
                <ModelSelector 
                  currentMode={currentMode} 
                  onSelect={handleModelSelect}
                  disabled={isProcessing}
                />
                <span className="text-[10px] text-gray-600 hidden md:block">
                   {currentMode === 'AUTO' ? 'Smart Routing Active' : 'Manual Override Active'}
                </span>
             </div>
             
             <input 
               type="file"
               ref={fileInputRef}
               className="hidden"
               accept="image/png, image/jpeg, image/webp"
               onChange={handleFileSelect}
             />

             {selectedImage && (
               <div className="absolute bottom-full mb-2 left-0 z-10 animate-[scaleIn_0.2s_ease-out]">
                 <div className="relative group">
                   <img 
                     src={selectedImage.url} 
                     alt="Preview" 
                     className="h-20 w-auto rounded-lg border border-white/20 shadow-lg bg-black/50"
                   />
                   <button 
                     onClick={clearImage}
                     className="absolute -top-2 -right-2 bg-nexus-800 text-white rounded-full p-1 border border-white/10 shadow-md hover:bg-red-500 transition-colors"
                   >
                     <X className="w-3 h-3" />
                   </button>
                 </div>
               </div>
             )}

             <textarea
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSendMessage();
                   }
               }}
               placeholder={usage.messagesUsed >= usage.limit && usage.tier === 'FREE' ? "Monthly limit reached. Upgrade to Pro." : "Send a message..."}
               disabled={isProcessing || (usage.messagesUsed >= usage.limit && usage.tier === 'FREE')}
               className="w-full bg-nexus-800/50 text-white placeholder-gray-500 rounded-xl pl-12 pr-24 py-3 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 h-[52px] max-h-[200px] disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
               style={{ minHeight: '52px' }}
             />
             
             <div className="absolute left-2 bottom-2 flex items-center">
                 <button
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isProcessing}
                   className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                   title="Upload Image"
                 >
                   <Paperclip className="w-4 h-4" />
                 </button>
             </div>
             
             <div className="absolute right-2 bottom-2 flex items-center gap-1">
                 <button
                   onClick={toggleVoiceInput}
                   disabled={isProcessing || (usage.messagesUsed >= usage.limit && usage.tier === 'FREE')}
                   className={`p-2 rounded-lg transition-all duration-200 
                     ${isListening 
                       ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                       : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                     }
                   `}
                   title={isListening ? "Stop Recording" : "Start Voice Input"}
                 >
                   {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                 </button>

                 <button
                   onClick={handleSendMessage}
                   disabled={(!inputValue.trim() && !selectedImage) || isProcessing || (usage.messagesUsed >= usage.limit && usage.tier === 'FREE')}
                   className={`p-2 rounded-lg transition-all duration-200 
                     {(inputValue.trim() || selectedImage) && !isProcessing && !(usage.messagesUsed >= usage.limit && usage.tier === 'FREE')
                       ? 'bg-nexus-primary text-white hover:bg-blue-600 shadow-lg shadow-nexus-primary/20' 
                       : 'bg-transparent text-gray-500 cursor-not-allowed'
                     }`}
                 >
                   <Send className="w-4 h-4" />
                 </button>
             </div>
             
             {usage.messagesUsed >= usage.limit && usage.tier === 'FREE' && (
                <div className="absolute -top-12 left-0 right-0 flex justify-center cursor-pointer" onClick={() => setShowPricing(true)}>
                    <div className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs border border-red-500/20 flex items-center gap-2 animate-pulse shadow-xl transition-colors">
                        <AlertTriangle className="w-4 h-4" />
                        <span>You've reached your free monthly limit. Click to Upgrade.</span>
                    </div>
                </div>
             )}
          </div>
          <div className="text-center mt-3">
            <p className="text-[10px] text-gray-600">
              Nexus can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
