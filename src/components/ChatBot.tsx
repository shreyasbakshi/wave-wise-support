import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, LogIn, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatBotRef {
  openWithMessage: (message: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  showLoginPrompt?: boolean;
  showFeedback?: boolean;
  feedbackGiven?: 'up' | 'down' | null;
  feedbackTextOpen?: boolean;
  escalated?: boolean;
}

const SESSION_ID = crypto.randomUUID();

function FeedbackTextInput({ onSubmit, onSkip }: { onSubmit: (text: string) => void; onSkip: () => void }) {
  const [text, setText] = useState('');
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-muted-foreground">What could be improved?</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tell us more (optional)..."
        className="w-full bg-surface-dark border border-border px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
        rows={2}
      />
      <div className="flex gap-1.5">
        <button
          onClick={() => onSubmit(text)}
          className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-mono hover:bg-primary/80 transition-colors rounded-sm"
        >
          Submit
        </button>
        <button
          onClick={onSkip}
          className="px-2 py-1 border border-border text-muted-foreground text-[10px] font-mono hover:text-foreground transition-colors rounded-sm"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

const ChatBot = forwardRef<ChatBotRef>((_props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: 'Namaste! 🙏 Welcome to SignalWave support. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const processMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('https://shrebuck.app.n8n.cloud/webhook/050ec3eb-3611-4678-8b4a-83111e4c248e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: SESSION_ID, query: text }),
      });
      const data = await response.json();

      if (data.escalate) {
        const needsLogin = !user;
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: needsLogin
              ? (data.answer || 'This issue needs to be escalated to our support team.') + '\n\nTo create a support ticket, please log in to your account first.'
              : (data.answer || 'This issue needs to be escalated. I\'ll create a support ticket for you.'),
            showLoginPrompt: needsLogin,
            escalated: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.answer || 'I couldn\'t process your query. Please try again.',
            showFeedback: true,
            feedbackGiven: null,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (msgId: string, type: 'up' | 'down') => {
    if (type === 'down') {
      // Open text input for negative feedback
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, feedbackGiven: type, feedbackTextOpen: true } : m))
      );
      return;
    }
    // Positive feedback sends immediately
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedbackGiven: type } : m))
    );
    try {
      await fetch('https://shrebuck.app.n8n.cloud/webhook/user-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: SESSION_ID, thumbs: 'up', feedback_text: '' }),
      });
    } catch {
      // silently fail
    }
  };

  const handleFeedbackSubmit = async (msgId: string, feedbackText: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedbackTextOpen: false } : m))
    );
    try {
      await fetch('https://shrebuck.app.n8n.cloud/webhook/user-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: SESSION_ID, thumbs: 'down', feedback_text: feedbackText }),
      });
    } catch {
      // silently fail
    }
  };

  useImperativeHandle(ref, () => ({
    openWithMessage: (message: string) => {
      setIsOpen(true);
      setTimeout(() => processMessage(message), 100);
    },
  }));

  const handleSend = () => {
    if (!input.trim()) return;
    const currentInput = input;
    setInput('');
    processMessage(currentInput);
  };

  const handleLoginRedirect = () => {
    navigate('/customer/login?redirect=/customer/tickets');
  };

  return (
    <>
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] flex flex-col border-2 border-border bg-surface-dark retro-border"
          >
            <div className="px-4 py-3 border-b border-border bg-surface-mid flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-display text-sm text-foreground">SIGNALWAVE BOT</h3>
                <p className="text-[10px] text-neon-green">● ONLINE</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
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
                  {msg.showLoginPrompt && (
                    <div className="ml-8 mt-2">
                      <button
                        onClick={handleLoginRedirect}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-mono hover:bg-primary/80 transition-colors rounded-sm"
                      >
                        <LogIn className="w-3 h-3" /> Log in to create ticket
                      </button>
                    </div>
                  )}
                  {msg.showFeedback && (
                    <div className="ml-8 mt-2">
                      {msg.feedbackGiven && !msg.feedbackTextOpen ? (
                        <span className="text-[10px] text-muted-foreground">Thanks for your feedback!</span>
                      ) : msg.feedbackTextOpen ? (
                        <FeedbackTextInput
                          onSubmit={(text) => handleFeedbackSubmit(msg.id, text)}
                          onSkip={() => handleFeedbackSubmit(msg.id, '')}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">Was this helpful?</span>
                          <button
                            onClick={() => handleFeedback(msg.id, 'up')}
                            className="p-1 hover:bg-primary/20 rounded-sm transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3 text-muted-foreground hover:text-primary" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'down')}
                            className="p-1 hover:bg-destructive/20 rounded-sm transition-colors"
                          >
                            <ThumbsDown className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
});

ChatBot.displayName = 'ChatBot';

export default ChatBot;
