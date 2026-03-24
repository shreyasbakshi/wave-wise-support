import { createClient } from '@supabase/supabase-js';

const MERCHANT_SUPABASE_URL = 'https://ujzbrpsyfsruottiwpiq.supabase.co';
const MERCHANT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqemJycHN5ZnNydW90dGl3cGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjI2MzUsImV4cCI6MjA4ODc5ODYzNX0.IrQPvm9yQTl1DClroR5x408t58tAWJoUYzZxEN7a_Mo';

export const merchantSupabase = createClient(MERCHANT_SUPABASE_URL, MERCHANT_SUPABASE_ANON_KEY);

export interface EscalationRow {
  id: string;
  session_id: string;
  query: string;
  enhanced_query: string | null;
  retrieved_context: string | null;
  human_answer: string | null;
  final_answer: string | null;
  status: 'pending' | 'resolved' | 'needs_review';
  created_at: string;
}
