import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const AADAnimation = () => {
  // Define initial state values to avoid flashing empty content
  const [attentionFocus, setAttentionFocus] = useState(1); // Start with middle speaker focused
  const [brainActivity, setBrainActivity] = useState([]);
  const [audioSources, setAudioSources] = useState([
    { id: "1", color: "#ff7043", name: "Speaker 1" },
    { id: "2", color: "#42a5f5", name: "Speaker 2" },
    { id: "3", color: "#66bb6a", name: "Speaker 3" }
  ]);
  const [audioWaves, setAudioWaves] = useState([]);
  const isMounted = useRef(true);
  const initComplete = useRef(false);
  
  useEffect(() => {
    // Mark as mounted
    isMounted.current = true;
    
    // Initialize immediately with default waves if not already initialized
    if (!initComplete.current) {
      // Generate brain activity data
      const brainData = Array.from({ length: 6 }, () => ({
        id: Math.random().toString(),
        frequency: Math.random() * 2 + 1,
        amplitude: Math.random() * 0.5 + 0.5,
        phase: Math.random() * Math.PI * 2
      }));
      setBrainActivity(brainData);
      
      // Generate audio waves for each speaker
      const waves = [];
      for (let i = 0; i < 3; i++) {
        waves.push(Array.from({ length: 3 }, () => ({
          id: Math.random().toString(),
          frequency: Math.random() * 1.5 + 0.8,
          amplitude: Math.random() * 0.6 + 0.4,
          phase: Math.random() * Math.PI * 2
        })));
      }
      setAudioWaves(waves);
      initComplete.current = true;
    }
    
    // Optional: Cycle through different speakers to show focus changing
    const cycleTimer = setTimeout(() => {
      if (!isMounted.current) return;
      
      // Cycle between speakers (0, 1, 2) every 4 seconds
      const cycleInterval = setInterval(() => {
        if (!isMounted.current) return;
        setAttentionFocus(prev => (prev + 1) % 3);
      }, 4000);
      
      return () => clearInterval(cycleInterval);
    }, 2000);
    
    return () => {
      isMounted.current = false;
      clearTimeout(cycleTimer);
    };
  }, []);
  
  return (
    <div className="w-full h-48 flex flex-col items-center justify-center">
      {/* Audio sources row */}
      <div className="w-full flex justify-around mt-3">
        {audioSources.map((source, idx) => (
          <motion.div
            key={source.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="w-6 h-6 rounded-full flex items-center justify-center relative"
              style={{ 
                backgroundColor: source.color,
                opacity: attentionFocus === idx ? 1 : 0.6
              }}
              animate={{ 
                scale: attentionFocus === idx ? [1, 1.2, 1] : 1,
                boxShadow: attentionFocus === idx ? 
                  `0 0 10px 3px ${source.color}60` : 'none'
              }}
              transition={{ 
                repeat: attentionFocus === idx ? Infinity : 0, 
                duration: 2
              }}
            >
              {/* Speaker icon */}
              <motion.div 
                className="w-2 h-3 bg-white rounded-sm"
                initial={{ opacity: 0.8 }}
                animate={{ 
                  opacity: [0.8, 1, 0.8],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              />
              
              {/* Audio pulse rings - only for focused speaker */}
              {attentionFocus === idx && (
                <>
                  <motion.div 
                    className="absolute rounded-full border-2 w-full h-full"
                    style={{ borderColor: source.color }}
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 2 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeOut",
                      repeatDelay: 0.5
                    }}
                  />
                  <motion.div 
                    className="absolute rounded-full border-2 w-full h-full"
                    style={{ borderColor: source.color }}
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 2 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeOut",
                      delay: 0.5
                    }}
                  />
                </>
              )}
            </motion.div>
            
            <div className="text-[9px] text-white mt-1 font-medium">{source.name}</div>
            {attentionFocus === idx && (
              <motion.div 
                className="text-[8px] text-white mt-0.5 font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                FOCUSED
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
        {/* Audio waves visualization */}
      <div className="relative w-full h-12 flex items-center justify-center mt-1">
        {/* Fallback when waves aren't initialized yet */}
        {(!audioWaves || audioWaves.length === 0) && (
          <div className="w-full flex justify-around">
            {[0, 1, 2].map((idx) => (
              <motion.div
                key={`fallback-${idx}`}
                className="h-8 w-20 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: idx === attentionFocus ? 1 : 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="h-[2px] w-16 rounded-full" 
                  style={{ 
                    backgroundColor: audioSources[idx]?.color || 
                      (idx === 0 ? "#ff7043" : idx === 1 ? "#42a5f5" : "#66bb6a")
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Main audio waves visualization */}
        {audioWaves && audioWaves.length > 0 && audioSources.length > 0 && (
          <motion.div 
            className="w-full h-full relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {audioWaves.map((speakerWaves, speakerIdx) => (
              <div key={`speaker-${speakerIdx}`} className="absolute inset-0">
                {/* Show all waves but highlight the focused one */}
                <motion.svg
                  className="w-full h-full"
                  viewBox="0 0 100 30"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: speakerIdx === attentionFocus ? 1 : 0.2,
                    scale: speakerIdx === attentionFocus ? 1 : 0.9,
                    y: speakerIdx === attentionFocus ? 0 : speakerIdx === 0 ? -2 : 2
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Add colored background glow for the active speaker */}
                  {speakerIdx === attentionFocus && (
                    <motion.rect
                      x="0" y="5" width="100" height="20"
                      fill={audioSources[speakerIdx]?.color || "#ffffff"}
                      opacity="0.1"
                      rx="10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.05, 0.12, 0.05] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut" 
                      }}
                    />
                  )}
                  
                  {/* Draw the wave paths */}
                  {speakerWaves && speakerWaves.map((wave, waveIdx) => (
                    <motion.path
                      key={wave.id}
                      d={generateAudioWavePath(wave.amplitude, wave.frequency, wave.phase, waveIdx, speakerIdx)}
                      fill="none"
                      stroke={audioSources[speakerIdx]?.color || "#ffffff"}
                      strokeWidth={speakerIdx === attentionFocus ? 2 - (waveIdx * 0.5) : 0.7}
                      strokeOpacity={speakerIdx === attentionFocus ? 1 - (waveIdx * 0.2) : 0.2}
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: 1,
                        strokeDashoffset: [0, -20, 0],
                      }}
                      transition={{ 
                        pathLength: { duration: 1 },
                        strokeDashoffset: { 
                          repeat: Infinity, 
                          duration: speakerIdx === 0 ? 5 : speakerIdx === 1 ? 4 : 6,
                          ease: "linear"
                        }
                      }}
                      strokeDasharray={speakerIdx === attentionFocus ? "0" : "2 2"}
                    />
                  ))}
                </motion.svg>
              </div>
            ))}
          </motion.div>
        )}      </div>
      
      {/* Brain section */}
      <div className="relative w-full h-10 flex items-center justify-center">
        <motion.div 
          className="w-10 h-7 rounded-t-full border-2 border-gray-300 border-b-0 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Brain activity glow - takes color of focused speaker */}
          {attentionFocus !== null && audioSources[attentionFocus] && (
            <motion.div
              className="absolute inset-0 rounded-t-full"
              style={{
                backgroundColor: audioSources[attentionFocus]?.color || "#ffffff",
                opacity: 0.2
              }}
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
          
          {/* EEG sensor points */}
          {[0, 1, 2, 3].map((idx) => (
            <motion.div
              key={idx}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${20 + idx * 20}%`,
                top: idx % 2 === 0 ? '20%' : '50%'
              }}
              animate={{ 
                opacity: [0.7, 1, 0.7],
                scale: idx === 1 || idx === 2 ? [1, 1.3, 1] : 1
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                delay: idx * 0.3
              }}
            />
          ))}
        </motion.div>

        
        {/* Connection lines from brain to all audio sources */}
        <motion.svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 100 40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Light connection lines to all speakers */}
          {audioSources.map((source, idx) => (
            <motion.path
              key={`connection-${idx}`}
              d={`M 50 20 Q 50 10, ${idx === 0 ? 20 : idx === 1 ? 50 : 80} 5`}
              fill="none"
              stroke={idx === attentionFocus ? source.color : "#555555"}
              strokeWidth={idx === attentionFocus ? 2 : 0.7}
              strokeOpacity={idx === attentionFocus ? 0.9 : 0.3}
              strokeDasharray={idx === attentionFocus ? "3,2" : "2,3"}
              initial={{ pathLength: 0 }}
              animate={{ 
                pathLength: 1,
                strokeDashoffset: idx === attentionFocus ? [0, -30, 0] : 0
              }}
              transition={{ 
                pathLength: { duration: 0.5 },
                strokeDashoffset: { 
                  repeat: idx === attentionFocus ? Infinity : 0,
                  duration: 3
                }
              }}
            />
          ))}
          
          {/* Attention indicator pulses for the focused speaker */}
          {attentionFocus !== null && audioSources[attentionFocus] && (
            <>
              <motion.circle
                cx={attentionFocus === 0 ? 20 : attentionFocus === 1 ? 50 : 80}
                cy="5"
                r="3"
                fill={audioSources[attentionFocus]?.color || "#ffffff"}
                fillOpacity={0.7}
                animate={{ 
                  r: [3, 5, 3],
                  fillOpacity: [0.5, 0.8, 0.5]
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <motion.circle
                cx={attentionFocus === 0 ? 20 : attentionFocus === 1 ? 50 : 80}
                cy="5"
                r="1.5"
                fill={audioSources[attentionFocus]?.color || "#ffffff"}
              />
            </>
          )}
        </motion.svg>
      </div>
      <motion.div 
              className="text-white text-xs font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              ⚠️ 0.5 to 2 seconds
            </motion.div>
      
      <motion.div 
        className="text-xs text-white font-bold mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        for Attention Decoding
      </motion.div>
    </div>
  );
};

// Helper function to generate EEG wave paths
const generateEEGPath = (amplitude, frequency, phase, offset) => {
  let path = "";
  const steps = 100;
  const yOffset = 10 + offset * 8;
  
  for (let i = 0; i <= steps; i++) {
    const x = i;
    const y = yOffset + Math.sin(i * 0.1 * frequency + phase) * 4 * amplitude;
    if (i === 0) {
      path += `M ${x} ${y} `;
    } else {
      path += `L ${x} ${y} `;
    }
  }
  
  return path;
};

// Helper function to generate audio wave paths with more variation for speakers
const generateAudioWavePath = (amplitude, frequency, phase, waveIdx, speakerIdx) => {
  let path = "";
  const steps = 100;
  
  // Position each speaker's waves in different vertical positions
  // Center speaker in the middle, others offset to sides
  let xOffset = 0;
  if (speakerIdx === 0) xOffset = -20;
  if (speakerIdx === 2) xOffset = 20;
  
  // Different wave shape based on speaker
  const waveFunction = (i, freq, phase) => {
    if (speakerIdx === 0) {
      // Speaker 1: Sharper peaks
      return Math.sin(i * 0.15 * freq + phase) * Math.pow(Math.sin(i * 0.02), 2);
    } else if (speakerIdx === 1) {
      // Speaker 2: Smoother sine waves
      return Math.sin(i * 0.12 * freq + phase);
    } else {
      // Speaker 3: More complex wave pattern
      return Math.sin(i * 0.1 * freq + phase) * (1 + 0.3 * Math.sin(i * 0.03 * freq));
    }
  };
  
  // Scale to different heights based on wave index
  const yScale = 5 - waveIdx * 1;
  
  for (let i = 0; i <= steps; i++) {
    const x = i + xOffset;
    // Center the waves vertically at different positions based on speaker
    const yCenter = 15 + (speakerIdx - 1) * 3; 
    const y = yCenter + waveFunction(i, frequency, phase) * yScale * amplitude;
    
    if (i === 0) {
      path += `M ${x} ${y} `;
    } else {
      path += `L ${x} ${y} `;
    }
  }
  
  return path;
};

export default AADAnimation;
