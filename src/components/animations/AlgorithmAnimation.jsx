import { useEffect, useState, useRef } from "react";
import PropTypes from 'prop-types';
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
  const previousId = useRef(algorithmId);
  const initialRender = useRef(true);
  
  // Reset animation when algorithmId changes or shouldPlay becomes true
  useEffect(() => {
    // Force a reset on initial render
    if (initialRender.current) {
      setKey(1);
      initialRender.current = false;
      previousId.current = algorithmId;
      return;
    }
    
    if (shouldPlay && (previousId.current !== algorithmId || key === 0)) {
      setKey(prevKey => prevKey + 1);
      previousId.current = algorithmId;
    }
  }, [algorithmId, shouldPlay, key]);

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
    <div className="w-full h-52 p-2 bg-[#06061b] rounded-md overflow-hidden">
      {getAnimationComponent()}
    </div>
  );
};

AlgorithmAnimation.propTypes = {
  algorithmId: PropTypes.number.isRequired,
  shouldPlay: PropTypes.bool
};

AlgorithmAnimation.defaultProps = {
  shouldPlay: true
};

export default AlgorithmAnimation;
