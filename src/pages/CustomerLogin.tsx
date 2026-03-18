import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Signal, ArrowRight, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();

  const redirectTo = searchParams.get('redirect') || '/customer/tickets';

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setError('');

    const { error: authError } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    setIsLoading(false);

    if (authError) {
      setError(authError.message);
    } else if (mode === 'signup') {
      setError('');
      setMode('login');
      alert('Account created! You can now log in.');
    } else {
      navigate(redirectTo);
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
              <h1 className="font-display text-xl text-foreground">
                CUSTOMER <span className="text-primary">{mode === 'login' ? 'LOGIN' : 'SIGN UP'}</span>
              </h1>
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-2.5 bg-primary text-primary-foreground font-display text-sm tracking-wider hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'LOGIN' : 'SIGN UP'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="w-full text-xs font-mono text-muted-foreground hover:text-primary transition-colors py-2"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
