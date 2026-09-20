import React, { useState } from 'react';
import { Shield, KeyRound, AlertCircle, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { usePalakasan } from '../../context/PalakasanContext';

interface AdminLoginProps {
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPublic }) => {
  const { loginAdmin, loginWithGoogle } = usePalakasan();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the administrative passcode.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const success = loginAdmin(passcode);
      if (!success) {
        setError('Invalid passcode. Official authorized access requires a valid committee credential.');
      }
      setIsLoading(false);
    }, 250);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const success = await loginWithGoogle();
      if (!success) {
        // user closed popup or cancelled
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickFill = (code: string) => {
    setPasscode(code);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          id="admin-login-back-btn"
          onClick={onBackToPublic}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Website</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
              MSU at Naawan • Firebase Admin Auth
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              PALAKASAN Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
              Authorized management console for tournament editions, events, official results, and standings.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In with Firebase Auth */}
          <button
            id="admin-google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-800 text-sm font-semibold transition-colors shadow-2xs disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google Account'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
              or use committee passcode
            </span>
          </div>

          {/* Passcode Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-passcode-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Security Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-passcode-input"
                  type="password"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter passcode (e.g. msun2026 or admin)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Access...' : 'Sign In with Passcode'}</span>
            </button>
          </form>

          {/* Quick Demo Assist */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-[11px] text-slate-500 font-medium">Quick Credentials for Committee Evaluation:</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('msun2026')}
                className="px-2.5 py-1 text-xs font-mono font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                msun2026
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
              >
                admin
              </button>
            </div>
          </div>

          {/* Academic Footer Note */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-center text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Mindanao State University at Naawan</span>
            </div>
            <p>Sports, Cultural & Literary Affairs Organizing Committee</p>
          </div>
        </div>
      </div>
    </div>
  );
};
