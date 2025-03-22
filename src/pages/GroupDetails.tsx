import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Navbar from '@/components/layout/Navbar';
import GroupChat from '@/components/groups/GroupChat';
import ResourceList from '@/components/resources/ResourceList';
import PageTransition from '@/components/shared/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CreateSessionDialog from '@/components/sessions/CreateSessionDialog';

interface Session {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  group_id: string;
  host_id: string;
  created_at: string;
}

const GroupDetails = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      
      try {
        setIsLoading(true);
        
        // Get group details
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();
          
        if (groupError) throw groupError;
        setGroup(groupData);
        
        // Get upcoming sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('group_id', groupId)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true });
          
        if (sessionsError) throw sessionsError;
        setUpcomingSessions(sessionsData || []);
        
        // Get group members with profile info
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            *,
            profiles:user_id(name, avatar)
          `)
          .eq('group_id', groupId);
          
        if (membersError) throw membersError;
        setMembers(membersData || []);
        
        // Check if user is a member
        if (isAuthenticated && user) {
          const { data: membershipData, error: membershipError } = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (membershipError) throw membershipError;
          setIsJoined(!!membershipData);
        }
      } catch (error) {
        console.error('Failed to fetch group details:', error);
        toast.error('Failed to load group details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroupDetails();
  }, [groupId, user, isAuthenticated]);
  
  const handleJoinGroup = async () => {
    if (!groupId || !user) {
      toast.error('You must be logged in to join a group');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Insert the user as a member of the group
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
        });
        
      if (error) throw error;
      
      // Add the new member to the local state
      const newMember = {
        id: Date.now().toString(), // Temporary ID until we refresh
        user_id: user.id,
        group_id: groupId,
        role: 'member',
        joined_at: new Date().toISOString(),
        profiles: {
          name: user.name,
          avatar: user.avatar
        }
      };
      
      setMembers([...members, newMember]);
      setIsJoined(true);
      toast.success('You have joined the group!');
    } catch (error) {
      console.error('Failed to join group:', error);
      toast.error('Failed to join the group');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateSession = () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to create a session');
      return;
    }
    
    if (!isJoined) {
      toast.error('You must be a member of this group to create a session');
      return;
    }
    
    setIsCreateSessionOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <PageTransition>
          <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="text-center">
              Loading group details...
            </div>
          </main>
        </PageTransition>
      </div>
    );
  }
  
  if (!group) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <PageTransition>
          <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="text-center">
              Group not found.
            </div>
          </main>
        </PageTransition>
      </div>
    );
  }

  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <PageTransition>
        <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Button variant="ghost" onClick={() => navigate('/groups')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Groups
              </Button>
              
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <p className="text-white-500">{group.description}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="glass rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Upcoming Session</h2>
                    
                    {isJoined && (
                      <Button 
                        size="sm" 
                        onClick={handleCreateSession}
                      >
                        Schedule Session
                      </Button>
                    )}
                  </div>
                  
                  {nextSession ? (
                    <div className="glass-dark rounded-lg p-4">
                      <h3 className="font-medium text-lg">{nextSession.title}</h3>
                      <p className="text-white-500 text-sm mb-2">{nextSession.description}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-white-500" />
                        <span>{new Date(nextSession.start_time).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-white-500" />
                        <span>
                          {new Date(nextSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(nextSession.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white-500" />
                        <span>{nextSession.location || 'Online'}</span>
                      </div>
                      
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => navigate(`/groups/${groupId}/sessions`)}
                        >
                          View All Sessions
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white-500">No upcoming sessions scheduled.</p>
                      
                      {isJoined && (
                        <Button
                          className="mt-4"
                          variant="outline"
                          onClick={() => navigate(`/groups/${groupId}/sessions`)}
                        >
                          View All Sessions
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                <GroupChat groupId={groupId} isJoined={isJoined} />
              </div>
              
              <div>
                <div className="glass rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Group Members</h2>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-white-500" />
                    <span>{members.length} members</span>
                  </div>
                  
                  <div className="space-y-3">
                    {members.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.profiles?.avatar || undefined} />
                          <AvatarFallback>
                            {member.profiles?.name ? member.profiles.name.charAt(0) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.profiles?.name || 'Unknown User'}</span>
                        {member.role === 'admin' && (
                          <Badge variant="outline" className="ml-auto text-xs">Admin</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {!isJoined && (
                    <Button 
                      className="w-full mt-4"
                      onClick={handleJoinGroup}
                      disabled={isLoading || !isAuthenticated}
                    >
                      {!isAuthenticated ? 'Sign in to Join' : 'Join Group'}
                    </Button>
                  )}
                  
                  {isJoined && (
                    <Button 
                      className="w-full mt-4"
                      variant="secondary"
                      onClick={() => navigate(`/groups/${groupId}/resources`)}
                    >
                      View Resources
                    </Button>
                  )}
                </div>
                
                {isJoined && (
                  <ResourceList groupId={groupId} />
                )}
              </div>
            </div>
          </div>
        </main>
      </PageTransition>

      {/* Create Session Dialog */}
      {groupId && (
        <CreateSessionDialog 
          open={isCreateSessionOpen} 
          onOpenChange={setIsCreateSessionOpen} 
          groupId={groupId} 
        />
      )}
    </div>
  );
};

export default GroupDetails;
