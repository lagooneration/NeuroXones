import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const AADAnimation = () => {
  const [attentionFocus, setAttentionFocus] = useState(null);
  const [brainActivity, setBrainActivity] = useState([]);
  const [audioSources, setAudioSources] = useState([]);
  
  useEffect(() => {
    // Generate random brain activity data
    const brainData = Array.from({ length: 6 }, () => ({
      id: Math.random(),
      frequency: Math.random() * 2 + 1,
      amplitude: Math.random() * 0.5 + 0.5,
      phase: Math.random() * Math.PI * 2
    }));
    setBrainActivity(brainData);
    
    // Set audio sources
    setAudioSources([
      { id: 1, color: "#ff7043", name: "Speaker 1" },
      { id: 2, color: "#42a5f5", name: "Speaker 2" },
      { id: 3, color: "#66bb6a", name: "Speaker 3" }
    ]);
    
    // After a delay, set attention focus
    const timer = setTimeout(() => {
      setAttentionFocus(2); // Focus on second audio source
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="w-full h-38 mt-2 flex flex-col items-center justify-center">
      {/* Audio sources */}
      <div className="w-full flex justify-around mb-4">
        {audioSources.map((source, idx) => (
          <motion.div
            key={source.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: source.color }}
              animate={{ 
                scale: attentionFocus === idx ? [1, 1.2, 1] : 1,
                boxShadow: attentionFocus === idx ? 
                  `0 0 8px 2px ${source.color}40` : 'none'
              }}
              transition={{ 
                repeat: attentionFocus === idx ? Infinity : 0, 
                duration: 1.5
              }}
            >
              <motion.div 
                className="w-2 h-4 bg-white rounded-full"
                animate={{ 
                  height: [4, 2, 6, 3, 5, 2, 4],
                  width: [2, 3, 2, 2, 3, 2, 2]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "linear"
                }}
              />
            </motion.div>
            <div className="text-[8px] text-white mt-1">{source.name}</div>
            {attentionFocus === idx && (
              <motion.div 
                className="text-[8px] text-white mt-1 font-bold"
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
      
      {/* Brain with EEG signals */}
      <div className="relative w-full h-16 flex items-center justify-center">
        <motion.div 
          className="absolute w-16 h-10 rounded-t-full border-2 border-gray-300 border-b-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* EEG sensor points */}
          {[0, 1, 2, 3].map((idx) => (
            <motion.div
              key={idx}
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              style={{
                left: `${20 + idx * 20}%`,
                top: idx % 2 === 0 ? '20%' : '50%'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + idx * 0.1 }}
            />
          ))}
          
          {/* Brain activity waves */}
          {attentionFocus !== null && (
            <motion.svg
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 100 60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {brainActivity.map((wave, idx) => (
                <motion.path
                  key={wave.id}
                  d={generateEEGPath(wave.amplitude, wave.frequency, wave.phase, idx)}
                  fill="none"
                  stroke={idx < 3 ? audioSources[attentionFocus].color : "#9e9e9e"}
                  strokeWidth={idx < 3 ? 1 : 0.5}
                  strokeOpacity={idx < 3 ? 0.8 : 0.3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.2 + idx * 0.1, duration: 1 }}
                />
              ))}
            </motion.svg>
          )}
        </motion.div>
        
        {/* Connection line from brain to focused audio */}
        {attentionFocus !== null && (
          <motion.svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 100 100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <motion.path
              d={`M 50 20 Q 50 10, ${attentionFocus === 0 ? 20 : attentionFocus === 1 ? 50 : 80} 0`}
              fill="none"
              stroke={audioSources[attentionFocus].color}
              strokeWidth="1"
              strokeDasharray="3,2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
            />
          </motion.svg>
        )}
      </div>
      
      <motion.div 
        className="text-xs text-white font-bold mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Auditory Attention Detection
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

export default AADAnimation;
