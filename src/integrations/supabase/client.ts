
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sdhgfhqamtbbmiyvtfvb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkaGdmaHFhbXRiYm1peXZ0ZnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNjE1NDQsImV4cCI6MjA1NzYzNzU0NH0.Te0IbW9nkT4kp6Fc04jFPGX66a_DnXR0WNV3PNr8lEc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
