
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '@/contexts/AuthContext';

export interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onOpenChange,
  defaultTab = 'login',
}) => {
  const [activeTab, setActiveTab] = React.useState<'login' | 'register'>(defaultTab);
  const { isAuthenticated, isLoading } = useAuth();

  // Make sure to update the tab state when defaultTab changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Close modal if user is authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onOpenChange(false);
    }
  }, [isAuthenticated, isOpen, onOpenChange]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'login' | 'register');
  };

  const handleSuccess = () => {
    if (activeTab === 'register') {
      setActiveTab('login');
    }
    // For login success, the useEffect above will close the modal
    // when isAuthenticated becomes true
  };

  const handleSwitchToRegister = () => {
    setActiveTab('register');
  };

  const handleSwitchToLogin = () => {
    setActiveTab('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {activeTab === 'login' 
              ? 'Sign in to your account to continue'
              : 'Create a new account to get started'
            }
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm 
              onSuccess={handleSuccess} 
              onSwitchToRegister={handleSwitchToRegister}
            />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm 
              onSuccess={handleSuccess} 
              onSwitchToLogin={handleSwitchToLogin}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
