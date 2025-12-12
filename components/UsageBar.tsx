import React from 'react';
import { UsageData } from '../types';

interface UsageBarProps {
  usage: UsageData;
}

const UsageBar: React.FC<UsageBarProps> = ({ usage }) => {
  if (usage.tier === 'PRO') return null;

  const percentage = Math.min(100, (usage.messagesUsed / usage.limit) * 100);
  const isNearLimit = percentage > 80;

  return (
    <div className="w-full px-4 mb-4">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Free Plan Usage</span>
        <span>{usage.messagesUsed} / {usage.limit}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-red-500' : 'bg-nexus-primary'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default UsageBar;