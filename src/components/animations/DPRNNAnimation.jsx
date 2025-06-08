import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const DPRNNAnimation = () => {
  const [processingStage, setProcessingStage] = useState(0);
  const [networkNodes, setNetworkNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  
  useEffect(() => {
    // Generate network nodes
    const nodes = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 10 + (i % 4) * 25,
      y: 10 + Math.floor(i / 4) * 25,
      active: false,
      path: Math.floor(i / 8) // 0 for intra-sequence, 1 for inter-sequence
    }));
    
    setNetworkNodes(nodes);
    
    // Animation sequence
    const timer1 = setTimeout(() => {
      // Activate intra-sequence path
      setProcessingStage(1);
      setNetworkNodes(prev => prev.map(node => ({
        ...node,
        active: node.path === 0
      })));
      
      // Generate intra-sequence connections
      const intraConnections = [];
      for (let i = 0; i < 7; i++) {
        intraConnections.push({
          id: `intra-${i}`,
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[i + 1].x,
          y2: nodes[i + 1].y,
          type: 'intra'
        });
      }
      setConnections(intraConnections);
    }, 800);
    
    const timer2 = setTimeout(() => {
      // Activate inter-sequence path
      setProcessingStage(2);
      setNetworkNodes(prev => prev.map(node => ({
        ...node,
        active: node.path === 1
      })));
      
      // Generate inter-sequence connections
      const interConnections = [];
      for (let i = 8; i < 15; i++) {
        interConnections.push({
          id: `inter-${i}`,
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[i + 1].x,
          y2: nodes[i + 1].y,
          type: 'inter'
        });
      }
      setConnections(interConnections);
    }, 2000);
    
    const timer3 = setTimeout(() => {
      // Show full network
      setProcessingStage(3);
      setNetworkNodes(prev => prev.map(node => ({
        ...node,
        active: true
      })));
      
      // Generate all connections
      const allConnections = [];
      // Intra-sequence connections
      for (let i = 0; i < 7; i++) {
        allConnections.push({
          id: `intra-${i}`,
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[i + 1].x,
          y2: nodes[i + 1].y,
          type: 'intra'
        });
      }
      // Inter-sequence connections
      for (let i = 8; i < 15; i++) {
        allConnections.push({
          id: `inter-${i}`,
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[i + 1].x,
          y2: nodes[i + 1].y,
          type: 'inter'
        });
      }
      // Path connections
      for (let i = 0; i < 8; i++) {
        allConnections.push({
          id: `path-${i}`,
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[i + 8].x,
          y2: nodes[i + 8].y,
          type: 'path'
        });
      }
      setConnections(allConnections);
    }, 3200);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);
  return (
    <div className="w-full h-40 flex flex-col items-center justify-center">
      <div className="relative w-full h-32">
        {/* Network visualization */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Connections */}
          {connections.map(conn => (
            <motion.line
              key={conn.id}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke={conn.type === 'intra' ? '#ff5722' : conn.type === 'inter' ? '#2196f3' : '#9c27b0'}
              strokeWidth="0.8"
              strokeOpacity="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          ))}
          
          {/* Nodes */}
          {networkNodes.map(node => (
            <motion.circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r="2.5"
              fill={node.path === 0 ? '#ff5722' : '#2196f3'}
              initial={{ scale: 0 }}
              animate={{ 
                scale: node.active ? 1 : 0.5,
                fillOpacity: node.active ? 1 : 0.3
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </svg>
        
        {/* Processing stage indicators */}
        <div className="absolute bottom-0 left-0 w-full flex justify-around">
          <motion.div 
            className={`text-[8px] font-bold ${processingStage === 1 || processingStage === 3 ? 'text-[#ff5722]' : 'text-gray-400'}`}
            animate={{ opacity: processingStage >= 1 ? 1 : 0.3 }}
          >
            Intra-RNN
          </motion.div>
          <motion.div 
            className={`text-[8px] font-bold ${processingStage === 2 || processingStage === 3 ? 'text-[#2196f3]' : 'text-gray-400'}`}
            animate={{ opacity: processingStage >= 2 ? 1 : 0.3 }}
          >
            Inter-RNN
          </motion.div>
          <motion.div 
            className={`text-[8px] font-bold ${processingStage === 3 ? 'text-[#9c27b0]' : 'text-gray-400'}`}
            animate={{ opacity: processingStage >= 3 ? 1 : 0.3 }}
          >
            Dual-Path
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="text-xs text-white font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        DPRNN: Dual-Path RNN
      </motion.div>
      
      {/* Efficiency indicator */}
      {processingStage === 3 && (
        <motion.div 
          className="mt-1 px-2 py-0.5 bg-green-900 rounded-sm text-[8px] text-green-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3 }}
        >
          Computational Efficiency: 60% Power Savings
        </motion.div>
      )}
    </div>
  );
};

export default DPRNNAnimation;
