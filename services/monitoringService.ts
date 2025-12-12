import { GlobalStats } from "../types";

const GLOBAL_STATS_KEY = 'nexus_global_stats_v1';

export const getSystemMetrics = (): GlobalStats => {
  const stored = localStorage.getItem(GLOBAL_STATS_KEY);
  if (stored) return JSON.parse(stored);
  
  // Return empty structure if nothing exists
  return {
    totalUsers: 0,
    totalMessages: 0,
    totalRevenue: 0,
    modelCounts: {},
    dailyStats: [],
    errors: []
  };
};

export const getAverageResponseTime = () => {
  // Mock calculation - in a real app, we would track this per request
  return Math.floor(Math.random() * 800) + 400; // ms
};

export const getErrorRate = () => {
  const metrics = getSystemMetrics();
  if (metrics.totalMessages === 0) return 0;
  return (metrics.errors.length / metrics.totalMessages) * 100;
};