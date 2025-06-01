import { Canvas, useFrame } from "@react-three/fiber";
import HeroText from "../components/HeroText";
import ParallaxBackground from "../components/parallaxBackground";
import { Float } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";
import { easing } from "maath";
import { Suspense } from "react";
import Loader from "../components/Loader";
import { Headphones } from "../components/Headphones";

const Hero = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  return (
    <section className="flex items-start justify-center min-h-screen overflow-hidden md:items-start md:justify-start c-space">
      <HeroText />
      <ParallaxBackground />
      <figure
        className="absolute inset-0"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Canvas camera={{ position: [0, 1, 2] }}>
          <Suspense fallback={<Loader />}>
            <Float>
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow  
              />
              <Headphones
                scale={isMobile ? 4.0 : 8.0}
                position={isMobile ? [0, -1.5, 0] : [2, 0, -1]}
                rotation={isMobile ? [-Math.PI / 6, Math.PI / 6, 0] : [-Math.PI/6, Math.PI / 4, 0]}
              />
            </Float>
            <Rig />
          </Suspense>
        </Canvas>
      </figure>
    </section>
  );
};

function Rig() {
  return useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [state.mouse.x / 10, 1 + state.mouse.y / 10, 3],
      0.5,
      delta
    );
  });
}

export default Hero;
