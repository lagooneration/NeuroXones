import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const DemcusAnimation = () => {
  const [audioWaves, setAudioWaves] = useState([]);
  const [separatedWaves, setSeparatedWaves] = useState([]);
  
  // Generate random wave patterns
  useEffect(() => {
    // Generate mixed audio waves
    const waves = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      color: i === 0 ? "#ff5e5e" : i === 1 ? "#5e9fff" : "#5eff8f",
      amplitude: Math.random() * 0.3 + 0.7,
      frequency: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2
    }));
    
    setAudioWaves(waves);
    
    // After a delay, show separated waves
    const timer = setTimeout(() => {
      setSeparatedWaves(waves);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="w-full h-48 flex flex-col items-center justify-center">
      {/* Original mixed sound waves */}
      <div className="w-full h-12 relative mb-6">
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="text-xs text-white opacity-50 absolute left-2">Mixed Audio</div>
          {audioWaves.map((wave) => (
            <motion.svg 
              key={wave.id} 
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 100 20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 1 }}
            >
              <motion.path
                d={generateWavePath(wave.amplitude, wave.frequency, wave.phase)}
                fill="none"
                stroke={wave.color}
                strokeWidth="0.7"
                strokeOpacity="0.7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </motion.svg>
          ))}
        </div>
      </div>
        {/* Neural network processing representation */}
      <motion.div 
        className="w-16 h-10 bg-gradient-to-r from-purple-700 to-indigo-900 rounded-md flex items-center justify-center mb-4 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >        <motion.div 
          className="text-white text-xs font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          DEMCUS
        </motion.div>
      </motion.div>
      
      {/* Separated audio channels */}
      <div className="w-full flex justify-between">
        {separatedWaves.map((wave, index) => (
          <motion.div 
            key={wave.id}
            className="w-[30%] h-8 relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + index * 0.2, duration: 0.5 }}
          >
            <div className="text-[8px] text-white opacity-50 absolute top-3 left-1">Speaker {index + 1}</div>
            <svg className="w-full h-full" viewBox="0 0 100 20">
              <motion.path
                d={generateWavePath(wave.amplitude, wave.frequency, wave.phase, 0.7)}
                fill="none"
                stroke={wave.color}
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1.2 + index * 0.2, duration: 1 }}
              />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Helper function to generate wave paths
const generateWavePath = (amplitude = 1, frequency = 1, phase = 0, scale = 1) => {
  let path = "M 0 10 ";
  const steps = 100;
  
  for (let i = 0; i <= steps; i++) {
    const x = i;
    const y = 10 + Math.sin(i * 0.1 * frequency + phase) * 5 * amplitude * scale;
    path += `L ${x} ${y} `;
  }
  
  return path;
};

export default DemcusAnimation;
