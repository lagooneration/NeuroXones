import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ConvTasNetAnimation = () => {
  const [waveData, setWaveData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [outputWaves, setOutputWaves] = useState([]);
  
  useEffect(() => {
    // Generate input wave data
    const inputWave = Array.from({ length: 10 }, () => Math.random() * 0.8 + 0.2);
    setWaveData(inputWave);
    
    // Generate convolutional filters
    const filterData = Array.from({ length: 3 }, () => 
      Array.from({ length: 3 }, () => Math.random() * 2 - 1)
    );
    setFilters(filterData);
    
    // After a delay, show the output waves (separated audio)
    const timer = setTimeout(() => {
      const outputs = [
        Array.from({ length: 10 }, () => Math.random() * 0.8 + 0.2),
        Array.from({ length: 10 }, () => Math.random() * 0.8 + 0.2)
      ];
      setOutputWaves(outputs);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="w-full h-48 flex flex-col items-center justify-center">
      {/* Input audio wave */}
      <div className="relative w-full h-10 mb-3">
        <div className="text-xs text-white opacity-50 absolute left-2 top-0">Input</div>
        <div className="w-full h-full flex items-center justify-center">
          <motion.svg 
            className="w-full h-full" 
            viewBox="0 0 100 20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.path
              d={`M 0 10 ${waveData.map((value, index) => 
                `L ${index * 10} ${10 - value * 8}`).join(' ')}`}
              fill="none"
              stroke="#ffb74d"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </motion.svg>
        </div>
      </div>
      
      {/* Convolutional filters */}
      <div className="flex space-x-3 mb-3">
        {filters.map((filter, filterIdx) => (
          <motion.div 
            key={filterIdx}
            className="w-8 h-8 bg-[#1a1c2e] rounded border border-indigo-900 grid grid-rows-3 grid-cols-3"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + filterIdx * 0.2, duration: 0.3 }}
          >

            {filter.map((value, valueIdx) => (
              <motion.div 
                key={valueIdx}
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + filterIdx * 0.2 + valueIdx * 0.05 }}
              >
                <div 
                  className={`w-2 h-2 rounded-full ${
                    value > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ opacity: Math.abs(value) }}
                />
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
      <motion.div 
              className="text-white text-xs font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Low Latency, Suitable for Real-Time
            </motion.div>
        {/* Convolution operation indicator */}
      <motion.div 
        className="text-xs text-[#3a29ff] font-bold mb-3 relative"
        initial={{ opacity: 0 }}        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        ConvTasNet
      </motion.div>
      
      {/* Output separated waves */}
      <div className="w-full flex justify-between">
        {outputWaves.map((wave, waveIdx) => (
          <motion.div 
            key={waveIdx}
            className="w-[48%] h-8 relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 + waveIdx * 0.2, duration: 0.5 }}
          >
            <div className="text-[8px] text-white opacity-50 absolute top-2 left-1">Stream {waveIdx + 1}</div>
            <svg className="w-full h-full" viewBox="0 0 100 20">
              <motion.path
                d={`M 0 10 ${wave.map((value, index) => 
                  `L ${index * 10} ${10 - value * 8}`).join(' ')}`}
                fill="none"
                stroke={waveIdx === 0 ? "#64b5f6" : "#81c784"}
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.6 + waveIdx * 0.2, duration: 1 }}
              />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ConvTasNetAnimation;
