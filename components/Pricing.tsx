import React from 'react';
import { Icons } from '../constants';

interface PricingProps {
  onUpgrade: () => void;
  onClose: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onUpgrade, onClose }) => {
  const features = [
    { name: 'Monthly Messages', free: '50', pro: 'Unlimited' },
    { name: 'AI Models', free: 'GPT-4, Claude, Gemini', pro: 'Advanced Pro Models' },
    { name: 'Priority Access', free: '❌', pro: '✅' },
    { name: 'Early Beta Features', free: '❌', pro: '✅' },
    { name: 'Conversation History', free: 'Limited (20)', pro: 'Unlimited' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="relative text-center space-y-4">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all hover:scale-105 active:scale-95"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tighter">Choose Your Plan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Free Tier */}
          <div className="bg-[var(--bg-tertiary)] p-5 sm:p-6 md:p-8 rounded-3xl border border-[var(--border)] flex flex-col">
            <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Free</h3>
            <div className="text-4xl font-black text-[var(--text-primary)] mb-6">$0<span className="text-lg font-normal text-[var(--text-secondary)]">/mo</span></div>
            <p className="text-[var(--text-secondary)] text-sm mb-8">Perfect for exploring our smart routing and multiple models.</p>
            <button className="mt-auto w-full py-4 rounded-xl font-black text-[12px] uppercase tracking-widest border border-[var(--border)] text-[var(--text-secondary)] cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-[var(--bg-tertiary)] p-5 sm:p-6 md:p-8 rounded-3xl border-2 border-[var(--accent)] flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[var(--accent)] text-white text-[12px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Recommended</div>
            <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Pro</h3>
            <div className="text-4xl font-black text-[var(--text-primary)] mb-6">$29<span className="text-lg font-normal text-[var(--text-secondary)]">/mo</span></div>
            <p className="text-[var(--text-secondary)] text-sm mb-8">Unlimited power. No limits. The best models, always routed perfectly.</p>
            <button 
              onClick={onUpgrade}
              className="mt-auto w-full py-4 rounded-xl font-black text-[12px] uppercase tracking-widest bg-[var(--accent)] hover:brightness-110 text-white transition-all shadow-lg shadow-[var(--accent)]/20"
            >
              Get Started with Pro
            </button>
          </div>
        </div>

        {/* Feature Table */}
        <div className="bg-[var(--bg-tertiary)] rounded-3xl border border-[var(--border)] overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[400px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                <th className="px-6 py-4 text-[12px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Feature</th>
                <th className="px-6 py-4 text-[12px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Free</th>
                <th className="px-6 py-4 text-[12px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {features.map((f, i) => (
                <tr key={i} className="hover:bg-[var(--bg-primary)] transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">{f.name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{f.free}</td>
                  <td className="px-6 py-4 text-sm font-black text-[var(--accent)] uppercase">{f.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pricing;