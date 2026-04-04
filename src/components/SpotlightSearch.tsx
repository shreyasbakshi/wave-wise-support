import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Loader2, ThumbsUp, ThumbsDown, LogIn, TicketPlus, ArrowRight } from 'lucide-react';
import { escalationsClient } from '@/integrations/supabase/escalationsClient';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

export interface SpotlightRef {
  open: () => void;
  openWithQuery: (query: string) => void;
}

interface Result {
  id: string;
  query: string;
  answer: string;
  source: 'kb' | 'webhook';
  feedbackGiven?: 'up' | 'down' | null;
  feedbackTextOpen?: boolean;
  escalated?: boolean;
  showCreateTicket?: boolean;
  showLoginPrompt?: boolean;
  ticketCreated?: boolean;
}

const SESSION_ID = crypto.randomUUID();
const CUSTOMER_QUERY_WEBHOOK = 'https://shrebuck.app.n8n.cloud/webhook/050ec3eb-3611-4678-8b4a-83111e4c248e';

const SpotlightSearch = forwardRef<SpotlightRef>((_props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((o) => !o);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Restore pending query after login
  useEffect(() => {
    const pending = sessionStorage.getItem('spotlight_pending_query');
    if (pending && user) {
      sessionStorage.removeItem('spotlight_pending_query');
      setIsOpen(true);
      setQuery(pending);
      setTimeout(() => handleSearch(pending), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useImperativeHandle(ref, () => ({
    open: () => { setIsOpen(true); setResult(null); setQuery(''); },
    openWithQuery: (q: string) => {
      setIsOpen(true);
      setQuery(q);
      setTimeout(() => handleSearch(q), 100);
    },
  }));

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;
    setIsSearching(true);
    setResult(null);
    setLastQuery(q);

    try {
      // 1. Search telco_support KB first
      const { data: kbData } = await escalationsClient
        .from('telco_support')
        .select('"Solution to FAQ"')
        .ilike('"FAQ Raised"', `%${q}%`)
        .limit(1);

      const kbAnswer = kbData?.[0]?.['Solution to FAQ'];

      if (kbAnswer) {
        setResult({
          id: Date.now().toString(),
          query: q,
          answer: kbAnswer,
          source: 'kb',
          feedbackGiven: null,
        });
        setIsSearching(false);
        return;
      }

      // 2. Fall back to n8n webhook
      const response = await fetch(CUSTOMER_QUERY_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: SESSION_ID, query: q }),
      });

      if (!response.ok) throw new Error('Webhook failed');

      const raw = await response.text();
      let parsed: { answer?: string; escalate?: boolean } = {};
      try { parsed = JSON.parse(raw); } catch { parsed = { answer: raw }; }

      const answer = parsed.answer?.trim();
      // Detect unhelpful/deflective answers as needing escalation
      const unhelpfulPatterns = /(?:contact.+(?:support|customer service|provider)|I (?:recommend|suggest) (?:contacting|reaching out)|isn't a specific (?:FAQ|entry)|couldn't find|not (?:available|found)|unable to (?:find|help)|beyond my (?:scope|ability))/i;
      const isUnhelpful = answer ? unhelpfulPatterns.test(answer) : true;
      const shouldEscalate = Boolean(parsed.escalate) || !answer || isUnhelpful;

      if (shouldEscalate) {
        const needsLogin = !user;

        if (!needsLogin && user?.email) {
          // Auto-create ticket for logged-in users
          const { error } = await escalationsClient.from('escalations').insert({
            session_id: SESSION_ID,
            query: q,
            customer_email: user.email,
            status: 'pending',
          });
          setResult({
            id: Date.now().toString(),
            query: q,
            answer: !error
              ? "I couldn't find a direct answer for this.\n\n✅ A support ticket has been automatically created. You can track it under \"My Tickets\" in your dashboard."
              : "I couldn't find a direct answer for this.\n\n❌ Failed to create a support ticket. Please try again.",
            source: 'webhook',
            ticketCreated: !error,
          });
        } else {
          setResult({
            id: Date.now().toString(),
            query: q,
            answer: "I couldn't find a direct answer for this. Please log in so we can create a support ticket for you.",
            source: 'webhook',
            showLoginPrompt: true,
          });
        }
      } else {
        setResult({
          id: Date.now().toString(),
          query: q,
          answer: answer!,
          source: 'webhook',
          feedbackGiven: null,
        });
      }
    } catch {
      setResult({
        id: Date.now().toString(),
        query: q,
        answer: 'Sorry, something went wrong. Please try again.',
        source: 'webhook',
      });
    } finally {
      setIsSearching(false);
    }
  }, [query, user]);

  const handleFeedback = async (type: 'up' | 'down') => {
    if (!result) return;
    if (type === 'down') {
      setResult((r) => r ? { ...r, feedbackGiven: 'down', feedbackTextOpen: true } : r);
      return;
    }
    setResult((r) => r ? { ...r, feedbackGiven: 'up' } : r);
    try {
      await fetch('https://shrebuck.app.n8n.cloud/webhook/user-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: SESSION_ID, thumbs: 'up', feedback_text: '' }),
      });
    } catch { /* silent */ }
  };

  const handleFeedbackText = async (text: string) => {
    setResult((r) => r ? { ...r, feedbackTextOpen: false } : r);
    try {
      await fetch('https://shrebuck.app.n8n.cloud/webhook/user-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: SESSION_ID, thumbs: 'down', feedback_text: text }),
      });
    } catch { /* silent */ }
  };

  const handleCreateTicket = async () => {
    if (!user?.email || !result) return;
    const { error } = await escalationsClient.from('escalations').insert({
      session_id: SESSION_ID,
      query: lastQuery,
      customer_email: user.email,
      status: 'pending',
    });
    setResult((r) => r ? {
      ...r,
      showCreateTicket: false,
      ticketCreated: !error,
      answer: !error
        ? `${r.answer}\n\n✅ Ticket created! Track it under "My Tickets" in your dashboard.`
        : `${r.answer}\n\n❌ Failed to create ticket. Please try again.`,
    } : r);
  };

  const handleLoginRedirect = () => {
    if (lastQuery) sessionStorage.setItem('spotlight_pending_query', lastQuery);
    navigate('/customer/login?redirect=/');
  };

  const close = () => { setIsOpen(false); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={close}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                  if (e.key === 'Escape') close();
                }}
                placeholder="Search help articles or ask a question..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(''); setResult(null); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
                ESC
              </kbd>
            </div>

            {/* Results area */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isSearching && (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </div>
              )}

              {!isSearching && !result && (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Type your question and press <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border border-border">Enter</kbd>
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    We'll search our knowledge base first, then ask our AI
                  </p>
                </div>
              )}

              {!isSearching && result && (
                <div className="p-4 space-y-3">
                  {/* Source badge */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                      result.source === 'kb'
                        ? 'border-primary/30 text-primary bg-primary/5'
                        : 'border-secondary/30 text-secondary bg-secondary/5'
                    }`}>
                      {result.source === 'kb' ? '📚 Knowledge Base' : '🤖 AI Answer'}
                    </span>
                  </div>

                  {/* Answer */}
                  <div className="prose prose-sm max-w-none text-foreground text-sm leading-relaxed">
                    <ReactMarkdown>{result.answer}</ReactMarkdown>
                  </div>

                  {/* Escalation buttons */}
                  {result.showLoginPrompt && (
                    <button
                      onClick={handleLoginRedirect}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Log in to create a support ticket
                    </button>
                  )}

                  {result.showCreateTicket && (
                    <button
                      onClick={handleCreateTicket}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <TicketPlus className="w-3.5 h-3.5" /> Create Support Ticket
                    </button>
                  )}

                  {result.ticketCreated && (
                    <button
                      onClick={() => { close(); navigate('/customer/tickets'); }}
                      className="flex items-center gap-2 text-xs text-primary hover:underline"
                    >
                      <ArrowRight className="w-3 h-3" /> Go to My Tickets
                    </button>
                  )}

                  {/* Feedback */}
                  {!result.showLoginPrompt && !result.showCreateTicket && !result.ticketCreated && (
                    <div className="pt-2 border-t border-border">
                      {result.feedbackGiven && !result.feedbackTextOpen ? (
                        <p className="text-xs text-muted-foreground">Thanks for your feedback!</p>
                      ) : result.feedbackTextOpen ? (
                        <FeedbackInput
                          onSubmit={(t) => handleFeedbackText(t)}
                          onSkip={() => handleFeedbackText('')}
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">Was this helpful?</span>
                          <button onClick={() => handleFeedback('up')} className="p-1.5 hover:bg-primary/10 rounded-md transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                          </button>
                          <button onClick={() => handleFeedback('down')} className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors">
                            <ThumbsDown className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Press <kbd className="px-1 py-0.5 font-mono bg-muted rounded border border-border text-[10px]">⌘K</kbd> to toggle
              </span>
              <span className="text-[10px] text-muted-foreground">SignalWave Support</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

SpotlightSearch.displayName = 'SpotlightSearch';
export default SpotlightSearch;

/* ---------- tiny sub-component ---------- */
function FeedbackInput({ onSubmit, onSkip }: { onSubmit: (t: string) => void; onSkip: () => void }) {
  const [text, setText] = useState('');
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">What could be improved?</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tell us more (optional)..."
        className="w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
        rows={2}
      />
      <div className="flex gap-2">
        <button onClick={() => onSubmit(text)} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors">
          Submit
        </button>
        <button onClick={onSkip} className="px-3 py-1.5 border border-border text-muted-foreground text-xs rounded-md hover:text-foreground transition-colors">
          Skip
        </button>
      </div>
    </div>
  );
}
