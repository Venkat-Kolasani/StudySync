
import { useState } from 'react';
import { Calendar, Clock, MapPin, AlignLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

const CreateSessionDialog = ({ open, onOpenChange, groupId }: CreateSessionDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setIsSubmitting(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('You must be signed in to create a session');
      return;
    }
    
    // Validate form
    if (!title.trim() || !date || !startTime || !endTime || !location.trim()) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    // Validate that end time is after start time
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert session into the database
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: location.trim(),
          group_id: groupId,
          host_id: user.id,
        })
        .select()
        .single();
        
      if (sessionError) throw sessionError;
      
      // Add the host as a confirmed attendee
      const { error: attendeeError } = await supabase
        .from('session_attendees')
        .insert({
          session_id: sessionData.id,
          user_id: user.id,
          status: 'confirmed',
        });
        
      if (attendeeError) {
        console.error('Failed to add host as attendee:', attendeeError);
        // Continue anyway as the session was created
      }
      
      // Success!
      toast.success('Study session created successfully');
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isSubmitting) {
        onOpenChange(newOpen);
        if (!newOpen) resetForm();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Study Session</DialogTitle>
          <DialogDescription>
            Schedule a new study session for your group
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Session Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Calculus Review Session"
                required
                className="pl-9"
              />
              <AlignLeft className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="pl-9"
                min={new Date().toISOString().split('T')[0]}
              />
              <Calendar className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium">
                Start Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="pl-9"
                />
                <Clock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="endTime" className="text-sm font-medium">
                End Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="pl-9"
                />
                <Clock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white-500" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Library Room 305 or Zoom URL"
                required
                className="pl-9"
              />
              <MapPin className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this study session will cover..."
              className="w-full min-h-[100px] px-3 py-2 text-base md:text-sm rounded-md border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          
          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionDialog;
