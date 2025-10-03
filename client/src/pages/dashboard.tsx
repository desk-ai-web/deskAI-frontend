import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { Eye, User, Download, BarChart3, Timer, Calendar, Clock, Focus, AlertTriangle, Settings, Save } from "lucide-react";
import { useLocation } from "wouter";
import { SubscriptionManager } from "@/components/subscription-manager";
import { Navigation } from "@/components/navigation";
import { useLogout } from "@/lib/authUtils";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Form states for settings
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);

  // Use centralized logout utility
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { firstName: string; lastName: string; email: string }) => {
      return await apiRequest("PUT", "/api/profile", profileData);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsSettingsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("PUT", "/api/change-password", passwordData);
    },
    onSuccess: () => {
      // Refetch user data to ensure everything is in sync
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsSettingsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  // Profile picture upload mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to upload profile picture');
        } else {
          const text = await response.text();
          
          // Check if it's an authentication error (HTML login page)
          if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            throw new Error('401: Not authenticated');
          }
          
          throw new Error('Server error occurred');
        }
      }
      
      return await response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: (error: any) => {
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Not authenticated')) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload a profile picture.",
          variant: "destructive",
        });
        // Redirect to auth page
        setLocation("/auth");
        return;
      }
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    },
  });

  // Profile picture upload handler
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload a profile picture.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingProfilePicture(true);
    try {
      await uploadProfilePictureMutation.mutateAsync(file);
    } finally {
      setIsUploadingProfilePicture(false);
      // Clear the input
      event.target.value = '';
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Add a small delay to avoid race conditions with session establishment
      const timeoutId = setTimeout(() => {
        // Double-check authentication status after delay
        if (!isAuthenticated) {
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          setLocation("/auth");
        }
      }, 1000); // Wait 1 second before redirecting

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  // Fetch usage statistics
  const { data: _usageStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/usage-stats"],
    enabled: isAuthenticated,
    retry: false,
  });
  // TODO: Use _usageStats data instead of dummyStats when real data is available

  // Dummy data for preview
  const dummyStats = [
    {
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sessionDuration: 125,
      blinkCount: 847,
      postureAlerts: 12,
      focusSessions: 3
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sessionDuration: 98,
      blinkCount: 623,
      postureAlerts: 8,
      focusSessions: 2
    },
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sessionDuration: 156,
      blinkCount: 1024,
      postureAlerts: 15,
      focusSessions: 4
    },
    {
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      sessionDuration: 87,
      blinkCount: 542,
      postureAlerts: 6,
      focusSessions: 2
    },
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sessionDuration: 134,
      blinkCount: 789,
      postureAlerts: 11,
      focusSessions: 3
    }
  ];

  // Use dummy data for now (replace with real usageStats when available)
  const displayStats = dummyStats;

  // Update form fields when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // TODO: Fetch subscription from API and use planName
  const _planName = 'Free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-light to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Here&apos;s your screen health overview and account details.
          </p>
        </div>

        {/* Compact Row Layout */}
        <div className="space-y-4 mb-8">
          {/* Subscription Status Row */}
          <div className="lg:col-span-2">
            <SubscriptionManager />
          </div>

          {/* Quick Actions Row - Compact horizontal layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="hover-lift cursor-pointer" onClick={() => window.open('/downloads', '_blank')}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm">Download App</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Get the desktop application</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-lift cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-secondary flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm">Account Settings</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Manage your profile</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-lift cursor-pointer sm:col-span-2 lg:col-span-1" onClick={() => setIsAnalyticsOpen(true)}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm">View Analytics</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">See detailed insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
            ) : displayStats && displayStats.length > 0 ? (
              <div className="space-y-3">
                {displayStats.slice(0, 5).map((stat: any, index: number) => (
                  <Card key={index} className="glass border-0 hover-lift transition-all duration-200">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                        {/* Date Section */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {new Date(stat.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {new Date(stat.date).getFullYear()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Metrics Section - Mobile: Stacked, Desktop: Horizontal */}
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
                          <div className="flex items-center gap-2 sm:gap-3 text-sm">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-blue-600 text-xs sm:text-sm">{stat.sessionDuration || 0}min</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">session</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:gap-3 text-sm">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-50 rounded-lg flex items-center justify-center">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-green-600 text-xs sm:text-sm">{stat.blinkCount || 0}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">blinks</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:gap-3 text-sm">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                              <Focus className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-purple-600 text-xs sm:text-sm">{stat.focusSessions || 0}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">focus</div>
                            </div>
                          </div>

                          {stat.postureAlerts > 0 && (
                            <div className="flex items-center gap-2 sm:gap-3 text-sm">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-orange-600 text-xs sm:text-sm">{stat.postureAlerts}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">alerts</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No activity yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
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

      {/* Analytics Modal */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Detailed Analytics</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
                         ) : displayStats && displayStats.length > 0 ? (
               <>
                 {/* Summary Cards */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                   <Card>
                     <CardContent className="pt-4 sm:pt-6">
                       <div className="text-center">
                         <div className="text-xl sm:text-2xl font-bold text-primary">
                           {displayStats.reduce((total: number, stat: any) => total + (stat.blinkCount || 0), 0)}
                         </div>
                         <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Total Blinks</div>
                       </div>
                     </CardContent>
                   </Card>
                   
                   <Card>
                     <CardContent className="pt-4 sm:pt-6">
                       <div className="text-center">
                         <div className="text-xl sm:text-2xl font-bold text-orange-500">
                           {displayStats.reduce((total: number, stat: any) => total + (stat.postureAlerts || 0), 0)}
                         </div>
                         <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Posture Alerts</div>
                       </div>
                     </CardContent>
                   </Card>
                   
                   <Card>
                     <CardContent className="pt-4 sm:pt-6">
                       <div className="text-center">
                         <div className="text-xl sm:text-2xl font-bold text-green-500">
                           {displayStats.reduce((total: number, stat: any) => total + (stat.focusSessions || 0), 0)}
                         </div>
                         <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Focus Sessions</div>
                       </div>
                     </CardContent>
                   </Card>
                 </div>

                 {/* Detailed Daily Stats */}
                 <Card>
                   <CardHeader>
                     <CardTitle>Daily Breakdown</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       {displayStats.map((stat: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-1 sm:space-y-0">
                            <div className="font-semibold text-sm sm:text-base">
                              {new Date(stat.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              {stat.sessionDuration || 0} min session
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                            <div className="flex items-center justify-between sm:flex-col sm:text-center p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                              <div className="flex items-center space-x-2 sm:space-x-0 sm:flex-col">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center sm:mb-1">
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                </div>
                                <div className="sm:text-center">
                                  <div className="text-base sm:text-lg font-bold text-blue-600">{stat.blinkCount || 0}</div>
                                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Blinks</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:flex-col sm:text-center p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                              <div className="flex items-center space-x-2 sm:space-x-0 sm:flex-col">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-50 rounded-lg flex items-center justify-center sm:mb-1">
                                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                                </div>
                                <div className="sm:text-center">
                                  <div className="text-base sm:text-lg font-bold text-orange-500">{stat.postureAlerts || 0}</div>
                                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Bad Posture</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:flex-col sm:text-center p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                              <div className="flex items-center space-x-2 sm:space-x-0 sm:flex-col">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-50 rounded-lg flex items-center justify-center sm:mb-1">
                                  <Focus className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                </div>
                                <div className="sm:text-center">
                                  <div className="text-base sm:text-lg font-bold text-green-500">{stat.focusSessions || 0}</div>
                                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Focus Sessions</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No analytics data available</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Start using the desk.ai app to generate analytics data about your screen health.
                </p>
                <Button 
                  className="gradient-bg hover:opacity-90"
                  onClick={() => {
                    setIsAnalyticsOpen(false);
                    window.open('/downloads', '_blank');
                  }}
                >
                  Download App
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>Account Settings</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="text-center">
              <div className="relative mx-auto mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={`${user.firstName}'s profile picture`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide the image and show fallback if it fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.opacity = '1';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary items-center justify-center text-white text-2xl font-bold">
                      {firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : 
                       user?.firstName && user?.lastName ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` :
                       user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  {/* Fallback div that shows when image fails to load */}
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold absolute inset-0 opacity-0">
                    {firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : 
                     user?.firstName && user?.lastName ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` :
                     user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                
                {/* Upload button - positioned relative to profile picture */}
                {!user?.googleId && isAuthenticated && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-white border-2 border-gray-200 hover:border-primary shadow-md"
                    onClick={() => document.getElementById('profile-picture-input')?.click()}
                    disabled={isUploadingProfilePicture}
                    title={isUploadingProfilePicture ? "Uploading..." : `Change ${user?.firstName}'s profile picture`}
                  >
                    {isUploadingProfilePicture ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </Button>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                {user?.googleId ? `${user.firstName}'s profile picture` : 
                 !isAuthenticated ? 'Please log in to upload' :
                 isUploadingProfilePicture ? 'Uploading...' : `${user?.firstName || 'User'}'s profile picture`}
              </p>
              
              {/* Hidden file input for profile picture upload */}
              {!user?.googleId && isAuthenticated && (
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleProfilePictureUpload(e)}
                />
              )}
            </div>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password Section - Only show if user has password (no Google auth) */}
            {user?.password && !user?.googleId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Account Type Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login Method</p>
                    <p className="text-sm text-gray-600">
                      {user?.googleId ? 'Google OAuth' : 'Email & Password'}
                    </p>
                    {user?.googleId && (
                      <p className="text-xs text-orange-600 mt-1">
                        Password removed when Google account was linked
                      </p>
                    )}
                  </div>
                  <Badge variant={user?.googleId ? 'default' : 'secondary'}>
                    {user?.googleId ? 'Google' : 'Email'}
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div>
                  <p className="font-medium">Member Since</p>
                  <p className="text-sm text-gray-600">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsSettingsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="gradient-bg hover:opacity-90"
                disabled={updateProfileMutation.isPending || changePasswordMutation.isPending}
                onClick={async () => {
                  // Validate form
                  if (!firstName || !lastName || !email) {
                    toast({
                      title: "Validation Error",
                      description: "Please fill in all required fields",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Validate password if provided (only for users with password, no Google auth)
                  const shouldChangePassword = user?.password && !user?.googleId && currentPassword && newPassword;
                  if (shouldChangePassword) {
                    if (newPassword !== confirmPassword) {
                      toast({
                        title: "Password Validation Error",
                        description: "New passwords do not match",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (newPassword.length < 6) {
                      toast({
                        title: "Password Validation Error",
                        description: "Password must be at least 6 characters long",
                        variant: "destructive",
                      });
                      return;
                    }
                  }

                  try {
                    // Update profile first
                    await updateProfileMutation.mutateAsync({ firstName, lastName, email });
                    
                    // Then change password if needed
                    if (shouldChangePassword) {
                      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
                    }
                    
                    // Close modal after both operations complete
                    if (!shouldChangePassword) {
                      setIsSettingsOpen(false);
                    }
                  } catch (error) {
                    // Error handling is already done in the individual mutations
                    // Silent fail - errors are already shown to user via mutations
                  }
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending || changePasswordMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
