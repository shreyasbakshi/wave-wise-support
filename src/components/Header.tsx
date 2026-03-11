import { Link, useLocation } from 'react-router-dom';
import { Signal, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SignalWaveLogo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <div className="relative">
      <Signal className="w-7 h-7 text-primary group-hover:text-secondary transition-colors" />
      <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md group-hover:bg-secondary/20 transition-colors" />
    </div>
    <span className="font-display text-lg tracking-wider text-foreground">
      SIGNAL<span className="text-primary">WAVE</span>
    </span>
  </Link>
);

const SignalBars = () => (
  <div className="flex items-end gap-[2px] h-4">
    {[3, 5, 8, 11, 15].map((h, i) => (
      <div
        key={i}
        className="w-[3px] bg-primary signal-bar rounded-sm"
        style={{ height: `${h}px` }}
      />
    ))}
  </div>
);

interface HeaderProps {
  variant?: 'public' | 'customer' | 'merchant';
  customerName?: string;
  onLogout?: () => void;
}

export default function Header({ variant = 'public', customerName, onLogout }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = variant === 'customer'
    ? [
        { path: '/customer/tickets', label: 'My Tickets' },
        { path: '/customer/queries', label: 'My Queries' },
        { path: '/customer/plan', label: 'Service Plan' },
      ]
    : variant === 'merchant'
    ? [
        { path: '/merchant/dashboard', label: 'Dashboard' },
        { path: '/merchant/tickets', label: 'Tickets' },
        { path: '/merchant/knowledge-base', label: 'Knowledge Base' },
      ]
    : [
        { path: '/', label: 'Home' },
        { path: '/customer/login', label: 'Customer Login' },
        { path: '/merchant/login', label: 'Merchant Login' },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-dark/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SignalWaveLogo />
          <SignalBars />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 text-sm font-mono transition-all ${
                isActive(link.path)
                  ? 'text-primary glow-text-blue'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              [{link.label}]
            </Link>
          ))}
          {(variant === 'customer' || variant === 'merchant') && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
              {customerName && (
                <span className="text-xs text-muted-foreground">{customerName}</span>
              )}
              <button
                onClick={onLogout}
                className="px-3 py-1 text-xs border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                LOGOUT
              </button>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-surface-dark overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 text-sm font-mono ${
                    isActive(link.path)
                      ? 'text-primary glow-text-blue'
                      : 'text-muted-foreground'
                  }`}
                >
                  {'>'} {link.label}
                </Link>
              ))}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-3 py-2 text-sm text-destructive text-left font-mono"
                >
                  {'>'} LOGOUT
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
