import { useRef } from 'react';
import LazyImage from '../components/LazyImage';
import AttentionLagVisualizer from '../components/AttentionLagVisualizer';

const Limitations = () => {
  const containerRef = useRef();
  
  return (
    <section className="c-space section-spacing" id="limitations">
      <h2 className="text-4xl font-bold text-center mt-8 text-white">Current Research Challenges</h2>
      
      <div className="mt-12 bg-[#0a0b1a] border border-[#1a1a2e] rounded-xl p-6 md:p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">          
          {/* Left column with traditional approaches limitations */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">The Primary Bottleneck: EEG Attention Detection</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              The Bottleneck: Current <a className='text-blue-400' href='https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2021.661178/full'>AAD models</a> require a "decision window" of EEG data to make an accurate prediction. This window is typically between <span className="text-red-400">0.5 and 2 seconds</span>
              <br /> In contrast, the real-time audio separation research from the <a className='text-blue-400' href='https://www.inf.uni-hamburg.de/en/inst/ab/sp/home.html'>University of Hamburg</a> and others has achieved extremely low latencies, with Real-Time Factors (RTF) well below 1.0. This means the audio filtering itself is not the major roadblock.
            </p>
            
            {/* Attention Detection Lag Animation */}
            <div className="bg-[#0c0d20] rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-white mb-2">Attention Switching Lag:</h4>
              <AttentionLagVisualizer />
              <p className="text-xs text-gray-400 text-center italic mt-2">
                The brain's focus changes (outer ring) before the actual neural response (inner color) due to the ~1.5 second lag
                required by current AAD algorithms to detect attention.
              </p>
            </div>
          </div>
          
          {/* Right column with research direction */}
          <div className="bg-[#0c0d20] rounded-xl p-5">
            <h3 className="text-xl font-bold mb-4 text-white">Neuro-Steered Signal Processing Research</h3>
            <div className="mb-6 relative h-48 overflow-hidden rounded-lg">
              <div className="relative w-full h-0 pb-[56.25%]">
                {/* Using lazy loading with loading="lazy" attribute */}
                <iframe 
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/_wPZ2l12C-o" 
                  title="Signal Processing Research - University of Hamburg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              Recent studies suggest that integrating neural signals with speech enhancement algorithms represents a 
              promising research direction.
            </p>
            
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#3a29ff] mr-2 flex-shrink-0">→</span>
                <span className="text-gray-300">Potential for neural decoding to identify attended audio streams in multi-speaker environments</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#3a29ff] mr-2 flex-shrink-0">→</span>
                <span className="text-gray-300">Theoretical framework for combining neural data with nonlinear spatial filtering techniques</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#3a29ff] mr-2 flex-shrink-0">→</span>
                <span className="text-gray-300">Preliminary investigations into low-latency processing for potential real-time applications</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#3a29ff] mr-2 flex-shrink-0">→</span>
                <span className="text-gray-300">Ongoing challenges in electrode count reduction while maintaining attention detection accuracy</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Limitations;
