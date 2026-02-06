
import { UserStats, AIModel, UserTier } from "../types";
import { api } from "./apiService";

const FREE_LIMIT = 50;

/**
 * NEXUS AI - Storage & Limits Logic
 */
export const getStats = async (userId: string): Promise<UserStats> => {
  try {
    /* Fix: getUserStats() uses current session ID internally and expects no arguments */
    return await api.getUserStats();
  } catch (err: any) {
    console.error(`Failed to fetch user stats for ${userId}:`, err.message || "Unknown storage error");
    // Return empty state or fallback to prevent app breakage
    return {
      userId,
      tier: 'free',
      totalMessagesSent: 0,
      monthlyMessagesSent: 0,
      monthlyMessagesLimit: FREE_LIMIT, // Added: Missing required field
      tokensEstimated: 0,
      modelUsage: { [AIModel.GPT4]: 0, [AIModel.CLAUDE]: 0, [AIModel.GEMINI]: 0 },
      dailyHistory: []
    };
  }
};

export const updateStats = async (userId: string, model: AIModel, prompt: string, response: string): Promise<UserStats> => {
  /* Fix: getUserStats() uses current session ID internally and expects no arguments */
  return await api.getUserStats();
};

export const setTier = async (userId: string, tier: UserTier): Promise<UserStats> => {
  /* Fix: api.updateTier expects only one argument */
  await api.updateTier(tier);
  /* Fix: getUserStats() uses current session ID internally and expects no arguments */
  return await api.getUserStats();
};

export const cancelSubscription = async (userId: string): Promise<UserStats> => {
  /* Fix: api.updateTier expects only one argument */
  await api.updateTier('free');
  /* Fix: getUserStats() uses current session ID internally and expects no arguments */
  return await api.getUserStats();
};

export const isLimitReached = (stats: UserStats): boolean => {
  if (stats.tier === 'pro') return false;
  return (stats.monthlyMessagesSent || 0) >= FREE_LIMIT;
};
