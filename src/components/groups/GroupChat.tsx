
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';

interface Message {
  id: string;
  content: string;
  user_id: string;
  group_id: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar: string | null;
  };
}

interface GroupChatProps {
  groupId: string;
  isJoined: boolean;
}

const GroupChat = ({ groupId, isJoined }: GroupChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Load initial messages
  useEffect(() => {
    if (!groupId || !isJoined) return;
    
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        
        // Get messages first
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select(`*`)
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Then fetch user profiles for each message
        const messagesWithProfiles = await Promise.all(
          (messagesData || []).map(async (message) => {
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('name, avatar')
              .eq('id', message.user_id)
              .single();
            
            if (profileError) {
              console.error('Error fetching profile', profileError);
              return { ...message, profiles: { name: 'Unknown User', avatar: null } };
            }
            
            return {
              ...message,
              profiles: profile
            } as Message;
          })
        );
        
        setMessages(messagesWithProfiles);
        
        // Scroll to bottom after messages load
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast.error('Failed to load chat messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [groupId, isJoined]);
  
  // Subscribe to new messages using our hook
  useSupabaseRealtime(
    {
      table: 'messages',
      event: 'INSERT',
      filter: `group_id=eq.${groupId}`,
      schema: 'public'
    },
    async (payload) => {
      try {
        // Get user details for the new message
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, avatar')
          .eq('id', payload.new.user_id)
          .single();
          
        if (profileError) throw profileError;
        
        // Add the new message to the list
        const newMsg = {
          ...payload.new,
          profiles: profile
        } as Message;
        
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    }
  );
  
  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !groupId) return;
    
    setIsSending(true);
    try {
      // Insert the message into the database
      const { error } = await supabase
        .from('messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: newMessage.trim(),
        });
        
      if (error) throw error;
      
      // Clear the input field
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  if (!isJoined) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Join the group to participate in discussions</h2>
        <p className="text-white-500">
          You need to be a member of this study group to view and send messages.
        </p>
      </div>
    );
  }
  
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Group Discussion</h2>
      
      <div className="h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 glass-dark rounded-lg p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white-500">No messages yet. Be the first to say something!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex gap-3 ${message.user_id === user?.id ? 'justify-end' : ''}`}
                >
                  {message.user_id !== user?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.profiles?.avatar || undefined} />
                      <AvatarFallback>
                        {message.profiles?.name ? message.profiles.name.charAt(0) : '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] ${message.user_id === user?.id ? 'ml-auto' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.user_id !== user?.id && (
                        <p className="text-sm font-medium">{message.profiles?.name || 'Unknown User'}</p>
                      )}
                      <p className="text-xs text-white-500">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div 
                      className={`rounded-lg px-3 py-2 ${
                        message.user_id === user?.id 
                          ? 'bg-accent/20 text-white' 
                          : 'glass-dark'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                  
                  {message.user_id === user?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="relative">
          <Textarea
            placeholder="Type your message here..."
            className="min-h-[80px] pr-16"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <Button 
            size="icon"
            className="absolute bottom-2 right-2 rounded-full"
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
