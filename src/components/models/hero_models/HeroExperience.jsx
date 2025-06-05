import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMediaQuery } from "react-responsive";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense } from "react";
import { Brainy } from "../../models/Brainy";
import { Hp } from "../Hp";
import HeroLights from "./HeroLights";


const HeroExperience = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });

  return (
    <Canvas camera={{ position: [-5, -2, 8], fov: 45 }}>
      {/* <color attach="background" /> */}
      <ambientLight intensity={0.2} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        maxDistance={20}
        minDistance={5}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2}
      />

      <Suspense fallback={null}>
        <HeroLights />
        
        {/* Brain model group */}
        <group
          scale={isMobile ? [15, 15, 15] : [15, 15, 15]}
          position={[0, -2, 0]}
          rotate={[0, Math.PI * 1.75, 0]}
        >
          <Brainy />
        </group>

        {/* HP model group - positioned relative to brain */}
        <group
          scale={isMobile ? [20, 20, 20] : [20, 20, 20]}
          position={[0, -4, 0]}
          rotate={[0, Math.PI * 1.75, 0]}
        >
          <Hp />
        </group>
      </Suspense>

      <EffectComposer>
        <Bloom luminanceThreshold={.1} luminanceSmoothing={0.9} height={500} />
      </EffectComposer>
    </Canvas>
  );
};

export default HeroExperience;
