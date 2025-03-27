import { useState } from 'react';
import { X, Mail, Copy, Check, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock user data for search results
const mockUsers = [
  { id: '1', name: 'Alex Johnson', email: 'alex.j@example.com', avatar: null },
  { id: '2', name: 'Jamie Smith', email: 'jamie.smith@example.com', avatar: null },
  { id: '3', name: 'Taylor Wilson', email: 'taylor.w@example.com', avatar: null },
  { id: '4', name: 'Morgan Lee', email: 'morgan.lee@example.com', avatar: null },
  { id: '5', name: 'Casey Brown', email: 'casey.b@example.com', avatar: null },
];

const InviteFriendsModal = ({ isOpen, onClose }: InviteFriendsModalProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('https://studysync.app/join/ABC123XYZ');
  const [linkCopied, setLinkCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  // Filter users based on search query
  const filteredUsers = searchQuery.trim() 
    ? mockUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    
    toast({
      title: 'Link copied',
      description: 'Invite link copied to clipboard',
    });
    
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
      });
      return;
    }

    setIsInviting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Invitation sent',
        description: `Invitation email sent to ${inviteEmail}`,
      });
      
      setInviteEmail('');
    } catch (error) {
      toast({
        title: 'Failed to send invitation',
        description: 'Please try again later',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleInviteUser = (userId: string) => {
    if (invitedUsers.includes(userId)) {
      // Remove from invited list if already invited
      setInvitedUsers(invitedUsers.filter(id => id !== userId));
      
      toast({
        title: 'Invitation canceled',
        description: 'User invitation has been canceled',
      });
    } else {
      // Add to invited list
      setInvitedUsers([...invitedUsers, userId]);
      
      const user = mockUsers.find(u => u.id === userId);
      
      toast({
        title: 'User invited',
        description: `Invitation sent to ${user?.name}`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="glass w-full max-w-md rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Invite Friends</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Email Invite */}
          <div className="space-y-3">
            <Label htmlFor="email-invite">Invite via Email</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white-500" />
                <Input
                  id="email-invite"
                  type="email"
                  placeholder="friend@example.com"
                  className="pl-10"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleSendInvite} disabled={isInviting}>
                {isInviting ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>

          {/* Invite Link */}
          <div className="space-y-3">
            <Label>Share Invite Link</Label>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="bg-black/20" />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Search Users */}
          <div className="space-y-3">
            <Label htmlFor="search-users">Find People</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white-500" />
              <Input
                id="search-users"
                placeholder="Search by name or email"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {searchQuery.trim() && (
              <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-white-500">{user.email}</p>
                        </div>
                      </div>
                      <Button 
                        variant={invitedUsers.includes(user.id) ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleInviteUser(user.id)}
                      >
                        {invitedUsers.includes(user.id) ? (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Invited
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-1 h-3 w-3" />
                            Invite
                          </>
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-white-500 py-4">No users found</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsModal;
