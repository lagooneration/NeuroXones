import * as THREE from "three";

const HeroLights = () => (
  <>
    {/* lamp's light */}
    <spotLight
      position={[2, 5, 6]}
      angle={0.15}
      penumbra={0.3}
      intensity={150}
      color="#f0e68c" // Soft gold
    />
    {/* bluish overhead lamp */}
    <spotLight
      position={[4, 5, 4]}
      angle={0.3}
      penumbra={0.5}
      intensity={800}
      color="#4cc9f0"
    />
    {/* purplish side fill */}
    <spotLight
      position={[-3, 5, 5]}
      angle={0.4}
      penumbra={0.7}
      intensity={120}
      color="#9d4edd"
    />
    {/* area light for soft moody fill */}
    <primitive
      object={new THREE.RectAreaLight("#a259ff", 10, 3, 2)}
      position={[1, 3, 4]}
      rotation={[-Math.PI / 4, Math.PI / 4, 0]}
      intensity={110}
    />
    {/* subtle point light for atmospheric tone */}
    <pointLight position={[0, 1, 0]} intensity={120} color="#7209b7" />
    <pointLight position={[1, 2, -2]} intensity={250} color="#0d00a4" />
  </>
);

export default HeroLights;
