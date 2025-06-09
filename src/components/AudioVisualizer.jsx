import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * AudioVisualizer component that creates a responsive audio visualization
 * for the currently active audio source.
 */
const AudioVisualizer = ({ activeAudioSource, audioRefs }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyzerRef = useRef(null);

  useEffect(() => {
    // Skip if no audio source is active or no canvas
    if (!activeAudioSource || !canvasRef.current || !audioRefs) {
      console.log('Skipping visualization:', { activeAudioSource, hasCanvas: !!canvasRef.current, hasAudioRefs: !!audioRefs });
      return;
    }
      // Get the current audio element based on the active source
    let audioElement;
    const source = activeAudioSource.toLowerCase();
    if (audioRefs[source]) {
      audioElement = audioRefs[source];
      console.log(`Found audio element for ${source}:`, !!audioElement);
    } else {
      console.warn(`No audio element found for source: ${source}`);
      return;
    }
    
    if (!audioElement?.analyzer) {
      console.warn('Audio element does not have an analyzer node:', activeAudioSource);
      return;
    }
    
    console.log(`Analyzer node found for ${activeAudioSource}:`, !!audioElement.analyzer);
    
    // Get the analyzer from the audio element    // Store the analyzer reference
    analyzerRef.current = audioElement.analyzer;
    
    // Canvas setup
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Responsive canvas sizing
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animation function to draw the audio visualization
    const draw = () => {
      if (!analyzerRef.current) return;
          // Get frequency data
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      try {
        analyzerRef.current.getByteFrequencyData(dataArray);
      } catch (error) {
        console.error('Error getting frequency data:', error);
        return;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw visualization bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
        // Choose color based on active source
      let barColor;
      switch (activeAudioSource.toLowerCase()) {
        case 'birds':
          barColor = 'rgba(255, 212, 59, 0.8)'; // Yellow for birds
          break;
        case 'cat':
          barColor = 'rgba(255, 107, 107, 0.8)'; // Red for cat
          break;
        case 'sign':
          barColor = 'rgba(77, 171, 247, 0.8)'; // Blue for sign
          break;
        default:
          barColor = 'rgba(255, 255, 255, 0.8)';
      }
      
      // Draw each bar
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Use a gradient for the bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
        gradient.addColorStop(1, barColor);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
      
      // Continue animation
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Start animation
    draw();
      // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [activeAudioSource, audioRefs]);
    return (
    <div className={`absolute bottom-4 left-4 right-4 h-16 sm:h-20 md:h-24 bg-black bg-opacity-30 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-500 shadow-lg ${activeAudioSource ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-xs sm:text-sm font-medium text-white opacity-50 ${activeAudioSource ? '' : 'hidden'}`}>
          {activeAudioSource ? `Visualizing ${activeAudioSource}` : ''}
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
};

AudioVisualizer.propTypes = {
  activeAudioSource: PropTypes.string,
  audioRefs: PropTypes.object
};

export default AudioVisualizer;
