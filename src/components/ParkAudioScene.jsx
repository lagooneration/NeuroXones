import React, { useRef, useState, useEffect, Suspense, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Canvas, extend, useThree } from '@react-three/fiber';
import {
  Environment,
  OrbitControls,
  AccumulativeShadows,
  RandomizedLight,
  useGLTF,
  useAnimations,
  Preload
} from '@react-three/drei';
import * as THREE from 'three';
import { Bird } from './models/sim_models/Bird';
import { Cat } from './models/sim_models/Cat';
import { Player } from './models/Player';
import AudioVisualizer from './AudioVisualizer';

// Extend THREE elements for JSX use
extend(THREE);

const AudioController = memo(React.forwardRef((props, ref) => {
  const { onPositionChange, onBirdHover, onCatHover, onPlayerHover } = props;
  const trackpadRef = useRef(null);
  const birdIconRef = useRef(null);
  const catIconRef = useRef(null);
  const playerIconRef = useRef(null);
  const audioContextRef = useRef(null);  const audioRefs = useRef({
    player: null,
    birds: null,
    cat: null,
    traffic: null
  });

  // Expose audioRefs to parent via ref
  useEffect(() => {
    if (ref) {
      ref.current = audioRefs;
    }
  }, [ref]);
  // Track hover states internally to use in audio adjustment
  const isBirdHovered = useRef(false);
  const isCatHovered = useRef(false);
  const isPlayerHovered = useRef(false);
  const isTrafficHovered = useRef(false);

  // Track if audio is playing
  const isPlayingRef = useRef(false);  // Create audio context lazily on first user interaction
  const initializeAudioContext = useCallback(() => {
    // If context doesn't exist or is closed, create a new one
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      console.log('Creating new AudioContext');
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    } else if (audioContextRef.current.state === 'suspended') {
      // If suspended, try to resume
      console.log('Resuming suspended AudioContext');
      audioContextRef.current.resume().catch(err => {
        console.error('Failed to resume AudioContext:', err);
      });
    }
    return audioContextRef.current;
  }, []);

  // Start audio playback
  const startAudio = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    // Make sure context is resumed
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }    if (!isPlayingRef.current && audioRefs.current) {
      console.log('Starting audio playback...');
      Object.entries(audioRefs.current).forEach(([key, audio]) => {
        if (audio?.source && audio.source.buffer) {
          try {
            // Set initial gain to the desired base volume (70%)
            audio.gainNode.gain.value = 0.7;
            audio.source.start(0);
            console.log(`Started ${key} audio source`);
          } catch (error) {
            if (!error.message.includes('start')) {
              console.error(`Error starting ${key} audio:`, error);
            }
          }
        } else {
          console.warn(`Audio source or buffer not ready for ${key}`);
        }
      });
      isPlayingRef.current = true;
    }
  }, []);

  // Cleanup function for audio resources
  useEffect(() => {
    return () => {
      // Cleanup audio context and resources
      if (isPlayingRef.current) {
        Object.values(audioRefs.current).forEach(audio => {
          if (audio?.source) {
            try {
              audio.source.stop();
              audio.source.disconnect();
            } catch (error) {
              if (!error.message.includes('stop')) {
                console.error('Error stopping audio:', error);
              }
            }
          }          if (audio?.analyzer) {
            audio.analyzer.disconnect();
          }
          if (audio?.panner) {
            audio.panner.disconnect();
          }
          if (audio?.gainNode) {
            audio.gainNode.disconnect();
          }
        });
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);  // Create audio analyzer nodes for visualization
  const createAnalyzer = useCallback((ctx = null) => {
    // Use provided context or the current one
    const audioContext = ctx || audioContextRef.current;
    if (!audioContext) {
      console.warn('No audio context available for analyzer creation');
      return null;
    }

    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 2048;
    analyzer.smoothingTimeConstant = 0.8;
    analyzer.minDecibels = -90;
    analyzer.maxDecibels = -10;
    return analyzer;
  }, []);// Setup analyzers for each audio source
  useEffect(() => {
    if (audioContextRef.current && audioRefs.current) {
      Object.entries(audioRefs.current).forEach(([key, audio]) => {
        if (audio?.gainNode && !audio.analyzer) {
          const analyzer = createAnalyzer();
          if (analyzer) {
            audio.gainNode.connect(analyzer);
            audio.analyzer = analyzer;
            console.log(`Created analyzer for ${key} audio source`);
          }
        }
      });
    }
  }, [createAnalyzer]);
  // Initialize audio with error handling
  useEffect(() => {
    const loadAudio = async () => {
      try {
        // Initialize audio context first and make sure it's ready
        const audioContext = initializeAudioContext();
        if (!audioContext) {
          throw new Error('Failed to initialize audio context');
        }
          // Create audio with panning capability
        const createAudioWithPanning = async (url) => {
          console.log(`Loading audio from ${url}`);
          // Ensure we're using the latest audio context
          const currentAudioContext = audioContextRef.current;
          
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio file ${url}: ${response.status} ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await currentAudioContext.decodeAudioData(arrayBuffer);
          
          const source = currentAudioContext.createBufferSource();
          const panner = currentAudioContext.createPanner();
          const gainNode = currentAudioContext.createGain();
          
          source.buffer = audioBuffer;
          source.loop = true;
          
          // Configure panner for better spatial audio
          panner.panningModel = 'HRTF';
          panner.distanceModel = 'inverse';
          panner.refDistance = 1;
          panner.maxDistance = 10000;
          panner.rolloffFactor = 1;
          panner.coneInnerAngle = 360;
          panner.coneOuterAngle = 0;
          panner.coneOuterGain = 0;
            
          // Set initial gain to 0.7 (70% volume)
          gainNode.gain.value = 0.7;
          source.connect(panner);
          panner.connect(gainNode);
          
          // Create analyzer for this source, passing the current audio context
          const analyzer = createAnalyzer(currentAudioContext);
          if (analyzer) {
            gainNode.connect(analyzer);
            analyzer.connect(currentAudioContext.destination);
          } else {
            gainNode.connect(currentAudioContext.destination);
          }
          
          return { source, panner, gainNode, analyzer, isStarted: false };
        };const audioUrls = {
          player: '/audio/player.mp3',
          birds: '/audio/birds.mp3',
          cat: '/audio/cat.mp3',
          traffic: '/audio/traffic.mp3'
        };

        // Load all audio files
        const loadedAudios = await Promise.all(
          Object.entries(audioUrls).map(async ([key, url]) => {
            try {
              const audio = await createAudioWithPanning(url);
              console.log(`Successfully loaded audio for ${key}`);
              return [key, audio];
            } catch (error) {
              console.error(`Failed to load audio for ${key}:`, error);
              return [key, null];
            }
          })
        );

        // Update refs with loaded audio
        audioRefs.current = Object.fromEntries(loadedAudios.filter(([_, audio]) => audio !== null));
          // Add click/touch listeners for first interaction
        const handleFirstInteraction = () => {
          console.log('First user interaction detected');
          // Make sure we have the latest audio context before starting playback
          initializeAudioContext();
          startAudio();
          document.removeEventListener('click', handleFirstInteraction);
          document.removeEventListener('touchstart', handleFirstInteraction);
        };
        
        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);      } catch (error) {
        console.error('Failed to initialize audio:', error);
        // Try to recover by reinitializing the audio context
        if (error.message && error.message.includes('AudioContext')) {
          console.log('Attempting to recover from audio context error...');
          try {
            // Force create a new audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            // Retry load after a short delay
            setTimeout(loadAudio, 500);
          } catch (retryError) {
            console.error('Failed to recover audio context:', retryError);
          }
        }
      }
    };loadAudio();
  }, [initializeAudioContext, startAudio, createAnalyzer]);

  // Memoize handlers
  const handleTrackpadMove = useCallback((e) => {
    if (!trackpadRef.current) return;    const rect = trackpadRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
      // Calculate distances to each audio source
    const playerPos = { x: 0.5, y: 0.5 }; // center
    const birdPos = { x: 0.7, y: 0.3 }; // top-right
    const catPos = { x: 0.3, y: 0.3 };  // top-left

    // Calculate distances (normalized 0-1)
    const maxDist = Math.sqrt(0.5);
    const playerDist = Math.hypot(x - playerPos.x, y - playerPos.y);
    const birdDist = Math.hypot(x - birdPos.x, y - birdPos.y);
    const catDist = Math.hypot(x - catPos.x, y - catPos.y);    // Set base volumes and focus values as per your request
    const baseVolume = 0.7; // Default volume for all sounds (70%)
    const reducedVolume = 0.35; // Volume for non-focused sounds (35%)
    const smoothFactor = 0.1; // For smooth transitions
    
    if (audioRefs.current.player) {
      // Determine which source is being focused on (if any)
      const isFocusingOnPlayer = isPlayerHovered.current;
      const isFocusingOnBird = isBirdHovered.current;
      const isFocusingOnCat = isCatHovered.current;
      const isFocusing = isFocusingOnPlayer || isFocusingOnBird || isFocusingOnCat;
      
      // Set default volumes (all at base volume when no focus)
      let playerTargetVolume = baseVolume;
      let birdTargetVolume = baseVolume;
      let catTargetVolume = baseVolume;
      
      // If focusing on an object, reduce others to the lower volume
      if (isFocusing) {
        if (isFocusingOnPlayer) {
          // Keep player at base volume, reduce others
          playerTargetVolume = baseVolume;
          birdTargetVolume = reducedVolume;
          catTargetVolume = reducedVolume;
        } else if (isFocusingOnBird) {
          // Keep birds at base volume, reduce others
          playerTargetVolume = reducedVolume;
          birdTargetVolume = baseVolume;
          catTargetVolume = reducedVolume;
        } else if (isFocusingOnCat) {
          // Keep cat at base volume, reduce others
          playerTargetVolume = reducedVolume;
          birdTargetVolume = reducedVolume;
          catTargetVolume = baseVolume;
        }
      }
      
      // Apply smooth transitions to the gain nodes
      audioRefs.current.player.gainNode.gain.value = audioRefs.current.player.gainNode.gain.value * (1 - smoothFactor) + playerTargetVolume * smoothFactor;
      audioRefs.current.birds.gainNode.gain.value = audioRefs.current.birds.gainNode.gain.value * (1 - smoothFactor) + birdTargetVolume * smoothFactor;
      audioRefs.current.cat.gainNode.gain.value = audioRefs.current.cat.gainNode.gain.value * (1 - smoothFactor) + catTargetVolume * smoothFactor;// Update panner positions
      audioRefs.current.player.panner.setPosition((x - 0.5) * 2, (y - 0.5) * 2, -0.5);
      audioRefs.current.birds.panner.setPosition((x - birdPos.x) * 2, (y - birdPos.y) * 2, -0.5);
      audioRefs.current.cat.panner.setPosition((x - catPos.x) * 2, (y - catPos.y) * 2, -0.5);

      // Handle audio context state
      if (!isPlayingRef.current) {
        // If context is closed, reinitialize it
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          initializeAudioContext();
        }
        // Try to start audio
        startAudio();
      } else if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(error => {
          console.error('Error resuming audio context:', error);
          if (error.message.includes('closed')) {
            initializeAudioContext();
            startAudio();
          }
        });
      }
    }

    // Ensure gain values are within valid range
    Object.values(audioRefs.current).forEach(audio => {
      if (audio?.gainNode && audio.gainNode.gain.value > 1) {
        audio.gainNode.gain.value = 1;
      }
    });

    onPositionChange?.({ x: x * 2 - 1, y: -(y * 2 - 1) });
  }, [onPositionChange, startAudio, initializeAudioContext]);return (    <div className="relative h-full w-full p-2 sm:p-4 md:p-6 lg:p-8">
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
          <div className="absolute h-full w-px bg-gray-700 opacity-70 left-1/2 transform -translate-x-1/2" />          {/* Points of interest with enhanced responsiveness */}
          <img 
            ref={playerIconRef}
            src="/icons/play.svg"
            alt="Player"
            className="absolute top-1/2 left-1/2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 transform -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_0_8px_rgba(77,171,247,0.5)] transition-all duration-300 hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(77,171,247,0.8)] active:scale-110 z-10" 
            title="Player"            onMouseEnter={() => {
              isPlayerHovered.current = true;
              onPlayerHover(true);
              // Add visual feedback
              playerIconRef.current?.classList.add('animate-pulse');
            }}
            onMouseLeave={() => {
              isPlayerHovered.current = false;
              onPlayerHover(false);
              playerIconRef.current?.classList.remove('animate-pulse');
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
          <div className={`absolute top-1/2 left-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-purple-500 opacity-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isPlayerHovered.current ? 'opacity-30 scale-125 shadow-lg shadow-purple-500/50' : ''}`}></div>
          <div className={`absolute top-[30%] left-[70%] w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-yellow-300 opacity-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isBirdHovered.current ? 'opacity-30 scale-125 shadow-lg shadow-yellow-300/50' : ''}`}></div>
          <div className={`absolute top-[30%] left-[30%] w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-red-400 opacity-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isCatHovered.current ? 'opacity-30 scale-125 shadow-lg shadow-red-400/50' : ''}`}></div>
        </div>
      </div>
    </div>
  );
}));

AudioController.propTypes = {
  onPositionChange: PropTypes.func,
  onBirdHover: PropTypes.func,
  onCatHover: PropTypes.func,
  onPlayerHover: PropTypes.func,
  ref: PropTypes.shape({
    current: PropTypes.object
  })
};

// Component code for Fountain and Traffic has been removed and replaced with Cat and Sign models

const Scene = memo(({ isBirdHovered, isCatHovered, isPlayerHovered }) => {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (camera) {
      camera.position.set(10, 2, 10);
      camera.fov = 60;
      camera.updateProjectionMatrix();
    }
    if (gl) {
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }, [camera, gl]);

  return (
    <>
      <color attach="background" args={['#9fbcea']} />
      <fog attach="fog" args={['#9fbcea', 10, 50]} />
      
      <Suspense fallback={null}>
        <Environment 
          files="/assets/env/background.jpg"
          background
          blur={0.03}
        />

        <hemisphereLight intensity={0.3} groundColor="#ffd9b3" />
        <directionalLight 
          castShadow
          position={[4, 1, 10]}
          intensity={7}
        >
          <orthographicCamera 
            attach="shadow-camera"
            args={[-10, 10, 10, -10, 0.1, 100]}
          />
        </directionalLight>
        
        <spotLight
          castShadow
          position={[-5, 8, -5]}
          penumbra={1}
          intensity={400}
          color="#b3d9ff"
          shadow-camera-far={50}
        />
          <Park3D 
          isBirdHovered={isBirdHovered}
          isCatHovered={isCatHovered}
          isPlayerHovered={isPlayerHovered}
        />

 

        <AccumulativeShadows
          position={[0, -0.99, 0]}
          scale={100}
          frames={100}
          temporal
          opacity={0.8}
          color="#2a2a2a"
          blend={0.7}
        >
          <RandomizedLight
            amount={8}
            radius={6}
            intensity={1.2}
            position={[3, 5, 3]}
            bias={0.001}
          />
          <RandomizedLight
            amount={4}
            radius={4}
            intensity={0.8}
            position={[-5, 7, -5]}
            color="#b3d9ff"
            bias={0.001}
          />
        </AccumulativeShadows>

        <Preload all />
      </Suspense>

      <OrbitControls
        enableZoom
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
});

Scene.propTypes = {
  isBirdHovered: PropTypes.bool,
  isCatHovered: PropTypes.bool,
  isPlayerHovered: PropTypes.bool
};

const TransformableGroup = memo(({ position, rotation, scale, children }) => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      if (position) ref.current.position.set(...position);
      if (rotation) ref.current.rotation.set(...rotation);
      if (scale) {
        if (Array.isArray(scale)) {
          ref.current.scale.set(...scale);
        } else {
          ref.current.scale.set(scale, scale, scale);
        }
      }
    }
  }, [position, rotation, scale]);

  return <group ref={ref}>{children}</group>;
});

TransformableGroup.propTypes = {
  children: PropTypes.node,
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ])
};

const BirdAnimation = memo(({ isBirdHovered }) => (
  <TransformableGroup
    position={[5.8, -0.4, 7.2]}
    rotation={[0, Math.PI / 6, 0]}
  >
    <Bird scale={0.32} playAnimation={isBirdHovered} />
  </TransformableGroup>
));

BirdAnimation.propTypes = {
  isBirdHovered: PropTypes.bool
};

const CatAnimation = memo(({ isCatHovered }) => {
  const { scene, animations } = useGLTF('/models/cat.glb');
  const modelRef = useRef();
  const { actions } = useAnimations(animations, modelRef);
    useEffect(() => {
    const currentActions = actions;
    // Play all available animations when hovered
    if (currentActions) {
      Object.values(currentActions).forEach(action => {
        if (action && typeof action.reset === 'function') {
          if (isCatHovered) {
            action.reset().fadeIn(0.2).play();
          } else {
            action.fadeOut(0.2);
          }
        }
      });
    }
    return () => {
      if (currentActions) {
        Object.values(currentActions).forEach(action => {
          if (action && typeof action.stop === 'function') {
            try {
              action.stop();
            } catch (error) {
              console.warn('Error stopping cat animation:', error);
            }
          }
        });
      }
    };
  }, [isCatHovered, actions]);

  return (
    <TransformableGroup
      position={[2.8, -0.9, 3.2]}
      rotation={[0, -Math.PI / 2, 0]}
      scale={0.08}
    >
      <group ref={modelRef}>
        <primitive object={scene} />
      </group>
    </TransformableGroup>
  );
});

CatAnimation.propTypes = {
  isCatHovered: PropTypes.bool
};

const PlayerAnimation = memo(({ isPlayerHovered }) => {
  const { scene, animations } = useGLTF('/models/player.glb');
  const modelRef = useRef();
  const { actions } = useAnimations(animations, modelRef);
    useEffect(() => {
    const currentActions = actions;
    // Play all available animations when hovered
    if (currentActions) {
      Object.values(currentActions).forEach(action => {
        if (action && typeof action.reset === 'function') {
          if (isPlayerHovered) {
            action.reset().fadeIn(0.2).play();
          } else {
            action.fadeOut(0.2);
          }
        }
      });
    }    return () => {
      if (currentActions) {
        Object.values(currentActions).forEach(action => {
          if (action && typeof action.stop === 'function') {
            try {
              action.stop();
            } catch (error) {
              console.warn('Error stopping player animation:', error);
            }
          }
        });
      }
    };
  }, [isPlayerHovered, actions]);

  return (
    <TransformableGroup
      position={[-10.6, -4.5, 0]}
      rotation={[0, Math.PI / 1.6, 0]}
      scale={6}
    >
      <group ref={modelRef}>
        <primitive object={scene} />
      </group>
    </TransformableGroup>
  );
});

PlayerAnimation.propTypes = {
  isPlayerHovered: PropTypes.bool
};

const Park3D = memo(({ isBirdHovered, isCatHovered, isPlayerHovered }) => {
  return (
    <group>
      <BirdAnimation isBirdHovered={isBirdHovered} />
      <CatAnimation isCatHovered={isCatHovered} />
      <PlayerAnimation isPlayerHovered={isPlayerHovered} />
    </group>
  );
});

Park3D.propTypes = {
  isBirdHovered: PropTypes.bool,
  isCatHovered: PropTypes.bool,
  isPlayerHovered: PropTypes.bool
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

const ParkAudioScene = () => {  const [trackpadPosition, setTrackpadPosition] = useState({ x: 0, y: 0 });
  const [isBirdHovered, setIsBirdHovered] = useState(false);
  const [isCatHovered, setIsCatHovered] = useState(false);
  const [isPlayerHovered, setIsPlayerHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAudioSource, setActiveAudioSource] = useState(null);
  const handleAudioHover = useCallback((source, isHovered) => {
    if (isHovered) {
      setActiveAudioSource(source);
    } else if (activeAudioSource === source) {
      setActiveAudioSource(null);
    }
  }, [activeAudioSource]);

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
      <div className="relative w-full h-full">        <Canvas shadows dpr={[1, 2]} camera={{ position: [10, 2, 10], fov: 60 }}>
          <Scene
            isBirdHovered={isBirdHovered}
            isCatHovered={isCatHovered}
            isPlayerHovered={isPlayerHovered}
          />
        </Canvas>        {activeAudioSource && (
          <div className="absolute top-16 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 animate-[fadeIn_0.5s_ease-in-out]" style={{
            boxShadow: activeAudioSource.toLowerCase() === 'birds' ? '0 0 10px rgba(255, 212, 59, 0.5)' : 
                       activeAudioSource.toLowerCase() === 'cat' ? '0 0 10px rgba(255, 107, 107, 0.5)' : 
                       '0 0 10px rgba(77, 171, 247, 0.5)'
          }}>
            <span className="inline-block w-2 h-2 rounded-full animate-[pulse_1.5s_infinite_ease-in-out]" style={{
              backgroundColor: activeAudioSource.toLowerCase() === 'birds' ? 'rgb(255, 212, 59)' : 
                              activeAudioSource.toLowerCase() === 'cat' ? 'rgb(255, 107, 107)' : 
                              'rgb(77, 171, 247)'
            }}></span>
            <span>Audio Focus: {activeAudioSource}</span>
          </div>
        )}
        <AudioVisualizer
          activeAudioSource={activeAudioSource}
          audioRefs={window.audioRefs?.current}
        />
      </div>      
      <div className="h-[25vh] min-h-[200px] max-h-[250px] bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-md">
        <AudioController
          ref={audioRefs => {
            if (audioRefs) {
              window.audioRefs = audioRefs;
            }
          }}
          onPositionChange={setTrackpadPosition}
          onBirdHover={(isHovered) => {
            setIsBirdHovered(isHovered);
            handleAudioHover('birds', isHovered);
          }}          onCatHover={(isHovered) => {
            setIsCatHovered(isHovered);
            handleAudioHover('cat', isHovered);
          }}
          onPlayerHover={(isHovered) => {
            setIsPlayerHovered(isHovered);
            handleAudioHover('player', isHovered);
          }}
        />
      </div>
    </div>
  );
};

export default ParkAudioScene;
