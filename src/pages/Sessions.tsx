
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/layout/Navbar';
import PageTransition from '@/components/shared/PageTransition';
import SessionCalendar from '@/components/sessions/SessionCalendar';
import SessionList from '@/components/sessions/SessionList';
import CreateSessionDialog from '@/components/sessions/CreateSessionDialog';

const Sessions = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calendar');
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  
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
                  <h1 className="text-3xl font-bold">Study Sessions</h1>
                  <p className="text-white-500 mt-1">
                    Schedule and manage study sessions with your group
                  </p>
                </div>
                
                <Button onClick={() => setCreateSessionOpen(true)}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Create Session
                </Button>
              </div>
            </div>
            
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar" className="mt-6">
                <SessionCalendar groupId={groupId || ''} />
              </TabsContent>
              
              <TabsContent value="list" className="mt-6">
                <SessionList groupId={groupId || ''} />
              </TabsContent>
            </Tabs>
          </div>
          
          <CreateSessionDialog 
            open={createSessionOpen}
            onOpenChange={setCreateSessionOpen}
            groupId={groupId || ''}
          />
        </main>
      </PageTransition>
    </div>
  );
};

export default Sessions;
