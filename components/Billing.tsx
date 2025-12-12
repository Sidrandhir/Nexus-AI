import React, { useState } from 'react';
import { UsageData } from '../types';
import { CreditCard, Clock, X, AlertTriangle, Download, ExternalLink } from 'lucide-react';
import { createBillingPortalSession, cancelSubscription } from '../services/stripeService';
import Modal from './Modal';

interface BillingProps {
  usage: UsageData;
  onClose: () => void;
  onViewPricing: () => void;
}

const Billing: React.FC<BillingProps> = ({ usage, onClose, onViewPricing }) => {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    await createBillingPortalSession();
    setLoadingPortal(false);
  };

  const handleCancel = async () => {
    await cancelSubscription(usage.userId);
    setCancelModalOpen(false);
    onClose(); // Refresh state by closing or force refresh app
  };

  return (
    <div className="fixed inset-0 z-[60] bg-nexus-900/95 backdrop-blur-md flex items-center justify-center p-4">
      <Modal 
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Subscription?"
        description="Your access to Pro features will end immediately. Are you sure you want to downgrade to the Free tier?"
        confirmText="Yes, Cancel"
        isDestructive={true}
      />

      <div className="bg-nexus-800 w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-nexus-900/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-nexus-primary" /> Billing & Subscription
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {/* Current Plan */}
          <section className="mb-10">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Current Plan</h3>
            <div className="bg-nexus-900/50 rounded-xl p-6 border border-white/5 flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  {usage.tier === 'PRO' ? 'Nexus Pro' : 'Free Starter'}
                </div>
                <div className="text-gray-400 text-sm">
                  {usage.tier === 'PRO' 
                    ? `$29.00 / month • Renews on ${new Date(usage.nextBillingDate || Date.now()).toLocaleDateString()}` 
                    : 'Limited to 50 messages/month'
                  }
                </div>
              </div>
              <div>
                {usage.tier === 'PRO' ? (
                  <button 
                    onClick={() => setCancelModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <button 
                    onClick={onViewPricing}
                    className="px-4 py-2 text-sm font-bold text-nexus-900 bg-white hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Payment Method */}
          {usage.tier === 'PRO' && (
            <section className="mb-10">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Payment Method</h3>
              <div className="bg-nexus-900/50 rounded-xl p-6 border border-white/5">
                {usage.paymentMethods && usage.paymentMethods.length > 0 ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                         <CreditCard className="w-6 h-6 text-gray-300" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {usage.paymentMethods[0].brand} ending in •••• {usage.paymentMethods[0].last4}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires {usage.paymentMethods[0].expiryMonth}/{usage.paymentMethods[0].expiryYear}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleManageSubscription}
                      disabled={loadingPortal}
                      className="text-nexus-primary hover:text-blue-400 text-sm font-medium flex items-center gap-1"
                    >
                      {loadingPortal ? 'Loading...' : <>Update <ExternalLink className="w-3 h-3" /></>}
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No payment method on file</div>
                )}
              </div>
            </section>
          )}

          {/* Invoice History */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Invoice History</h3>
            <div className="bg-nexus-900/50 rounded-xl border border-white/5 overflow-hidden">
              {usage.invoices && usage.invoices.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-gray-400">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usage.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-gray-300">{new Date(inv.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-white font-medium">${(inv.amount / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                            ${inv.status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}
                          `}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-gray-400 hover:text-white transition-colors p-1">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <Clock className="w-8 h-8 mb-2 opacity-50" />
                  <p>No invoices found</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Billing;