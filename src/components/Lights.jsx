import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export function Lights({ brainRotation = 0 }) {
  const group = useRef();
  // Create auditory cortex light indicators
  const auditoryLights = useMemo(() => {
    // Create multiple rectangular lights to be placed on sides of the brain
    const lights = [];
    
    // Left side auditory cortex lights - auditory cortex region
    for (let i = 0; i < 5; i++) {
      lights.push({
        id: `left-light-${i}`,
        position: [-1.5, -0.2 + i * 0.25, 0],  // Positioned on left side
        scale: [0.3, 0.12, 0.05],               // Rectangular shape
        rotation: [0, Math.PI / 2, 0],          // Rotated to face outward
        blinkOffset: Math.random() * Math.PI * 2, // Random phase offset for blinking
        blinkSpeed: 2 + Math.random() * 3,      // Random blink speed
      });
    }
    
    // Right side auditory cortex lights
    for (let i = 0; i < 5; i++) {
      lights.push({
        id: `right-light-${i}`,
        position: [1.5, -0.2 + i * 0.25, 0],    // Positioned on right side
        scale: [0.3, 0.12, 0.05],               // Rectangular shape
        rotation: [0, -Math.PI / 2, 0],         // Rotated to face outward
        blinkOffset: Math.random() * Math.PI * 2, // Random phase offset for blinking
        blinkSpeed: 2 + Math.random() * 3,      // Random blink speed
      });
    }
    
    return lights;
  }, []);

  // Animate the neural activity lights
  useFrame((state) => {
    if (group.current) {
      // Match the brain's rotation
      group.current.rotation.y = brainRotation;
      
      // Update each light's blinking effect
      group.current.children.forEach((child, index) => {
        if (child.userData && child.userData.isActivityLight) {
          const light = auditoryLights[index];
          
          // Calculate blinking effect - each light has its own rhythm
          const blinkValue = Math.sin(state.clock.elapsedTime * light.blinkSpeed + light.blinkOffset);
            // Apply opacity based on blinking
          if (child.material) {
            child.material.opacity = 0.2 + Math.max(0, blinkValue) * 0.8;
            
            // Add a subtle color transition effect
            const hue = (state.clock.elapsedTime * 0.05 + index * 0.1) % 1;
            child.material.color.setHSL(0.6 + hue * 0.05, 0.8, 0.5 + blinkValue * 0.2);
          }
        }
      });
    }
  });

  return (
    <group ref={group} position={[0.8, -1.3, 0]} scale={0.045}>
      {/* Neural activity indicators on auditory cortices */}
      {auditoryLights.map((light) => (
        <mesh
          key={light.id}
          position={light.position}
          scale={light.scale}
          rotation={light.rotation}
          userData={{ isActivityLight: true, lightId: light.id }}
        >
          <planeGeometry />
          <meshBasicMaterial 
            color="#00aaff"
            transparent={true}
            opacity={0.7}
            side={2} // Double-sided rendering
          />
        </mesh>
      ))}
    </group>
  );
}