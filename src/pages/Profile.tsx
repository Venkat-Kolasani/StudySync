
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Navbar from '@/components/layout/Navbar';
import ProfileCard from '@/components/profile/ProfileCard';
import PageTransition from '@/components/shared/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type StudyGroup = {
  id: string;
  name: string;
  subject: string;
  memberCount: number;
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userGroups, setUserGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateProfile, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Fetch user's study groups
    const fetchUserGroups = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get groups the user is a member of
        const { data: memberGroups, error: groupsError } = await supabase
          .from('group_members')
          .select(`
            group:group_id (
              id,
              name,
              subject
            )
          `)
          .eq('user_id', user.id);
          
        if (groupsError) throw groupsError;
        
        // Get member count for each group
        const groupPromises = memberGroups.map(async (item) => {
          const group = item.group;
          
          const { count, error: countError } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);
            
          return {
            id: group.id,
            name: group.name,
            subject: group.subject,
            memberCount: count || 0,
          };
        });
        
        const userGroupsData = await Promise.all(groupPromises);
        setUserGroups(userGroupsData);
      } catch (error) {
        console.error('Failed to fetch user groups:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchUserGroups();
    }
  }, [user, isAuthenticated]);
  
  // If user is not authenticated, show a message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <PageTransition>
          <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
              <p className="text-white-500 mb-8">
                Please sign in to view your profile.
              </p>
            </div>
          </main>
        </PageTransition>
      </div>
    );
  }
  
  // User profile data from auth context
  const userProfile = {
    id: user?.id || '1',
    name: user?.name || 'Loading...',
    avatar: user?.avatar,
    academicLevel: user?.academicLevel || 'Student',
    joinedDate: new Date(user?.id ? parseInt(user.id.split('-')[0], 16) * 1000 : Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    location: 'Not specified',
    bio: user?.bio || 'No bio added yet.',
    interests: user?.subjectInterests || [],
    expertise: [],
    studyPreferences: user?.studyPreferences || {
      timeOfDay: 'Any time',
      groupSize: 'Small (3-5)',
    },
  };
  
  const handleProfileUpdate = async (data: any) => {
    try {
      // Map the form data to the profile structure
      await updateProfile({
        name: data.name,
        bio: data.bio,
        academicLevel: data.academicLevel,
        subjectInterests: data.interests,
        studyPreferences: {
          timeOfDay: data.timeOfDay,
          groupSize: typeof data.groupSize === 'string' ? 
            parseInt(data.groupSize) : data.groupSize,
        },
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <PageTransition>
        <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <ProfileCard 
              profile={userProfile} 
              isCurrentUser={true} 
              onUpdate={handleProfileUpdate}
            />
            
            <div className="mt-8">
              <Tabs 
                defaultValue={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="groups">Study Groups</TabsTrigger>
                  <TabsTrigger value="resources">Shared Resources</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-8">
                  <section className="glass rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">About Me</h2>
                    <p className="text-white-500">
                      {user?.bio || 'No bio information added yet. Edit your profile to add more about yourself.'}
                    </p>
                  </section>
                  
                  <section className="glass rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">Academic Background</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">{user?.academicLevel || 'Academic level not specified'}</h3>
                        <p className="text-white-500">Update your profile to add more details about your education.</p>
                      </div>
                    </div>
                  </section>
                </TabsContent>
                
                <TabsContent value="groups">
                  {isLoading ? (
                    <div className="glass rounded-xl p-6 flex items-center justify-center h-64">
                      <p className="text-white-500">Loading your study groups...</p>
                    </div>
                  ) : userGroups.length > 0 ? (
                    <div className="glass rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-4">Your Study Groups</h2>
                      <div className="grid gap-4">
                        {userGroups.map(group => (
                          <div key={group.id} className="glass-dark rounded-lg p-4">
                            <h3 className="font-medium text-lg">{group.name}</h3>
                            <p className="text-white-500 text-sm mb-2">{group.subject}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-white-500">{group.memberCount} members</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild
                              >
                                <Link to={`/groups/${group.id}`}>View Group</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="glass rounded-xl p-6 text-center py-12">
                      <h2 className="text-xl font-bold mb-2">No Study Groups Yet</h2>
                      <p className="text-white-500 mb-6">
                        You haven't joined any study groups yet. Explore available groups or create your own.
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild>
                          <Link to="/groups">Browse Groups</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link to="/groups/create">Create a Group</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="resources">
                  <div className="glass rounded-xl p-6 text-center py-12">
                    <h2 className="text-xl font-bold mb-2">No Resources Shared</h2>
                    <p className="text-white-500 mb-6">
                      You haven't shared any study resources yet. Upload notes, documents, or links to helpful content.
                    </p>
                    <Button>Upload Resources</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Profile;
