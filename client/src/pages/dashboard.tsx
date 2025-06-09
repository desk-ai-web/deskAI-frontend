import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Eye, User, Download, BarChart3, Timer, Crown } from "lucide-react";
import { useLocation } from "wouter";
import type { User as UserType } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
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
      // Even if logout fails, clear cache and redirect to auth page
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/auth");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch usage statistics
  const { data: usageStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/usage-stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const subscription = user?.subscription;
  const planName = subscription?.status === 'active' ? 'Pro' : 'Free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-light to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">desk.ai</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=0066FF&color=fff`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Here's your screen health overview and account details.
          </p>
        </div>

        {/* Subscription Status */}
        <Card className="mb-8 glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-primary" />
              <span>Subscription Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                  {planName}
                </Badge>
                <span className="text-sm text-gray-600">
                  {subscription?.status === 'active' 
                    ? 'Active subscription' 
                    : 'Free plan - Upgrade to unlock all features'
                  }
                </span>
              </div>
              {subscription?.status !== 'active' && (
                <Button 
                  className="gradient-bg hover:opacity-90"
                  onClick={() => window.open('/#pricing', '_blank')}
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass border-0 hover-lift cursor-pointer" onClick={() => window.open('/downloads', '_blank')}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Download className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Download App</h3>
                  <p className="text-sm text-gray-600">Get the desktop application</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-0 hover-lift cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-secondary" />
                <div>
                  <h3 className="font-semibold">Account Settings</h3>
                  <p className="text-sm text-gray-600">Manage your profile</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-0 hover-lift cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-accent" />
                <div>
                  <h3 className="font-semibold">View Analytics</h3>
                  <p className="text-sm text-gray-600">See detailed insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Statistics */}
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : usageStats && usageStats.length > 0 ? (
              <div className="space-y-4">
                {usageStats.slice(0, 5).map((stat: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="text-sm text-gray-600">
                      {new Date(stat.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <span>{stat.sessionDuration || 0}min session</span>
                      <span>{stat.blinkCount || 0} blinks</span>
                      <span>{stat.focusSessions || 0} focus sessions</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-600 mb-4">
                  Download and start using the desk.ai app to see your screen health statistics here.
                </p>
                <Button 
                  className="gradient-bg hover:opacity-90"
                  onClick={() => window.open('/downloads', '_blank')}
                >
                  Download App
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
