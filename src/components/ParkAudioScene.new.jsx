import React, { useRef, useState, useEffect, Suspense, memo, useCallback, useImperativeHandle } from 'react';
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
  const audioRefsRef = useRef({
    sign: null,
    birds: null,
    cat: null,
    traffic: null
  });

  // Expose audioRefsRef to parent via ref
  useImperativeHandle(ref, () => audioRefsRef.current, []);

  // Track hover states internally
  const isBirdHovered = useRef(false);
  const isCatHovered = useRef(false);
  const isSignHovered = useRef(false);
  const isTrafficHovered = useRef(false);
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

  // Create audio analyzer nodes for visualization
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
  }, []);

  // Start audio playback
  const startAudio = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    if (!isPlayingRef.current && audioRefsRef.current) {
      console.log('Starting audio playback...');
      Object.entries(audioRefsRef.current).forEach(([key, audio]) => {
        if (audio?.source && audio.source.buffer) {
          try {
            audio.gainNode.gain.value = 0.5;
            audio.source.start(0);
            console.log(`Started ${key} audio source`);
          } catch (error) {
            if (!error.message.includes('start')) {
              console.error(`Error starting ${key} audio:`, error);
            }
          }
        }
      });
      isPlayingRef.current = true;
    }
  }, []);

  // Initialize audio with error handling
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const audioContext = initializeAudioContext();
        
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
          const analyzer = createAnalyzer();
          
          source.buffer = audioBuffer;
          source.loop = true;
          
          // Configure panner
          panner.panningModel = 'HRTF';
          panner.distanceModel = 'inverse';
          panner.refDistance = 1;
          panner.maxDistance = 10000;
          panner.rolloffFactor = 1;
          panner.coneInnerAngle = 360;
          panner.coneOuterAngle = 0;
          panner.coneOuterGain = 0;
          
          // Initial gain
          gainNode.gain.value = 0.5;
          
          // Connect nodes
          source.connect(panner);
          panner.connect(gainNode);
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

        // Load audio files
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

        audioRefsRef.current = Object.fromEntries(loadedAudios.filter(([_, audio]) => audio !== null));
        
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
    };

    loadAudio();
  }, [initializeAudioContext, startAudio, createAnalyzer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (isPlayingRef.current) {
        Object.values(audioRefsRef.current).forEach(audio => {
          if (audio?.source) {
            try {
              audio.source.stop();
              audio.source.disconnect();
            } catch (error) {
              if (!error.message.includes('stop')) {
                console.error('Error stopping audio:', error);
              }
            }
          }
          if (audio?.analyzer) {
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
  }, []);

  const handleTrackpadMove = useCallback((e) => {
    if (!trackpadRef.current) return;

    const rect = trackpadRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const signPos = { x: 0.5, y: 0.5 };
    const birdPos = { x: 0.7, y: 0.3 };
    const catPos = { x: 0.3, y: 0.3 };

    const maxDist = Math.sqrt(0.5);
    const signDist = Math.hypot(x - signPos.x, y - signPos.y);
    const birdDist = Math.hypot(x - birdPos.x, y - birdPos.y);
    const catDist = Math.hypot(x - catPos.x, y - catPos.y);

    const signVolume = Math.max(0, 1 - (signDist / maxDist));
    const birdVolume = Math.max(0, 1 - (birdDist / maxDist));
    const catVolume = Math.max(0, 1 - (catDist / maxDist));

    const smoothFactor = 0.1;
    const hoverBoostFactor = 1.5;

    if (audioRefsRef.current.sign) {
      const boostedSignVolume = isSignHovered.current ? signVolume * hoverBoostFactor : signVolume;
      const boostedBirdVolume = isBirdHovered.current ? birdVolume * hoverBoostFactor : birdVolume;
      const boostedCatVolume = isCatHovered.current ? catVolume * hoverBoostFactor : catVolume;

      // Update volumes
      audioRefsRef.current.sign.gainNode.gain.value = audioRefsRef.current.sign.gainNode.gain.value * (1 - smoothFactor) + boostedSignVolume * smoothFactor;
      audioRefsRef.current.birds.gainNode.gain.value = audioRefsRef.current.birds.gainNode.gain.value * (1 - smoothFactor) + boostedBirdVolume * smoothFactor;
      audioRefsRef.current.cat.gainNode.gain.value = audioRefsRef.current.cat.gainNode.gain.value * (1 - smoothFactor) + boostedCatVolume * smoothFactor;

      // Update positions
      audioRefsRef.current.sign.panner.setPosition((x - 0.5) * 2, (y - 0.5) * 2, -0.5);
      audioRefsRef.current.birds.panner.setPosition((x - birdPos.x) * 2, (y - birdPos.y) * 2, -0.5);
      audioRefsRef.current.cat.panner.setPosition((x - catPos.x) * 2, (y - catPos.y) * 2, -0.5);

      // Handle audio context state
      if (!isPlayingRef.current) {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          initializeAudioContext();
        }
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
    Object.values(audioRefsRef.current).forEach(audio => {
      if (audio?.gainNode && audio.gainNode.gain.value > 1) {
        audio.gainNode.gain.value = 1;
      }
    });

    onPositionChange?.({ x: x * 2 - 1, y: -(y * 2 - 1) });
  }, [onPositionChange, startAudio, initializeAudioContext]);

  return (
    <div className="relative h-full w-full p-2 sm:p-4 md:p-6 lg:p-8">
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
          <div className="absolute w-full h-px bg-gray-700 opacity-70 top-1/2 transform -translate-y-1/2" />
          <div className="absolute h-full w-px bg-gray-700 opacity-70 left-1/2 transform -translate-x-1/2" />
          
          <img 
            ref={signIconRef}
            src="/icons/buzz.svg"
            alt="Sign"
            className="absolute top-1/2 left-1/2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 transform -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_0_8px_rgba(77,171,247,0.5)] transition-all duration-300 hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(77,171,247,0.8)] active:scale-110 z-10" 
            title="Sign"
            onMouseEnter={() => {
              isSignHovered.current = true;
              onSignHover(true);
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
          
          <div className={`absolute top-1/2 left-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-blue-500 opacity-10 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${isSignHovered.current ? 'opacity-20' : ''}`}></div>
          <div className={`absolute top-[30%] left-[70%] w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-yellow-300 opacity-10 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${isBirdHovered.current ? 'opacity-20' : ''}`}></div>
          <div className={`absolute top-[30%] left-[30%] w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-red-400 opacity-10 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${isCatHovered.current ? 'opacity-20' : ''}`}></div>
        </div>
      </div>
    </div>
  );
}));
