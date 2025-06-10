/**
 * Utility functions for optimizing mobile performance
 */

// Debounce function to limit how often a function can be called
export const debounce = (func, wait = 100) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function to limit the rate at which a function can fire
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Detect if the device is a mobile device
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Helper to disable animations on low-end devices
export const shouldReduceMotion = () => {
  // Check for user preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return true;
  }
  
  // Check for low-end device
  if (isMobile()) {
    // Some additional checks for low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      return true;
    }
  }
  
  return false;
};

// Get appropriate image quality based on device
export const getImageQuality = () => {
  // Return lower quality images for mobile devices
  if (isMobile()) {
    return 'low';
  }
  return 'high';
};

// Optimal animation settings based on device capability
export const getOptimalAnimationSettings = () => {
  if (shouldReduceMotion()) {
    return {
      duration: 0.15,
      stiffness: 100,
      damping: 15,
      useSimpleAnimations: true
    };
  }
  
  return {
    duration: 0.3,
    stiffness: 300,
    damping: 30,
    useSimpleAnimations: false
  };
};

// IntersectionObserver configuration for optimal lazy loading
export const observerOptions = {
  rootMargin: '100px',
  threshold: 0.1
};
