import { useState } from 'react';
import { X, Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string; // Optional: if creating for a specific group
}

const CreateSessionModal = ({ isOpen, onClose, groupId }: CreateSessionModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [subject, setSubject] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Get today's date in YYYY-MM-DD format for the date input min value
  const today = new Date().toISOString().split('T')[0];

  const handleCreateSession = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for your study session.',
      });
      return;
    }

    if (!date) {
      toast({
        title: 'Date required',
        description: 'Please select a date for your study session.',
      });
      return;
    }

    if (!time) {
      toast({
        title: 'Time required',
        description: 'Please select a time for your study session.',
      });
      return;
    }

    setIsCreating(true);

    try {
      // For testing purposes, using a default user ID
      const testUserId = '12345';

      // Create session data object
      const sessionData = {
        title,
        description,
        date,
        time,
        duration: parseInt(duration),
        subject,
        max_participants: parseInt(maxParticipants),
        group_id: groupId || null,
        created_by: testUserId,
        created_at: new Date().toISOString(),
        status: 'scheduled',
      };

      console.log('Creating study session:', sessionData);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Study session created',
        description: 'Your study session has been scheduled successfully.',
      });

      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Error creating study session:', error);
      toast({
        title: 'Creation failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setDuration('60');
    setSubject('');
    setMaxParticipants('10');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="glass w-full max-w-md rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Study Session</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              placeholder="E.g., Calculus Exam Prep"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
                <SelectItem value="Literature">Literature</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-white-500" />
                <Input
                  id="date"
                  type="date"
                  min={today}
                  className="pl-10"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-white-500" />
                <Input
                  id="time"
                  type="time"
                  className="pl-10"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Duration and Max Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 h-4 w-4 text-white-500" />
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="50"
                  className="pl-10"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what will be covered in this session..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none min-h-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionModal;
