import React from 'react';
import { ShokhLogo } from './ShokhLogo';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  onNav: (tab: 'home' | 'shop' | 'customize' | 'wholesale') => void;
  onOpenSizeGuide?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNav, onOpenSizeGuide, onOpenAdmin }) => {
  const { admin } = useAuth();
  return (
    <footer className="bg-black text-white border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand info */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <ShokhLogo size="md" light={true} />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Shokh Outfits is a premium minimalist apparel and custom printing brand based in Dhaka, Bangladesh. We craft timeless plain tees, screen printed graphics, and heavy fleece hoodies.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3">
              Shop &amp; Services
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => onNav('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('shop')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('customize')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Custom T-Shirt Printing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('wholesale')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Wholesale Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3">
              Delivery &amp; Support
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>Delivery Inside Dhaka: ৳60 (2-3 days)</li>
              <li>Delivery Outside Dhaka: ৳120 (3-5 days)</li>
              <li>Cash on Delivery across 64 districts</li>
              <li>7 Days Hassle-Free Exchange</li>
              {onOpenSizeGuide && (
                <li>
                  <button
                    onClick={onOpenSizeGuide}
                    className="text-white hover:text-emerald-400 font-semibold underline decoration-neutral-600 hover:decoration-emerald-400 transition-colors cursor-pointer inline-flex items-center gap-1 mt-1"
                  >
                    Size &amp; Fit Guide
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact & Hotline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3">
              Hotline &amp; Studio
            </h4>
            <p className="text-xs text-neutral-400 mb-2">
              Customer Support &amp; WhatsApp:
            </p>
            <p className="text-sm font-bold text-white font-mono mb-2">
              +880 1712-345678
            </p>
            <p className="text-xs text-neutral-400">
              Plot 14, Sector 7, Uttara, Dhaka-1230, Bangladesh
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} SHOKH OUTFITS BD. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span>Clean Monochrome Apparel</span>
            <span>·</span>
            <span>100% Combed Cotton</span>
            <span>·</span>
            <span>Made in Bangladesh</span>
            {/* Admin Portal - Only visible when Admin is authenticated */}
            {admin && onOpenAdmin && (
              <>
                <span>·</span>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-emerald-400 font-semibold inline-flex items-center gap-1.5"
                >
                  <span>Admin Portal</span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">({admin.email})</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
