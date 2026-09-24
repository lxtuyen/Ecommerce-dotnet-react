import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  ArrowLeft,
  ShieldAlert,
  LogOut,
  Store,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Admin Access Restricted
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You must be signed in with an Administrator account (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">admin@webstore.com</code>) to access the control panel.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Sign In as Admin
            </button>
            <Link
              to="/"
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950">
      {/* Top Admin Sub-bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
            Admin Portal
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Logged in as {user?.name} ({user?.email})
          </span>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Return to Storefront</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Admin Sidebar Navigation */}
          <aside className="md:col-span-3 space-y-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-sm space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Admin Outlet */}
          <main className="md:col-span-9">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
