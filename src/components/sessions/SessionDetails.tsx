
import { Clock, MapPin, Calendar, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { type Session } from './SessionCalendar';

interface SessionDetailsProps {
  session: Session;
  onRSVP: (sessionId: string, status: 'confirmed' | 'tentative' | 'declined') => void;
  onClose: () => void;
  currentUserId?: string;
}

const SessionDetails = ({ session, onRSVP, onClose, currentUserId }: SessionDetailsProps) => {
  // Use currentUserId directly instead of relying on authentication context
  const effectiveUserId = currentUserId;
  
  const userRSVP = effectiveUserId 
    ? session.attendees.find(a => a.id === effectiveUserId)?.status 
    : undefined;
  
  const confirmedCount = session.attendees.filter(a => a.status === 'confirmed').length;
  const tentativeCount = session.attendees.filter(a => a.status === 'tentative').length;
  const declinedCount = session.attendees.filter(a => a.status === 'declined').length;
  
  return (
    <div className="glass rounded-xl p-6">
      <Button variant="ghost" size="sm" onClick={onClose} className="mb-4">
        Back to Calendar
      </Button>
      
      <h2 className="text-xl font-semibold mb-2">{session.title}</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex gap-2 items-center">
          <Calendar className="h-5 w-5 text-white-500" />
          <span>{format(session.startTime, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        
        <div className="flex gap-2 items-center">
          <Clock className="h-5 w-5 text-white-500" />
          <span>
            {format(session.startTime, 'h:mm a')} - {format(session.endTime, 'h:mm a')}
          </span>
        </div>
        
        <div className="flex gap-2 items-center">
          <MapPin className="h-5 w-5 text-white-500" />
          <span>{session.location}</span>
        </div>
        
        <div className="flex gap-2 items-center">
          <User className="h-5 w-5 text-white-500" />
          <span>Hosted by {session.hostName}</span>
        </div>
      </div>
      
      <div className="bg-secondary/20 p-4 rounded-md mb-6">
        <h3 className="font-medium mb-2">Description</h3>
        <p className="text-white-500 text-sm">{session.description}</p>
      </div>
      
      {effectiveUserId ? (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Your RSVP</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={userRSVP === 'confirmed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRSVP(session.id, 'confirmed')}
            >
              Going
            </Button>
            <Button
              variant={userRSVP === 'tentative' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRSVP(session.id, 'tentative')}
            >
              Maybe
            </Button>
            <Button
              variant={userRSVP === 'declined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRSVP(session.id, 'declined')}
            >
              Can't Go
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-secondary/20 p-3 rounded-md mb-6 text-sm text-white-500">
          Sign in to RSVP to this session
        </div>
      )}
      
      <div>
        <h3 className="font-medium mb-2 flex items-center">
          <Users className="h-4 w-4 mr-1" />
          Attendees ({confirmedCount + tentativeCount})
        </h3>
        
        <div className="bg-secondary/10 rounded-md">
          {confirmedCount > 0 && (
            <div className="p-3 border-b border-secondary/20">
              <h4 className="text-sm font-medium mb-2">Going ({confirmedCount})</h4>
              <div className="flex flex-wrap gap-2">
                {session.attendees
                  .filter(a => a.status === 'confirmed')
                  .map(attendee => (
                    <div key={attendee.id} className="flex items-center gap-1.5 bg-secondary/20 px-2 py-1 rounded-md text-xs">
                      {attendee.avatar ? (
                        <img 
                          src={attendee.avatar} 
                          alt={attendee.name} 
                          className="h-4 w-4 rounded-full"
                        />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium">
                          {attendee.name.charAt(0)}
                        </div>
                      )}
                      {attendee.name}
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {tentativeCount > 0 && (
            <div className="p-3 border-b border-secondary/20">
              <h4 className="text-sm font-medium mb-2">Maybe ({tentativeCount})</h4>
              <div className="flex flex-wrap gap-2">
                {session.attendees
                  .filter(a => a.status === 'tentative')
                  .map(attendee => (
                    <div key={attendee.id} className="flex items-center gap-1.5 bg-secondary/20 px-2 py-1 rounded-md text-xs">
                      {attendee.avatar ? (
                        <img 
                          src={attendee.avatar} 
                          alt={attendee.name} 
                          className="h-4 w-4 rounded-full"
                        />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium">
                          {attendee.name.charAt(0)}
                        </div>
                      )}
                      {attendee.name}
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {declinedCount > 0 && (
            <div className="p-3">
              <h4 className="text-sm font-medium mb-2">Not Going ({declinedCount})</h4>
              <div className="flex flex-wrap gap-2">
                {session.attendees
                  .filter(a => a.status === 'declined')
                  .map(attendee => (
                    <div key={attendee.id} className="flex items-center gap-1.5 bg-secondary/20 px-2 py-1 rounded-md text-xs">
                      {attendee.avatar ? (
                        <img 
                          src={attendee.avatar} 
                          alt={attendee.name} 
                          className="h-4 w-4 rounded-full"
                        />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium">
                          {attendee.name.charAt(0)}
                        </div>
                      )}
                      {attendee.name}
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {session.attendees.length === 0 && (
            <div className="p-3 text-center text-white-500 text-sm">
              No one has RSVP'd yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;
