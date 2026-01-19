
import React, { useState } from 'react';
import { Droplets, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!formData.name) throw new Error("Full name is required.");

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
            }
          }
        });

        if (signUpError) throw signUpError;

        // If signup is successful but no session, it means email verification is required
        if (data.user && !data.session) {
          setVerificationSent(true);
          localStorage.setItem('hemocare_pending_verification', data.user.email);
        } else if (data.user && data.session) {
          // If session exists immediately (email verification disabled or auto-confirmed)
          onLogin({
            id: data.user.id,
            name: formData.name,
            email: formData.email,
            photoURL: data.user.user_metadata.avatar_url
          });
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          if (signInError.message === 'Invalid login credentials') {
            throw new Error("Invalid credentials. If you haven't created an account yet, please use the 'Sign Up' link below.");
          }
          throw signInError;
        }

        if (data.user) {
          onLogin({
            id: data.user.id,
            name: data.user.user_metadata.full_name || 'HemoCare User',
            email: data.user.email || '',
            photoURL: data.user.user_metadata.avatar_url
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please check your connection.");
      console.error("Auth Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#020617] flex items-center justify-center p-6 font-inter transition-colors duration-700">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-14 shadow-2xl border border-slate-200/50 dark:border-slate-800 animate-in fade-in zoom-in duration-700 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={36} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-4 tracking-tight">Check your email</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-medium">
            We've sent a verification link to <span className="text-medical-blue font-bold">{formData.email}</span>.
            Please check your inbox (and spam folder) and click the link to verify your account.
          </p>
          <button
            onClick={() => {
              setVerificationSent(false);
              setMode('login');
              localStorage.removeItem('hemocare_pending_verification');
            }}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#020617] flex items-center justify-center p-6 font-inter transition-colors duration-700">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-14 shadow-2xl border border-slate-200/50 dark:border-slate-800 animate-in fade-in zoom-in duration-700">
          {/* Hidden Dev Button to Reset Landing Page */}
          <button
            onClick={() => { localStorage.removeItem('hemocare_landing_seen'); window.location.reload(); }}
            className="absolute top-4 left-4 p-2 text-slate-200 hover:text-slate-400 font-mono text-[10px] uppercase opacity-0 hover:opacity-100 transition-opacity"
          >
            Reset Flow
          </button>

          <div className="w-20 h-20 bg-medical-blue rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-white shadow-xl shadow-medical-blue/20">
            <Droplets size={36} className="fill-white" />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tightest uppercase mb-2">HemoCare AI</h1>
            <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] tracking-[0.3em] uppercase">Cloud-Sync Health Matrix</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 text-xs font-bold leading-tight animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAction} className="space-y-5">
            {mode === 'signup' && (
              <div className="relative animate-in slide-in-from-top-2">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#f8fafc] dark:bg-slate-800 border-none rounded-2xl py-5 pl-14 pr-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
              <input
                required
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#f8fafc] dark:bg-slate-800 border-none rounded-2xl py-5 pl-14 pr-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#f8fafc] dark:bg-slate-800 border-none rounded-2xl py-5 pl-14 pr-12 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-medical-blue text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-medical-blue/30 hover:bg-medical-blue/90 active:scale-95 transition-all disabled:opacity-50 mt-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="pt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                  setShowPassword(false);
                }}
                className="text-[10px] font-black text-medical-blue dark:text-medical-light uppercase tracking-widest hover:underline"
              >
                {mode === 'login' ? "Need an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-left">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl"><ShieldCheck size={24} /></div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-wider">
              Encryption active. Your health data is secured with Supabase HIPAA-compliant infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
