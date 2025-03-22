
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Check, X, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Session } from './SessionCalendar';

interface SessionListProps {
  groupId: string;
}

const SessionList = ({ groupId }: SessionListProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchSessions = async () => {
      if (!groupId) return;
      
      try {
        setIsLoading(true);
        
        // Get sessions for this group with host profile information
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select(`
            *,
            host:host_id(name)
          `)
          .eq('group_id', groupId)
          .order('start_time', { ascending: true });
          
        if (sessionsError) throw sessionsError;
        
        // Get attendees for each session
        const sessionsWithAttendees = await Promise.all(
          sessionsData.map(async (session: any) => {
            const { data: attendeesData, error: attendeesError } = await supabase
              .from('session_attendees')
              .select(`
                *,
                profiles:user_id(name, avatar)
              `)
              .eq('session_id', session.id);
              
            if (attendeesError) {
              console.error('Failed to fetch attendees:', attendeesError);
              return {
                ...session,
                attendees: [],
              };
            }
            
            // Format attendees
            const attendees = attendeesData.map((attendee: any) => ({
              id: attendee.user_id,
              name: attendee.profiles?.name || 'Unknown User',
              avatar: attendee.profiles?.avatar || undefined,
              status: attendee.status,
            }));
            
            return {
              id: session.id,
              title: session.title,
              description: session.description || '',
              startTime: new Date(session.start_time),
              endTime: new Date(session.end_time),
              location: session.location || 'No location specified',
              hostId: session.host_id,
              hostName: session.host?.name || 'Unknown Host',
              attendees,
              groupId: session.group_id,
              createAt: new Date(session.created_at),
            };
          })
        );
        
        setSessions(sessionsWithAttendees);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        toast.error('Failed to load sessions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, [groupId]);
  
  const handleRSVP = async (sessionId: string, status: 'confirmed' | 'tentative' | 'declined') => {
    if (!user) {
      toast.error('You must be signed in to RSVP');
      return;
    }
    
    try {
      // Check if the user already has an RSVP for this session
      const { data: existingRsvp, error: checkError } = await supabase
        .from('session_attendees')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingRsvp) {
        // Update existing RSVP
        const { error: updateError } = await supabase
          .from('session_attendees')
          .update({ status })
          .eq('id', existingRsvp.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new RSVP
        const { error: insertError } = await supabase
          .from('session_attendees')
          .insert({
            session_id: sessionId,
            user_id: user.id,
            status,
          });
          
        if (insertError) throw insertError;
      }
      
      // Update the sessions state
      setSessions(prevSessions => 
        prevSessions.map(session => {
          if (session.id === sessionId) {
            // Update or add user's RSVP
            const existingAttendeeIndex = session.attendees.findIndex(a => a.id === user.id);
            let updatedAttendees;
            
            if (existingAttendeeIndex >= 0) {
              // Update existing status
              updatedAttendees = [...session.attendees];
              updatedAttendees[existingAttendeeIndex] = {
                ...updatedAttendees[existingAttendeeIndex],
                status
              };
            } else {
              // Add new attendee
              updatedAttendees = [
                ...session.attendees,
                {
                  id: user.id,
                  name: user.name,
                  avatar: user.avatar,
                  status
                }
              ];
            }
            
            return {
              ...session,
              attendees: updatedAttendees
            };
          }
          return session;
        })
      );
      
      const statusText = 
        status === 'confirmed' ? 'attending' : 
        status === 'tentative' ? 'tentatively attending' : 
        'not attending';
        
      toast.success(`You are ${statusText} this session`);
    } catch (error: any) {
      console.error('Failed to update RSVP status:', error);
      toast.error('Failed to update RSVP', {
        description: error.message || 'Please try again later',
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'tentative':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'declined':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="h-3 w-3" />;
      case 'tentative':
        return <AlertCircle className="h-3 w-3" />;
      case 'declined':
        return <X className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const getUserStatus = (session: Session) => {
    if (!user) return null;
    const userAttendee = session.attendees.find(a => a.id === user.id);
    return userAttendee ? userAttendee.status : null;
  };
  
  const getConfirmedCount = (session: Session) => {
    return session.attendees.filter(a => a.status === 'confirmed').length;
  };
  
  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-white-500">Loading sessions...</p>
      </div>
    );
  }
  
  if (sessions.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-white-500 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Sessions Scheduled</h3>
        <p className="text-white-500 mb-4">
          There are no study sessions scheduled for this group yet.
        </p>
      </div>
    );
  }
  
  // Group sessions by upcoming and past
  const now = new Date();
  const upcomingSessions = sessions.filter(s => s.startTime > now);
  const pastSessions = sessions.filter(s => s.startTime <= now);
  
  return (
    <div className="space-y-8">
      {upcomingSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Upcoming Sessions</h3>
          
          <div className="space-y-4">
            {upcomingSessions.map((session) => {
              const userStatus = getUserStatus(session);
              const confirmedCount = getConfirmedCount(session);
              
              return (
                <div key={session.id} className="glass rounded-xl p-5">
                  <h4 className="text-xl font-semibold mb-2">{session.title}</h4>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex gap-2 items-center">
                      <Calendar className="h-4 w-4 text-white-500" />
                      <span>{format(session.startTime, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Clock className="h-4 w-4 text-white-500" />
                      <span>
                        {format(session.startTime, 'h:mm a')} - {format(session.endTime, 'h:mm a')}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <MapPin className="h-4 w-4 text-white-500" />
                      <span>{session.location}</span>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Users className="h-4 w-4 text-white-500" />
                      <span>
                        {confirmedCount} {confirmedCount === 1 ? 'person' : 'people'} attending
                      </span>
                    </div>
                  </div>
                  
                  {session.description && (
                    <div className="bg-secondary/10 p-3 rounded-md mb-4 text-sm">
                      <p>{session.description}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    {userStatus && (
                      <div className="mb-2 sm:mb-0 sm:mr-4">
                        <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(userStatus)}`}>
                          {getStatusIcon(userStatus)}
                          <span>
                            {userStatus === 'confirmed' ? 'Going' : 
                             userStatus === 'tentative' ? 'Maybe' : 'Not Going'}
                          </span>
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={userStatus === 'confirmed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRSVP(session.id, 'confirmed')}
                        disabled={!user}
                      >
                        Going
                      </Button>
                      <Button
                        variant={userStatus === 'tentative' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRSVP(session.id, 'tentative')}
                        disabled={!user}
                      >
                        Maybe
                      </Button>
                      <Button
                        variant={userStatus === 'declined' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRSVP(session.id, 'declined')}
                        disabled={!user}
                      >
                        Can't Go
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {pastSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Past Sessions</h3>
          
          <div className="space-y-4">
            {pastSessions.map((session) => (
              <div key={session.id} className="glass rounded-xl p-5 opacity-70">
                <h4 className="text-xl font-semibold mb-2">{session.title}</h4>
                
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2 items-center">
                    <Calendar className="h-4 w-4 text-white-500" />
                    <span>{format(session.startTime, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <Clock className="h-4 w-4 text-white-500" />
                    <span>
                      {format(session.startTime, 'h:mm a')} - {format(session.endTime, 'h:mm a')}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <MapPin className="h-4 w-4 text-white-500" />
                    <span>{session.location}</span>
                  </div>
                </div>
                
                <Badge variant="outline" className="bg-secondary/10">
                  Completed
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList;
