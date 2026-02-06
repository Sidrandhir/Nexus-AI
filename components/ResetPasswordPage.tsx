import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Icons } from '../constants';

interface ResetPasswordPageProps {
  onResetSuccess?: () => void;
  onBackToAuth?: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onResetSuccess, onBackToAuth }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verify session and check for errors in URL params
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Check for error parameters in URL (from Supabase)
        const params = new URLSearchParams(window.location.search);
        const errorCode = params.get('error_code');
        const errorDescription = params.get('error_description');

        if (errorCode) {
          setIsValidToken(false);
          let message = 'Invalid or expired reset link. Please request a new password reset.';
          
          if (errorCode === 'otp_expired') {
            message = 'Your password reset link has expired. Links are valid for 24 hours. Please request a new password reset.';
          } else if (errorCode === 'access_denied') {
            message = 'Access denied. This link may be invalid or has already been used. Please request a new password reset.';
          } else if (errorDescription) {
            message = decodeURIComponent(errorDescription).replace(/\+/g, ' ');
          }
          
          setError(message);
          return;
        }

        // Check if we have a valid session
        if (!supabase) {
          setIsValidToken(false);
          setError('Authentication service not configured');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsValidToken(false);
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      } catch (err: any) {
        setIsValidToken(false);
        setError('Failed to verify reset link. Please try again.');
      }
    };

    verifySession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (!supabase) {
        throw new Error('Authentication service not configured');
      }

      // Update password using the current session
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Password has been reset successfully! Redirecting to login...');
      setPassword('');
      setConfirmPassword('');

      // Redirect after 2 seconds
      setTimeout(() => {
        // Sign out to force re-login with new password
        supabase?.auth.signOut().then(() => {
          onResetSuccess?.();
          onBackToAuth?.();
        });
      }, 2000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-[var(--bg-secondary)] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl shadow-black/20">
            {/* Header */}
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-red-500/20">
                <Icons.X className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-center mb-3 sm:mb-4 text-white">
              Invalid Reset Link
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] text-center mb-6 sm:mb-8">
              {error || 'This password reset link is invalid or has expired. Please request a new password reset link.'}
            </p>

            <button
              onClick={onBackToAuth}
              className="w-full py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest rounded-lg sm:rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-[var(--bg-secondary)] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl shadow-black/20">
          {/* Header */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <Icons.Shield className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-center mb-2 text-white">
            Reset Password
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] text-center mb-6 sm:mb-8">
            Enter your new password below to reset your account access
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg sm:rounded-xl">
              <p className="text-xs sm:text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg sm:rounded-xl">
              <p className="text-xs sm:text-sm text-emerald-400 font-medium">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-[9px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-[var(--bg-tertiary)] border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-[var(--text-secondary)] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <Icons.Eye className="w-4 h-4" />
                  ) : (
                    <Icons.EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[9px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-[var(--bg-tertiary)] border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-[var(--text-secondary)] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white transition-colors p-1"
                >
                  {showConfirmPassword ? (
                    <Icons.Eye className="w-4 h-4" />
                  ) : (
                    <Icons.EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="text-[9px] sm:text-xs text-[var(--text-secondary)] bg-white/5 rounded-lg p-3 sm:p-4 border border-white/5">
              <p className="font-medium mb-2">Password requirements:</p>
              <ul className="space-y-1 text-[9px] sm:text-xs">
                <li className={password.length >= 6 ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}>
                  ✓ At least 6 characters
                </li>
                <li className={password === confirmPassword && password ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}>
                  ✓ Passwords match
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest rounded-lg sm:rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-6 sm:mt-8 active:scale-95"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to Auth Link */}
          <button
            onClick={onBackToAuth}
            className="w-full mt-4 py-3 text-[var(--text-secondary)] hover:text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-colors text-center active:scale-95"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
