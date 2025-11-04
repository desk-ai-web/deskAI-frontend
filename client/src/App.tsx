import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { CookieConsent } from '@/components/cookie-consent';
// Desktop finalization is handled in AuthPage to avoid duplicate calls
import NotFound from '@/pages/not-found';
import Landing from '@/pages/landing';
import Dashboard from '@/pages/dashboard';
import Downloads from '@/pages/downloads';
import AuthPage from '@/pages/auth-page';
import TermsPage from '@/pages/terms';
import PrivacyPage from '@/pages/privacy';
import ImpressumPage from '@/pages/impressum';

function Router() {
  // Note: isAuthenticated and isLoading are available for future use
  const { isAuthenticated: _isAuthenticated, isLoading: _isLoading } =
    useAuth();
  // Desktop flow finalization is handled exclusively in AuthPage now

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/landing" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/impressum" component={ImpressumPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
