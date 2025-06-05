import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
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

const AudioController = ({ onPositionChange }) => {
  const trackpadRef = useRef(null);
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
  };
  return (
    <div className="relative h-full w-full p-2">
      <div 
        ref={trackpadRef}
        className="w-full h-full bg-gray-900 rounded-lg relative cursor-crosshair"
        onMouseMove={handleTrackpadMove}
      >
        {/* Quadrant lines */}
        <div className="absolute w-full h-px bg-gray-700 top-1/2 transform -translate-y-1/2" />
        <div className="absolute h-full w-px bg-gray-700 left-1/2 transform -translate-x-1/2" />
        
        {/* Points of interest */}
        <div 
          className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" 
          title="Fountain"
        />
        <div 
          className="absolute top-[30%] left-[70%] w-3 h-3 bg-yellow-500 rounded-full" 
          title="Birds"
        />
        <div 
          className="absolute top-[85%] left-[15%] w-3 h-3 bg-red-500 rounded-full" 
          title="Traffic"
        />
      </div>
    </div>
  );
};

AudioController.propTypes = {
  onPositionChange: PropTypes.func
};

const BirdAnimation = ({ trackpadPosition }) => {
  const birdRef = useRef();

  useEffect(() => {
    if (birdRef.current && trackpadPosition) {
      const targetY = 2 + Math.sin((trackpadPosition.y || 0) * Math.PI) * 0.5;
      const currentY = birdRef.current.position.y || 2;
      birdRef.current.position.y = currentY + (targetY - currentY) * 0.1;
    }
  }, [trackpadPosition]);

  return (
    <group ref={birdRef} position={[3.6, -0.4, 3.6]}>
      <Bird scale={0.3} />
    </group>
  );
};

BirdAnimation.propTypes = {
  trackpadPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  })
};

const Park3D = ({ trackpadPosition }) => {
  return (
    <>
      <group>
        <Park 
          scale={[0.5, 0.5, 0.5]} 
          position={[0, -1, 0]} 
          castShadow 
          receiveShadow
        />
        <BirdAnimation trackpadPosition={trackpadPosition} />
        
        <mesh 
          position={[0, -1, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#2f784d"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        <AccumulativeShadows 
          temporal 
          frames={100} 
          color="#303030" 
          colorBlend={0.5} 
          scale={100}
          position={[0, -0.99, 0]}
        >
          <RandomizedLight 
            amount={8}
            radius={4}
            ambient={0.5}
            intensity={1}
            position={[5, 5, -10]}
            bias={0.001}
          />
        </AccumulativeShadows>
      </group>
    </>
  );
};

Park3D.propTypes = {
  trackpadPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  })
};

const Scene = ({ trackpadPosition }) => {
  return (
    <Canvas 
      camera={{ position: [10, 5, 10], fov: 60 }}
      shadows
    >
      <color attach="background" args={["#87CEEB"]} />
      
      <Suspense fallback={null}>
        <Environment 
          preset="sunset" 
          background={false}
          blur={0.8}
        />

        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <spotLight
          position={[-5, 8, -5]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />
        
        <Park3D trackpadPosition={trackpadPosition} />

        <EffectComposer>
          <Bloom 
            intensity={0.5} 
            luminanceThreshold={0.8} 
            luminanceSmoothing={0.3}
          />
          <ChromaticAberration offset={[0.001, 0.001]} />
          <BrightnessContrast brightness={0.1} contrast={0.2} />
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
  })
};

const ParkAudioScene = () => {
  const [trackpadPosition, setTrackpadPosition] = useState({ x: 0, y: 0 });
  return (
    <div className="h-full grid grid-rows-[1fr,auto]">
      <div className="relative w-full h-full">
        <Scene trackpadPosition={trackpadPosition} />
      </div>
      <div className="h-[25vh] min-h-[200px] max-h-[250px] bg-gray-900/50 backdrop-blur-md">
        <AudioController onPositionChange={setTrackpadPosition} />
      </div>
    </div>
  );
};

export default ParkAudioScene;
