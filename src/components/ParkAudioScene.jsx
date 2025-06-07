import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls,
  Environment,
  AccumulativeShadows,
  RandomizedLight,
  Loader
} from '@react-three/drei';
import { 
  EffectComposer,
  Bloom,
  ChromaticAberration,
  BrightnessContrast 
} from '@react-three/postprocessing';
import { Park } from './models/sim_models/Park';
import { Bird } from './models/sim_models/Bird';
import * as THREE from 'three';
import PropTypes from 'prop-types';

const AudioController = ({ onPositionChange, onBirdHover, onFountainHover, onTrafficHover }) => {
  const trackpadRef = useRef(null);
  const birdIconRef = useRef(null);
  const fountainIconRef = useRef(null);
  const trafficIconRef = useRef(null);
  const audioRefs = useRef({
    water: null,
    birds: null,
    traffic: null
  });

  useEffect(() => {
    const audios = {
      water: new Audio('/audio/water.mp3'),
      birds: new Audio('/audio/birds.mp3'),
      traffic: new Audio('/audio/traffic.mp3')
    };

    // Configure each audio
    Object.values(audios).forEach(audio => {
      audio.loop = true;
      audio.volume = 0;
    });

    audioRefs.current = audios;

    const initAudio = async () => {
      try {
        await Promise.all(Object.values(audios).map(audio => audio.play()));
      } catch (err) {
        console.error('Failed to play audio:', err);
      }
    };

    // Initialize on user interaction
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);

    return () => {
      Object.values(audios).forEach(audio => audio.pause());
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  const handleTrackpadMove = (e) => {
    if (!trackpadRef.current) return;

    const rect = trackpadRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Calculate distances from points of interest
    const centerDist = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
    const birdDist = Math.sqrt(Math.pow(x - 0.7, 2) + Math.pow(y - 0.3, 2));
    const trafficDist = Math.min(x, 1 - x, y, 1 - y);

    // Update audio volumes
    if (audioRefs.current.water) {
      audioRefs.current.water.volume = Math.max(0, 1 - centerDist * 2);
      audioRefs.current.birds.volume = Math.max(0, 1 - birdDist * 2);
      audioRefs.current.traffic.volume = Math.max(0, 1 - trafficDist * 3);
    }

    onPositionChange?.({ x: x * 2 - 1, y: -(y * 2 - 1) });
  };  return (
    <div className="relative h-full w-full p-2">
      <div 
        ref={trackpadRef}
        className="w-full h-full bg-gray-900 rounded-lg relative cursor-crosshair"
        onMouseMove={handleTrackpadMove}
      >
        {/* Quadrant lines */}
        <div className="absolute w-full h-px bg-gray-700 top-1/2 transform -translate-y-1/2" />
        <div className="absolute h-full w-px bg-gray-700 left-1/2 transform -translate-x-1/2" />
        
        {/* Points of interest */}        <img 
          ref={fountainIconRef}
          src="/icons/fountain.svg"
          alt="Fountain"
          className="absolute top-1/2 left-1/2 w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_0_8px_rgba(77,171,247,0.5)]" 
          title="Fountain"
          onMouseEnter={() => onFountainHover(true)}
          onMouseLeave={() => onFountainHover(false)}
        />
        <img 
          ref={birdIconRef}
          src="/icons/bird.svg"
          alt="Birds"
          className="absolute top-[30%] left-[70%] w-10 h-10 filter drop-shadow-[0_0_8px_rgba(255,212,59,0.5)]" 
          title="Birds"
          onMouseEnter={() => onBirdHover(true)}
          onMouseLeave={() => onBirdHover(false)}
        />
        <img 
          ref={trafficIconRef}
          src="/icons/traffic.svg"
          alt="Traffic"
          className="absolute top-[85%] left-[15%] w-10 h-10 filter drop-shadow-[0_0_8px_rgba(255,107,107,0.5)]" 
          title="Traffic"
          onMouseEnter={() => onTrafficHover(true)}
          onMouseLeave={() => onTrafficHover(false)}
        />
      </div>
    </div>
  );
};

AudioController.propTypes = {
  onPositionChange: PropTypes.func,
  onBirdHover: PropTypes.func,
  onFountainHover: PropTypes.func,
  onTrafficHover: PropTypes.func
};

const FountainBubbles = ({ isActive }) => {
  const bubbleRef = useRef();
  const bubbleCount = 25;
  const bubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 0.5,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.5
      ],
      size: Math.random() * 0.02 + 0.01,
      speed: Math.random() * 0.1 + 0.05
    }));
  }, []);

  useFrame((state, delta) => {
    if (!bubbleRef.current || !isActive) return;

    // Animate each bubble in the group
    bubbleRef.current.children.forEach((bubble, i) => {
      // Move bubbles upward
      bubble.position.y += bubbles[i].speed * delta;
      
      // Reset position when it goes too high
      if (bubble.position.y > 0.5) {
        bubble.position.y = 0;
        bubble.position.x = (Math.random() - 0.5) * 0.5;
        bubble.position.z = (Math.random() - 0.5) * 0.5;
      }
      
      // Fade out as they go higher
      const opacity = Math.max(0, 1 - bubble.position.y * 2);
      bubble.material.opacity = opacity;
      
      // Small random movement
      bubble.position.x += (Math.random() - 0.5) * 0.002;
      bubble.position.z += (Math.random() - 0.5) * 0.002;
    });
  });

  return isActive ? (
    <group ref={bubbleRef} position={[0, 0.1, 0]}>
      {bubbles.map((bubble, i) => (
        <mesh key={i} position={bubble.position}>
          <sphereGeometry args={[bubble.size, 8, 8]} />
          <meshStandardMaterial 
            color="#a0e0ff" 
            transparent 
            opacity={0.7} 
            emissive="#80c0ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  ) : null;
};

FountainBubbles.propTypes = {
  isActive: PropTypes.bool
};

const TrafficSmoke = ({ isActive }) => {
  const smokeRef = useRef();
  const smokeCount = 15;
  const smokeParticles = useMemo(() => {
    return Array.from({ length: smokeCount }).map((_, i) => ({
      position: [
        8 + (Math.random() - 0.5) * 3,
        Math.random() * 0.5,
        8 + (Math.random() - 0.5) * 3
      ],
      size: Math.random() * 0.4 + 0.2,
      speed: Math.random() * 0.05 + 0.02,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.01
    }));
  }, []);

  useFrame((state, delta) => {
    if (!smokeRef.current || !isActive) return;

    // Animate each smoke particle in the group
    smokeRef.current.children.forEach((smoke, i) => {
      // Move smoke upward
      smoke.position.y += smokeParticles[i].speed * delta;
      
      // Rotate the smoke
      smoke.rotation.z += smokeParticles[i].rotationSpeed;
      
      // Reset position when it goes too high
      if (smoke.position.y > 2) {
        smoke.position.y = 0;
        smoke.position.x = 8 + (Math.random() - 0.5) * 3;
        smoke.position.z = 8 + (Math.random() - 0.5) * 3;
      }
      
      // Fade out as they go higher
      const opacity = Math.max(0, 0.3 - smoke.position.y * 0.1);
      smoke.material.opacity = opacity;
      
      // Expand as they rise
      smoke.scale.x = smoke.scale.y = smoke.scale.z = 
        smokeParticles[i].size * (1 + smoke.position.y * 0.5);
    });
  });

  return isActive ? (
    <group ref={smokeRef} position={[0, 0, 0]}>
      {smokeParticles.map((particle, i) => (
        <mesh key={i} position={particle.position} rotation={[0, 0, particle.rotation]}>
          <planeGeometry args={[particle.size, particle.size]} />
          <meshStandardMaterial 
            color="#dddddd" 
            transparent 
            opacity={0.2} 
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  ) : null;
};

TrafficSmoke.propTypes = {
  isActive: PropTypes.bool
};

const BirdAnimation = ({ isBirdHovered }) => {
  const birdRef = useRef();

  // Position is now fixed and doesn't change when hovered
  // Only the Bird component's animation plays based on hover state
  return (
    <group ref={birdRef} position={[4.8, -0.4, 6.2]} rotation={[0, Math.PI / 6, 0]}>
      <Bird scale={0.3} playAnimation={isBirdHovered} />
    </group>
  );
};

BirdAnimation.propTypes = {
  isBirdHovered: PropTypes.bool
};

const Park3D = ({ isBirdHovered, isFountainHovered, isTrafficHovered }) => {
  return (
    <>
      <group>
        <Park 
          scale={[0.5, 0.5, 0.5]}
          position={[0, -1, 0]} 
          castShadow 
          receiveShadow
        />
        <BirdAnimation 
          isBirdHovered={isBirdHovered} 
        />
        
        {/* Fountain bubbles */}
        <group position={[0, -0.3, 0]}>
          <FountainBubbles isActive={isFountainHovered} />
        </group>
        
        {/* Traffic smoke at the boundary */}
        <TrafficSmoke isActive={isTrafficHovered} />
          
        <mesh 
          position={[0, -1, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#356c4d"
            roughness={0.9}
            metalness={0.05}
            envMapIntensity={0.3}
          />
        </mesh>        <AccumulativeShadows 
          temporal 
          frames={100} 
          color="#2a2a2a" 
          colorBlend={0.7} 
          toneMapped={true}
          alphaTest={0.75}
          opacity={0.8}
          scale={100}
          position={[0, -0.99, 0]}
        >
          <RandomizedLight 
            amount={8}
            radius={6}
            ambient={0.6}
            intensity={1.2}
            position={[3, 5, 3]}
            bias={0.001}
            size={10}
          />
          <RandomizedLight 
            amount={4}
            radius={4}
            ambient={0.4}
            intensity={0.8}
            position={[-5, 7, -5]}
            bias={0.001}
            size={8}
            color="#b3d9ff"
          />
        </AccumulativeShadows>
      </group>
    </>
  );
};

Park3D.propTypes = {
  isBirdHovered: PropTypes.bool,
  isFountainHovered: PropTypes.bool,
  isTrafficHovered: PropTypes.bool
};

const Scene = ({ trackpadPosition, isBirdHovered }) => {
  // We're keeping trackpadPosition in the props even though it's not directly used by Park3D
  // because it could be needed for future enhancements or animations
  return (
    <Canvas 
      camera={{ position: [10, 2, 10], fov: 60 }}
      shadows
    >
      <color attach="background" args={["#9fbcea"]} />
        <Suspense fallback={null}>
        <Environment 
          preset="forest" 
          background={true}
          blur={0.06}
          intensity={0.6}
        />

        <ambientLight intensity={0.3} color="#ffd9b3" />
        <directionalLight 
          position={[4, 1, 10]} 
          intensity={7} 
          color="#ffb366"
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <spotLight
          position={[-5, 8, -5]}
          angle={0.3}
          penumbra={1}
          intensity={400}
          color="#b3d9ff"
          castShadow
          shadow-camera-far={50}
        />
          <Park3D 
          isBirdHovered={isBirdHovered}
        />        <EffectComposer>
          <Bloom 
            intensity={0.7} 
            luminanceThreshold={0.7} 
            luminanceSmoothing={0.4}
            blendFunction={1} // Normal blend mode
          />
          <ChromaticAberration offset={[0.0015, 0.0015]} />
          <BrightnessContrast brightness={0.05} contrast={0.15} />
        </EffectComposer>
      </Suspense>

      <OrbitControls 
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
};

Scene.propTypes = {
  trackpadPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  isBirdHovered: PropTypes.bool
};

const ParkAudioScene = () => {
  const [trackpadPosition, setTrackpadPosition] = useState({ x: 0, y: 0 });
  const [isBirdHovered, setIsBirdHovered] = useState(false);
  
  return (
    <div className="h-full grid grid-rows-[1fr,auto]">
      <div className="relative w-full h-full">
        <Scene 
          trackpadPosition={trackpadPosition} 
          isBirdHovered={isBirdHovered}
        />
      </div>
      <div className="h-[25vh] min-h-[200px] max-h-[250px] bg-gray-900/50 backdrop-blur-md">
        <AudioController 
          onPositionChange={setTrackpadPosition} 
          onBirdHover={setIsBirdHovered}
        />
      </div>
    </div>
  );
};

export default ParkAudioScene;
