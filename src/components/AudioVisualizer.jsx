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
      let pulseFactor = 1.0; // Add pulse factor for more dynamic visualization
      
      switch (activeAudioSource.toLowerCase()) {
        case 'birds':
          barColor = 'rgba(255, 212, 59, 0.9)'; // Yellow for birds - increased opacity
          break;
        case 'cat':
          barColor = 'rgba(255, 107, 107, 0.9)'; // Red for cat - increased opacity
          break;
        case 'player':
          barColor = 'rgba(77, 171, 247, 0.9)'; // Blue for player - increased opacity
          break;
        default:
          barColor = 'rgba(255, 255, 255, 0.9)';
      }
      
      // Add time-based pulse effect
      pulseFactor = 1.0 + 0.2 * Math.sin(Date.now() * 0.003);
      
      // Draw each bar with enhanced effects
      for (let i = 0; i < bufferLength; i++) {
        // Apply some frequency-based effects to make visualization more interesting
        const frequencyFactor = i / bufferLength; // 0-1 range from low to high frequency
        const barHeight = (dataArray[i] / 255) * canvas.height * pulseFactor;
        
        // Use a more vibrant gradient for the bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(0.6, barColor);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
        
        ctx.fillStyle = gradient;
        // Add some variation to bar width based on frequency
        const currentBarWidth = barWidth * (1 + 0.2 * frequencyFactor);
        ctx.fillRect(x, canvas.height - barHeight, currentBarWidth, barHeight);
        
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
  }, [activeAudioSource, audioRefs]);    return (
    <div className={`absolute bottom-4 left-4 right-4 h-16 sm:h-20 md:h-24 bg-black bg-opacity-30 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-500 shadow-lg ${activeAudioSource ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`} style={{ 
      boxShadow: activeAudioSource ? 
        (activeAudioSource.toLowerCase() === 'birds' ? '0 0 15px 5px rgba(255, 212, 59, 0.3)' : 
         activeAudioSource.toLowerCase() === 'cat' ? '0 0 15px 5px rgba(255, 107, 107, 0.3)' : 
         activeAudioSource.toLowerCase() === 'player' ? '0 0 15px 5px rgba(77, 171, 247, 0.3)' : 
         '0 0 15px 5px rgba(255, 255, 255, 0.3)') : 'none' 
    }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-xs sm:text-sm font-medium text-white opacity-70 ${activeAudioSource ? '' : 'hidden'}`}>
          {activeAudioSource ? `Focused Audio: ${activeAudioSource}` : ''}
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
