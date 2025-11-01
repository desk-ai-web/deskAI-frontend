import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Monitor,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Redirect, useLocation } from 'wouter';
import { Navigation } from '@/components/navigation';
import { getApiUrl } from '@/config';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Check for OAuth errors in URL
  const urlParams = new URLSearchParams(window.location.search);
  const oauthError = urlParams.get('error');

  // Check if this is a desktop authentication request
  const fromDesktop = urlParams.get('from') === 'desktop';
  const state = urlParams.get('state');
  const redirectUri = urlParams.get('redirect_uri');

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  // Try to finalize desktop flow immediately using session (works for Google OAuth)
  useEffect(() => {
    async function tryImmediateFinalize() {
      if (!(fromDesktop && state)) return;
      const guardKey = `desktop-finalized-${state}`;
      // If we already finalized (or are in-progress), don't start another
      if (sessionStorage.getItem(guardKey)) return;
      try {
        sessionStorage.setItem(guardKey, 'in-progress');
        const payload: any = { state };
        if (redirectUri) payload.redirect_uri = redirectUri;
        const resp = await apiRequest(
          'POST',
          getApiUrl('/api/auth/desktop/callback'),
          payload
        );
        const data = await resp.json();
        const url = data?.data?.url as string | undefined;
        const token = data?.data?.token as string | undefined;
        if (url) {
          sessionStorage.setItem(guardKey, '1');
          window.location.href = url;
          return;
        }
        if (!url && token && redirectUri) {
          const sep = redirectUri.includes('?') ? '&' : '?';
          sessionStorage.setItem(guardKey, '1');
          window.location.href = `${redirectUri}${sep}token=${encodeURIComponent(
            token
          )}&state=${encodeURIComponent(state)}`;
          return;
        }
        if (import.meta.env.MODE === 'development') {
          console.warn('Immediate desktop finalize had no URL', data);
        }
        sessionStorage.removeItem(guardKey);
      } catch (e: any) {
        // If unauthorized, user still needs to sign in (session not present);
        // remove guard so later flows can retry after login
        if (import.meta.env.MODE === 'development') {
          console.warn('Immediate desktop finalize failed', e?.message || e);
        }
        sessionStorage.removeItem(guardKey);
      }
    }
    tryImmediateFinalize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDesktop, state, redirectUri]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await apiRequest('POST', getApiUrl('/api/v2/login'), data);
      const json = await res.json();
      // Persist JWT for future requests
      if (json?.data?.token) {
        localStorage.setItem('deskai_jwt', json.data.token);
      }
      return json;
    },
    onSuccess: async () => {
      // Wait for user data to be loaded before redirecting
      await queryClient.invalidateQueries({
        queryKey: [getApiUrl('/api/v2/user/data')],
      });
      await queryClient.refetchQueries({
        queryKey: [getApiUrl('/api/v2/user/data')],
      });

      // If from desktop, request deep link from server and navigate
      if (fromDesktop && state) {
        const guardKey = `desktop-finalized-${state}`;
        if (sessionStorage.getItem(guardKey)) {
          // Already finalized or in-progress
          return setLocation('/dashboard');
        }
        try {
          sessionStorage.setItem(guardKey, 'in-progress');
          const payload: any = { state };
          if (redirectUri) payload.redirect_uri = redirectUri;
          const callbackRes = await apiRequest(
            'POST',
            getApiUrl('/api/auth/desktop/callback'),
            payload
          );
          const data = await callbackRes.json();
          const url = data?.data?.url as string | undefined;
          const token = data?.data?.token as string | undefined;
          if (url) {
            sessionStorage.setItem(guardKey, '1');
            window.location.href = url;
            return;
          }
          // Fallback: construct URL locally if server returned token but no URL
          if (!url && token && redirectUri) {
            const sep = redirectUri.includes('?') ? '&' : '?';
            sessionStorage.setItem(guardKey, '1');
            window.location.href = `${redirectUri}${sep}token=${encodeURIComponent(
              token
            )}&state=${encodeURIComponent(state)}`;
            return;
          }
          if (import.meta.env.MODE === 'development') {
            console.warn('Desktop callback did not return URL', data);
          }
        } catch (e) {
          if (import.meta.env.MODE === 'development') {
            console.error('Desktop callback error (login flow):', e);
          }
          // fallback to normal
          sessionStorage.removeItem(guardKey);
        }
      }
      {
        // Normal web flow
        setLocation('/dashboard');
      }
    },
    onError: (error: any) => {
      // Log errors in development only
      if (import.meta.env.MODE === 'development') {
        console.error('Login error:', error);
      }
      // Extract meaningful error message from server response
      let displayMessage = 'Login failed. Please try again.';

      if (error.message) {
        if (error.message.includes(':')) {
          const serverMessage = error.message
            .split(':')
            .slice(1)
            .join(':')
            .trim();
          if (serverMessage) {
            displayMessage = serverMessage;
          }
        } else if (error.message.includes('Invalid email or password')) {
          displayMessage =
            'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('License expired')) {
          displayMessage =
            'Your trial has expired. Please contact support or start a new subscription.';
        } else {
          displayMessage = error.message;
        }
      }

      error.displayMessage = displayMessage;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest('POST', getApiUrl('/api/v2/register'), data);
      const json = await res.json();
      // Persist JWT for future requests
      if (json?.data?.token) {
        localStorage.setItem('deskai_jwt', json.data.token);
      }
      return json;
    },
    onSuccess: async () => {
      // Wait for user data to be loaded before redirecting
      await queryClient.invalidateQueries({
        queryKey: [getApiUrl('/api/v2/user/data')],
      });
      await queryClient.refetchQueries({
        queryKey: [getApiUrl('/api/v2/user/data')],
      });

      // If from desktop, request deep link from server and navigate
      if (fromDesktop && state) {
        const guardKey = `desktop-finalized-${state}`;
        if (sessionStorage.getItem(guardKey)) {
          return setLocation('/dashboard');
        }
        try {
          sessionStorage.setItem(guardKey, 'in-progress');
          const payload: any = { state };
          if (redirectUri) payload.redirect_uri = redirectUri;
          const callbackRes = await apiRequest(
            'POST',
            getApiUrl('/api/auth/desktop/callback'),
            payload
          );
          const data = await callbackRes.json();
          const url = data?.data?.url as string | undefined;
          const token = data?.data?.token as string | undefined;
          if (url) {
            sessionStorage.setItem(guardKey, '1');
            window.location.href = url;
            return;
          }
          // Fallback: construct URL locally if server returned token but no URL
          if (!url && token && redirectUri) {
            const sep = redirectUri.includes('?') ? '&' : '?';
            sessionStorage.setItem(guardKey, '1');
            window.location.href = `${redirectUri}${sep}token=${encodeURIComponent(
              token
            )}&state=${encodeURIComponent(state)}`;
            return;
          }
          if (import.meta.env.MODE === 'development') {
            console.warn(
              'Desktop callback did not return URL (register)',
              data
            );
          }
        } catch (e) {
          if (import.meta.env.MODE === 'development') {
            console.error('Desktop callback error (register flow):', e);
          }
          // fallback to normal
          sessionStorage.removeItem(guardKey);
        }
      }
      {
        // Normal web flow
        setLocation('/dashboard');
      }
    },
    onError: (error: any) => {
      // Log errors in development only
      if (import.meta.env.MODE === 'development') {
        console.error('Registration error:', error);
      }
      // Extract meaningful error message from server response
      if (error.message && error.message.includes(':')) {
        const serverMessage = error.message
          .split(':')
          .slice(1)
          .join(':')
          .trim();
        if (serverMessage) {
          error.displayMessage = serverMessage;
        }
      }
    },
  });

  // If already authenticated and this is a desktop flow, finalize by requesting desktop token
  useEffect(() => {
    async function finalizeDesktopIfNeeded() {
      if (fromDesktop && state && user) {
        const guardKey = `desktop-finalized-${state}`;
        if (sessionStorage.getItem(guardKey)) {
          return setLocation('/dashboard');
        }
        try {
          sessionStorage.setItem(guardKey, 'in-progress');
          const payload: any = { state };
          if (redirectUri) payload.redirect_uri = redirectUri;
          const callbackRes = await apiRequest(
            'POST',
            getApiUrl('/api/auth/desktop/callback'),
            payload
          );
          const data = await callbackRes.json();
          const url = data?.data?.url as string | undefined;
          const token = data?.data?.token as string | undefined;
          if (url) {
            sessionStorage.setItem(guardKey, '1');
            window.location.href = url;
            return;
          }
          if (!url && token && redirectUri) {
            const sep = redirectUri.includes('?') ? '&' : '?';
            sessionStorage.setItem(guardKey, '1');
            window.location.href = `${redirectUri}${sep}token=${encodeURIComponent(
              token
            )}&state=${encodeURIComponent(state)}`;
            return;
          }
          if (import.meta.env.MODE === 'development') {
            console.warn(
              'Desktop callback did not return URL (already signed-in)',
              data
            );
          }
        } catch (e) {
          if (import.meta.env.MODE === 'development') {
            console.error('Desktop callback error (already signed-in):', e);
          }
          // fall through to normal navigation
          sessionStorage.removeItem(guardKey);
        }
        setLocation('/dashboard');
      }
    }
    finalizeDesktopIfNeeded();
  }, [fromDesktop, state, redirectUri, user, setLocation]);

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  // Redirect if already authenticated (after all hooks are called)
  // For desktop flow, avoid short-circuiting so useEffect above can finalize
  if (!isLoading && user && !fromDesktop) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="flex min-h-[calc(100vh-4rem)] pt-16">
        {/* Left side - Auth forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {fromDesktop ? 'Sign in to DeskAI Desktop' : 'Welcome back'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {fromDesktop
                  ? 'Please sign in to continue using the desktop app'
                  : 'Sign in to your account or create a new one'}
              </p>
            </div>

            {fromDesktop && (
              <Alert className="mb-4 border-primary/50 bg-primary/10">
                <Monitor className="h-4 w-4" />
                <AlertDescription>
                  Signing in for DeskAI Desktop App
                </AlertDescription>
              </Alert>
            )}

            <Card className="glass border-0 shadow-xl dark:bg-gray-800/50 dark:border-gray-700">
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
                      <Alert
                        variant="destructive"
                        className="dark:bg-red-950 dark:border-red-800 dark:text-red-200"
                      >
                        <AlertDescription>
                          {loginMutation.error.displayMessage ||
                            'Login failed. Please try again.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {oauthError && (
                      <Alert
                        variant="destructive"
                        className="dark:bg-red-950 dark:border-red-800 dark:text-red-200"
                      >
                        <AlertDescription>
                          {oauthError === 'google'
                            ? 'Google sign-in failed. Please try again or use email/password.'
                            : 'Authentication failed. Please try again.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            {...loginForm.register('email')}
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
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
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            {...loginForm.register('password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full gradient-bg"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                      <p>If you signed up with Google, use the button below</p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-200 hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500"
                      onClick={() => {
                        const authUrl = (() => {
                          if (fromDesktop && state) {
                            const qp = new URLSearchParams({
                              from: 'desktop',
                              state,
                            });
                            if (redirectUri)
                              qp.set('redirect_uri', redirectUri);
                            return getApiUrl(
                              `/api/auth/google?${qp.toString()}`
                            );
                          }
                          return getApiUrl('/api/auth/google');
                        })();
                        window.location.href = authUrl;
                      }}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-6">
                    {registerMutation.error && (
                      <Alert
                        variant="destructive"
                        className="dark:bg-red-950 dark:border-red-800 dark:text-red-200"
                      >
                        <AlertDescription>
                          {registerMutation.error.displayMessage ||
                            'Registration failed. Please try again.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {oauthError && (
                      <Alert
                        variant="destructive"
                        className="dark:bg-red-950 dark:border-red-800 dark:text-red-200"
                      >
                        <AlertDescription>
                          {oauthError === 'google'
                            ? 'Google sign-in failed. Please try again or use email/password.'
                            : 'Authentication failed. Please try again.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="register-firstName">First Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-firstName"
                              type="text"
                              placeholder="First name"
                              className="pl-10"
                              {...registerForm.register('firstName')}
                            />
                          </div>
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500 dark:text-red-400 mt-1">
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
                              type="text"
                              placeholder="Last name"
                              className="pl-10"
                              {...registerForm.register('lastName')}
                            />
                          </div>
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500 dark:text-red-400 mt-1">
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
                            {...registerForm.register('email')}
                          />
                        </div>
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
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
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password"
                            className="pl-10 pr-10"
                            {...registerForm.register('password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full gradient-bg"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending
                          ? 'Creating account...'
                          : 'Create Account'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-200 hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500"
                      onClick={() => {
                        const authUrl = (() => {
                          if (fromDesktop && state) {
                            const qp = new URLSearchParams({
                              from: 'desktop',
                              state,
                            });
                            if (redirectUri)
                              qp.set('redirect_uri', redirectUri);
                            return getApiUrl(
                              `/api/auth/google?${qp.toString()}`
                            );
                          }
                          return getApiUrl('/api/auth/google');
                        })();
                        window.location.href = authUrl;
                      }}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                By signing up, you agree to our{' '}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Hero section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-600 dark:from-gray-800 dark:to-gray-900 items-center justify-center p-8 text-white">
          <div className="max-w-md text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Monitor className="w-16 h-16 text-white" />

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
              Track eye blinks, posture, and focus sessions with AI-powered
              monitoring. Improve your health while maintaining productivity.
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 dark:bg-gray-700/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-green-400 font-semibold">Eye Tracking</div>
                <div className="text-white/80 dark:text-gray-200">
                  Real-time blink monitoring
                </div>
              </div>
              <div className="bg-white/10 dark:bg-gray-700/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-green-400 font-semibold">
                  Posture Alert
                </div>
                <div className="text-white/80 dark:text-gray-200">
                  Smart posture detection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
