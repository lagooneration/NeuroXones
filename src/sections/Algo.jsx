import { useState, lazy, Suspense, memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiCircle, FiCode, FiFileText, FiLayers } from "react-icons/fi";

// Lazy load the animation component
const AlgorithmAnimation = lazy(() => import('../components/animations/AlgorithmAnimation'));

// Loading fallback component
const AnimationFallback = memo(() => (
  <div className="w-full h-40 flex items-center justify-center bg-[#030412] rounded-md border border-[#1a1a2e]">
    <div className="w-8 h-8 border-3 border-t-3 rounded-full border-neutral-700 border-t-indigo-500 animate-spin"></div>
  </div>
));

AnimationFallback.displayName = 'AnimationFallback';

// Algorithm button component
const AlgorithmButton = memo(({ icon, title, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full md:w-auto
      ${isActive 
        ? 'bg-[#3a29ff] text-white shadow-lg shadow-indigo-500/20' 
        : 'bg-[#0a0b1a] text-gray-300 hover:bg-[#111228] hover:text-white'}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{title}</span>
  </button>
));

AlgorithmButton.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

AlgorithmButton.displayName = 'AlgorithmButton';

// Memoized algorithm details component for better performance
const AlgorithmDetails = memo(({ details }) => (
  <div className="w-full bg-[#0a0b1a] border border-[#1a1a2e] rounded-xl p-6 md:p-8 shadow-xl">
    <h3 className="text-xl md:text-2xl font-bold mt-2 text-white text-center md:text-left">
      {details.title}
    </h3>
    <p className="text-gray-300 mb-6 leading-relaxed text-center md:text-left">
      {details.description}
    </p>
    
    <h4 className="text-lg md:text-xl font-semibold mb-3 text-white text-center md:text-left">Key Benefits:</h4>
    <ul className="space-y-2">
      {details.benefits.map((benefit, index) => (
        <li key={index} className="flex items-start">
          <span className="text-[#3a29ff] mr-2 flex-shrink-0">•</span>
          <span className="text-gray-300">{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
));

// Add prop validation
AlgorithmDetails.propTypes = {
  details: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    benefits: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
};

AlgorithmDetails.displayName = 'AlgorithmDetails';

const Algo = () => {
    const [currentAlgorithm, setCurrentAlgorithm] = useState(0);
    
    // Memoize algorithm configurations
    const algorithms = useMemo(() => [
        {
            id: 1,
            title: "Demcus",
            shortTitle: "Demcus",
            description: "Speech Separation algorithm that isolates individual speakers",
            icon: <FiCircle />,
            fullTitle: "Demcus: Speech Separation",
            fullDescription: "Demcus employs deep neural networks to separate mixed audio streams, isolating individual speakers from complex soundscapes. It allows our system to create distinct audio channels that can be selectively enhanced based on user attention.",
            benefits: ["Isolates individual speakers in crowded environments", "Reduces background noise by up to 85%", "Works with multiple overlapping voices"]
        },
        {
            id: 2,
            title: "ConvTasNet",
            shortTitle: "ConvTasNet",
            description: "Time-domain Audio Separation Network to separate audio streams",
            icon: <FiCode />,
            fullTitle: "ConvTasNet: Real-time Processing",
            fullDescription: "ConvTasNet is our core audio separation technology, using time-domain convolutional networks for ultra-low latency performance. It enables natural listening experiences by processing audio faster than human perception can detect.",
            benefits: ["Achieves separation in milliseconds", "Adapts to changing acoustic environments", "Preserves natural sound quality"]
        },
        {
            id: 3,
            title: "AAD",
            shortTitle: "AAD",
            description: "Auditory Attention Detection precisely tracks neural activity to track focus",
            icon: <FiFileText />,
            fullTitle: "AAD: Neural Tracking",
            fullDescription: "Auditory Attention Detection monitors neural signals in real-time to determine which audio stream you're focusing on. This breakthrough technology bridges the gap between brain activity and sound enhancement.",
            benefits: ["Tracks attention shifts within 300ms", "Works with non-invasive EEG sensors", "Continuously improves with machine learning"]
        },
        {
            id: 4,
            title: "DPRNN",
            shortTitle: "DPRNN",
            description: "Dual-Path Recurrent Neural Network offers unprecedented precision in audio stream separation",
            icon: <FiLayers />,
            fullTitle: "DPRNN: Computational Efficiency",
            fullDescription: "Dual-Path Recurrent Neural Networks provide our platform with the computational efficiency needed for mobile applications. This algorithm optimizes resource usage while maintaining exceptional audio quality.",
            benefits: ["Reduces power consumption by 60%", "Enables all-day wearable use", "Scales processing based on environmental complexity"]
        }
    ], []);

    // Use useCallback to prevent unnecessary re-renders
    const handleAlgorithmChange = useCallback((index) => {
        setCurrentAlgorithm(index);
    }, []);

    // Get the current algorithm details
    const currentAlgoDetails = {
        title: algorithms[currentAlgorithm].fullTitle,
        description: algorithms[currentAlgorithm].fullDescription,
        benefits: algorithms[currentAlgorithm].benefits
    };

    return (
        <section className="c-space max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16">
                <h2 className="text-4xl font-bold text-center mt-8 text-white">Algorithms</h2>
                
                {/* Algorithm selection buttons */}
                <div className="flex flex-wrap justify-center gap-3 mt-12">
                    {algorithms.map((algo, index) => (
                        <AlgorithmButton
                            key={algo.id}
                            icon={algo.icon}
                            title={algo.shortTitle}
                            isActive={currentAlgorithm === index}
                            onClick={() => handleAlgorithmChange(index)}
                        />
                    ))}
                </div>
                
                {/* Animation display */}
                <div className="w-full max-w-2xl mx-auto mt-8">
                    <Suspense fallback={<AnimationFallback />}>
                        <AlgorithmAnimation
                            algorithmId={algorithms[currentAlgorithm].id}
                            shouldPlay={true}
                            key={`algorithm-${algorithms[currentAlgorithm].id}`}
                        />
                    </Suspense>
                </div>

                {/* Algorithm details */}
                <div className="w-full max-w-3xl mx-auto mt-8">
                    <AlgorithmDetails details={currentAlgoDetails} />
                </div>
            </div>
        </section>
    );
};
                                export default Algo;