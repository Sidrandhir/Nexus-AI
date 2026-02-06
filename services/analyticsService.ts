
import { AnalyticsEvent, ErrorLog, AdminStats, AIModel, User } from "../types";
import { getAllUsers } from "./authService";

const EVENTS_KEY = 'nexus_ai_analytics_events';
const ERRORS_KEY = 'nexus_ai_error_logs';

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  const userId = localStorage.getItem('nexus_ai_session_token') || 'anonymous';
  const event: AnalyticsEvent = {
    eventName,
    userId,
    params,
    timestamp: Date.now()
  };
  
  const existing = getEvents();
  existing.push(event);
  // Keep only last 1000 events to manage storage
  localStorage.setItem(EVENTS_KEY, JSON.stringify(existing.slice(-1000)));
  
  // Real GA4 would go here:
  // window.gtag('event', eventName, params);
  console.debug(`[Analytics] ${eventName}:`, params);
};

export const logError = (message: string, isCritical: boolean = false, model?: AIModel, stack?: string) => {
  const userId = localStorage.getItem('nexus_ai_session_token') || undefined;
  const error: ErrorLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    message,
    userId,
    model,
    stack,
    critical: isCritical
  };
  
  const existing = getErrors();
  existing.push(error);
  localStorage.setItem(ERRORS_KEY, JSON.stringify(existing.slice(-200)));
  
  if (isCritical) {
    console.error(`[CRITICAL ERROR] ${message}`);
    // Real notification logic would trigger here
  }
};

const getEvents = (): AnalyticsEvent[] => {
  const stored = localStorage.getItem(EVENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const getErrors = (): ErrorLog[] => {
  const stored = localStorage.getItem(ERRORS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getAdminStats = (): AdminStats => {
  const users = getAllUsers();
  const events = getEvents();
  const errors = getErrors();
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const monthStart = new Date().setDate(1);

  const modelCalls = events.filter(e => e.eventName === 'model_call');
  const messagesToday = modelCalls.filter(e => e.timestamp >= todayStart).length;
  const messagesThisMonth = modelCalls.filter(e => e.timestamp >= monthStart).length;

  // Simulate revenue from stats
  let totalRevenue = 0;
  users.forEach(u => {
    const userStatsStr = localStorage.getItem(`nexus_ai_stats_${u.id}`);
    if (userStatsStr) {
      const stats = JSON.parse(userStatsStr);
      if (stats.tier === 'pro') {
        totalRevenue += 29 * (stats.billingHistory?.length || 1);
      }
    }
  });

  // Calculate average response time from events
  const responseTimes = modelCalls.map(e => e.params.responseTime).filter(t => t !== undefined);
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;

  // Error Rate
  const errorRate = modelCalls.length > 0 
    ? (errors.length / (modelCalls.length + errors.length)) * 100 
    : 0;

  // Model Distribution
  const modelDistribution: Record<AIModel, number> = {
    [AIModel.GPT4]: 0,
    [AIModel.CLAUDE]: 0,
    [AIModel.GEMINI]: 0
  };
  modelCalls.forEach(e => {
    if (e.params.model) {
      modelDistribution[e.params.model as AIModel]++;
    }
  });

  // Mock growth history (Last 7 days)
  const growthHistory = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      users: users.filter(u => new Date(u.createdAt).toISOString().split('T')[0] === dateStr).length,
      revenue: Math.floor(Math.random() * 200) + 100 // Mock random daily rev
    };
  });

  return {
    totalUsers: users.length,
    messagesToday,
    messagesThisMonth,
    totalRevenue,
    avgResponseTime,
    errorRate,
    modelDistribution,
    growthHistory,
    errorLogs: errors.sort((a, b) => b.timestamp - a.timestamp)
  };
};
