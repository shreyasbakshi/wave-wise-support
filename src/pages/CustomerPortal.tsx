import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, MessageSquare, ThumbsUp, ThumbsDown, Send, Wifi, Phone, CreditCard, Zap, Clock } from 'lucide-react';
import Header from '@/components/Header';
import TicketCard from '@/components/TicketCard';
import ChatBot from '@/components/ChatBot';
import { customers, tickets as allTickets, queries as allQueries, type Ticket as TicketType } from '@/data/mockData';

type Tab = 'tickets' | 'queries' | 'plan';

function TicketDetailView({ ticket, onBack }: { ticket: TicketType; onBack: () => void }) {
  const [replyText, setReplyText] = useState('');
  const [localTicket, setLocalTicket] = useState(ticket);

  const handleReply = () => {
    if (!replyText.trim()) return;
    setLocalTicket((prev) => ({
      ...prev,
      responses: [
        ...prev.responses,
        { id: Date.now().toString(), from: 'customer', message: replyText, timestamp: new Date().toISOString() },
      ],
    }));
    setReplyText('');
  };

  const handleRating = (rating: 'up' | 'down') => {
    setLocalTicket((prev) => ({ ...prev, customerRating: rating }));
  };

  return (
    <div>
      <button onClick={onBack} className="text-xs text-primary font-mono mb-4 hover:underline">
        {'<'} BACK TO TICKETS
      </button>

      <div className="border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-muted-foreground">{localTicket.id}</span>
          <span className={`text-[10px] px-2 py-0.5 border font-mono uppercase ${
            localTicket.status === 'open' ? 'border-neon-orange text-neon-orange' :
            localTicket.status === 'pending' ? 'border-neon-yellow text-neon-yellow' :
            localTicket.status === 'resolved' ? 'border-neon-green text-neon-green' :
            'border-muted-foreground text-muted-foreground'
          }`}>
            {localTicket.status}
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-surface-light border border-border">{localTicket.category}</span>
        </div>
        <h2 className="font-display text-lg text-foreground mb-2">{localTicket.subject}</h2>
        <p className="text-sm text-muted-foreground mb-4">{localTicket.description}</p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Created: {new Date(localTicket.createdAt).toLocaleString('en-IN')}
        </p>
      </div>

      {/* Responses */}
      <div className="mt-4 space-y-3">
        <h3 className="font-display text-sm text-muted-foreground">CONVERSATION</h3>
        {localTicket.responses.map((res) => (
          <div
            key={res.id}
            className={`border p-4 ${
              res.from === 'customer'
                ? 'border-primary/30 bg-primary/5 ml-8'
                : res.from === 'merchant'
                ? 'border-secondary/30 bg-secondary/5 mr-8'
                : 'border-border bg-surface-mid mx-4'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-mono uppercase ${
                res.from === 'customer' ? 'text-primary' :
                res.from === 'merchant' ? 'text-secondary' : 'text-muted-foreground'
              }`}>
                {res.from === 'customer' ? '> YOU' : res.from === 'merchant' ? '> SUPPORT AGENT' : '> SYSTEM'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(res.timestamp).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-sm text-foreground">{res.message}</p>
          </div>
        ))}
      </div>

      {/* Rating */}
      {localTicket.status === 'resolved' && (
        <div className="mt-4 border border-border p-4 bg-surface-mid">
          <p className="text-xs font-mono text-muted-foreground mb-2">Was this resolution helpful?</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleRating('up')}
              className={`flex items-center gap-1 px-3 py-1.5 border text-xs font-mono transition-all ${
                localTicket.customerRating === 'up'
                  ? 'border-neon-green text-neon-green bg-neon-green/10'
                  : 'border-border text-muted-foreground hover:border-neon-green hover:text-neon-green'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" /> HELPFUL
            </button>
            <button
              onClick={() => handleRating('down')}
              className={`flex items-center gap-1 px-3 py-1.5 border text-xs font-mono transition-all ${
                localTicket.customerRating === 'down'
                  ? 'border-destructive text-destructive bg-destructive/10'
                  : 'border-border text-muted-foreground hover:border-destructive hover:text-destructive'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" /> NOT HELPFUL
            </button>
          </div>
        </div>
      )}

      {/* Reply box */}
      {localTicket.status !== 'closed' && (
        <div className="mt-4 border border-border bg-surface-dark p-4">
          <p className="text-[10px] font-mono text-muted-foreground mb-2">REPLY TO TICKET</p>
          <div className="flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 bg-surface-mid border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none h-20 font-mono"
            />
            <button
              onClick={handleReply}
              className="self-end px-4 py-2 bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/80 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const path = location.pathname;
  const activeTab: Tab = path.includes('/queries') ? 'queries' : path.includes('/plan') ? 'plan' : 'tickets';

  const customerId = localStorage.getItem('customerId');
  const customerName = localStorage.getItem('customerName');

  useEffect(() => {
    if (!customerId) navigate('/customer/login');
  }, [customerId, navigate]);

  const customer = customers.find((c) => c.id === customerId);
  const myTickets: TicketType[] = [];
  const myQueries: typeof allQueries = [];

  const handleLogout = () => {
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    navigate('/customer/login');
  };

  const tabs: { key: Tab; label: string; path: string; icon: React.ElementType }[] = [
    { key: 'tickets', label: 'My Tickets', path: '/customer/tickets', icon: Ticket },
    { key: 'queries', label: 'My Queries', path: '/customer/queries', icon: MessageSquare },
    { key: 'plan', label: 'Service Plan', path: '/customer/plan', icon: CreditCard },
  ];

  const planIcons: Record<string, React.ElementType> = {
    prepaid: Phone,
    postpaid: Phone,
    fiber: Wifi,
    business: Zap,
    family: Wifi,
  };

  if (!customer) return null;

  const PlanIcon = planIcons[customer.plan.type] || Wifi;

  return (
    <div className="min-h-screen bg-background">
      <Header variant="customer" customerName={customerName || ''} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-3xl">{customer.avatar}</span>
          <div>
            <h1 className="font-display text-lg text-foreground">Welcome, <span className="text-primary">{customer.name}</span></h1>
            <p className="text-[10px] font-mono text-muted-foreground">{customer.plan.name} | {customer.phone}</p>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Content */}
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
                  TICKETS ({myTickets.length})
                </h2>
              </div>
              {myTickets.length === 0 ? (
                <div className="border border-border bg-card p-8 text-center">
                  <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tickets yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() => setSelectedTicket(ticket)}
                    />
                  ))}
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
                QUERIES & RESPONSES ({myQueries.length})
              </h2>
              {myQueries.length === 0 ? (
                <div className="border border-border bg-card p-8 text-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No queries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myQueries.map((q) => (
                    <div key={q.id} className="border border-border bg-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 border border-primary/30 text-primary font-mono uppercase">
                          {q.source}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(q.timestamp).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2 font-mono">Q: {q.question}</p>
                      <div className="border-l-2 border-primary/50 pl-3">
                        <p className="text-sm text-muted-foreground">A: {q.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'plan' && (
            <div>
              <div className="border-2 border-primary/30 bg-card p-6 glow-blue">
                <div className="flex items-start gap-4">
                  <div className="p-3 border border-primary/30 bg-primary/10">
                    <PlanIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-xl text-foreground mb-1">{customer.plan.name}</h2>
                    <p className="text-sm text-primary font-mono">{customer.plan.price}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="border border-border bg-surface-dark p-3">
                        <p className="text-[10px] text-muted-foreground font-mono">DATA</p>
                        <p className="text-sm text-foreground font-display">{customer.plan.data}</p>
                      </div>
                      <div className="border border-border bg-surface-dark p-3">
                        <p className="text-[10px] text-muted-foreground font-mono">VALIDITY</p>
                        <p className="text-sm text-foreground font-display">{customer.plan.validity}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] text-muted-foreground font-mono mb-2">FEATURES</p>
                      <div className="flex flex-wrap gap-2">
                        {customer.plan.features.map((feat) => (
                          <span key={feat} className="text-[11px] px-2 py-1 border border-border bg-surface-light text-foreground font-mono">
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border border-border bg-card p-4">
                <p className="text-[10px] font-mono text-secondary mb-2">{'>'} UPGRADE OPTIONS</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-border p-3 hover:border-secondary/50 cursor-pointer transition-all">
                    <p className="text-xs font-display text-foreground">SPEED BOOST ADD-ON</p>
                    <p className="text-[10px] text-muted-foreground">+50Mbps for ₹199/month</p>
                  </div>
                  <div className="border border-border p-3 hover:border-secondary/50 cursor-pointer transition-all">
                    <p className="text-xs font-display text-foreground">OTT SUPER PACK</p>
                    <p className="text-[10px] text-muted-foreground">All OTT apps for ₹299/month</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ChatBot />
    </div>
  );
}
