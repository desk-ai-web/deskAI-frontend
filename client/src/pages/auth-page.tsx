import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

  // Redirect if already authenticated
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/dashboard";
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/dashboard";
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">desk.ai</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600">
              Sign in to your account or create a new one
            </p>
          </div>

          <Card className="glass border-0 shadow-xl">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="login" className="space-y-6">
                  {loginMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {loginMutation.error.message || "Login failed. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          {...loginForm.register("email")}
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          {...loginForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full gradient-bg"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-6">
                  {registerMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {registerMutation.error.message || "Registration failed. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-firstName"
                            placeholder="First name"
                            className="pl-10"
                            {...registerForm.register("firstName")}
                          />
                        </div>
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500 mt-1">
                            {registerForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="register-lastName">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-lastName"
                            placeholder="Last name"
                            className="pl-10"
                            {...registerForm.register("lastName")}
                          />
                        </div>
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500 mt-1">
                            {registerForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          {...registerForm.register("email")}
                        />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className="pl-10 pr-10"
                          {...registerForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full gradient-bg"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-12">
        <div className="text-center text-white max-w-lg">
          <div className="mb-8">
            <div className="relative">
              {/* Person at laptop illustration */}
              <div className="w-64 h-48 mx-auto bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-8 h-8 text-white/80" />
                  </div>
                  <div className="w-24 h-16 bg-white/20 rounded-lg mx-auto"></div>
                </div>
              </div>
              
              {/* Eye blink monitoring indicators */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                <Eye className="w-3 h-3 text-white" />
              </div>
              
              {/* Posture monitoring indicator */}
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4">
            Monitor Your Screen Habits
          </h2>
          <p className="text-lg text-white/90 mb-6">
            Track eye blinks, posture, and focus sessions with AI-powered monitoring. 
            Improve your health while maintaining productivity.
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-green-400 font-semibold">Eye Tracking</div>
              <div className="text-white/80">Real-time blink monitoring</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-blue-400 font-semibold">Posture Alert</div>
              <div className="text-white/80">Smart posture detection</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}