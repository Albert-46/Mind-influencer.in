/**
 * firebase-analytics-init.js (Modular SDK)
 *
 * Firebase Analytics initialisation for Mind Influencer | MIAFL
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAnalytics, isSupported, logEvent } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";

import { firebaseConfig } from './firebase-config.js';

let analyticsInstance = null;

const isConfigPlaceholder = (config) => {
  return !config || 
         !config.apiKey || 
         config.apiKey === 'YOUR_FIREBASE_API_KEY' || 
         config.projectId === 'YOUR_FIREBASE_PROJECT_ID';
};

// Delay execution to clear the main thread
setTimeout(() => {
  if (isConfigPlaceholder(firebaseConfig)) {
    console.warn('[Firebase] Configuration is missing or uses placeholders. Analytics will not be initialised.');
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    console.log('[Firebase] App initialised. Project:', firebaseConfig.projectId);

    isSupported().then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
        console.log(`[Firebase] Analytics initialised ✓  Measurement ID: ${firebaseConfig.measurementId}`);
        console.log('[Firebase] GA4 page_view event will be sent automatically.');
      } else {
        console.info('[Firebase] Analytics not supported in this environment — ' +
          'no data will be sent. This is expected in privacy browsers or when ' +
          'an ad-blocker is active.');
      }
    }).catch((err) => {
      console.warn('[Firebase] Analytics isSupported() check failed:', err);
    });
  } catch (error) {
    console.warn('[Firebase] Initialisation failed:', error);
  }
}, 3500);

// Expose a global logger for script.js
window.logFirebaseEvent = function(eventName, params) {
  if (analyticsInstance) {
    logEvent(analyticsInstance, eventName, params);
  }
};
