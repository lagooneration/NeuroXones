import { useState, lazy, Suspense, memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaFacebook } from "react-icons/fa";
import { CiWavePulse1 } from "react-icons/ci";
import { LuBrainCircuit } from "react-icons/lu";
import { IoGitNetworkSharp } from "react-icons/io5";
import { motion } from 'framer-motion';
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
    className={`flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3 px-3 sm:px-4 py-3 rounded-lg transition-all duration-300 w-full h-full
      ${isActive 
        ? 'bg-[#3a29ff] text-white shadow-lg shadow-indigo-500/20' 
        : 'bg-[#0a0b1a] text-gray-300 hover:bg-[#111228] hover:text-white'}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium text-sm text-center sm:text-left sm:text-base">{title}</span>
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
    <h3 className="text-xl md:text-2xl font-bold mt-2 text-white text-start md:text-left">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        key={details.title} // Important: key changes trigger animation to re-run
      >
        {details.title}
      </motion.div>
    </h3>
    <p className="text-gray-300 mb-6 leading-relaxed text-start md:text-left">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        key={details.description} // Important: key changes trigger animation to re-run
      >
        {details.description}
      </motion.div>
    </p>
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
            title: "Demucs",
            shortTitle: "Demucs",
            description: "Hybrid Transformer-based Music Source Separation",
            icon: <FaFacebook />,
            fullTitle: "Advanced Audio Separation",
            fullDescription: "Demucs is a state-of-the-art hybrid model from facebook combining waveform and spectrogram domain separation, achieving 9.0 dB SDR on benchmark datasets. Originally developed by Facebook Research for music source separation, we've adapted it for selective auditory stream isolation in complex acoustic environments.",
        },
        {
            id: 2,
            title: "ConvTasNet",
            shortTitle: "ConvTasNet",
            description: "Time-domain Audio Separation Network to separate audio streams",
            icon: <CiWavePulse1 />,
            fullTitle: "End-to-End Speech Separation",
            fullDescription: "ConvTasNet is a fully-convolutional time-domain audio separation network that outperforms traditional spectrogram-based methods. It works directly on waveforms using a learnable encoder-decoder architecture with temporal convolutional networks (TCN).",
        },
        {
            id: 3,
            title: "AAD",
            shortTitle: "AAD",
            description: "Auditory Attention Detection precisely tracks neural activity to track focus",
            icon: <LuBrainCircuit />,
            fullTitle: "Neural Decoding of Attention",
            fullDescription: "AAD algorithm decodes neural signals to determine which speaker or sound source has captured attention in multi-talker environments. By correlating EEG readings with speech envelope features, it can identify the attended speaker with up to 95% accuracy.",
        },
        {
            id: 4,
            title: "DPRNN",
            shortTitle: "DPRNN",
            description: "Dual-Path Recurrent Neural Network offers unprecedented precision in audio stream separation",
            icon: <IoGitNetworkSharp />,
            fullTitle: "Long Sequence Modeling",
            fullDescription: "DPRNN addresses the challenge of modeling extremely long audio sequences by dividing the problem into two paths: local and global processing. This architecture efficiently captures both short-term acoustic features and long-term temporal dependencies crucial for speaker tracking.",
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
                <h2 className="text-4xl font-bold text-center mt-8 text-white">Algorithms</h2>                  {/* Algorithm selection buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 justify-center gap-3 mt-12 max-w-4xl mx-auto">
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