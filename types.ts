export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export enum ModelProvider {
  GEMINI = 'Gemini 2.5',
  CLAUDE = 'Claude 3.5 Sonnet',
  GPT4 = 'GPT-4o'
}

export type RoutingMode = 'AUTO' | ModelProvider;

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: number;
  isAdmin?: boolean;
}

export interface Attachment {
  type: 'image';
  url: string; // Base64 data URL
  mimeType: string;
  name: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  model?: ModelProvider; // The model that generated this message
  isRouting?: boolean;   // If true, showing routing animation
  attachment?: Attachment; // Optional file attachment
}

export interface Conversation {
  id: string;
  userId: string; // Owner of the conversation
  title: string;
  messages: Message[];
  createdAt: number;
  lastModified: number;
  isStarred?: boolean;
  isArchived?: boolean;
  preferredModel?: RoutingMode;
}

export interface RoutingDecision {
  provider: ModelProvider;
  reason: string;
  requiresSearch?: boolean;
}

export type UserTier = 'FREE' | 'PRO';

export interface DailyUsage {
  date: string; // ISO date string YYYY-MM-DD
  count: number;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  pdfUrl?: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface UsageData {
  userId: string;
  tier: UserTier;
  messagesUsed: number;
  limit: number;
  periodStart: number;
  totalTokens: number;
  modelUsage: Record<string, number>;
  history: DailyUsage[];
  // Billing Info
  subscriptionId?: string;
  nextBillingDate?: number;
  paymentMethods?: PaymentMethod[];
  invoices?: Invoice[];
  canceledAt?: number; // If set, subscription ends at period end
}

export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  userId?: string;
}

export interface GlobalStats {
  totalUsers: number;
  totalMessages: number;
  totalRevenue: number;
  modelCounts: Record<string, number>;
  dailyStats: {
    date: string;
    users: number;
    messages: number;
    revenue: number;
  }[];
  errors: ErrorLog[];
}

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}