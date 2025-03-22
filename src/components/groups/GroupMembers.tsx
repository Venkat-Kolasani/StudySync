
import { Shield, User } from 'lucide-react';

type Member = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
};

interface GroupMembersProps {
  members: Member[];
}

const GroupMembers = ({ members }: GroupMembersProps) => {
  // Group members by role
  const admins = members.filter(member => member.role.toLowerCase() === 'admin');
  const regularMembers = members.filter(member => member.role.toLowerCase() !== 'admin');
  
  const sortedMembers = [...admins, ...regularMembers];
  
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">
        Group Members ({members.length})
      </h2>
      
      <div className="space-y-3">
        {sortedMembers.map(member => (
          <div 
            key={member.id}
            className="glass-dark rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden mr-3">
                {member.avatar ? (
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white font-medium">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-white-500">{member.role}</p>
              </div>
            </div>
            
            <div>
              {member.role.toLowerCase() === 'admin' ? (
                <Shield className="h-5 w-5 text-accent" />
              ) : (
                <User className="h-5 w-5 text-white-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupMembers;
