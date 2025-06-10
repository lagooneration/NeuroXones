import { shouldReduceMotion } from "../../lib/performance";

// Optimizations for the motion components
export const motionConfig = {
  transition: { 
    type: "spring", 
    stiffness: shouldReduceMotion() ? 150 : 300, 
    damping: shouldReduceMotion() ? 20 : 30,
    restDelta: 0.01, // Smaller value for more precise animation endpoint
    restSpeed: 0.01  // Smaller value for more precise animation endpoint
  },
  dragTransition: {
    power: 0.3,       // Lower power for smoother drag
    timeConstant: 200, // Higher value for more dampening
    modifyTarget: value => Math.round(value) // Snap to nearest integer for cleaner stops
  },
  // Performance attributes
  layoutDependency: false, // Disable automatic layout animation
  reducedMotion: 'user'    // Respect user's reduced motion preferences
};
