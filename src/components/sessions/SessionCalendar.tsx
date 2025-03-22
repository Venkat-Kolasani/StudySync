
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SessionDetails from './SessionDetails';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SessionCalendarProps {
  groupId: string;
}

export type Session = {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  hostId: string;
  hostName: string;
  attendees: {
    id: string;
    name: string;
    avatar?: string;
    status: 'confirmed' | 'tentative' | 'declined';
  }[];
  groupId: string;
  createAt: Date;
};

const SessionCalendar = ({ groupId }: SessionCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
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
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  
  const getSessionsForDay = (date: Date) => {
    return sessions.filter(session => 
      isSameDay(session.startTime, date)
    );
  };
  
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
      
      // Update selected session if it's the one being modified
      if (selectedSession?.id === sessionId) {
        setSelectedSession(sessions.find(s => s.id === sessionId) || null);
      }
      
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
  
  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-white-500">Loading sessions...</p>
      </div>
    );
  }
  
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Study Sessions</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div 
            key={day} 
            className="text-center text-xs font-medium py-2"
          >
            {day}
          </div>
        ))}
        
        {days.map((day) => {
          const daysSessions = getSessionsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <div
              key={day.toString()}
              className={`min-h-[80px] p-1 border border-white/10 rounded-md ${
                !isCurrentMonth ? 'opacity-40' : ''
              } ${
                isToday(day) ? 'bg-primary/10 border-primary/30' : ''
              }`}
              onClick={() => {
                if (daysSessions.length > 0) {
                  setSelectedSession(daysSessions[0]);
                }
              }}
            >
              <div className="text-right p-1">
                <span className={`text-xs ${isToday(day) ? 'font-bold text-primary' : ''}`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              {daysSessions.length > 0 && (
                <div className="mt-1">
                  {daysSessions.slice(0, 2).map((session) => (
                    <div 
                      key={session.id}
                      className="bg-primary/20 text-primary-foreground text-xs p-1 rounded mb-1 truncate cursor-pointer hover:bg-primary/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSession(session);
                      }}
                    >
                      {format(session.startTime, 'h:mm a')} - {session.title}
                    </div>
                  ))}
                  
                  {daysSessions.length > 2 && (
                    <div className="text-xs text-white-500 pl-1">
                      +{daysSessions.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedSession && (
        <div className="mt-6">
          <SessionDetails 
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            onRSVP={handleRSVP}
            currentUserId={user?.id}
          />
        </div>
      )}
    </div>
  );
};

export default SessionCalendar;
