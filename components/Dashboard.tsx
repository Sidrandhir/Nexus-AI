import React from 'react';
import { UsageData } from '../types';
import { getFavoriteModel } from '../services/usageService';
import { BarChart3, Zap, Crown, X, Calendar, CreditCard } from 'lucide-react';

interface DashboardProps {
  usage: UsageData;
  onClose: () => void;
  onUpgrade: () => void;
  onOpenBilling: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ usage, onClose, onUpgrade, onOpenBilling }) => {
  const favoriteModel = getFavoriteModel(usage);
  
  // Calculate max for chart scaling
  const maxDaily = Math.max(...usage.history.map(h => h.count), 5);

  return (
    <div className="absolute inset-0 z-50 bg-nexus-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-nexus-800 w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-nexus-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-nexus-primary/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-nexus-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Usage Dashboard</h2>
              <p className="text-sm text-gray-400">Track your AI interactions and limits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Current Plan */}
            <div className="bg-gradient-to-br from-nexus-700 to-nexus-800 p-5 rounded-xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown className="w-16 h-16" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Current Plan</p>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {usage.tier} Tier
                {usage.tier === 'FREE' ? (
                  <button 
                    onClick={onUpgrade}
                    className="text-xs bg-nexus-primary hover:bg-blue-600 px-2 py-1 rounded text-white font-medium ml-2 transition-colors shadow-lg shadow-nexus-primary/20"
                  >
                    UPGRADE
                  </button>
                ) : (
                  <button
                    onClick={onOpenBilling}
                    className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white font-medium ml-2 transition-colors"
                  >
                    MANAGE
                  </button>
                )}
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                {usage.tier === 'FREE' ? 'Limited to 50 msgs/mo' : 'Unlimited Access'}
              </p>
            </div>

            {/* Messages Used */}
            <div className="bg-nexus-800 p-5 rounded-xl border border-white/5">
              <p className="text-gray-400 text-sm mb-1">Messages This Month</p>
              <h3 className="text-2xl font-bold text-white">
                {usage.messagesUsed} <span className="text-gray-500 text-lg font-normal">/ {usage.tier === 'FREE' ? usage.limit : '∞'}</span>
              </h3>
              <div className="mt-3 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${usage.messagesUsed >= usage.limit ? 'bg-red-500' : 'bg-nexus-primary'}`}
                  style={{ width: `${Math.min(100, (usage.messagesUsed / (usage.tier === 'FREE' ? usage.limit : Math.max(usage.messagesUsed, 100))) * 100)}%` }}
                />
              </div>
            </div>

            {/* Total Tokens */}
            <div className="bg-nexus-800 p-5 rounded-xl border border-white/5">
              <p className="text-gray-400 text-sm mb-1">Total Tokens Processed</p>
              <h3 className="text-2xl font-bold text-white">{usage.totalTokens.toLocaleString()}</h3>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" /> Favorite: <span className="text-gray-300">{favoriteModel}</span>
              </p>
            </div>
          </div>

          {/* Usage Chart */}
          <div className="bg-nexus-800/50 rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-nexus-primary" />
              Activity Last 30 Days
            </h3>
            
            <div className="h-48 flex items-end gap-2">
              {usage.history.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm italic">
                  No activity recorded yet
                </div>
              ) : (
                usage.history.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className="w-full bg-nexus-primary/30 hover:bg-nexus-primary/60 rounded-t transition-all min-w-[4px]"
                      style={{ height: `${(day.count / maxDaily) * 100}%` }}
                    ></div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {day.date}: {day.count} msgs
                    </div>
                  </div>
                ))
              )}
            </div>
            {usage.history.length > 0 && (
                <div className="flex justify-between mt-2 text-xs text-gray-500 border-t border-white/5 pt-2">
                    <span>{usage.history[0].date}</span>
                    <span>Today</span>
                </div>
            )}
          </div>

        </div>

        {/* Footer */}
        {usage.tier === 'FREE' ? (
          <div className="p-6 bg-gradient-to-r from-nexus-800 to-nexus-900 border-t border-white/10 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-white">Unlock Unlimited Potential</h4>
              <p className="text-sm text-gray-400">Remove limits and get priority access to new models.</p>
            </div>
            <button 
              onClick={onUpgrade}
              className="px-6 py-2.5 bg-white text-nexus-900 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg shadow-white/5"
            >
              Upgrade to Pro
            </button>
          </div>
        ) : (
           <div className="p-6 bg-nexus-800/50 border-t border-white/10 flex justify-between items-center">
             <div>
               <h4 className="font-bold text-white flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-500" /> Nexus Pro Active</h4>
               <p className="text-sm text-gray-400">Thanks for supporting Nexus AI.</p>
             </div>
             <button 
               onClick={onOpenBilling}
               className="px-6 py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
             >
               <CreditCard className="w-4 h-4" /> Billing Settings
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;