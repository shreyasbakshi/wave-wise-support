import { createClient } from '@supabase/supabase-js';

const ESCALATIONS_SUPABASE_URL = 'https://ujzbrpsyfsruottiwpiq.supabase.co';
const ESCALATIONS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqemJycHN5ZnNydW90dGl3cGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjI2MzUsImV4cCI6MjA4ODc5ODYzNX0.IrQPvm9yQTl1DClroR5x408t58tAWJoUYzZxEN7a_Mo';

export const escalationsClient = createClient(ESCALATIONS_SUPABASE_URL, ESCALATIONS_SUPABASE_ANON_KEY);
