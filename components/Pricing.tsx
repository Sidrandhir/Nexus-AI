import React, { useState } from 'react';
import { Check, X, Sparkles, Zap, Shield } from 'lucide-react';
import { initiateCheckout } from '../services/stripeService';

interface PricingProps {
  onClose: () => void;
  currentTier: 'FREE' | 'PRO';
}

const Pricing: React.FC<PricingProps> = ({ onClose, currentTier }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await initiateCheckout();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-nexus-900/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl animate-[fadeIn_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <X className="w-6 h-6" /> Close
        </button>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-4">Upgrade to NEXUS <span className="text-nexus-primary">PRO</span></h2>
          <p className="text-xl text-gray-400">Unlock the full potential of advanced AI models without limits.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-nexus-800 rounded-2xl border border-white/10 p-8 flex flex-col relative overflow-hidden">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-100">Starter</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="ml-2 text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-gray-400 text-sm">Perfect for trying out the capabilities of Nexus AI.</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-gray-300">
                <Check className="w-5 h-5 text-nexus-primary flex-shrink-0" />
                <span>50 Messages per month</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Check className="w-5 h-5 text-nexus-primary flex-shrink-0" />
                <span>Access to GPT-4o & Gemini</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Check className="w-5 h-5 text-nexus-primary flex-shrink-0" />
                <span>Basic routing logic</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500">
                <X className="w-5 h-5 flex-shrink-0" />
                <span>Claude 3.5 Sonnet (Limited)</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500">
                <X className="w-5 h-5 flex-shrink-0" />
                <span>Priority processing</span>
              </li>
            </ul>

            <button 
              className="w-full py-3 rounded-xl font-semibold border border-white/10 bg-white/5 text-gray-300 cursor-default"
              disabled
            >
              {currentTier === 'FREE' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-nexus-800 to-nexus-900 rounded-2xl border border-nexus-primary/50 p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-nexus-primary/10 transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-nexus-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Recommended
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-nexus-primary" /> Pro
              </h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="ml-2 text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-gray-300 text-sm">For power users who need unrestricted access.</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-white">
                <div className="p-1 bg-green-500/20 rounded-full"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /></div>
                <span className="font-medium">Unlimited Messages</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="p-1 bg-green-500/20 rounded-full"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /></div>
                <span>Full Access to Claude 3.5 Sonnet</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="p-1 bg-green-500/20 rounded-full"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /></div>
                <span>Advanced Smart Router</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="p-1 bg-green-500/20 rounded-full"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /></div>
                <span>Prioritized Response Time</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="p-1 bg-green-500/20 rounded-full"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /></div>
                <span>Early Access to New Models</span>
              </li>
            </ul>

            <button 
              onClick={handleUpgrade}
              disabled={currentTier === 'PRO' || loading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                ${currentTier === 'PRO' 
                  ? 'bg-green-500/20 text-green-400 cursor-default' 
                  : 'bg-nexus-primary hover:bg-blue-600 text-white hover:shadow-nexus-primary/30 hover:scale-[1.02]'
                }`}
            >
              {loading ? (
                <span className="animate-pulse">Redirecting to Stripe...</span>
              ) : currentTier === 'PRO' ? (
                <>Active Plan <Check className="w-5 h-5" /></>
              ) : (
                <>Get Started <Zap className="w-5 h-5 fill-current" /></>
              )}
            </button>
            <div className="mt-4 flex justify-center items-center gap-2 text-xs text-gray-500">
               <Shield className="w-3 h-3" /> Secure payment via Stripe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;