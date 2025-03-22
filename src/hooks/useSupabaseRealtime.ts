
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type ChannelConfig = {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema: string;
  table: string;
  filter?: string;
};

export function useSupabaseRealtime<T = any>(
  config: ChannelConfig,
  callback: (payload: any) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const channelName = `${config.table}_${config.event}_${Date.now()}`;

  useEffect(() => {
    // Create and subscribe to a channel
    const { event, schema, table, filter } = config;
    
    const channelFilter: any = {
      event: event,
      schema: schema,
      table: table,
    };

    if (filter) {
      channelFilter.filter = filter;
    }

    // Create the channel with the correct parameters
    const newChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        channelFilter,
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    setChannel(newChannel);

    // Cleanup function to remove the subscription
    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [channelName, config, callback]);

  return channel;
}
