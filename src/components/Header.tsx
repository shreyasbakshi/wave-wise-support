import { Link, useLocation } from 'react-router-dom';
import { Signal, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SignalWaveLogo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <div className="relative">
      <Signal className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
    </div>
    <span className="text-lg font-semibold tracking-tight text-foreground">
      Signal<span className="text-primary">Wave</span>
    </span>
  </Link>
);

const SignalBars = () => (
  <div className="flex items-end gap-[2px] h-4">
    {[3, 5, 8, 11, 15].map((h, i) => (
      <div
        key={i}
        className="w-[3px] bg-primary/60 signal-bar rounded-full"
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
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SignalWaveLogo />
          <SignalBars />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                isActive(link.path)
                  ? 'text-primary bg-primary/5 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {(variant === 'customer' || variant === 'merchant') && (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
              {customerName && (
                <span className="text-sm text-muted-foreground">{customerName}</span>
              )}
              <button
                onClick={onLogout}
                className="px-4 py-1.5 text-sm rounded-lg border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                Logout
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
            className="md:hidden border-t border-border bg-card overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 text-sm rounded-lg ${
                    isActive(link.path)
                      ? 'text-primary bg-primary/5 font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2.5 text-sm text-destructive text-left rounded-lg"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
