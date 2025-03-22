import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/use-mobile';
import ThemeToggle from '@/components/ui/ThemeToggle';
import AuthModal from '@/components/auth/AuthModal';

interface NavbarProps {
  transparent?: boolean;
}

const CustomNavbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const isMobile = useMobile();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const openLoginModal = () => {
    setAuthTab('login');
    setShowAuthModal(true);
  };

  const openRegisterModal = () => {
    setAuthTab('register');
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const navLinks = [
    {
      name: 'Home',
      path: '/',
      isPrivate: false,
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      isPrivate: true,
    },
    {
      name: 'Study Groups',
      path: '/groups',
      isPrivate: true,
    },
    {
      name: 'Profile',
      path: '/profile',
      isPrivate: true,
    },
  ];

  const filteredLinks = navLinks.filter(
    link => !link.isPrivate || (link.isPrivate && isAuthenticated)
  );

  const mobileMenu = (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4">
          {filteredLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-lg py-2 hover:text-accent transition-colors ${
                isActive(link.path) ? 'text-accent font-semibold' : ''
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {isAuthenticated ? (
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="mt-4"
            >
              Logout
            </Button>
          ) : (
            <div className="flex flex-col space-y-2 mt-4">
              <Button onClick={() => {
                setIsOpen(false);
                openLoginModal();
              }}>
                Sign In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsOpen(false);
                  openRegisterModal();
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors ${
        transparent
          ? 'bg-transparent'
          : 'bg-background/80 backdrop-blur-md border-b'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
                StudySync 
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {filteredLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium hover:text-accent transition-colors ${
                    isActive(link.path) ? 'text-accent font-semibold' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Authentication buttons for desktop */}
            {!isMobile && (
              isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={openLoginModal}
                  >
                    Sign In
                  </Button>
                  <Button onClick={openRegisterModal}>
                    Sign Up
                  </Button>
                </>
              )
            )}
            
            {/* Mobile menu button */}
            {mobileMenu}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab={authTab}
      />
    </header>
  );
};

export default CustomNavbar;
