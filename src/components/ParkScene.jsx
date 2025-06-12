import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { 
  Environment, 
  useProgress,
  Html,
  useGLTF
} from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

// Import the 3D models
import { Player } from './models/sim_models/Player';
import { Cat } from './models/sim_models/Cat';
import { Bird } from './models/sim_models/Bird';

// Icons for the trackpad
const ICONS = {
  cat: '/icons/cat.svg',
  bird: '/icons/bird.svg',
  player: '/icons/player.svg'
};

// Audio files
const AUDIO_FILES = {
  cat: '/audio/cat.mp3',
  bird: '/audio/bird.mp3',
  player: '/audio/player.mp3',
  traffic: '/audio/traffic.mp3'
};

// Loading indicator component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader-container">
        <div className="loader"></div>
        <div className="loading-text">{progress.toFixed(0)}% loaded</div>
      </div>
    </Html>
  );
}

// Preload all models to prevent context loss
useGLTF.preload('/models/player.glb');
useGLTF.preload('/models/cat.glb');
useGLTF.preload('/models/bird.glb');

// Main 3D Scene component
function Scene({ activeModel }) {
  const { camera, gl, scene } = useThree();
  
  useEffect(() => {
    // Position the camera for a good view of all models
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    // Enable shadow mapping
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Set pixel ratio to avoid performance issues
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Optimize renderer
    gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
    
    // Limit frame rate to 60 fps to avoid overloading the GPU
    const clock = new THREE.Clock();
    const limitFramerate = () => {
      const delta = clock.getDelta();
      if (delta < 1/60) {
        setTimeout(() => {
          requestAnimationFrame(limitFramerate);
        }, (1/60 - delta) * 1000);
      } else {
        requestAnimationFrame(limitFramerate);
      }
    };
    limitFramerate();

    // Ensure proper cleanup
    return () => {
      // Dispose of any materials, geometries, or textures if needed
      scene.traverse((object) => {
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.texture) {
          object.texture.dispose();
        }
      });
    };
  }, [camera, gl, scene]);

  return (    
  <>      
  {/* Better background alternative to HDR */}
      {/* <color attach="background" args={['#87CEEB']} /> */}
      {/* <Sky sunPosition={[10, 5, 0]} /> */}
      {/* <Environment preset="park" background={false} /> */}
      <Environment
        files="/assets/env/japan.jpg"
        background
        blur={0.03}
        />
      {/* Add lighting for better visibility */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
        {/* The 3D models */}
      <group>
        {/* Position the models in a semi-circle */}
        <Player 
          position={[7, -4, -18]}
          rotation={[0, -Math.PI / 4, 0]} 
          scale={10} 
          visible={true}
          isActive={activeModel === 'player'}
        />
        <Cat 
          position={[-2, -0.8, -8]} 
          rotation={[0, -Math.PI / 12, 0]} 
          scale={0.08} 
          visible={true}
          isActive={activeModel === 'cat'}
        />
        <Bird 
          position={[0.7, 0, 4.2]} 
          rotation={[0, -Math.PI / 6, 0]} 
          scale={4} 
          visible={true}
          isActive={activeModel === 'bird'}
        />
      </group>
      
    </>
  );
}

Scene.propTypes = {
  activeModel: PropTypes.string
};

// Trackpad component with icons
function Trackpad({ activeModel, setActiveModel }) {
  const handleHover = (model) => {
    setActiveModel(model);
  };

  const handleMouseLeave = () => {
    setActiveModel(null);
  };

  return (
    <div className="trackpad">
      {Object.keys(ICONS).map((model) => (
        <div
          key={model}
          className={`trackpad-icon ${activeModel === model ? 'active' : ''}`}
          onMouseEnter={() => handleHover(model)}
          onMouseLeave={handleMouseLeave}
        >
          <img src={ICONS[model]} alt={model} />
        </div>
      ))}
    </div>
  );
}

Trackpad.propTypes = {
  activeModel: PropTypes.string,
  setActiveModel: PropTypes.func.isRequired
};

// Audio Controller component
function AudioController({ activeModel, initializedByUser }) {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioRefs = useRef({
    cat: new Audio(AUDIO_FILES.cat),
    bird: new Audio(AUDIO_FILES.bird),
    player: new Audio(AUDIO_FILES.player),
    traffic: new Audio(AUDIO_FILES.traffic)
  });

  // Initialize audio settings but don't play yet
  useEffect(() => {
    // Store a reference to audioRefs.current to use in cleanup
    const audios = audioRefs.current;
    
    // Pre-load all audio files
    Object.values(audios).forEach(audio => {
      audio.load();
      audio.loop = true;
      audio.volume = 0.1; // Default low volume
    });
    
    // Set traffic volume to 30%
    audios.traffic.volume = 0.2;
    
    // Cleanup function
    return () => {
      Object.values(audios).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);
  // Function to start audio playback (will be called after user interaction)
  const initializeAudio = useCallback(() => {
    if (audioInitialized) return;
    
    const audios = audioRefs.current;
    // Ensure traffic sound is at 30% volume
    audios.traffic.volume = 0.2;
    
    // Start playing all audio files
    const playPromises = Object.values(audios).map(audio => 
      audio.play().catch(e => console.log("Audio playback error:", e))
    );
    
    Promise.all(playPromises)
      .then(() => setAudioInitialized(true))
      .catch(err => console.error("Could not initialize audio:", err));
  }, [audioInitialized]);
    // Try to initialize audio when initializedByUser changes to true
  useEffect(() => {
    if (initializedByUser && !audioInitialized) {
      initializeAudio();
    }
  }, [initializedByUser, audioInitialized, initializeAudio]);  useEffect(() => {
    if (!audioInitialized) return;
    
    // Store a reference to audioRefs.current to use in effect and cleanup
    const audios = audioRefs.current;
    const intervals = [];
    
    // Enhance the volume of the hovered model's audio
    Object.keys(audios).forEach(model => {
      // Skip traffic sound as it should maintain constant volume
      if (model === 'traffic') return;
      
      if (activeModel === model) {
        // Gradually increase volume
        const fadeIn = setInterval(() => {
          if (audios[model].volume < 1.0) {
            audios[model].volume = Math.min(1.0, audios[model].volume + 0.05);
          } else {
            clearInterval(fadeIn);
          }
        }, 50);
        intervals.push(fadeIn);
      } else {
        // Gradually decrease volume
        const fadeOut = setInterval(() => {
          if (audios[model].volume > 0.1) {
            audios[model].volume = Math.max(0.1, audios[model].volume - 0.05);
          } else {
            clearInterval(fadeOut);
          }
        }, 50);
        intervals.push(fadeOut);
      }
    });
    
    // Clean up all intervals on unmount or when activeModel changes
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [activeModel, audioInitialized]);

  return (
    <>
      {!audioInitialized && (
        <div className="audio-init-overlay" onClick={initializeAudio}>
          <button className="audio-init-button">
            Start 
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM10.6935 15.8458L15.4137 13.059C16.1954 12.5974 16.1954 11.4026 15.4137 10.941L10.6935 8.15419C9.93371 7.70561 9 8.28947 9 9.21316V14.7868C9 15.7105 9.93371 16.2944 10.6935 15.8458Z" fill="#1C274C"></path> </g></svg>
          </button>
        </div>
      )}
    </>
  ); // This component renders an overlay if audio isn't initialized
}

AudioController.propTypes = {
  activeModel: PropTypes.string,
  initializedByUser: PropTypes.bool
};

// Main ParkScene component
const ParkScene = () => {
  const [activeModel, setActiveModel] = useState(null);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const [canvasError, setCanvasError] = useState(false);
  
  // Function to handle user interaction for audio context initialization
  const handleUserInteraction = () => {
    if (!audioContextInitialized) {
      setAudioContextInitialized(true);
    }
  };

  // Handle canvas errors
  const handleCanvasError = useCallback((error) => {
    console.error("Canvas error:", error);
    setCanvasError(true);
  }, []);

  return (
    <div 
      className="park-scene-container" 
      onClick={handleUserInteraction}
    >
      <h2>Active Listening</h2>
      <p>Hover over an icon below to enhance - simulating selective listening</p>      <div className="canvas-container">
        <Canvas
          gl={{ 
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          camera={{ position: [2, 2, 10], fov: 55 }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}          
          shadows
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color('#87CEEB'), 0);
            // Only add event listener if canvas is available
            if (gl.domElement) {
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                e.preventDefault();
                console.log('WebGL context lost. Trying to restore...');
                // You could add additional handling here
              });
            }
          }}
        >
          <Suspense fallback={<Loader />}>
            <Scene activeModel={activeModel} />
          </Suspense>
        </Canvas>
      </div>
      
      <Trackpad activeModel={activeModel} setActiveModel={setActiveModel} />
      <AudioController activeModel={activeModel} initializedByUser={audioContextInitialized} />
      <style>{`
        .park-scene-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          color: white;
          text-align: center;
          margin-top: 1.2rem;
        }
        
        h2 {
          margin-bottom: 0.5rem;
          font-size: 2rem;
        }
        
        p {
          margin-bottom: 2rem;
          opacity: 0.8;
        }
        
        .canvas-container {
          width: 100%;
          height: 500px;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 2rem;
          position: relative;
        }
        
        .trackpad {
          display: flex;
          gap: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }
        
        .trackpad-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .trackpad-icon img {
          width: 30px;
          height: 30px;
        }
        
        .trackpad-icon.active {
          background: rgba(255, 255, 255, 0.6);
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }
        
        .audio-init-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          z-index: 10;
          cursor: pointer;
        }
        
        .audio-init-button {
          padding: 1rem 2rem;
          background: #4a88ff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
          .audio-init-button:hover {
          background: #3a78ff;
          transform: scale(1.05);
        }
        
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .loader {
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 5px solid #4a88ff;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        
        .loading-text {
          color: white;
          font-size: 16px;
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ParkScene;