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
import { Sign } from './models/sim_models/Sign';
import AudioVisualizer from './AudioVisualizer';

// Extend THREE elements for JSX use
extend(THREE);

const AudioController = memo(React.forwardRef((props, ref) => {
  const { onPositionChange, onBirdHover, onCatHover, onSignHover } = props;
  const trackpadRef = useRef(null);
  const birdIconRef = useRef(null);
  const catIconRef = useRef(null);
  const signIconRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioRefs = useRef({
    sign: null,
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
  const isSignHovered = useRef(false);
  const isTrafficHovered = useRef(false);

  // Track if audio is playing
  const isPlayingRef = useRef(false);
  // Create audio context lazily on first user interaction
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
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
    }

    if (!isPlayingRef.current && audioRefs.current) {
      console.log('Starting audio playback...');
      Object.entries(audioRefs.current).forEach(([key, audio]) => {
        if (audio?.source && audio.source.buffer) {
          try {
            // Set initial gain to avoid sudden loud sounds
            audio.gainNode.gain.value = 0.5;
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
  const createAnalyzer = useCallback(() => {
    const audioContext = audioContextRef.current;
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
        const audioContext = initializeAudioContext();
        
        // Create audio with panning capability
        const createAudioWithPanning = async (url) => {
          console.log(`Loading audio from ${url}`);
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio file ${url}: ${response.status} ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const source = audioContext.createBufferSource();
          const panner = audioContext.createPanner();
          const gainNode = audioContext.createGain();
          
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
          
          // Set initial gain to prevent sudden loud sounds
          gainNode.gain.value = 0.5;
            source.connect(panner);
          panner.connect(gainNode);
          
          // Create analyzer for this source
          const analyzer = createAnalyzer();
          if (analyzer) {
            gainNode.connect(analyzer);
            analyzer.connect(audioContext.destination);
          } else {
            gainNode.connect(audioContext.destination);
          }
          
          return { source, panner, gainNode, analyzer, isStarted: false };
        };

        const audioUrls = {
          sign: '/audio/sign.mp3',
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
          startAudio();
          document.removeEventListener('click', handleFirstInteraction);
          document.removeEventListener('touchstart', handleFirstInteraction);
        };
        
        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);

      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };    loadAudio();
  }, [initializeAudioContext, startAudio, createAnalyzer]);

  // Memoize handlers
  const handleTrackpadMove = useCallback((e) => {
    if (!trackpadRef.current) return;

    const rect = trackpadRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Calculate distances to each audio source
    const signPos = { x: 0.5, y: 0.5 }; // center
    const birdPos = { x: 0.7, y: 0.3 }; // top-right
    const catPos = { x: 0.3, y: 0.3 };  // top-left

    // Calculate distances (normalized 0-1)
    const maxDist = Math.sqrt(0.5);
    const signDist = Math.hypot(x - signPos.x, y - signPos.y);
    const birdDist = Math.hypot(x - birdPos.x, y - birdPos.y);
    const catDist = Math.hypot(x - catPos.x, y - catPos.y);

    // Convert distance to volume (closer = louder)
    const signVolume = Math.max(0, 1 - (signDist / maxDist));
    const birdVolume = Math.max(0, 1 - (birdDist / maxDist));
    const catVolume = Math.max(0, 1 - (catDist / maxDist));

    // Apply hover boost and smooth transitions
    const smoothFactor = 0.1;
    const hoverBoostFactor = 1.5;

    if (audioRefs.current.sign) {
      // Apply hover boost if element is hovered
      const boostedSignVolume = isSignHovered.current ? signVolume * hoverBoostFactor : signVolume;
      const boostedBirdVolume = isBirdHovered.current ? birdVolume * hoverBoostFactor : birdVolume;
      const boostedCatVolume = isCatHovered.current ? catVolume * hoverBoostFactor : catVolume;

      // Update gain nodes with smooth transitions
      audioRefs.current.sign.gainNode.gain.value = audioRefs.current.sign.gainNode.gain.value * (1 - smoothFactor) + boostedSignVolume * smoothFactor;
      audioRefs.current.birds.gainNode.gain.value = audioRefs.current.birds.gainNode.gain.value * (1 - smoothFactor) + boostedBirdVolume * smoothFactor;
      audioRefs.current.cat.gainNode.gain.value = audioRefs.current.cat.gainNode.gain.value * (1 - smoothFactor) + boostedCatVolume * smoothFactor;

      // Update panner positions
      audioRefs.current.sign.panner.setPosition((x - 0.5) * 2, (y - 0.5) * 2, -0.5);
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
}));

AudioController.propTypes = {
  onPositionChange: PropTypes.func,
  onBirdHover: PropTypes.func,
  onCatHover: PropTypes.func,
  onSignHover: PropTypes.func,
  ref: PropTypes.shape({
    current: PropTypes.object
  })
};

// Component code for Fountain and Traffic has been removed and replaced with Cat and Sign models

const Scene = memo(({ isBirdHovered, isCatHovered, isSignHovered }) => {
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
          blur={0}
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
          isSignHovered={isSignHovered}
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
  isSignHovered: PropTypes.bool
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

const SignAnimation = memo(({ isSignHovered }) => {
  const { scene, animations } = useGLTF('/models/sign.glb');
  const modelRef = useRef();
  const { actions } = useAnimations(animations, modelRef);
    useEffect(() => {
    const currentActions = actions;
    // Play all available animations when hovered
    if (currentActions) {
      Object.values(currentActions).forEach(action => {
        if (action && typeof action.reset === 'function') {
          if (isSignHovered) {
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
              console.warn('Error stopping sign animation:', error);
            }
          }
        });
      }
    };
  }, [isSignHovered, actions]);

  return (
    <TransformableGroup
      position={[2.9, 2.8, 0]}
      rotation={[0, Math.PI / 3, 0]}
      scale={0.8}
    >
      <group ref={modelRef}>
        <primitive object={scene} />
      </group>
    </TransformableGroup>
  );
});

SignAnimation.propTypes = {
  isSignHovered: PropTypes.bool
};

const Park3D = memo(({ isBirdHovered, isCatHovered, isSignHovered }) => {
  return (
    <group>
      <BirdAnimation isBirdHovered={isBirdHovered} />
      <CatAnimation isCatHovered={isCatHovered} />
      <SignAnimation isSignHovered={isSignHovered} />
    </group>
  );
});

Park3D.propTypes = {
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
      <div className="relative w-full h-full">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [10, 2, 10], fov: 60 }}>
          <Scene
            isBirdHovered={isBirdHovered}
            isCatHovered={isCatHovered}
            isSignHovered={isSignHovered}
          />
        </Canvas>

        {activeAudioSource && (
          <div className="absolute top-16 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2 animate-[fadeIn_0.5s_ease-in-out]">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-[pulse_1.5s_infinite_ease-in-out]"></span>
            <span>Focusing on: {activeAudioSource}</span>
          </div>
        )}        
        {/* <AudioVisualizer
          activeAudioSource={activeAudioSource}
          audioRefs={window.audioRefs?.current}
        /> */}
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
          }}
          onCatHover={(isHovered) => {
            setIsCatHovered(isHovered);
            handleAudioHover('cat', isHovered);
          }}
          onSignHover={(isHovered) => {
            setIsSignHovered(isHovered);
            handleAudioHover('sign', isHovered);
          }}
        />
      </div>
    </div>
  );
};

export default ParkAudioScene;
