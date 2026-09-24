import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { authApi } from '@/services/api';
import { Lock, Mail, Loader2, ShoppingBag, Shield, User, Info } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        setAuth(res.data, res.data.token || '');
        if (redirectParam) {
          navigate(redirectParam);
        } else if (res.data.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        throw new Error(res.message || 'Login failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-white mx-auto shadow-lg shadow-zinc-950/20 mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome to TechVault
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your cart, tracked orders and account settings
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/40 border border-zinc-300 dark:border-zinc-800 space-y-2">
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Demo Credentials (1-Click Fill):
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@webstore.com', 'Admin@123')}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Account</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('customer@webstore.com', 'Customer@123')}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-[11px] font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Account</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          {redirectParam === '/checkout' && (
            <div className="mb-4 p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 flex items-start gap-2.5 text-zinc-800 dark:text-zinc-200 text-xs">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-zinc-900 dark:text-zinc-100" />
              <span>
                <strong>Đăng nhập để thanh toán:</strong> Vui lòng đăng nhập tài khoản của bạn để tiếp tục đặt hàng (hoặc dùng 1-Click tài khoản Khách hàng / Admin phía trên).
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-zinc-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-zinc-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-zinc-950/20 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link
              to={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : '/register'}
              className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
            >
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
