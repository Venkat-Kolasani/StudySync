
-- Make tables support realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.group_members REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.resources REPLICA IDENTITY FULL;
ALTER TABLE public.sessions REPLICA IDENTITY FULL;
ALTER TABLE public.session_attendees REPLICA IDENTITY FULL;

-- Add tables to realtime publication
BEGIN;
  -- Drop the publication if it exists already
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create a new publication for all tables
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.messages,
    public.group_members,
    public.profiles,
    public.resources, 
    public.sessions, 
    public.session_attendees;
COMMIT;
