import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, Signal } from 'lucide-react';
import Header from '@/components/Header';
import { merchantCredentials } from '@/data/mockData';

export default function MerchantLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email === merchantCredentials.email && password === merchantCredentials.password) {
      localStorage.setItem('merchantLoggedIn', 'true');
      localStorage.setItem('merchantName', merchantCredentials.name);
      navigate('/merchant/dashboard');
    } else {
      setError('Invalid credentials. Use the demo account below.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-secondary/50 bg-card p-8"
            style={{ boxShadow: '4px 4px 0 hsl(320 100% 55% / 0.3)' }}
          >
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                <div className="w-2.5 h-2.5 rounded-full bg-neon-yellow" />
                <div className="w-2.5 h-2.5 rounded-full bg-neon-green" />
              </div>
              <span className="text-xs font-mono text-muted-foreground ml-2">merchant_auth.exe</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-6 h-6 text-secondary" />
              <h1 className="font-display text-xl text-foreground">MERCHANT <span className="text-secondary">LOGIN</span></h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground mb-1 block uppercase">Email</label>
                <div className="flex items-center border border-border bg-surface-dark focus-within:border-secondary transition-colors">
                  <Signal className="w-4 h-4 text-muted-foreground mx-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Merchant email"
                    className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted-foreground mb-1 block uppercase">Password</label>
                <div className="flex items-center border border-border bg-surface-dark focus-within:border-secondary transition-colors">
                  <Lock className="w-4 h-4 text-muted-foreground mx-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter password"
                    className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive font-mono border border-destructive/30 bg-destructive/10 px-3 py-2">
                  ⚠ {error}
                </p>
              )}

              <button
                onClick={handleLogin}
                className="w-full py-2.5 bg-secondary text-secondary-foreground font-display text-sm tracking-wider hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
              >
                LOGIN <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 border border-border bg-surface-dark p-4"
          >
            <p className="text-[10px] font-mono text-secondary mb-3">{'>'} DEMO ACCOUNT:</p>
            <button
              onClick={() => {
                setEmail(merchantCredentials.email);
                setPassword(merchantCredentials.password);
                setError('');
              }}
              className="w-full flex items-center justify-between px-3 py-2 border border-border hover:border-secondary/50 hover:bg-surface-mid transition-all text-left group"
            >
              <div>
                <span className="text-xs font-mono text-foreground">{merchantCredentials.name}</span>
                <span className="text-[10px] text-muted-foreground block">{merchantCredentials.role}</span>
                <span className="text-[10px] text-muted-foreground">{merchantCredentials.email}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-secondary transition-colors" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
