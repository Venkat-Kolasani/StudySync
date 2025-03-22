
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import GroupList from '@/components/groups/GroupList';
import PageTransition from '@/components/shared/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define study group type
type StudyGroup = {
  id: string;
  name: string;
  subject: string;
  description: string;
  members: number;
  capacity: number;
  tags: string[];
};

const Groups = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch groups from Supabase
    const fetchGroups = async () => {
      try {
        setIsLoadingGroups(true);
        
        // Fetch public groups from Supabase
        const { data: groupsData, error } = await supabase
          .from('groups')
          .select('*');
        
        if (error) throw error;
        
        // Transform the data to match the frontend group structure
        const groupPromises = groupsData.map(async (group) => {
          // Count members for each group
          const { count: membersCount, error: membersError } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);
            
          if (membersError) throw membersError;
          
          return {
            id: group.id,
            name: group.name,
            subject: group.subject,
            description: group.description || '',
            members: membersCount || 0,
            capacity: group.capacity,
            tags: group.subject_tags || [],
          };
        });
        
        const processedGroups = await Promise.all(groupPromises);
        setGroups(processedGroups);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
        toast.error('Failed to load study groups');
      } finally {
        setIsLoadingGroups(false);
      }
    };
    
    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <PageTransition>
        <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Study Groups</h1>
              <p className="text-white-500 mt-1">Discover and join study groups or create your own</p>
            </div>
            
            <Button className="mt-4 md:mt-0" asChild>
              <Link to={isAuthenticated ? "/groups/create" : "/"}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Group
              </Link>
            </Button>
          </header>
          
          <div className="glass rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-dark rounded-lg p-5 text-center">
                <div className="text-3xl font-bold text-accent mb-2">{groups.length}</div>
                <div className="text-white-500">Available Groups</div>
              </div>
              <div className="glass-dark rounded-lg p-5 text-center">
                <div className="text-3xl font-bold text-accent mb-2">350+</div>
                <div className="text-white-500">Active Students</div>
              </div>
              <div className="glass-dark rounded-lg p-5 text-center">
                <div className="text-3xl font-bold text-accent mb-2">12</div>
                <div className="text-white-500">Study Subjects</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Popular Subjects</h3>
              <div className="flex flex-wrap gap-2">
                <Badge className="text-sm py-1.5">Computer Science</Badge>
                <Badge className="text-sm py-1.5">Mathematics</Badge>
                <Badge className="text-sm py-1.5">Physics</Badge>
                <Badge className="text-sm py-1.5">Biology</Badge>
                <Badge className="text-sm py-1.5">Chemistry</Badge>
                <Badge className="text-sm py-1.5">Literature</Badge>
                <Badge className="text-sm py-1.5">History</Badge>
                <Badge className="text-sm py-1.5">Economics</Badge>
              </div>
            </div>
          </div>
          
          {isLoadingGroups ? (
            <div className="glass-dark rounded-xl p-6 flex items-center justify-center h-64">
              <p className="text-white-500">Loading study groups...</p>
            </div>
          ) : (
            <GroupList groups={groups} />
          )}
        </main>
      </PageTransition>
    </div>
  );
};

export default Groups;
