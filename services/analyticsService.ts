import { GlobalStats, ModelProvider } from "../types";

const GA_MEASUREMENT_ID = 'G-MOCK-NEXUS-ID'; // Placeholder
const GLOBAL_STATS_KEY = 'nexus_global_stats_v1';

// Initialize Global Stats if empty
const initGlobalStats = (): GlobalStats => {
  const stored = localStorage.getItem(GLOBAL_STATS_KEY);
  if (stored) return JSON.parse(stored);

  const initial: GlobalStats = {
    totalUsers: 0,
    totalMessages: 0,
    totalRevenue: 0,
    modelCounts: {
      [ModelProvider.GEMINI]: 0,
      [ModelProvider.CLAUDE]: 0,
      [ModelProvider.GPT4]: 0
    },
    dailyStats: [],
    errors: []
  };
  localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(initial));
  return initial;
};

// --- Google Analytics 4 ---

export const initGA = () => {
  // In a real app, this would inject the Google Tag Manager script
  console.log(`[Analytics] GA4 Initialized with ID: ${GA_MEASUREMENT_ID}`);
  
  // Mock window.gtag if it doesn't exist
  if (!(window as any).gtag) {
    (window as any).gtag = (...args: any[]) => {
      console.log(`[Analytics] gtag event:`, args);
    };
  }
};

export const trackPageView = (path: string) => {
  if ((window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: document.title
    });
  }
};

export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  if ((window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// --- Internal Analytics for Dashboard ---

const getTodayString = () => new Date().toISOString().split('T')[0];

const updateDailyStats = (stats: GlobalStats, revenueChange: number = 0, messageChange: number = 0, userChange: number = 0) => {
  const today = getTodayString();
  const dayStat = stats.dailyStats.find(d => d.date === today);
  
  if (dayStat) {
    dayStat.messages += messageChange;
    dayStat.revenue += revenueChange;
    dayStat.users += userChange;
  } else {
    stats.dailyStats.push({
      date: today,
      messages: messageChange,
      revenue: revenueChange,
      users: Math.max(stats.totalUsers + userChange, 1) // Rough estimate for today
    });
    // Keep last 30 days
    if (stats.dailyStats.length > 30) stats.dailyStats.shift();
  }
  return stats;
};

export const trackMessageSent = (model: string) => {
  const stats = initGlobalStats();
  stats.totalMessages += 1;
  stats.modelCounts[model] = (stats.modelCounts[model] || 0) + 1;
  updateDailyStats(stats, 0, 1, 0);
  localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(stats));
  
  trackEvent('AI', 'generate_content', model);
};

export const trackUserSignup = () => {
  const stats = initGlobalStats();
  stats.totalUsers += 1;
  updateDailyStats(stats, 0, 0, 1);
  localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(stats));
  
  trackEvent('User', 'signup');
};

export const trackRevenue = (amount: number) => {
  const stats = initGlobalStats();
  stats.totalRevenue += amount;
  updateDailyStats(stats, amount, 0, 0);
  localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(stats));
  
  trackEvent('Revenue', 'purchase', 'subscription', amount);
};

export const trackError = (message: string, stack?: string, userId?: string) => {
  const stats = initGlobalStats();
  stats.errors.unshift({
    id: Math.random().toString(36).substring(7),
    timestamp: Date.now(),
    message,
    stack,
    userId
  });
  // Keep last 50 errors
  if (stats.errors.length > 50) stats.errors = stats.errors.slice(0, 50);
  localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(stats));
  
  trackEvent('System', 'error', message);
};