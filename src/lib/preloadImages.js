/**
 * Utility to preload critical images for better performance
 */

// List of critical images that should be preloaded
const criticalImages = [
  '/assets/logos/heading.svg',
  '/assets/logos/logo-gray.svg'
];

// Preload function
export const preloadCriticalImages = () => {
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// Function to preload specific images
export const preloadImages = (imageSources) => {
  if (!Array.isArray(imageSources)) return;
  
  imageSources.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};
