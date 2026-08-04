// =========================================================
// AGNES MEMORIAL MEDICAL HOSPITAL - SYSTEM CONFIGURATION
// Configured by Michael Munguti (Dedan Kimathi University of Technology)
// =========================================================

(function (window) {
    'use strict';

    // Production backend API URL (Vercel)
    const API_BASE_URL = "https://agnes-hospital.vercel.app";

    const config = {
        API_URL: API_BASE_URL,
        API_BASE_URL: API_BASE_URL,
        
        // Helper method to safely build full API endpoints without duplicate slashes
        getEndpoint: function (path) {
            const cleanPath = path.startsWith('/') ? path : '/' + path;
            return this.API_URL + cleanPath;
        }
    };

    // Attach to global window object for universal availability across all scripts
    window.CONFIG = config;
    window.API_URL = API_BASE_URL;

    // Support CommonJS / Node environment if imported in backend tests
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = config;
    }
})(typeof window !== 'undefined' ? window : this);