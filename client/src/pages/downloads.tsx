import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Monitor, Smartphone, Apple, AppWindow, Laptop } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/navigation";
import { getApiUrl } from "@/config";
// Note: Link is available but not currently used
// import { Link } from "wouter";

interface OSInfo {
  os: string;
  userAgent: string;
}

export default function Downloads() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const queryClient = useQueryClient();

  // Detect OS
  const { data: osInfo } = useQuery<OSInfo>({
    queryKey: [getApiUrl("/api/detect-os")],
  });

  // Set default platform based on detected OS
  useEffect(() => {
    if (osInfo?.os && osInfo.os !== 'unknown') {
      setSelectedPlatform(osInfo.os);
    } else {
      // Default fallback - try to detect OS client-side if server detection fails
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
        setSelectedPlatform('mac');
      } else if (userAgent.includes('Windows')) {
        setSelectedPlatform('windows');
      } else if (userAgent.includes('Linux')) {
        setSelectedPlatform('linux');
      } else {
        setSelectedPlatform('mac'); // Default to Mac since user is on Mac
      }
    }
  }, [osInfo]);

  // Track download mutation
  const trackDownloadMutation = useMutation({
    mutationFn: async (platform: string) => {
      await apiRequest('POST', getApiUrl('/api/downloads'), {
        platform,
        version: '1.0.0'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getApiUrl('/api/downloads/stats')] });
    },
  });

  const handleDownload = (platform: string) => {
    // Track the download
    trackDownloadMutation.mutate(platform);
    
    // Simulate download - in a real app, this would be actual download links
    const downloadUrls = {
      mac: 'https://releases.deskflow.app/DeskFlow-1.0.0.dmg',
      windows: 'https://releases.deskflow.app/DeskFlow-1.0.0.exe',
      linux: 'https://releases.deskflow.app/DeskFlow-1.0.0.AppImage'
    };
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrls[platform as keyof typeof downloadUrls] || '#';
    link.download = `DeskFlow-${platform}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const platforms = [
    {
      id: 'mac',
      name: 'macOS',
      icon: Apple,
      requirements: 'macOS 10.14 or later',
      size: '45 MB',
      description: 'Native Apple Silicon and Intel support'
    },
    {
      id: 'windows',
      name: 'Windows',
      icon: AppWindow,
      requirements: 'Windows 10 or later',
      size: '38 MB',
      description: 'Works with Windows 10 and 11'
    },
    {
      id: 'linux',
      name: 'Linux',
      icon: Laptop,
      requirements: 'Ubuntu 18.04+ or equivalent',
      size: '42 MB',
      description: 'AppImage format for universal compatibility'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light to-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Download <span className="gradient-text">desk.ai</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get the desktop application and start improving your screen habits in minutes. 
            Available for all major operating systems.
          </p>
          
          {osInfo?.os && osInfo.os !== 'unknown' && (
            <div className="flex items-center justify-center space-x-2 mb-8">
              <Badge variant="secondary">
                Detected: {osInfo.os === 'mac' ? 'macOS' : osInfo.os === 'windows' ? 'Windows' : 'Linux'}
              </Badge>
            </div>
          )}
        </div>

        {/* Platform Selection */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {platforms.map((platform) => {
            const IconComponent = platform.icon;
            const isSelected = selectedPlatform === platform.id;
            const isRecommended = osInfo?.os === platform.id;
            
            return (
              <Card 
                key={platform.id}
                className={`glass border-0 hover-lift cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPlatform(platform.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <IconComponent className="w-8 h-8 text-primary" />
                      <span>{platform.name}</span>
                    </CardTitle>
                    {isRecommended && (
                      <Badge className="gradient-bg">Recommended</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{platform.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Requirements:</span>
                      <span className="font-medium">{platform.requirements}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Download size:</span>
                      <span className="font-medium">{platform.size}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Download Button */}
        <div className="text-center mb-12">
          <Button
            size="lg"
            className="gradient-bg hover:opacity-90 text-lg px-8 py-4"
            onClick={() => handleDownload(selectedPlatform)}
            disabled={trackDownloadMutation.isPending}
          >
            <Download className="w-5 h-5 mr-2" />
            {trackDownloadMutation.isPending ? 'Starting Download...' : `Download for ${
              platforms.find(p => p.id === selectedPlatform)?.name || 'Selected Platform'
            }`}
          </Button>
          
          <p className="text-sm text-gray-600 mt-4">
            Free to download • No credit card required • Start improving your habits today
          </p>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-8">What you&apos;ll get with desk.ai</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Smart Tracking</h3>
              <p className="text-sm text-gray-600">AI-powered detection of your screen habits</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Gentle Reminders</h3>
              <p className="text-sm text-gray-600">Non-intrusive notifications that adapt to your workflow</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-gray-600">All data stays on your device - completely private</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center mx-auto mb-4">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Cross Platform</h3>
              <p className="text-sm text-gray-600">Works seamlessly across all your devices</p>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">System Requirements</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <Apple className="w-5 h-5" />
                <span>macOS</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• macOS 10.14 (Mojave) or later</li>
                <li>• Intel or Apple Silicon processor</li>
                <li>• 100 MB free disk space</li>
                <li>• Webcam (built-in or external)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <AppWindow className="w-5 h-5" />
                <span>Windows</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Windows 10 (v1903) or later</li>
                <li>• x64 processor</li>
                <li>• 100 MB free disk space</li>
                <li>• Webcam (built-in or external)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <Laptop className="w-5 h-5" />
                <span>Linux</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Ubuntu 18.04+ or equivalent</li>
                <li>• x64 processor</li>
                <li>• 100 MB free disk space</li>
                <li>• Webcam (built-in or external)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
