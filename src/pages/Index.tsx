import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import SpotlightSearch, { SpotlightRef } from '@/components/SpotlightSearch';

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
  const spotlightRef = useRef<SpotlightRef>(null);

  const handleSearch = (query?: string) => {
    const q = (query || searchQuery).trim();
    if (!q) return;
    spotlightRef.current?.openWithQuery(q);
    setSearchQuery('');
  };

  const openSpotlight = () => {
    spotlightRef.current?.open();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 retro-grid opacity-30" />

        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card mb-8 text-xs text-muted-foreground shadow-sm">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              All networks operational
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight text-foreground">
              How can we{' '}
              <span className="text-primary">help</span> you?
            </h1>

            <p className="text-muted-foreground text-base md:text-lg mb-10">
              Search our knowledge base or ask our AI assistant
            </p>

            {/* Search Box */}
            <div className="relative max-w-xl mx-auto">
              <div
                className="flex rounded-full border border-border bg-card shadow-lg hover:border-primary/50 hover:shadow-xl transition-all cursor-text"
                onClick={openSpotlight}
              >
                <div className="flex-1 px-6 py-4 text-sm text-muted-foreground">
                  Search help articles or ask a question...
                </div>
                <div className="px-6 py-4 bg-primary text-primary-foreground rounded-r-full flex items-center gap-2 text-sm font-medium">
                  <Search className="w-4 h-4" />
                  Ask
                </div>
              </div>
              <kbd className="absolute right-[100px] top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
                ⌘K
              </kbd>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {quickLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => {
                    spotlightRef.current?.openWithQuery(link);
                  }}
                  className="text-xs px-4 py-2 rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  {link}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <SpotlightSearch ref={spotlightRef} />
    </div>
  );
}
