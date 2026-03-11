import { Ticket, customers } from '@/data/mockData';
import { Clock, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

const statusStyles: Record<string, string> = {
  open: 'border-neon-orange text-neon-orange bg-neon-orange/10',
  pending: 'border-neon-yellow text-neon-yellow bg-neon-yellow/10',
  resolved: 'border-neon-green text-neon-green bg-neon-green/10',
  closed: 'border-muted-foreground text-muted-foreground bg-muted/50',
};

interface TicketCardProps {
  ticket: Ticket;
  showCustomer?: boolean;
  onClick?: () => void;
}

export default function TicketCard({ ticket, showCustomer = false, onClick }: TicketCardProps) {
  const customer = customers.find((c) => c.id === ticket.customerId);
  const date = new Date(ticket.createdAt);
  const isOld = (Date.now() - date.getTime()) > 24 * 60 * 60 * 1000;

  return (
    <div
      onClick={onClick}
      className={`border border-border bg-card p-4 hover:border-primary/50 transition-all cursor-pointer group ${
        isOld && ticket.status === 'open' ? 'border-l-2 border-l-destructive' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-muted-foreground">{ticket.id}</span>
            <span className={`text-[10px] px-2 py-0.5 border font-mono uppercase ${statusStyles[ticket.status]}`}>
              {ticket.status}
            </span>
          </div>
          <h3 className="text-sm font-display text-foreground group-hover:text-primary transition-colors truncate">
            {ticket.subject}
          </h3>
        </div>
        {ticket.customerRating && (
          <div className="flex-shrink-0">
            {ticket.customerRating === 'up' ? (
              <ThumbsUp className="w-4 h-4 text-neon-green" />
            ) : (
              <ThumbsDown className="w-4 h-4 text-destructive" />
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{ticket.description}</p>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="px-1.5 py-0.5 bg-surface-light border border-border">{ticket.category}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {date.toLocaleDateString('en-IN')}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {ticket.responses.length}
          </span>
        </div>
        {showCustomer && customer && (
          <span>{customer.avatar} {customer.name}</span>
        )}
      </div>
    </div>
  );
}
