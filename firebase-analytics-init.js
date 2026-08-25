/**
 * firebase-analytics-init.js
 *
 * Firebase Analytics initialisation for Mind Influencer | MIAFL
 * ─────────────────────────────────────────────────────────────────
 * This file is loaded with `defer` AFTER firebase-app-compat.js and
 * firebase-analytics-compat.js (also deferred), so `firebase` is
 * guaranteed to be defined when this script runs.
 *
 * GA4 Measurement ID : G-X7FQRDX3D0
 * Firebase project   : mindinfluencer-57ee1
 */

(function () {
  'use strict';

  // ── 1. Firebase project configuration ──────────────────────────────────────
  var firebaseConfig = {
    apiKey:            'AIzaSyDcq-Qu8rCLEbmdis4GQf4Zj2SvXuLgCiY',
    authDomain:        'mindinfluencer-57ee1.firebaseapp.com',
    projectId:         'mindinfluencer-57ee1',
    storageBucket:     'mindinfluencer-57ee1.firebasestorage.app',
    messagingSenderId: '113507299234',
    appId:             '1:113507299234:web:69ae6df015a7b382dc4cfb',
    measurementId:     'G-X7FQRDX3D0'
  };

  // ── 2. Guard: confirm firebase SDK is available ─────────────────────────────
  if (typeof firebase === 'undefined') {
    console.error('[Firebase] ERROR: firebase global is not defined. ' +
      'Ensure firebase-app-compat.js loads before this script.');
    return;
  }

  // ── 3. Initialize Firebase App (reuse existing instance if already created) ─
  var app;
  try {
    app = firebase.apps.length
      ? firebase.app()
      : firebase.initializeApp(firebaseConfig);
    console.log('[Firebase] App initialised. Project:', firebaseConfig.projectId);
  } catch (initErr) {
    console.error('[Firebase] App init failed:', initErr);
    return;
  }

  // ── 4. Initialize Analytics safely ─────────────────────────────────────────
  //    isSupported() returns false in:
  //      • Browsers blocking third-party cookies (ITP / ETP)
  //      • Node.js / SSR environments
  //      • Some privacy-focused browsers
  //    GA4 automatically fires a `page_view` event when Analytics initialises.
  firebase.analytics.isSupported()
    .then(function (supported) {
      if (supported) {
        // ── Analytics initialised ──────────────────────────────────────────
        window._firebaseAnalytics = firebase.analytics(app);
        console.log('[Firebase] Analytics initialised ✓  Measurement ID: G-X7FQRDX3D0');
        console.log('[Firebase] GA4 page_view event will be sent automatically.');
      } else {
        // ── Not supported (privacy browser, ad-blocker, etc.) ─────────────
        console.info('[Firebase] Analytics not supported in this environment — ' +
          'no data will be sent. This is expected in privacy browsers or when ' +
          'an ad-blocker is active.');
      }
    })
    .catch(function (err) {
      console.warn('[Firebase] Analytics isSupported() check failed:', err);
    });

})();
