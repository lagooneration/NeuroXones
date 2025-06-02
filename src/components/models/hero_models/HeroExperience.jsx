import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMediaQuery } from "react-responsive";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import { Room } from "./Room";
import HeroLights from "./HeroLights";
import Particles from "./Particles";
import { Suspense } from "react";
import { Neuroxone } from "../../models/Neuroxone";
import { Brain } from "../../models/Brain";
import BackgroundShader from "../../BackgroundShader";


const HeroExperience = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });

  return (
    <Canvas camera={{ position: [2, 8, 5], fov: 45 }}>
      {/* deep blue ambient */}
      <ambientLight intensity={0.2} color="#1a1a40" />
      {/* Configure OrbitControls to disable panning and control zoom based on device type */}
      <OrbitControls
        enablePan={false} // Prevents panning of the scene
        enableZoom={false}
        maxDistance={20} // Maximum distance for zooming out
        minDistance={5} // Minimum distance for zooming in
        minPolarAngle={Math.PI / 5} // Minimum angle for vertical rotation
        maxPolarAngle={Math.PI / 2} // Maximum angle for vertical rotation
      />

      <Suspense fallback={null}>

        <HeroLights />
        {/* <Particles count={100} /> */}
        {/* <BackgroundShader /> */}
        <group
          scale={isMobile ? 26 : 26}
          position={[0, -2.5, 0]} // Changed position to center
          rotation={[-Math.PI / 6, Math.PI / 2, 0]}
        >
          {/* <Room /> */}
          <Brain />
          <Neuroxone />
        </group>
      </Suspense>
      {/* <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
      </EffectComposer> */}
    </Canvas>
  );
};

export default HeroExperience;
