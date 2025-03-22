
import { useState, useEffect } from 'react';
import { Download, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Resource } from '@/types/supabase';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { Button } from '@/components/ui/button';

type ResourceListProps = {
  groupId: string | undefined;
}

const ResourceList = ({ groupId }: ResourceListProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load resources
  useEffect(() => {
    const fetchResources = async () => {
      if (!groupId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        setResources(data || []);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, [groupId]);

  // Listen for realtime updates to resources
  useSupabaseRealtime(
    {
      table: 'resources',
      filter: groupId ? `group_id=eq.${groupId}` : undefined,
      event: '*',
      schema: 'public'
    },
    (payload) => {
      // Handle INSERT event
      if (payload.eventType === 'INSERT') {
        setResources(prev => [payload.new as Resource, ...prev]);
      }
      // Handle UPDATE event
      else if (payload.eventType === 'UPDATE') {
        setResources(prev => 
          prev.map(resource => 
            resource.id === payload.new.id ? (payload.new as Resource) : resource
          )
        );
      }
      // Handle DELETE event
      else if (payload.eventType === 'DELETE') {
        setResources(prev => 
          prev.filter(resource => resource.id !== payload.old.id)
        );
      }
    }
  );

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 mt-4">
        <h2 className="text-xl font-semibold mb-2">Recent Resources</h2>
        <p className="text-white-500 text-center py-4">Loading resources...</p>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="glass rounded-xl p-6 mt-4">
        <h2 className="text-xl font-semibold mb-2">Recent Resources</h2>
        <p className="text-white-500 text-center py-4">No resources shared yet.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 mt-4">
      <h2 className="text-xl font-semibold mb-4">Recent Resources</h2>
      <div className="space-y-3">
        {resources.map(resource => (
          <div key={resource.id} className="glass-dark rounded-lg p-3">
            <div className="flex gap-3 items-center">
              <File className="h-5 w-5 text-white-500" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{resource.title}</h3>
                {resource.description && (
                  <p className="text-sm text-white-500 truncate">{resource.description}</p>
                )}
              </div>
              <Button size="sm" variant="ghost" asChild className="ml-auto">
                <a href={resource.file_url} target="_blank" rel="noopener noreferrer" aria-label="Download">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
