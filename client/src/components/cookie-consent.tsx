import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export function CookieConsent() {
  const { isVisible, acceptAll, rejectNonEssential } = useCookieConsent();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🍪</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-gray-600">
                    We use essential cookies for authentication and security. Optional cookies help us improve your experience.{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={rejectNonEssential}
                className="flex-1 sm:flex-none"
              >
                Reject Non-Essential
              </Button>
              <Button
                onClick={acceptAll}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

