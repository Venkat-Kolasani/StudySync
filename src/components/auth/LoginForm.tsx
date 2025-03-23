import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Github, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm = ({ onSuccess, onSwitchToRegister }: LoginFormProps) => {
  const [localLoading, setLocalLoading] = useState(false);
  const { toast } = useToast();
  const { login, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // Only consider localLoading for button state
  // This fixes the issue where the button shows "Signing in..." without user action
  const isLoading = localLoading;
  
  // If user becomes authenticated, call onSuccess
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User authenticated, redirecting...");
      onSuccess();
    }
  }, [isAuthenticated, onSuccess]);
  
  // Clear the loading state when component unmounts
  useEffect(() => {
    return () => setLocalLoading(false);
  }, []);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    if (localLoading) return; // Prevent multiple submissions
    
    setLocalLoading(true);
    try {
      const result = await login(data.email, data.password);
      console.log("Login successful, calling onSuccess directly");
      
      // Call onSuccess directly after successful login
      // This ensures navigation happens even if the isAuthenticated state update is delayed
      onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show user-friendly error message
      toast({
        title: "Login failed",
        description: error?.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (localLoading) return; // Prevent multiple submissions
    
    setLocalLoading(true);
    try {
      // Simulate API call
      console.log(`Login with ${provider}`);
      
      toast({
        title: "Coming soon!",
        description: `${provider} login will be available soon.`,
      });
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: `Your ${provider} login request failed. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email-input">Email</FormLabel>
                <FormControl>
                  <Input id="email-input" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password-input">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="password-input"
                      type="password" 
                      className="pl-10 focus-ring" 
                      placeholder="********" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading}
          onClick={() => handleSocialLogin('GitHub')}
          className="focus-ring"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Button 
          variant="link" 
          className="p-0 h-auto text-accent hover:text-accent/80"
          onClick={onSwitchToRegister}
          disabled={isLoading}
        >
          Sign up
        </Button>
      </p>
    </div>
  );
};

export default LoginForm;
