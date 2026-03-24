import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Ticket, BookOpen, Send, CheckCircle, AlertTriangle,
  Clock, Eye, Plus, SpellCheck, Wand2, FileText, RefreshCw
} from 'lucide-react';
import Header from '@/components/Header';
import TicketCard from '@/components/TicketCard';
import { escalationsClient } from '@/integrations/supabase/escalationsClient';
import {
  customers, kbArticles as initialKBArticles,
  ticketCategories, type Ticket as TicketType, type KBArticle
} from '@/data/mockData';

type Tab = 'dashboard' | 'tickets' | 'knowledge-base';
type StatusFilter = 'all' | 'open' | 'resolved' | 'closed' | 'old';

const isOlderThan24h = (createdAt: string) =>
  (Date.now() - new Date(createdAt).getTime()) > 24 * 60 * 60 * 1000;

function DashboardView({
  tickets,
  onFilterNav,
}: {
  tickets: TicketType[];
  onFilterNav: (status: StatusFilter) => void;
}) {
  const open = tickets.filter((t) => t.status === 'open').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;
  const closed = tickets.filter((t) => t.status === 'closed').length;
  const oldOpen = tickets.filter((t) => t.status === 'open' && isOlderThan24h(t.createdAt)).length;

  const stats: { label: string; value: number; icon: React.ElementType; color: string; filter: StatusFilter }[] = [
    { label: 'OPEN', value: open, icon: AlertTriangle, color: 'text-neon-orange border-neon-orange/30 bg-neon-orange/10 hover:bg-neon-orange/20', filter: 'open' },
    { label: 'RESOLVED', value: resolved, icon: CheckCircle, color: 'text-neon-green border-neon-green/30 bg-neon-green/10 hover:bg-neon-green/20', filter: 'resolved' },
    { label: 'CLOSED', value: closed, icon: Eye, color: 'text-muted-foreground border-border bg-muted/30 hover:bg-muted/50', filter: 'closed' },
    { label: 'ALL', value: tickets.length, icon: Ticket, color: 'text-primary border-primary/30 bg-primary/10 hover:bg-primary/20', filter: 'all' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => onFilterNav(stat.filter)}
            className={`border p-4 text-left transition-colors cursor-pointer ${stat.color}`}
          >
            <stat.icon className="w-5 h-5 mb-2" />
            <p className="text-2xl font-display">{stat.value}</p>
            <p className="text-[10px] font-mono">{stat.label} TICKETS →</p>
          </button>
        ))}
      </div>

      {/* 24hr alert */}
      {oldOpen > 0 && (
        <button
          onClick={() => onFilterNav('old')}
          className="w-full mb-6 border border-destructive/50 bg-destructive/10 hover:bg-destructive/20 p-4 flex items-center gap-3 text-left transition-colors"
        >
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-display text-destructive">{oldOpen} TICKET(S) OPEN {'>'} 24 HOURS → VIEW ALL</p>
            <p className="text-xs text-muted-foreground">These tickets require immediate attention</p>
          </div>
        </button>
      )}

      {/* KB stats */}
      <div className="border border-border bg-card p-4 mb-6">
        <p className="text-[10px] font-mono text-muted-foreground mb-2">KNOWLEDGE BASE</p>
        <div className="flex gap-6">
          <div>
            <p className="text-lg font-display text-foreground">{initialKBArticles.length}</p>
            <p className="text-[10px] text-muted-foreground">Articles</p>
          </div>
          <div>
            <p className="text-lg font-display text-foreground">{tickets.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Tickets</p>
          </div>
        </div>
      </div>

      {/* Recent tickets */}
      <h3 className="font-display text-sm text-muted-foreground mb-3">RECENT TICKETS</h3>
      <div className="space-y-2">
        {tickets.slice(0, 3).map((t) => (
          <TicketCard key={t.id} ticket={t} showCustomer onClick={() => onFilterNav('all')} />
        ))}
      </div>
    </div>
  );
}

function TicketDetailMerchant({
  ticket,
  onBack,
  onResponseSent,
}: {
  ticket: TicketType;
  onBack: () => void;
  onResponseSent: () => void;
}) {
  const [response, setResponse] = useState('');
  const [spellChecked, setSpellChecked] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [useGpt, setUseGpt] = useState(false);
  const [error, setError] = useState('');
  const customer = customers.find((c) => c.id === ticket.customerId);

  const handleSpellCheck = () => {
    setSpellChecked(true);
    setTimeout(() => setSpellChecked(false), 2000);
  };

  const handleSend = async () => {
    if (!response.trim()) return;
    setSending(true);
    setError('');
    try {
      // Call n8n webhook (for GPT enhancement if enabled)
      await fetch('https://shrebuck.app.n8n.cloud/webhook/human-response-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: ticket.session_id || ticket.id,
          merchant_answer: response,
          faq_raised: ticket.query || ticket.subject,
          use_gpt: useGpt,
        }),
      });

      // Directly update the row in our Supabase project
      await escalationsClient
        .from('escalations')
        .update({ merchant_answer: response, status: 'resolved' })
        .eq('id', ticket.id);

      setSent(true);
      setTimeout(() => {
        onResponseSent();
        onBack();
      }, 1500);
    } catch (err) {
      setError('Failed to send response. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="text-xs text-secondary font-mono mb-4 hover:underline">
        {'<'} BACK TO TICKETS
      </button>

      <div className="border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">{ticket.id}</span>
            <span className={`text-[10px] px-2 py-0.5 border font-mono uppercase ${
              ticket.status === 'open' ? 'border-neon-orange text-neon-orange' :
              ticket.status === 'pending' ? 'border-neon-yellow text-neon-yellow' :
              ticket.status === 'resolved' ? 'border-neon-green text-neon-green' :
              'border-muted-foreground text-muted-foreground'
            }`}>
              {ticket.status}
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-surface-light border border-border">{ticket.category}</span>
          </div>
          {customer && (
            <span className="text-xs text-muted-foreground">{customer.avatar} {customer.name}</span>
          )}
        </div>
        <h2 className="font-display text-lg text-foreground mb-2">{ticket.subject}</h2>
        <p className="text-sm text-muted-foreground">{ticket.description}</p>
        {ticket.query && (
          <p className="text-[10px] font-mono text-muted-foreground mt-2">
            ORIGINAL QUERY: {ticket.query}
          </p>
        )}
      </div>

      {/* Conversation */}
      <div className="mt-4 space-y-3">
        <h3 className="font-display text-sm text-muted-foreground">CONVERSATION LOG</h3>
        {ticket.responses.map((res) => (
          <div
            key={res.id}
            className={`border p-4 ${
              res.from === 'customer' ? 'border-primary/30 bg-primary/5 mr-8' :
              res.from === 'merchant' ? 'border-secondary/30 bg-secondary/5 ml-8' :
              'border-border bg-surface-mid mx-4'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-mono uppercase ${
                res.from === 'customer' ? 'text-primary' :
                res.from === 'merchant' ? 'text-secondary' : 'text-muted-foreground'
              }`}>
                {res.from === 'customer' ? `> ${customer?.name || 'Customer'}` :
                 res.from === 'merchant' ? '> YOU (Agent)' : '> SYSTEM'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(res.timestamp).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-sm text-foreground">{res.message}</p>
          </div>
        ))}
      </div>

      {/* Response box */}
      <div className="mt-4 border-2 border-secondary/30 bg-surface-dark p-4">
        <p className="text-[10px] font-mono text-secondary mb-2">COMPOSE RESPONSE</p>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your resolution response..."
          className="w-full bg-surface-mid border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none resize-none h-28 font-mono mb-3"
          spellCheck
          disabled={sent}
        />

        {/* GPT Toggle */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setUseGpt(!useGpt)}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              useGpt ? 'bg-secondary' : 'bg-muted'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
              useGpt ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
          <span className="text-[10px] font-mono text-muted-foreground">
            USE GPT TO ENHANCE RESPONSE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSpellCheck}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono transition-all ${
              spellChecked
                ? 'border-neon-green text-neon-green'
                : 'border-border text-muted-foreground hover:border-secondary hover:text-secondary'
            }`}
            disabled={sent}
          >
            <SpellCheck className="w-3.5 h-3.5" />
            {spellChecked ? 'CHECKED ✓' : 'SPELL CHECK'}
          </button>
          <button
            onClick={handleSend}
            disabled={sending || sent || !response.trim()}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono transition-all disabled:opacity-50 ${
              sent
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {sent ? <CheckCircle className="w-3.5 h-3.5" /> : sending ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sent ? 'SENT' : sending ? 'SENDING...' : 'SEND RESPONSE'}
          </button>
        </div>
        {sent && (
          <p className="mt-2 text-xs text-neon-green font-mono">
            ✓ Response sent via webhook. Customer will be notified.
          </p>
        )}
        {error && (
          <p className="mt-2 text-xs text-destructive font-mono">✗ {error}</p>
        )}
      </div>
    </div>
  );
}

function KnowledgeBaseView() {
  const [articles, setArticles] = useState<KBArticle[]>(initialKBArticles);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Network');
  const [newContent, setNewContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setNewContent(`## ${newTitle || 'Untitled Article'}\n\n### Overview\nThis article addresses common issues related to ${newCategory.toLowerCase()} services.\n\n### Steps to Resolve\n1. **Verify your account status** - Check if your plan is active\n2. **Restart your device** - Power cycle for 30 seconds\n3. **Check service status** - Visit status.signalwave.in\n4. **Clear cache** - Go to Settings → Apps → SignalWave → Clear Cache\n5. **Contact support** - If issue persists, call 1800-SIGNAL-0\n\n### Additional Notes\n- This issue typically resolves within 2-4 hours\n- Network maintenance windows: Tue/Thu 2AM-4AM IST\n- For enterprise customers, contact your dedicated account manager`);
      setIsGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const handlePublish = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const newArticle: KBArticle = {
      id: `KB${(articles.length + 1).toString().padStart(3, '0')}`,
      title: newTitle,
      category: newCategory,
      content: newContent,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Arjun Kapoor',
      status: 'published',
    };
    setArticles((prev) => [newArticle, ...prev]);
    setShowCreate(false);
    setNewTitle('');
    setNewContent('');
    setGenerated(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm text-muted-foreground">
          KNOWLEDGE BASE ({articles.length} articles)
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-mono hover:bg-secondary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          NEW ARTICLE
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-2 border-secondary/30 bg-surface-dark p-5 mb-6 overflow-hidden"
        >
          <h3 className="font-display text-sm text-secondary mb-4">CREATE KNOWLEDGE BASE ARTICLE</h3>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground block mb-1">TITLE</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full bg-surface-mid border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-muted-foreground block mb-1">CATEGORY</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-surface-mid border border-border px-3 py-2 text-sm text-foreground focus:border-secondary focus:outline-none font-mono"
              >
                {ticketCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono text-muted-foreground">CONTENT</label>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono border border-secondary/50 text-secondary hover:bg-secondary/10 transition-colors disabled:opacity-50"
                >
                  <Wand2 className="w-3 h-3" />
                  {isGenerating ? 'GENERATING...' : 'AI GENERATE'}
                </button>
              </div>
              <textarea
                value={newContent}
                onChange={(e) => {
                  setNewContent(e.target.value);
                  setGenerated(false);
                }}
                placeholder="Article content in markdown..."
                className="w-full bg-surface-mid border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary focus:outline-none resize-none h-40 font-mono"
              />
              {generated && (
                <p className="text-[10px] text-neon-green font-mono mt-1">
                  ✓ Content generated by LLM. You can edit before publishing.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePublish}
                className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-secondary-foreground text-xs font-mono hover:bg-secondary/80 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                PUBLISH ARTICLE
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Articles list */}
      <div className="space-y-3">
        {articles.map((article) => (
          <div key={article.id} className="border border-border bg-card p-4 hover:border-secondary/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-muted-foreground">{article.id}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-surface-light border border-border">{article.category}</span>
              <span className={`text-[10px] px-1.5 py-0.5 border font-mono ${
                article.status === 'published'
                  ? 'border-neon-green/50 text-neon-green'
                  : 'border-neon-yellow/50 text-neon-yellow'
              }`}>
                {article.status.toUpperCase()}
              </span>
            </div>
            <h3 className="text-sm font-display text-foreground mb-1">{article.title}</h3>
            <p className="text-[10px] text-muted-foreground">
              Created by {article.createdBy} on {article.createdAt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MerchantPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  const path = location.pathname;
  const activeTab: Tab = path.includes('/knowledge-base') ? 'knowledge-base' :
    path.includes('/tickets') ? 'tickets' : 'dashboard';

  const merchantName = localStorage.getItem('merchantName');

  const fetchEscalations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await escalationsClient
      .from('escalations')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      const mapped: TicketType[] = data.map((row: any) => ({
        id: row.id,
        customerId: '',
        subject: row.query,
        description: row.query,
        status: row.status === 'pending' ? 'open' as const :
                row.status === 'resolved' ? 'resolved' as const : 'closed' as const,
        category: row.category || 'General',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        responses: row.merchant_answer
          ? [{ id: '1', from: 'merchant' as const, message: row.merchant_answer, timestamp: row.updated_at }]
          : [],
        session_id: row.session_id,
        query: row.query,
        customerRating: null,
      }));
      setTickets(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('merchantLoggedIn')) {
      navigate('/merchant/login');
      return;
    }
    fetchEscalations();

    // Real-time subscription for instant updates
    const channel = escalationsClient
      .channel('merchant-escalations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'escalations' },
        () => { fetchEscalations(); }
      )
      .subscribe();

    // 30-second polling fallback
    const interval = setInterval(fetchEscalations, 30_000);

    return () => {
      escalationsClient.removeChannel(channel);
      clearInterval(interval);
    };
  }, [navigate, fetchEscalations]);

  const handleLogout = () => {
    localStorage.removeItem('merchantLoggedIn');
    localStorage.removeItem('merchantName');
    navigate('/merchant/login');
  };

  const handleFilterNav = (status: StatusFilter) => {
    setStatusFilter(status);
    setSelectedTicket(null);
    navigate('/merchant/tickets');
  };

  const filteredTickets = tickets.filter((t) => {
    const categoryMatch = filterCategory === 'all' || t.category === filterCategory;
    const statusMatch =
      statusFilter === 'all' ? true :
      statusFilter === 'old' ? (t.status === 'open' && isOlderThan24h(t.createdAt)) :
      t.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  const tabs: { key: Tab; label: string; path: string; icon: React.ElementType }[] = [
    { key: 'dashboard', label: 'Dashboard', path: '/merchant/dashboard', icon: LayoutDashboard },
    { key: 'tickets', label: 'Tickets', path: '/merchant/tickets', icon: Ticket },
    { key: 'knowledge-base', label: 'Knowledge Base', path: '/merchant/knowledge-base', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header variant="merchant" customerName={merchantName || ''} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-6">
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
                  ? 'border-secondary text-secondary'
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
          {activeTab === 'dashboard' && (
            <DashboardView tickets={tickets} onFilterNav={handleFilterNav} />
          )}

          {activeTab === 'tickets' && !selectedTicket && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-sm text-muted-foreground">
                  {statusFilter === 'all' ? 'ALL' :
                   statusFilter === 'old' ? 'OPEN > 24 HRS' :
                   statusFilter.toUpperCase()} TICKETS ({filteredTickets.length})
                </h2>
                <div className="flex items-center gap-2">
                  {statusFilter !== 'all' && (
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="text-[10px] font-mono px-2 py-1 border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      ✕ CLEAR FILTER
                    </button>
                  )}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-surface-dark border border-border px-3 py-1.5 text-xs text-foreground font-mono focus:border-secondary focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {ticketCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={fetchEscalations}
                    className="flex items-center gap-1 px-3 py-1.5 border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-secondary transition-all"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    REFRESH
                  </button>
                </div>
              </div>

              {/* Active status filter pills */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(['all', 'open', 'resolved', 'closed', 'old'] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`text-[10px] font-mono px-2.5 py-1 border transition-colors ${
                      statusFilter === s
                        ? s === 'open' ? 'border-neon-orange bg-neon-orange/20 text-neon-orange' :
                          s === 'resolved' ? 'border-neon-green bg-neon-green/20 text-neon-green' :
                          s === 'closed' ? 'border-muted-foreground bg-muted/40 text-muted-foreground' :
                          s === 'old' ? 'border-destructive bg-destructive/20 text-destructive' :
                          'border-primary bg-primary/20 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s === 'old' ? '> 24 HRS' : s.toUpperCase()}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="border border-border bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground font-mono">Loading tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="border border-border bg-card p-8 text-center">
                  <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tickets match this filter</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      showCustomer
                      onClick={() => setSelectedTicket(ticket)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tickets' && selectedTicket && (
            <TicketDetailMerchant
              ticket={selectedTicket}
              onBack={() => setSelectedTicket(null)}
              onResponseSent={fetchEscalations}
            />
          )}

          {activeTab === 'knowledge-base' && <KnowledgeBaseView />}
        </motion.div>
      </div>
    </div>
  );
}
