
import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';

export const AuthButtons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'login' | 'register'>('login');
  const { isAuthenticated, user } = useAuth();

  const openLogin = () => {
    setDefaultTab('login');
    setIsModalOpen(true);
  };

  const openRegister = () => {
    setDefaultTab('register');
    setIsModalOpen(true);
  };

  if (isAuthenticated && user) {
    return null; // Don't show auth buttons if user is logged in
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openLogin}
          className="hidden sm:flex"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </Button>
        
        <Button 
          size="sm" 
          onClick={openRegister}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Sign Up
        </Button>
      </div>

      <AuthModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        defaultTab={defaultTab}
      />
    </>
  );
};

export default AuthButtons;
