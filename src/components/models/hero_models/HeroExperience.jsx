import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMediaQuery } from "react-responsive";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense } from "react";
import { Brain } from "../../models/Brain";
import { Hp } from "../Hp";
import HeroLights from "./HeroLights";


const HeroExperience = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const isSmallMobile = useMediaQuery({ query: "(max-width: 480px)" });

  return (
    <Canvas
      camera={{ 
        position: isSmallMobile ? [-4, -2, 7] : isMobile ? [-4.5, -2, 7.5] : [-5, -2, 8], 
        fov: isSmallMobile ? 50 : isMobile ? 47 : 45 
      }}
      style={{ width: '100%', height: '100%' }}
    >
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
          scale={isSmallMobile ? [21, 21, 21] : isMobile ? [21, 21, 21] : [15, 15, 15]}
          position={isSmallMobile ? [0, -2.0, 0] : isMobile ? [0, -1.8, 0] : [0, -1.2, 0]}
          rotation={[0, -Math.PI * 1.85, 0]}
        >
          <Brain />
        </group>

        {/* HP model group - positioned relative to brain */}
        <group
          scale={isSmallMobile ? [27, 27, 27] : isMobile ? [27, 27, 27] : [20, 20, 20]}
          position={isSmallMobile ? [0, -4.5, 0] : isMobile ? [0, -4.2, 0] : [0, -3.2, 0]}
          rotation={[0, -Math.PI * 1.85, 0]}
        >
          <Hp />
        </group>
      </Suspense>

      <EffectComposer>
        <Bloom luminanceThreshold={.9} luminanceSmoothing={0.9} height={500} />
      </EffectComposer>
    </Canvas>
  );
};

export default HeroExperience;
