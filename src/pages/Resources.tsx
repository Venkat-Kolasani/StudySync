
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/layout/Navbar';
import PageTransition from '@/components/shared/PageTransition';
import FileUpload, { UploadedFile } from '@/components/resources/FileUpload';
import ResourceGrid from '@/components/resources/ResourceGrid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Resources = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resources, setResources] = useState<UploadedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchResources = async () => {
      if (!groupId) return;
      
      try {
        setIsLoading(true);
        
        // Get resources for this group
        const { data, error } = await supabase
          .from('resources')
          .select(`
            *,
            profiles:user_id(name)
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform to the format expected by ResourceGrid
        const formattedResources: UploadedFile[] = data.map((resource: any) => ({
          id: resource.id,
          name: resource.title,
          size: 1024 * 1024, // Default to 1MB if size not available
          type: resource.file_type,
          url: resource.file_url,
          thumbnailUrl: resource.file_type.startsWith('image/') ? resource.file_url : undefined,
          uploadedAt: new Date(resource.created_at),
          uploadedBy: {
            id: resource.user_id,
            name: resource.profiles?.name || 'Unknown User',
          },
        }));
        
        setResources(formattedResources);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        toast.error('Failed to load resources');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (groupId) {
      fetchResources();
    }
  }, [groupId]);
  
  const handleUploadComplete = (file: UploadedFile) => {
    setResources(prev => [file, ...prev]);
  };
  
  const handleDeleteResource = (fileId: string) => {
    setResources(prev => prev.filter(resource => resource.id !== fileId));
  };
  
  const filteredResources = resources
    .filter(resource => {
      // Filter by search query
      if (searchQuery && !resource.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by file type
      if (activeTab === 'documents' && 
          !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
          .includes(resource.type)) {
        return false;
      }
      
      if (activeTab === 'images' && !resource.type.startsWith('image/')) {
        return false;
      }
      
      return true;
    });
  
  // Check if user is a member of this group
  const [isGroupMember, setIsGroupMember] = useState(false);
  
  useEffect(() => {
    const checkGroupMembership = async () => {
      if (!groupId || !user) {
        setIsGroupMember(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        setIsGroupMember(!!data);
      } catch (error) {
        console.error('Failed to check group membership:', error);
        setIsGroupMember(false);
      }
    };
    
    checkGroupMembership();
  }, [groupId, user]);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <PageTransition>
        <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Button 
                variant="ghost" 
                className="mb-4" 
                onClick={() => navigate(`/groups/${groupId}`)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Group
              </Button>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Group Resources</h1>
                  <p className="text-white-500 mt-1">
                    Share study materials with your group members
                  </p>
                </div>
              </div>
            </div>
            
            {!isGroupMember ? (
              <div className="glass rounded-xl p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">
                  Join the group to access resources
                </h2>
                <p className="text-white-500 mb-4">
                  You need to be a member of this study group to view and share resources.
                </p>
                <Button onClick={() => navigate(`/groups/${groupId}`)}>
                  Go to Group
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <FileUpload 
                    groupId={groupId || ''} 
                    onUploadComplete={handleUploadComplete} 
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <div className="glass rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search resources..."
                          className="pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <Tabs 
                        defaultValue={activeTab} 
                        onValueChange={setActiveTab}
                        className="w-full sm:w-auto"
                      >
                        <TabsList>
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="documents">Documents</TabsTrigger>
                          <TabsTrigger value="images">Images</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    
                    {isLoading ? (
                      <div className="text-center py-8">
                        <p className="text-white-500">Loading resources...</p>
                      </div>
                    ) : (
                      <ResourceGrid 
                        resources={filteredResources} 
                        onDelete={handleDeleteResource} 
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Resources;
