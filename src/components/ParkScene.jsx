import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { 
  Environment, 
  OrbitControls,
  Sky
} from '@react-three/drei';
import PropTypes from 'prop-types';

// Import the 3D models
import { Player } from './models/sim_models/Player';
import { Cat } from './models/sim_models/Cat';
import { Bird } from './models/sim_models/Bird';

// Icons for the trackpad
const ICONS = {
  cat: '/icons/cat.svg',
  bird: '/icons/bird.svg',
  player: '/icons/play.svg'
};

// Audio files
const AUDIO_FILES = {
  cat: '/audio/cat.mp3',
  bird: '/audio/birds.mp3',
  player: '/audio/player.mp3'
};

// Main 3D Scene component
function Scene({ activeModel }) {
  const { camera } = useThree();
  
  useEffect(() => {
    // Position the camera for a good view of all models
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (    <>      
    {/* Better background alternative to HDR */}
      {/* <color attach="background" args={['#87CEEB']} /> */}
      {/* <Sky sunPosition={[10, 5, 0]} /> */}
      <Environment 
          files="/assets/env/japa.jpg" 
          background
          blur={0.5}
          />
      {/* Add lighting for better visibility */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* The 3D models */}
      <group>
        {/* Position the models in a semi-circle */}
        <Player 
          position={[0, 0, 0]} 
          scale={1} 
          visible={true}
        />
        <Cat 
          position={[-3, 0, 0]} 
          scale={0.5} 
          visible={true}
        />
        <Bird 
          position={[3, 0, 0]} 
          scale={0.5} 
          visible={true}
        />
      </group>
      
      {/* Controls for the camera */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        enableRotate={true} 
        minDistance={2} 
        maxDistance={15}
      />
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
    player: new Audio(AUDIO_FILES.player)
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
    // Start playing all audio files at low volume
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
  }, [initializedByUser, audioInitialized, initializeAudio]);
  useEffect(() => {
    if (!audioInitialized) return;
    
    // Store a reference to audioRefs.current to use in effect and cleanup
    const audios = audioRefs.current;
    const intervals = [];
    
    // Enhance the volume of the hovered model's audio
    Object.keys(audios).forEach(model => {
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
            Click to Enable Audio
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
  
  // Function to handle user interaction for audio context initialization
  const handleUserInteraction = () => {
    if (!audioContextInitialized) {
      setAudioContextInitialized(true);
    }
  };

  return (
    <div 
      className="park-scene-container" 
      onClick={handleUserInteraction}
    >
      <h2>Selective Listening Experience</h2>
      <p>Hover over an icon below to enhance its audio - simulating selective listening</p>
      
      <div className="canvas-container">
        <Canvas>
          <Scene activeModel={activeModel} />
        </Canvas>      </div>
      
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
      `}</style>
    </div>
  );
};

export default ParkScene;