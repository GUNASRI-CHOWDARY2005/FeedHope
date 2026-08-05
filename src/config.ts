const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname, port, origin } = window.location;

    // Local browser development
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port) {
      return `http://${hostname}:5000`;
    }

    // Capacitor app on Android (requires adb reverse tcp:5000 tcp:5000 for local testing)
    if (origin.startsWith('http://localhost') && !port) {
      return 'http://localhost:5000';
    }

    // Capacitor app on iOS Simulator
    if (origin.startsWith('capacitor://localhost')) {
      return 'http://localhost:5000';
    }
  }

  // Fallback to live Render backend
  return 'https://feedhope-z0k0.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();