import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AnalyticsEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
  [key: string]: any;
};

type PageView = {
  page: string;
  title: string;
  timestamp: Date;
  duration?: number;
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: {
        event_category?: string;
        event_label?: string;
        value?: number;
        page_title?: string;
        page_location?: string;
      }
    ) => void;
  }
}

export const useAnalytics = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [pageStartTime, setPageStartTime] = useState<Date>(new Date());

  // Track page views
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Calculate time spent on previous page
      const endTime = new Date();
      const duration = endTime.getTime() - pageStartTime.getTime();

      // Track page view for previous page
      trackPageView({
        page: window.location.pathname,
        title: document.title,
        timestamp: pageStartTime,
        duration,
      });

      // Set new page start time
      setPageStartTime(new Date());

      // Track new page view
      trackPageView({
        page: url,
        title: document.title,
        timestamp: new Date(),
      });
    };

    // Listen to route changes
    const handleBeforeUnload = () => {
      const endTime = new Date();
      const duration = endTime.getTime() - pageStartTime.getTime();
      
      trackPageView({
        page: window.location.pathname,
        title: document.title,
        timestamp: pageStartTime,
        duration,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pageStartTime]);

  // Track custom event
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const eventData = {
      ...event,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
    };

    // Send to analytics service
    if (process.env.NODE_ENV === "production") {
      // Example: Google Analytics
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
        window.gtag("event", event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
        });
      }

      // Send to your analytics API
      fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      }).catch(console.error);
    } else {
      console.log("[Analytics Event]:", eventData);
    }
  }, [session]);

  // Track page view
  const trackPageView = useCallback((pageView: PageView) => {
    const pageData = {
      ...pageView,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      url: window.location.href,
      referrer: document.referrer,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };

    if (process.env.NODE_ENV === "production") {
      // Google Analytics
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
        window.gtag("config", "GA_MEASUREMENT_ID", {
          page_title: pageData.title,
          page_location: pageData.url,
        });
      }

      // Send to your analytics API
      fetch("/api/analytics/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      }).catch(console.error);
    } else {
      console.log("[Page View]:", pageData);
    }
  }, [session]);

  // Track user interaction
  const trackInteraction = useCallback((
    element: string,
    action: string,
    details?: any
  ) => {
    trackEvent({
      category: "User Interaction",
      action: `${element} - ${action}`,
      label: details,
    });
  }, [trackEvent]);

  // Track error
  const trackError = useCallback((error: Error, context?: any) => {
    trackEvent({
      category: "Error",
      action: "Error Occurred",
      label: error.message,
      value: 1,
      stack: error.stack,
      context,
    });
  }, [trackEvent]);

  // Track conversion
  const trackConversion = useCallback((conversionType: string, value?: number) => {
    trackEvent({
      category: "Conversion",
      action: conversionType,
      value: value,
    });
  }, [trackEvent]);

  // Predefined event helpers
  const analytics = {
    // Auth events
    signIn: (method: string) => 
      trackEvent({ category: "Auth", action: "Sign In", label: method }),
    
    signUp: (method: string) =>
      trackEvent({ category: "Auth", action: "Sign Up", label: method }),
    
    // Property events
    viewProperty: (propertyId: string) =>
      trackEvent({ category: "Property", action: "View", label: propertyId }),
    
    searchProperties: (filters: any) =>
      trackEvent({ category: "Search", action: "Search Properties", label: JSON.stringify(filters) }),
    
    // Booking events
    startBooking: (propertyId: string) =>
      trackEvent({ category: "Booking", action: "Start Booking", label: propertyId }),
    
    completeBooking: (bookingId: string, amount: number) =>
      trackEvent({ category: "Booking", action: "Complete Booking", label: bookingId, value: amount }),
    
    // Payment events
    startPayment: (amount: number) =>
      trackEvent({ category: "Payment", action: "Start Payment", value: amount }),
    
    completePayment: (paymentId: string, amount: number) =>
      trackEvent({ category: "Payment", action: "Complete Payment", label: paymentId, value: amount }),
  };

  return {
    // Tracking methods
    trackEvent,
    trackPageView,
    trackInteraction,
    trackError,
    trackConversion,
    
    // Predefined events
    analytics,
    
    // User identification
    identifyUser: (userId: string, traits?: any) => {
      if (process.env.NODE_ENV === "production") {
        // Identify user in analytics service
        fetch("/api/analytics/identify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, traits }),
        }).catch(console.error);
      }
    },
  };
};

// Helper hook for component analytics
export const useComponentAnalytics = (componentName: string) => {
  const { trackInteraction, trackError } = useAnalytics();

  const trackComponentEvent = useCallback((action: string, details?: any) => {
    trackInteraction(componentName, action, details);
  }, [componentName, trackInteraction]);

  const trackComponentError = useCallback((error: Error, context?: any) => {
    trackError(error, { component: componentName, ...context });
  }, [componentName, trackError]);

  return {
    trackEvent: trackComponentEvent,
    trackError: trackComponentError,
  };
};