import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLogout } from "@/lib/authUtils";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  
  // Use centralized logout utility
  const logoutMutation = useLogout();

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
          <Link href="/" className="flex items-center space-x-2 cursor-pointer">
            <img
              src="/icon_with_background.png"
              alt="desk.ai icon"
              className="w-8 h-8"
              loading="lazy"
            />
            <span className="text-xl font-bold gradient-text">desk.ai</span>
          </Link>
          
          {/* Desktop Navigation */}
          {location === "/" && (
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-3 py-2 rounded-md transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-3 py-2 rounded-md transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-3 py-2 rounded-md transition-colors"
              >
                FAQ
              </button>
            </div>
          )}
          
          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
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
                  variant="outline"
                  onClick={() => setLocation('/dashboard')}
                  className="border-blue-600/30 dark:border-blue-400/40 bg-white/70 dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 shadow-sm"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400"
                >
                  {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/auth')}
                  className="border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400"
                >
                  Sign In
                </Button>
                <Button 
                  className="gradient-bg hover:opacity-90"
                  onClick={() => location === "/" ? setLocation('/downloads') : setLocation('/auth')}
                >
                  {location === "/" ? "Download" : "Get Started"}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
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
            {location === "/" && (
              <>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="block w-full text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors py-2 px-3"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="block w-full text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors py-2 px-3"
                >
                  Pricing
                </button>
                                  <button 
                  onClick={() => scrollToSection('faq')}
                  className="block w-full text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors py-2 px-3"
                >
                  FAQ
                </button>
              </>
            )}
            <div className="pt-4 border-t space-y-2">
              <ThemeToggle />
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
                    className="w-full hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400"
                    onClick={() => setLocation('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400"
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
                    className="w-full hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400"
                    onClick={() => setLocation('/auth')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full gradient-bg hover:opacity-90"
                    onClick={() => setLocation('/downloads')}
                  >
                    Download
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
