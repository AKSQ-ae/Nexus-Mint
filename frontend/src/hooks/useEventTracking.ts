import { useCallback } from 'react';

interface EventData {
  [key: string]: any;
}

interface TrackingEvent {
  event: string;
  properties: EventData;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export function useEventTracking() {
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('nexus_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('nexus_session_id', sessionId);
    }
    return sessionId;
  }, []);

  const track = useCallback((event: string, properties: EventData = {}) => {
    try {
      const trackingEvent: TrackingEvent = {
        event,
        properties: {
          ...properties,
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        },
        timestamp: Date.now(),
        sessionId: getSessionId()
      };

      // Store locally for now - can be enhanced to send to analytics service
      const events = JSON.parse(localStorage.getItem('nexus_events') || '[]');
      events.push(trackingEvent);
      
      // Keep only last 100 events to prevent storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('nexus_events', JSON.stringify(events));
      
      console.log('📊 Event tracked:', event, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [getSessionId]);

  const trackPageView = useCallback((page: string) => {
    track('page_view', { page });
  }, [track]);

  const trackPropertyView = useCallback((propertyId: string, propertyTitle: string) => {
    track('property_view', { propertyId, propertyTitle });
  }, [track]);

  const trackInvestmentStart = useCallback((propertyId: string, amount: number) => {
    track('investment_start', { propertyId, amount });
  }, [track]);

  const trackInvestmentComplete = useCallback((propertyId: string, amount: number, transactionId: string) => {
    track('investment_complete', { propertyId, amount, transactionId });
  }, [track]);

  const trackWalletConnect = useCallback((walletType: string) => {
    track('wallet_connect', { walletType });
  }, [track]);

  const trackSignUp = useCallback(() => {
    track('sign_up');
  }, [track]);

  const trackSignIn = useCallback(() => {
    track('sign_in');
  }, [track]);

  return {
    track,
    trackPageView,
    trackPropertyView,
    trackInvestmentStart,
    trackInvestmentComplete,
    trackWalletConnect,
    trackSignUp,
    trackSignIn
  };
}
