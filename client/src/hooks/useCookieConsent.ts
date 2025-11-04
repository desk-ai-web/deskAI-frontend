import { useState, useEffect } from 'react';

export type CookieConsentStatus = 'accepted' | 'rejected' | null;

interface CookieConsentState {
  status: CookieConsentStatus;
  timestamp: number;
}

const COOKIE_CONSENT_KEY = 'desk_ai_cookie_consent';
const CONSENT_EXPIRY_MONTHS = 6;

export function useCookieConsent() {
  const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for existing consent
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (stored) {
      try {
        const parsed: CookieConsentState = JSON.parse(stored);
        const now = Date.now();
        const expiryTime = parsed.timestamp + (CONSENT_EXPIRY_MONTHS * 30 * 24 * 60 * 60 * 1000);
        
        if (now < expiryTime) {
          // Consent is still valid
          setConsentStatus(parsed.status);
          setIsVisible(false);
        } else {
          // Consent expired
          localStorage.removeItem(COOKIE_CONSENT_KEY);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
        setIsVisible(true);
      }
    } else {
      // No consent stored, show banner
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    const state: CookieConsentState = {
      status: 'accepted',
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
    setConsentStatus('accepted');
    setIsVisible(false);
  };

  const rejectNonEssential = () => {
    const state: CookieConsentState = {
      status: 'rejected',
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
    setConsentStatus('rejected');
    setIsVisible(false);
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setConsentStatus(null);
    setIsVisible(true);
  };

  const hasAnalyticsConsent = () => {
    return consentStatus === 'accepted';
  };

  return {
    consentStatus,
    isVisible,
    acceptAll,
    rejectNonEssential,
    resetConsent,
    hasAnalyticsConsent,
  };
}

