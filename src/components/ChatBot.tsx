import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const botResponses: Record<string, string> = {
  'data': 'To check your data balance, dial *121# or open the SignalWave app → My Usage. You can also SMS "BAL" to 121.',
  'recharge': 'You can recharge through: 1) SignalWave App 2) Website signalwave.in/recharge 3) Paytm/PhonePe 4) Nearest retail store',
  'speed': 'If you\'re experiencing slow speeds: 1) Restart your device 2) Check signal strength 3) Try toggling airplane mode. If issue persists, we\'ll create a support ticket for you.',
  'bill': 'View your bill: App → My Account → Bills. Download PDF or get it emailed. For billing disputes, I can create a ticket for you.',
  'plan': 'To view or change your plan, go to App → My Plan → Explore Plans. You can also visit signalwave.in/plans for all current offers.',
  'roaming': 'International roaming can be activated by dialing *123*1# or through the app. We recommend our travel packs starting at ₹499 for 7 days.',
  'default': 'I understand your query. Let me connect you with our AI assistant for a detailed response. Meanwhile, you can also check our FAQ at signalwave.in/help. Would you like me to create a support ticket?',
};

function getResponse(query: string): string {
  const q = query.toLowerCase();
  for (const [key, response] of Object.entries(botResponses)) {
    if (key !== 'default' && q.includes(key)) return response;
  }
  return botResponses['default'];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: 'Namaste! 🙏 Welcome to SignalWave support. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(input);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: response },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary flex items-center justify-center glow-blue"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] flex flex-col border-2 border-border bg-surface-dark retro-border"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-surface-mid flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-display text-sm text-foreground">SIGNALWAVE BOT</h3>
                <p className="text-[10px] text-neon-green">● ONLINE</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-secondary/20' : 'bg-primary/20'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-secondary" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    )}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-secondary/10 border border-secondary/30 text-foreground'
                      : 'bg-primary/10 border border-primary/30 text-foreground'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-sm bg-primary/20 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-primary/10 border border-primary/30 px-3 py-2 text-xs text-muted-foreground retro-pulse">
                    typing...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-surface-mid">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your query..."
                  className="flex-1 bg-surface-dark border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  className="px-3 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
