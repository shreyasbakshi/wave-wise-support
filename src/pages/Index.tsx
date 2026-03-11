import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Zap, Wifi, Phone, Globe, Tv, Shield, ChevronRight, Signal } from 'lucide-react';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import heroBanner from '@/assets/hero-banner.jpg';

const features = [
  { icon: Wifi, label: 'Broadband & Fiber', desc: 'Lightning fast internet up to 1Gbps' },
  { icon: Phone, label: 'Mobile Plans', desc: 'Prepaid & Postpaid for everyone' },
  { icon: Globe, label: 'International Roaming', desc: 'Stay connected worldwide' },
  { icon: Tv, label: 'OTT & Entertainment', desc: 'Free streaming with select plans' },
  { icon: Shield, label: 'Device Protection', desc: 'Insurance & extended warranty' },
  { icon: Zap, label: '5G Network', desc: 'Next-gen speeds, now live in 500+ cities' },
];

const quickLinks = [
  'Check data balance',
  'Recharge my number',
  'View my bill',
  'Activate international roaming',
  'Report network issue',
  'Change my plan',
];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (query?: string) => {
    const q = query || searchQuery;
    if (!q.trim()) return;
    // In design-first mode, just show that search works
    navigate(`/customer/login?query=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBanner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        <div className="absolute inset-0 retro-grid opacity-20" />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Terminal-style header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/50 bg-primary/10 mb-6 text-xs font-mono text-primary">
              <Signal className="w-3 h-3" />
              <span>SYSTEM.STATUS: ALL_NETWORKS_OPERATIONAL</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display mb-4 leading-tight">
              <span className="text-foreground">HOW CAN WE </span>
              <span className="text-primary glow-text-blue">HELP</span>
              <span className="text-foreground"> YOU</span>
              <span className="text-secondary glow-text-magenta">?</span>
            </h1>

            <p className="text-muted-foreground text-sm md:text-base mb-8 font-mono">
              {'>'} Search our knowledge base or chat with our AI assistant
            </p>

            {/* Search Box */}
            <div className="relative max-w-xl mx-auto">
              <div className="flex border-2 border-border bg-surface-dark focus-within:border-primary transition-colors glow-blue">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Describe your issue or question..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
                />
                <button
                  onClick={() => handleSearch()}
                  className="px-5 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors flex items-center gap-2 font-mono text-sm"
                >
                  <Search className="w-4 h-4" />
                  SEARCH
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {quickLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => {
                    setSearchQuery(link);
                    handleSearch(link);
                  }}
                  className="text-[11px] font-mono px-3 py-1.5 border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                >
                  {link}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl text-foreground mb-2">
            {'<'} OUR <span className="text-primary">SERVICES</span> {'/>'} 
          </h2>
          <p className="text-xs text-muted-foreground font-mono">Explore what SignalWave has to offer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {features.map((feat, i) => (
            <motion.div
              key={feat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group border border-border bg-card p-5 hover:border-primary/50 hover:bg-surface-mid transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 border border-border bg-surface-dark group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                  <feat.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-display text-sm text-foreground mb-1">{feat.label}</h3>
                  <p className="text-xs text-muted-foreground">{feat.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary ml-auto transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Signal className="w-5 h-5 text-primary" />
              <span className="font-display text-sm">SIGNAL<span className="text-primary">WAVE</span></span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              © 2024 SignalWave Telecom Pvt. Ltd. | CIN: U64200MH2024PTC123456 | Toll Free: 1800-SIGNAL-0
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="hover:text-primary cursor-pointer">Privacy</span>
              <span className="hover:text-primary cursor-pointer">Terms</span>
              <span className="hover:text-primary cursor-pointer">TRAI</span>
            </div>
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
