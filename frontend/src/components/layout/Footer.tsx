import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="text-xl font-bold tracking-tight text-white">TechVault</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Your premier destination for high-end smartphones, ultra-portable laptops, audiophile gear, and cutting-edge tech accessories.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=Smartphones" className="hover:text-white transition-colors">Smartphones</Link></li>
              <li><Link to="/shop?category=Laptops" className="hover:text-white transition-colors">Laptops</Link></li>
              <li><Link to="/shop?category=Audio+%26+Headphones" className="hover:text-white transition-colors">Audio Gear</Link></li>
              <li><Link to="/shop?category=Smartwatches" className="hover:text-white transition-colors">Wearables</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Account
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">My Cart</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Customer Login</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TechVault Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
