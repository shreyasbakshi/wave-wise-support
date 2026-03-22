import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, MessageSquare, Send, Clock, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Tab = 'tickets' | 'queries';

interface EscalationRow {
  id: string;
  session_id: string;
  query: string;
  customer_email: string | null;
  customer_name: string | null;
  category: string | null;
  status: string;
  merchant_answer: string | null;
  created_at: string;
  updated_at: string;
}

const statusDisplay: Record<string, { label: string; className: string }> = {
  pending: { label: 'AWAITING RESPONSE', className: 'border-neon-orange text-neon-orange bg-neon-orange/10' },
  resolved: { label: 'RESPONSE RECEIVED', className: 'border-neon-green text-neon-green bg-neon-green/10' },
  closed: { label: 'CLOSED', className: 'border-muted-foreground text-muted-foreground bg-muted/50' },
};

function TicketDetailView({ ticket, onBack }: { ticket: EscalationRow; onBack: () => void }) {
  const display = statusDisplay[ticket.status] || statusDisplay.pending;

  return (
    <div>
      <button onClick={onBack} className="text-xs text-primary font-mono mb-4 hover:underline">
        {'<'} BACK TO TICKETS
      </button>

      <div className="border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-muted-foreground">{ticket.id.slice(0, 8)}</span>
          <span className={`text-[10px] px-2 py-0.5 border font-mono uppercase ${display.className}`}>
            {display.label}
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-surface-light border border-border">
            {ticket.category || 'General'}
          </span>
        </div>
        <h2 className="font-display text-lg text-foreground mb-2">{ticket.query}</h2>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Created: {new Date(ticket.created_at).toLocaleString('en-IN')}
        </p>
      </div>

      {/* Your query */}
      <div className="mt-4 space-y-3">
        <h3 className="font-display text-sm text-muted-foreground">CONVERSATION</h3>
        <div className="border border-primary/30 bg-primary/5 ml-8 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase text-primary">&gt; YOU</span>
            <span className="text-[10px] text-muted-foreground">
              {new Date(ticket.created_at).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-sm text-foreground">{ticket.query}</p>
        </div>

        {/* Merchant response */}
        {ticket.merchant_answer && (
          <div className="border border-secondary/30 bg-secondary/5 mr-8 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase text-secondary">&gt; SUPPORT AGENT</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(ticket.updated_at).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-sm text-foreground">{ticket.merchant_answer}</p>
          </div>
        )}

        {!ticket.merchant_answer && ticket.status === 'pending' && (
          <div className="border border-border bg-surface-mid p-4 text-center">
            <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground font-mono">Awaiting merchant response...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTicket, setSelectedTicket] = useState<EscalationRow | null>(null);
  const [tickets, setTickets] = useState<EscalationRow[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const { user, loading, signOut } = useAuth();

  const path = location.pathname;
  const activeTab: Tab = path.includes('/queries') ? 'queries' : 'tickets';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/customer/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user?.email) return;
    const fetchTickets = async () => {
      setLoadingTickets(true);
      const { data } = await supabase
        .from('escalations')
        .select('*')
        .eq('customer_email', user.email!)
        .order('created_at', { ascending: false });
      if (data) setTickets(data as EscalationRow[]);
      setLoadingTickets(false);
    };
    fetchTickets();
  }, [user?.email]);

  if (loading || (!loading && !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-mono text-sm">Loading...</p>
      </div>
    );
  }

  const customerEmail = user?.email || '';

  const handleLogout = async () => {
    await signOut();
    navigate('/customer/login');
  };

  const handleRefresh = async () => {
    if (!user?.email) return;
    setLoadingTickets(true);
    const { data } = await supabase
      .from('escalations')
      .select('*')
      .eq('customer_email', user.email!)
      .order('created_at', { ascending: false });
    if (data) setTickets(data as EscalationRow[]);
    setLoadingTickets(false);
  };

  const tabs: { key: Tab; label: string; path: string; icon: React.ElementType }[] = [
    { key: 'tickets', label: 'My Tickets', path: '/customer/tickets', icon: Ticket },
    { key: 'queries', label: 'My Queries', path: '/customer/queries', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header variant="customer" customerName={customerEmail} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-lg text-foreground">Welcome, <span className="text-primary">{customerEmail}</span></h1>
        </div>

        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedTicket(null);
                navigate(tab.path);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'tickets' && !selectedTicket && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-sm text-muted-foreground">
                  TICKETS ({tickets.length})
                </h2>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingTickets ? 'animate-spin' : ''}`} />
                  REFRESH
                </button>
              </div>
              {loadingTickets ? (
                <div className="border border-border bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground font-mono">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="border border-border bg-card p-8 text-center">
                  <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tickets yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => {
                    const display = statusDisplay[ticket.status] || statusDisplay.pending;
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="border border-border bg-card p-4 hover:border-primary/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-muted-foreground">{ticket.id.slice(0, 8)}</span>
                          <span className={`text-[10px] px-2 py-0.5 border font-mono uppercase ${display.className}`}>
                            {display.label}
                          </span>
                        </div>
                        <h3 className="text-sm font-display text-foreground group-hover:text-primary transition-colors truncate mb-1">
                          {ticket.query}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="px-1.5 py-0.5 bg-surface-light border border-border">
                            {ticket.category || 'General'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.created_at).toLocaleDateString('en-IN')}
                          </span>
                          {ticket.merchant_answer && (
                            <span className="text-neon-green font-mono">● HAS RESPONSE</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tickets' && selectedTicket && (
            <TicketDetailView ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />
          )}

          {activeTab === 'queries' && (
            <div>
              <h2 className="font-display text-sm text-muted-foreground mb-4">
                QUERIES & RESPONSES (0)
              </h2>
              <div className="border border-border bg-card p-8 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No queries yet</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ChatBot />
    </div>
  );
}
