import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Ticket, BookOpen, Send, CheckCircle, AlertTriangle,
  Clock, Eye, Plus, Save, SpellCheck, Wand2, FileText
} from 'lucide-react';
import Header from '@/components/Header';
import TicketCard from '@/components/TicketCard';
import {
  tickets as allTickets, customers, kbArticles as initialKBArticles,
  ticketCategories, type Ticket as TicketType, type KBArticle
} from '@/data/mockData';

type Tab = 'dashboard' | 'tickets' | 'knowledge-base';

function DashboardView({ tickets }: { tickets: TicketType[] }) {
  const open = tickets.filter((t) => t.status === 'open').length;
  const pending = tickets.filter((t) => t.status === 'pending').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;
  const closed = tickets.filter((t) => t.status === 'closed').length;
  const oldOpen = tickets.filter((t) => {
    if (t.status !== 'open') return false;
    return (Date.now() - new Date(t.createdAt).getTime()) > 24 * 60 * 60 * 1000;
  }).length;

  const stats = [
    { label: 'OPEN', value: open, icon: AlertTriangle, color: 'text-neon-orange border-neon-orange/30 bg-neon-orange/10' },
    { label: 'PENDING', value: pending, icon: Clock, color: 'text-neon-yellow border-neon-yellow/30 bg-neon-yellow/10' },
    { label: 'RESOLVED', value: resolved, icon: CheckCircle, color: 'text-neon-green border-neon-green/30 bg-neon-green/10' },
    { label: 'CLOSED', value: closed, icon: Eye, color: 'text-muted-foreground border-border bg-muted/30' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`border p-4 ${stat.color}`}>
            <stat.icon className="w-5 h-5 mb-2" />
            <p className="text-2xl font-display">{stat.value}</p>
            <p className="text-[10px] font-mono">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 24hr alert */}
      {oldOpen > 0 && (
        <div className="mb-6 border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-display text-destructive">{oldOpen} TICKET(S) OPEN {'>'} 24 HOURS</p>
            <p className="text-xs text-muted-foreground">These tickets require immediate attention</p>
          </div>
        </div>
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
          <TicketCard key={t.id} ticket={t} showCustomer />
        ))}
      </div>
    </div>
  );
}

function TicketDetailMerchant({ ticket, onBack }: { ticket: TicketType; onBack: () => void }) {
  const [response, setResponse] = useState('');
  const [spellChecked, setSpellChecked] = useState(false);
  const [saved, setSaved] = useState(false);
  const customer = customers.find((c) => c.id === ticket.customerId);

  const handleSpellCheck = () => {
    // Mock spell check
    setSpellChecked(true);
    setTimeout(() => setSpellChecked(false), 2000);
  };

  const handleSave = () => {
    if (!response.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpellCheck}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono transition-all ${
              spellChecked
                ? 'border-neon-green text-neon-green'
                : 'border-border text-muted-foreground hover:border-secondary hover:text-secondary'
            }`}
          >
            <SpellCheck className="w-3.5 h-3.5" />
            {spellChecked ? 'CHECKED ✓' : 'SPELL CHECK'}
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono transition-all ${
              saved
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'SAVED & SENT' : 'SAVE RESPONSE'}
          </button>
        </div>
        {saved && (
          <p className="mt-2 text-xs text-neon-green font-mono">
            ✓ Response saved. Customer has been notified.
          </p>
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

  const path = location.pathname;
  const activeTab: Tab = path.includes('/knowledge-base') ? 'knowledge-base' :
    path.includes('/tickets') ? 'tickets' : 'dashboard';

  const merchantName = localStorage.getItem('merchantName');

  useEffect(() => {
    if (!localStorage.getItem('merchantLoggedIn')) navigate('/merchant/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('merchantLoggedIn');
    localStorage.removeItem('merchantName');
    navigate('/merchant/login');
  };

  const emptyTickets: TicketType[] = [];
  const filteredTickets = emptyTickets;

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
          {activeTab === 'dashboard' && <DashboardView tickets={allTickets} />}

          {activeTab === 'tickets' && !selectedTicket && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-sm text-muted-foreground">
                  ALL TICKETS ({filteredTickets.length})
                </h2>
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
              </div>
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
            </div>
          )}

          {activeTab === 'tickets' && selectedTicket && (
            <TicketDetailMerchant ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />
          )}

          {activeTab === 'knowledge-base' && <KnowledgeBaseView />}
        </motion.div>
      </div>
    </div>
  );
}
