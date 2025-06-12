import * as THREE from "three";

const HeroLights = () => (
  <>    {/* Blue directional light from left side */}
    <directionalLight
      position={[-5, 3, 4]}
      intensity={4}
      color="#2b0fff" // Deep blue
    />
    
    {/* Pink/magenta directional light from right side */}
    <directionalLight
      position={[5, 2, 4]}
      intensity={1}
      color="#ff00e6" // Magenta pink
    />
    
    {/* Blue ambient fill for left side */}
    <pointLight 
      position={[-3, 1, -1]} 
      intensity={10}
      color="#ff00f0"

    />
    
    {/* Purple ambient fill for right side */}
    <pointLight 
      position={[0, 1, 0]} 
      intensity={20} 
      color="#ff00f0"
    />
    
    {/* Soft overall ambient light for supporting structure */}
    <ambientLight intensity={0.3} color="#170033" />
  </>
);

export default HeroLights;
