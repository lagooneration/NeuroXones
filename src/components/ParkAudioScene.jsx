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
import AudioVisualizer from './AudioVisualizer';

const AudioController = ({ onPositionChange, onBirdHover, onCatHover, onSignHover }) => {
  const trackpadRef = useRef(null);
  const birdIconRef = useRef(null);
  const catIconRef = useRef(null);
  const signIconRef = useRef(null);
  const audioRefs = useRef({
    sign: null,
    birds: null,
    cat: null,
    traffic: null
  });
  
  // Track hover states internally to use in audio adjustment
  const isBirdHovered = useRef(false);
  const isCatHovered = useRef(false);
  const isSignHovered = useRef(false);
  const isTrafficHovered = useRef(false);

  // Expose audio references for the visualizer
  useEffect(() => {
    // Share audioRefs with parent component
    if (typeof window !== 'undefined') {
      window.audioRefsForVisualizer = audioRefs;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.audioRefsForVisualizer;
      }
    };
  }, []);
  useEffect(() => {
    // Create an audio context for more advanced audio control
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
      // Initialize audio elements with panning capability
    const createAudioWithPanning = (url) => {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0;
      
      // Create audio nodes for panning
      const source = audioContext.createMediaElementSource(audio);
      const gainNode = audioContext.createGain();
      const panNode = audioContext.createStereoPanner();
      const analyzerNode = audioContext.createAnalyser();
      analyzerNode.fftSize = 128;
      
      // Connect the audio pipeline
      source.connect(panNode);
      panNode.connect(gainNode);
      gainNode.connect(analyzerNode);
      analyzerNode.connect(audioContext.destination);
      
      // Store control nodes for later use
      audio.pan = panNode;
      audio.gain = gainNode;
      audio.analyzer = analyzerNode;
      
      return audio;
    };

    const audios = {
      sign: createAudioWithPanning('/audio/sign.mp3'),
      birds: createAudioWithPanning('/audio/birds.mp3'),
      cat: createAudioWithPanning('/audio/cat.mp3'),
      traffic: createAudioWithPanning('/audio/traffic.mp3')
    };

    audioRefs.current = audios;

    const initAudio = async () => {
      try {
        // Resume audio context on user interaction
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        await Promise.all(Object.values(audios).map(audio => {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            return playPromise.catch(err => {
              console.warn('Audio play was prevented:', err);
            });
          }
          return Promise.resolve();
        }));
        
        // Set initial panning positions based on their locations
        audios.birds.pan.value = 0.4;  // Bird on the right
        audios.cat.pan.value = -0.4;   // Cat on the left
        audios.sign.pan.value = 0;     // Sign in the center
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
      // Close audio context on cleanup
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(err => console.error('Error closing audio context:', err));
      }
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
    
    // Calculate distance from edge - the closer to any edge, the louder the traffic
    const trafficDist = Math.min(x, 1 - x, y, 1 - y);

    // Update audio volumes
    if (audioRefs.current.sign) {
      // Base volumes - adjusted for better spatial audio experience
      let signVolume = Math.max(0, 1 - centerDist * 1.2);
      let birdVolume = Math.max(0, 1 - birdDist * 1.2);
      let catVolume = Math.max(0, 1 - catDist * 1.2);
      let trafficVolume = Math.max(0, 1 - trafficDist * 2.5); // Traffic gets louder at edges
      
      // Enhanced selective hearing effect
      if (isBirdHovered.current) {
        birdVolume = Math.min(1, birdVolume * 2.5); // Significantly boost focused audio
        signVolume *= 0.3; // Further reduce other sounds
        catVolume *= 0.3;
        trafficVolume *= 0.2; // Reduce traffic noise even more
        
        // Add dynamic panning based on cursor position
        if (audioRefs.current.birds.pan) {
          audioRefs.current.birds.pan.value = Math.min(1, Math.max(-1, (x - 0.7) * 2));
        }
      } else if (isCatHovered.current) {
        catVolume = Math.min(1, catVolume * 2.5);
        signVolume *= 0.3;
        birdVolume *= 0.3;
        trafficVolume *= 0.2;
        
        if (audioRefs.current.cat.pan) {
          audioRefs.current.cat.pan.value = Math.min(1, Math.max(-1, (x - 0.3) * 2));
        }
      } else if (isSignHovered.current) {
        signVolume = Math.min(1, signVolume * 2.5);
        birdVolume *= 0.3;
        catVolume *= 0.3;
        trafficVolume *= 0.2;
        
        if (audioRefs.current.sign.pan) {
          audioRefs.current.sign.pan.value = Math.min(1, Math.max(-1, (x - 0.5) * 2));
        }
      } else if (isTrafficHovered.current) {
        trafficVolume = Math.min(1, trafficVolume * 2.5);
        signVolume *= 0.3;
        birdVolume *= 0.3;
        catVolume *= 0.3;
      } else {
        // Apply natural volume balancing when nothing is hovered
        // Boost the closest sound source slightly
        const minDist = Math.min(centerDist, birdDist, catDist, trafficDist);
        if (minDist === centerDist) signVolume = Math.min(1, signVolume * 1.3);
        if (minDist === birdDist) birdVolume = Math.min(1, birdVolume * 1.3);
        if (minDist === catDist) catVolume = Math.min(1, catVolume * 1.3);
        if (minDist === trafficDist) trafficVolume = Math.min(1, trafficVolume * 1.3);
      }
      
      // Apply smooth volume transitions
      const smoothFactor = 0.1; // Lower value = smoother but slower transitions
      audioRefs.current.sign.volume = audioRefs.current.sign.volume * (1 - smoothFactor) + signVolume * smoothFactor;
      audioRefs.current.birds.volume = audioRefs.current.birds.volume * (1 - smoothFactor) + birdVolume * smoothFactor;
      audioRefs.current.cat.volume = audioRefs.current.cat.volume * (1 - smoothFactor) + catVolume * smoothFactor;
      audioRefs.current.traffic.volume = audioRefs.current.traffic.volume * (1 - smoothFactor) + trafficVolume * smoothFactor;
    }

    onPositionChange?.({ x: x * 2 - 1, y: -(y * 2 - 1) });
  };return (    <div className="relative h-full w-full p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full h-full construction-border">
        <div 
          ref={trackpadRef}
          className="w-full h-full bg-gray-900 rounded-lg relative cursor-crosshair overflow-hidden shadow-inner"
          onMouseMove={handleTrackpadMove}
          onTouchMove={(e) => {
            if (e.touches && e.touches[0]) {
              const touch = e.touches[0];
              const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
              handleTrackpadMove(fakeEvent);
            }
          }}
        >
          {/* Quadrant lines */}
          <div className="absolute w-full h-px bg-gray-700 opacity-70 top-1/2 transform -translate-y-1/2" />
          <div className="absolute h-full w-px bg-gray-700 opacity-70 left-1/2 transform -translate-x-1/2" />
          
          {/* Points of interest with enhanced responsiveness */}
          <img 
            ref={signIconRef}
            src="/icons/buzz.svg"
            alt="Sign"
            className="absolute top-1/2 left-1/2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 transform -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_0_8px_rgba(77,171,247,0.5)] transition-all duration-300 hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(77,171,247,0.8)] active:scale-110 z-10" 
            title="Sign"
            onMouseEnter={() => {
              isSignHovered.current = true;
              onSignHover(true);
              // Add visual feedback
              signIconRef.current?.classList.add('animate-pulse');
            }}
            onMouseLeave={() => {
              isSignHovered.current = false;
              onSignHover(false);
              signIconRef.current?.classList.remove('animate-pulse');
            }}
          />
          <img 
            ref={birdIconRef}
            src="/icons/bird.svg"
            alt="Birds"
            className="absolute top-[30%] left-[70%] w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 filter drop-shadow-[0_0_8px_rgba(255,212,59,0.5)] transition-all duration-300 hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(255,212,59,0.8)] active:scale-110 z-10" 
            title="Birds"
            onMouseEnter={() => {
              isBirdHovered.current = true;
              onBirdHover(true);
              birdIconRef.current?.classList.add('animate-pulse');
            }}
            onMouseLeave={() => {
              isBirdHovered.current = false;
              onBirdHover(false);
              birdIconRef.current?.classList.remove('animate-pulse');
            }}
          />
          <img 
            ref={catIconRef}
            src="/icons/cat.svg"
            alt="Cat"
            className="absolute top-[30%] left-[30%] w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 filter drop-shadow-[0_0_8px_rgba(255,107,107,0.5)] transition-all duration-300 hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(255,107,107,0.8)] active:scale-110 z-10" 
            title="Cat"
            onMouseEnter={() => {
              isCatHovered.current = true;
              onCatHover(true);
              catIconRef.current?.classList.add('animate-pulse');
            }}
            onMouseLeave={() => {
              isCatHovered.current = false;
              onCatHover(false);
              catIconRef.current?.classList.remove('animate-pulse');
            }}
          />
          
          {/* Visual indicators for audio sources - subtle glowing circles */}
          <div className={`absolute top-1/2 left-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-blue-500 opacity-10 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${isSignHovered.current ? 'opacity-20' : ''}`}></div>
          <div className={`absolute top-[30%] left-[70%] w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-yellow-300 opacity-10 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${isBirdHovered.current ? 'opacity-20' : ''}`}></div>
          <div className={`absolute top-[30%] left-[30%] w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-red-400 opacity-10 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${isCatHovered.current ? 'opacity-20' : ''}`}></div>
        </div>
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
        />        
        {/* <EffectComposer>
          <Bloom 
            intensity={0.7} 
            luminanceThreshold={0.7} 
            luminanceSmoothing={0.4}
            blendFunction={1} // Normal blend mode
          />
          <ChromaticAberration offset={[0.0015, 0.0015]} />
          <BrightnessContrast brightness={0.05} contrast={0.15} />
        </EffectComposer> */}
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

const LoadingScreen = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl text-white font-light">Loading Neuro Experience</h2>
        <p className="text-gray-400 mt-2">Please wait while we tune your neural interface...</p>
      </div>
    </div>
  );
};

const ParkAudioScene = () => {
  const [trackpadPosition, setTrackpadPosition] = useState({ x: 0, y: 0 });
  const [isBirdHovered, setIsBirdHovered] = useState(false);
  const [isCatHovered, setIsCatHovered] = useState(false);
  const [isSignHovered, setIsSignHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAudioSource, setActiveAudioSource] = useState(null);
    // Effect handler for hovering on audio sources
  const handleAudioHover = (source, isHovered) => {
    if (isHovered) {
      setActiveAudioSource(source);
      // When changing audio sources, we need to make sure the audio context is in running state
      if (typeof window !== 'undefined' && window.audioRefsForVisualizer) {
        const audioRefs = window.audioRefsForVisualizer.current;
        if (audioRefs) {
          // Ensure audio context is running
          const audioContext = audioRefs.sign?.gain?.context || 
                              audioRefs.birds?.gain?.context || 
                              audioRefs.cat?.gain?.context;
          
          if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().catch(err => console.warn('Failed to resume audio context:', err));
          }
        }
      }
    } else if (activeAudioSource === source) {
      setActiveAudioSource(null);
    }
  }
  
  // Use effect to simulate loading
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="h-full grid grid-rows-[1fr,auto]">
      <div className="relative w-full h-full">
        <Scene 
          trackpadPosition={trackpadPosition} 
          isBirdHovered={isBirdHovered}
          isCatHovered={isCatHovered}
          isSignHovered={isSignHovered}
        />
        
        {/* Audio source indicator */}
        {activeAudioSource && (
          <div className="absolute top-12 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2 animate-[fadeIn_0.5s_ease-in-out]">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-[pulse_1.5s_infinite_ease-in-out]"></span>
            <span>Focusing on: {activeAudioSource}</span>
          </div>
        )}
        
        {/* Audio visualizer */}
        <AudioVisualizer 
          activeAudioSource={activeAudioSource} 
          audioRefs={typeof window !== 'undefined' ? window.audioRefsForVisualizer : null}
        />
      </div>
      
      <div className="h-[25vh] min-h-[200px] max-h-[250px] bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-md">
        <AudioController 
          onPositionChange={setTrackpadPosition} 
          onBirdHover={(isHovered) => {
            setIsBirdHovered(isHovered);
            handleAudioHover('Birds', isHovered);
          }}
          onCatHover={(isHovered) => {
            setIsCatHovered(isHovered);
            handleAudioHover('Cat', isHovered);
          }}
          onSignHover={(isHovered) => {
            setIsSignHovered(isHovered);
            handleAudioHover('Sign', isHovered);
          }}
        />
      </div>
    </div>
  );
};

export default ParkAudioScene;
