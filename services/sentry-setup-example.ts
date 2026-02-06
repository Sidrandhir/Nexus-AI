// Sentry Error Tracking Integration
// File: services/sentrySetup.ts
// Purpose: Initialize Sentry for production error tracking

// @ts-ignore - Optional peer dependency
import * as Sentry from '@sentry/react';
// @ts-ignore - Optional peer dependency
import { BrowserTracing } from '@sentry/tracing';

declare const import: {
  meta: {
    env: Record<string, any>;
  };
};

export function initSentry() {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string;
  
  if (!sentryDsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    // Sentry project endpoint
    dsn: sentryDsn,

    // Set the environment (development, staging, production)
    environment: import.meta.env.MODE as string,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // We recommend adjusting this value in production
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Capture Replay for 10% of all sessions,
    // plus, capture 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Performance monitoring
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        // Mask all text content kept in the DOM when replaying
        maskAllText: true,
        // Mask all elements with class 'password'
        blockAllMedia: true,
      }),
    ],

    // Ignore certain errors
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      // See http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Network errors often don't need reporting
      'NetworkError',
      'TimeoutError',
    ],

    // By default the SDK will try to use `window.fetch()` to send events.
    // If this is disabled or unavailable, it will use `XMLHttpRequest` instead.
    // Set this option to false if you want to force the SDK to always use `XMLHttpRequest`.
    transportOptions: {
      fetchImpl: fetch,
    },
  });

  console.log('✅ Sentry initialized for error tracking');
}

// Helper function to capture exceptions
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      app: context,
    },
  });
}

// Helper function to capture messages
export function captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info') {
  Sentry.captureMessage(message, level);
}

// Helper function to set user context
export function setSentryUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

// Helper function to clear user context (on logout)
export function clearSentryUser() {
  Sentry.setUser(null);
}

// Helper function to add breadcrumbs (track user actions)
export function addBreadcrumb(message: string, category: string = 'user-action', data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

// Sentry environment variables to add to .env.local:
/*
# Sentry Error Tracking
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Sentry is optional - if not configured, app works without it
# To get your DSN:
# 1. Go to https://sentry.io
# 2. Create a free account
# 3. Create new project (React)
# 4. Copy the DSN
# 5. Paste it here
*/
