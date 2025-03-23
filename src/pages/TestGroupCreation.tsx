import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import PageTransition from '@/components/shared/PageTransition';

const TestGroupCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const createTestGroup = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    try {
      // Very simple test group data
      const testGroup = {
        name: "Test Group " + new Date().toISOString(),
        description: "This is a test group",
        subject: "Computer Science",
        capacity: 10,
        is_public: true,
        subject_tags: ["test"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Try to insert
      const { data, error: insertError } = await supabase
        .from('groups')
        .insert([testGroup])
        .select();
      
      if (insertError) {
        console.error("Insert error:", insertError);
        setError(insertError);
        return;
      }
      
      setResult(data);
      console.log("Success:", data);
      
    } catch (err) {
      console.error("Error:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <main className="pt-24 pb-12 px-4 md:px-8 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Test Group Creation</h1>
            <p className="text-muted-foreground">
              This page tests direct group creation with Supabase.
            </p>
          </div>
          
          <div className="space-y-6">
            <Button 
              onClick={createTestGroup} 
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? "Creating..." : "Create Test Group"}
            </Button>
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                <h3 className="font-medium text-red-500 mb-2">Error</h3>
                <pre className="text-sm overflow-auto p-2 bg-black/50 rounded">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            )}
            
            {result && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
                <h3 className="font-medium text-green-500 mb-2">Success</h3>
                <pre className="text-sm overflow-auto p-2 bg-black/50 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default TestGroupCreation;
