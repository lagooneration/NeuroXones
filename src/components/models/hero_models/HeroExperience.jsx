import { OrbitControls, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMediaQuery } from "react-responsive";
import { Suspense, useEffect, useCallback } from "react";
import { Helix } from 'ldrs/react';
import 'ldrs/react/Grid.css';
import { Brain } from "../../models/Brain";
import { Hp } from "../Hp";
import HeroLights from "./HeroLights";
import { useSpring, animated } from '@react-spring/three';


function Loader() {
  const { progress } = useProgress();
  return progress !== 100 ? (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000
    }}>
      <Helix
        size={60}
        speed={1.5}
        color="white"
      />
    </div>
  ) : null;
}

const Scene = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const isSmallMobile = useMediaQuery({ query: "(max-width: 480px)" });
  const { progress } = useProgress();

  const [brainSpring, setBrainSpring] = useSpring(() => ({
    position: [20, 0, 0],
    config: { mass: 1, tension: 280, friction: 60 }
  }));

  const [hpSpring, setHpSpring] = useSpring(() => ({
    position: [-4, 20, 0],
    config: { mass: 1, tension: 280, friction: 60 }
  }));
  const animateModels = useCallback(() => {
    setBrainSpring.start({
      position: isSmallMobile ? [0, -2.0, 0] : isMobile ? [0, -1.8, 0] : [0, -1.2, 0],
      delay: 900
    });
    setHpSpring.start({
      position: isSmallMobile ? [0, -4.5, 0] : isMobile ? [0, -4.2, 0] : [0, -3.2, 0],
      delay: 1150
    });
  }, [setBrainSpring, setHpSpring, isMobile, isSmallMobile]);

  useEffect(() => {
    if (progress === 100) {
      animateModels();
    }
  }, [progress, animateModels]);

  return (
    <>      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        maxDistance={20}
        minDistance={5}
        // Lock vertical rotation by setting both angles to the same value
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        // Optional: Control rotation speed
        rotateSpeed={0.5}
      />

      <HeroLights />
      
      {/* Brain model group */}
      <animated.group
        scale={isSmallMobile ? [21, 21, 21] : isMobile ? [23, 23, 23] : [15, 15, 15]}
        position={brainSpring.position}
        rotation={[0, -Math.PI * 1.85, 0]}
      >
        <Brain />
      </animated.group>

      {/* HP model group */}
      <animated.group
        scale={isSmallMobile ? [27, 27, 27] : isMobile ? [29, 29, 29] : [20, 20, 20]}
        position={hpSpring.position}
        rotation={[0, -Math.PI * 1.85, 0]}
      >
        <Hp />
      </animated.group>
    </>
  );
};

const HeroExperience = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const isSmallMobile = useMediaQuery({ query: "(max-width: 480px)" });

  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      position: 'relative'
    }}>
      <Canvas
        camera={{ 
          position: isSmallMobile ? [-4, -2, 7] : isMobile ? [-4.5, -2, 7.5] : [-5, -2, 8], 
          fov: isSmallMobile ? 50 : isMobile ? 47 : 45 
        }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Loader />
    </div>
  );
};

export default HeroExperience;
