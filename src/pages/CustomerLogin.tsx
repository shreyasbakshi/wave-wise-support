import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Signal, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { customers } from '@/data/mockData';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    const customer = customers.find((c) => c.email === email && c.password === password);
    if (customer) {
      localStorage.setItem('customerId', customer.id);
      localStorage.setItem('customerName', customer.name);
      navigate('/customer/tickets');
    } else {
      setError('Invalid credentials. Try one of the demo accounts below.');
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
            className="border-2 border-border bg-card p-8 retro-border"
          >
            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                <div className="w-2.5 h-2.5 rounded-full bg-neon-yellow" />
                <div className="w-2.5 h-2.5 rounded-full bg-neon-green" />
              </div>
              <span className="text-xs font-mono text-muted-foreground ml-2">customer_auth.exe</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Signal className="w-6 h-6 text-primary" />
              <h1 className="font-display text-xl text-foreground">CUSTOMER <span className="text-primary">LOGIN</span></h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground mb-1 block uppercase">Email</label>
                <div className="flex items-center border border-border bg-surface-dark focus-within:border-primary transition-colors">
                  <User className="w-4 h-4 text-muted-foreground mx-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted-foreground mb-1 block uppercase">Password</label>
                <div className="flex items-center border border-border bg-surface-dark focus-within:border-primary transition-colors">
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
                className="w-full py-2.5 bg-primary text-primary-foreground font-display text-sm tracking-wider hover:bg-primary/80 transition-colors flex items-center justify-center gap-2"
              >
                LOGIN <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Demo accounts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 border border-border bg-surface-dark p-4"
          >
            <p className="text-[10px] font-mono text-primary mb-3">{'>'} DEMO ACCOUNTS:</p>
            <div className="space-y-2">
              {customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setEmail(c.email);
                    setPassword(c.password);
                    setError('');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 border border-border hover:border-primary/50 hover:bg-surface-mid transition-all text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.avatar}</span>
                    <div>
                      <span className="text-xs font-mono text-foreground">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground block">{c.plan.name}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
