import { UsageData, UserTier, ModelProvider, Invoice, PaymentMethod } from "../types";
import { fetchUsage } from "./dataService";

// In a real app, most of this logic happens on the backend.
// We keep the state management here for the React client but data loading via dataService.

const STORAGE_PREFIX = 'nexus_usage_';
const FREE_LIMIT = 50;
const PRO_LIMIT = Infinity;

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;
const getTodayString = () => new Date().toISOString().split('T')[0];

const createInitialData = (userId: string): UsageData => ({
  userId,
  tier: 'FREE',
  messagesUsed: 0,
  limit: FREE_LIMIT,
  periodStart: Date.now(),
  totalTokens: 0,
  modelUsage: {
    [ModelProvider.GEMINI]: 0,
    [ModelProvider.CLAUDE]: 0,
    [ModelProvider.GPT4]: 0
  },
  history: [],
  invoices: [],
  paymentMethods: []
});

export const getUsage = (userId: string): UsageData => {
  if (!userId) return createInitialData('anonymous');
  
  // NOTE: In a full async migration, this should be async.
  // For now, we fallback to synchronous localStorage for immediate UI rendering,
  // but in background we would sync with API using fetchUsage(userId).
  
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (!stored) {
      const initial = createInitialData(userId);
      saveUsage(userId, initial);
      return initial;
    }
    const parsed = JSON.parse(stored);
    
    // Check if we need to reset monthly usage
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.periodStart > thirtyDaysMs) {
      return resetPeriod(parsed);
    }
    
    return parsed;
  } catch (e) {
    return createInitialData(userId);
  }
};

const saveUsage = (userId: string, data: UsageData) => {
  // Save locally
  localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
  // In real app: await fetch(`${API_URL}/usage`, { method: 'POST', body: JSON.stringify(data) })
};

const resetPeriod = (data: UsageData): UsageData => {
  const newData = {
    ...data,
    messagesUsed: 0,
    periodStart: Date.now(),
  };
  saveUsage(data.userId, newData);
  return newData;
};

export const incrementUsage = (userId: string, model: ModelProvider | string, wordCount: number) => {
  const data = getUsage(userId);
  
  data.messagesUsed += 1;
  data.totalTokens += Math.ceil(wordCount * 1.3);
  data.modelUsage[model] = (data.modelUsage[model] || 0) + 1;
  
  const today = getTodayString();
  const dayEntry = data.history.find(h => h.date === today);
  if (dayEntry) {
    dayEntry.count += 1;
  } else {
    data.history.push({ date: today, count: 1 });
    if (data.history.length > 30) data.history.shift();
  }

  saveUsage(userId, data);
  return data;
};

export const checkLimit = (userId: string): boolean => {
  const data = getUsage(userId);
  if (data.tier === 'PRO') return true;
  return data.messagesUsed < data.limit;
};

export const upgradeToPro = (userId: string) => {
  const data = getUsage(userId);
  data.tier = 'PRO';
  data.limit = PRO_LIMIT;
  
  data.subscriptionId = 'sub_' + Math.random().toString(36).substring(7);
  data.nextBillingDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
  
  if (!data.paymentMethods?.length) {
    data.paymentMethods = [{
      id: 'pm_' + Math.random().toString(36).substring(7),
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    }];
  }

  const newInvoice: Invoice = {
    id: 'inv_' + Math.random().toString(36).substring(7),
    date: new Date().toISOString(),
    amount: 2900, 
    status: 'paid',
    pdfUrl: '#'
  };
  
  data.invoices = [newInvoice, ...(data.invoices || [])];

  saveUsage(userId, data);
  return data;
};

export const downgradeToFree = (userId: string) => {
    const data = getUsage(userId);
    data.tier = 'FREE';
    data.limit = FREE_LIMIT;
    data.subscriptionId = undefined;
    data.nextBillingDate = undefined;
    saveUsage(userId, data);
    return data;
};

export const getFavoriteModel = (data: UsageData): string => {
  let max = 0;
  let fav = 'None';
  Object.entries(data.modelUsage).forEach(([model, count]) => {
    if (count > max) {
      max = count;
      fav = model;
    }
  });
  return fav;
};
