import { useEffect, useState } from "react";
import DemcusAnimation from "./DemcusAnimation";
import ConvTasNetAnimation from "./ConvTasNetAnimation";
import AADAnimation from "./AADAnimation";
import DPRNNAnimation from "./DPRNNAnimation";

// Animation durations in milliseconds
export const ANIMATION_DURATIONS = {
  1: 4000, // Demcus
  2: 4500, // ConvTasNet
  3: 5000, // AAD
  4: 4200  // DPRNN
};

const AlgorithmAnimation = ({ algorithmId, shouldPlay = true }) => {
  const [key, setKey] = useState(0);
  
  // Reset animation when algorithmId changes or shouldPlay becomes true
  useEffect(() => {
    if (shouldPlay) {
      setKey(prevKey => prevKey + 1);
    }
  }, [algorithmId, shouldPlay]);

  // Map algorithm IDs to components
  const getAnimationComponent = () => {
    switch (algorithmId) {
      case 1: // Demcus
        return <DemcusAnimation key={key} />;
      case 2: // ConvTasNet
        return <ConvTasNetAnimation key={key} />;
      case 3: // AAD
        return <AADAnimation key={key} />;
      case 4: // DPRNN
        return <DPRNNAnimation key={key} />;
      default:
        return <div className="w-full h-40 flex items-center justify-center text-white text-sm">Select an algorithm</div>;
    }
  };

  return (
    <div className="w-full h-40 bg-[#030412] rounded-md overflow-hidden">
      {getAnimationComponent()}
    </div>
  );
};

export default AlgorithmAnimation;
