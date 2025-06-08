import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls,
  Environment,
  AccumulativeShadows,
  RandomizedLight,
  useAnimations,
  useGLTF
} from '@react-three/drei';
import { 
  EffectComposer,
  Bloom,
  ChromaticAberration,
  BrightnessContrast 
} from '@react-three/postprocessing';
import { Bird } from './models/sim_models/Bird';
import { Cat } from './models/sim_models/Cat';
import { Sign } from './models/sim_models/Sign';
import PropTypes from 'prop-types';

const AudioController = ({ onPositionChange, onBirdHover, onCatHover, onSignHover }) => {
  const trackpadRef = useRef(null);
  const birdIconRef = useRef(null);
  const catIconRef = useRef(null);
  const signIconRef = useRef(null);
  const audioRefs = useRef({
    sign: null,
    birds: null,
    cat: null
  });
  
  // Track hover states internally to use in audio adjustment
  const isBirdHovered = useRef(false);
  const isCatHovered = useRef(false);
  const isSignHovered = useRef(false);

  useEffect(() => {
    const audios = {
      sign: new Audio('/audio/sign.mp3'),
      birds: new Audio('/audio/birds.mp3'),
      cat: new Audio('/audio/cat.mp3'),
      traffic: new Audio('/audio/traffic.mp3') // Reusing traffic audio for cat
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
    const catDist = Math.sqrt(Math.pow(x - 0.3, 2) + Math.pow(y - 0.3, 2));

    // Update audio volumes
    if (audioRefs.current.sign) {
      // Base volumes - louder than before
      let signVolume = Math.max(0, 1 - centerDist * 1.5);
      let birdVolume = Math.max(0, 1 - birdDist * 1.5);
      let catVolume = Math.max(0, 1 - catDist * 1.5);
      
      // Attention detection effect
      if (isBirdHovered.current) {
        birdVolume = Math.min(1, birdVolume * 1.5);
        signVolume *= 0.6;
        catVolume *= 0.6;
      } else if (isCatHovered.current) {
        catVolume = Math.min(1, catVolume * 1.5);
        signVolume *= 0.6;
        birdVolume *= 0.6;
      } else if (isSignHovered.current) {
        signVolume = Math.min(1, signVolume * 1.5);
        birdVolume *= 0.6;
        catVolume *= 0.6;
      }
      
      audioRefs.current.sign.volume = signVolume;
      audioRefs.current.birds.volume = birdVolume;
      audioRefs.current.cat.volume = catVolume;
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
        
        {/* Points of interest */}
        <img 
          ref={signIconRef}
          src="/icons/buzz.svg" /* Reusing fountain icon for sign */
          alt="Sign"
          className="absolute top-1/2 left-1/2 w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_0_8px_rgba(77,171,247,0.5)]" 
          title="Sign"
          onMouseEnter={() => {
            isSignHovered.current = true;
            onSignHover(true);
          }}
          onMouseLeave={() => {
            isSignHovered.current = false;
            onSignHover(false);
          }}
        />
        <img 
          ref={birdIconRef}
          src="/icons/bird.svg"
          alt="Birds"
          className="absolute top-[30%] left-[70%] w-10 h-10 filter drop-shadow-[0_0_8px_rgba(255,212,59,0.5)]" 
          title="Birds"
          onMouseEnter={() => {
            isBirdHovered.current = true;
            onBirdHover(true);
          }}
          onMouseLeave={() => {
            isBirdHovered.current = false;
            onBirdHover(false);
          }}
        />
        <img 
          ref={catIconRef}
          src="/icons/cat.svg" /* Reusing traffic icon for cat */
          alt="Cat"
          className="absolute top-[30%] left-[30%] w-10 h-10 filter drop-shadow-[0_0_8px_rgba(255,107,107,0.5)]" 
          title="Cat"
          onMouseEnter={() => {
            isCatHovered.current = true;
            onCatHover(true);
          }}
          onMouseLeave={() => {
            isCatHovered.current = false;
            onCatHover(false);
          }}
        />
      </div>
    </div>
  );
};

AudioController.propTypes = {
  onPositionChange: PropTypes.func,
  onBirdHover: PropTypes.func,
  onCatHover: PropTypes.func,
  onSignHover: PropTypes.func
};

// Component code for Fountain and Traffic has been removed and replaced with Cat and Sign models

const BirdAnimation = ({ isBirdHovered }) => {
  const birdRef = useRef();

  // Position is now fixed and doesn't change when hovered
  // Only the Bird component's animation plays based on hover state
  return (
    <group ref={birdRef} position={[5.8, -0.4, 7.2]} rotation={[0, Math.PI / 6, 0]}>
      <Bird scale={0.32} playAnimation={isBirdHovered} />
    </group>
  );
};

BirdAnimation.propTypes = {
  isBirdHovered: PropTypes.bool
};

const CatAnimation = ({ isCatHovered }) => {
  const catRef = useRef();
  const { animations } = useGLTF('/models/cat.glb');
  const { actions } = useAnimations(animations, catRef);
  
  useEffect(() => {
    // Debug the available animations
    if (actions && Object.keys(actions).length > 0) {
      console.log('Available cat animations:', Object.keys(actions));
    }
    
    if (isCatHovered) {
      // Try to play animation - if Animation doesn't exist, try the first available animation
      if (actions.Animation) {
        actions.Animation.reset().fadeIn(0.5).play();
      } else if (Object.keys(actions).length > 0) {
        const animName = Object.keys(actions)[0];
        actions[animName].reset().fadeIn(0.5).play();
      }
    } else {
      // Stop animation when not hovered
      if (actions.Animation) {
        actions.Animation.fadeOut(0.5);
      } else if (Object.keys(actions).length > 0) {
        const animName = Object.keys(actions)[0];
        actions[animName].fadeOut(0.5);
      }
    }
  }, [isCatHovered, actions]);

  return (
    <group ref={catRef} position={[2.8, -0.9, 3.2]} rotation={[0, -Math.PI / 2, 0]} scale={0.08}>
      <Cat />
    </group>
  );
};

CatAnimation.propTypes = {
  isCatHovered: PropTypes.bool
};

const SignAnimation = ({ isSignHovered }) => {
  const signRef = useRef();
  const { animations } = useGLTF('/models/sign.glb');
  const { actions } = useAnimations(animations, signRef);
  
  useEffect(() => {
    // Debug the available animations
    if (actions && Object.keys(actions).length > 0) {
      console.log('Available sign animations:', Object.keys(actions));
    }
    
    // Sign animations may have different names, adjust as needed
    const animationName = Object.keys(actions)[0]; // Get first animation
    
    if (isSignHovered) {
      // Enhance animation or lighting when hovered
      if (actions[animationName]) {
        actions[animationName].reset().fadeIn(0.5).play();
      }
    } else {
      // Return to normal state
      if (actions[animationName]) {
        actions[animationName].fadeOut(0.5);
      }
    }
  }, [isSignHovered, actions]);

  return (
    <group ref={signRef} position={[2.9, 2.8, 0]} rotation={[0, Math.PI / 3, 0]} scale={0.8}>
      <Sign />
    </group>
  );
};

SignAnimation.propTypes = {
  isSignHovered: PropTypes.bool
};

const Park3D = ({ isBirdHovered, isCatHovered, isSignHovered }) => {
  return (
    <>
      <group>
        {/* <SimScene 
          scale={[1, 1, 1]}
          position={[0, 0, 0]} 
          castShadow 
          receiveShadow
        /> */}
        <BirdAnimation 
          isBirdHovered={isBirdHovered} 
        />
        <CatAnimation 
          isCatHovered={isCatHovered}
        />
        
        {/* Sign in the center */}
        <SignAnimation 
          isSignHovered={isSignHovered}
        />
          
        <mesh 
          position={[0, -1, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          {/* <planeGeometry args={[100, 100]} /> */}
          <meshStandardMaterial 
            color="#356c4d"
            roughness={0.9}
            metalness={0.05}
            envMapIntensity={0.3}
          />
        </mesh>        
        <AccumulativeShadows 
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
  isCatHovered: PropTypes.bool,
  isSignHovered: PropTypes.bool
};

const Scene = ({ trackpadPosition, isBirdHovered, isCatHovered, isSignHovered }) => {
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
          files="/assets/env/anime_art_style_japan_streets_with_cherry_blossom_.jpg"
          background={true}
          blur={0}
          intensity={1.5}
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
          isCatHovered={isCatHovered}
          isSignHovered={isSignHovered}
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
        enableZoom={true}
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
  isBirdHovered: PropTypes.bool,
  isCatHovered: PropTypes.bool,
  isSignHovered: PropTypes.bool
};

const ParkAudioScene = () => {
  const [trackpadPosition, setTrackpadPosition] = useState({ x: 0, y: 0 });
  const [isBirdHovered, setIsBirdHovered] = useState(false);
  const [isCatHovered, setIsCatHovered] = useState(false);
  const [isSignHovered, setIsSignHovered] = useState(false);
  
  return (
    <div className="h-full grid grid-rows-[1fr,auto]">
      <div className="relative w-full h-full">
        <Scene 
          trackpadPosition={trackpadPosition} 
          isBirdHovered={isBirdHovered}
          isCatHovered={isCatHovered}
          isSignHovered={isSignHovered}
        />
      </div>
      <div className="h-[25vh] min-h-[200px] max-h-[250px] bg-gray-900/50 backdrop-blur-md">
        <AudioController 
          onPositionChange={setTrackpadPosition} 
          onBirdHover={setIsBirdHovered}
          onCatHover={setIsCatHovered}
          onSignHover={setIsSignHovered}
        />
      </div>
    </div>
  );
};

export default ParkAudioScene;
