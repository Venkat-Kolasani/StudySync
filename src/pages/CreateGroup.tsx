
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import PageTransition from '@/components/shared/PageTransition';
import GroupForm from '@/components/groups/GroupForm';

const CreateGroup = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateGroup = async (formData: any) => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to create a group.',
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create new group with submitted data
      const { data: group, error } = await supabase
        .from('groups')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            subject: formData.subject,
            capacity: formData.capacity,
            is_public: !formData.isPrivate,
            subject_tags: formData.tags,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating group:', error);
        throw error;
      }

      console.log('Group created:', group);

      // Add the current user as a member of the group with 'admin' role
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([
          {
            user_id: user.id,
            group_id: group.id,
            role: 'admin',
            joined_at: new Date().toISOString(),
          },
        ]);

      if (memberError) {
        console.error('Error adding user as member:', memberError);
        throw memberError;
      }

      toast({
        title: 'Group created!',
        description: 'You have successfully created a new study group.',
      });
      navigate(`/groups/${group.id}`);
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast({
        title: 'Failed to create group',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <PageTransition>
          <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
              <p className="text-white-500 mb-8">
                Please sign in to create a study group.
              </p>
              <Button onClick={() => navigate('/login')}>Sign In</Button>
            </div>
          </main>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <main className="pt-24 pb-12 px-4 md:px-8 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create a New Study Group</h1>
            <p className="text-muted-foreground">
              Fill out the form below to create your study group.
            </p>
          </div>
          
          <GroupForm onSubmit={handleCreateGroup} isSubmitting={isCreating} />
        </main>
      </PageTransition>
    </div>
  );
};

export default CreateGroup;
