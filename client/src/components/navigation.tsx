import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Menu, X, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/auth");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/auth");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass blur-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">desk.ai</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              FAQ
            </button>
          </div>
          
          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <img 
                    src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=0066FF&color=fff`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                </div>
                <Button 
                  variant="ghost"
                  onClick={() => setLocation('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  className="gradient-bg hover:opacity-90"
                  onClick={() => setLocation('/auth')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass blur-effect border-t">
          <div className="px-4 py-4 space-y-4">
            <button 
              onClick={() => scrollToSection('features')}
              className="block w-full text-left text-gray-600 hover:text-primary transition-colors py-2"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="block w-full text-left text-gray-600 hover:text-primary transition-colors py-2"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left text-gray-600 hover:text-primary transition-colors py-2"
            >
              FAQ
            </button>
            <div className="pt-4 border-t space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 py-2">
                    <img 
                      src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=0066FF&color=fff`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation('/auth')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full gradient-bg hover:opacity-90"
                    onClick={() => setLocation('/auth')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
