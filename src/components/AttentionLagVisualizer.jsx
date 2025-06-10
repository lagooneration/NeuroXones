import React from 'react';
import './AttentionLagVisualizer.css';

const AttentionLagVisualizer = () => {
  return (
    <div className="relative h-52 w-full md:h-56 xl:h-64">
      {/* Brain Icon in the Center */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center relative">
          {/* Brain Focus Ring */}
          <div 
            className="absolute inset-0 rounded-full border-2"
            style={{
              animation: 'focusChange 6s infinite',
              borderColor: '#3b82f6'
            }}
          />
          
          {/* Brain Icon */}
          <svg 
            className="w-8 h-8 z-10"
            style={{
              animation: 'brainColorChange 6s infinite',
              fill: '#3b82f6',
              animationDelay: '1s'
            }}
            viewBox="0 0 512 512"
          >
            <path d="M502.198,263.697C492.386,148.068,375.395,65.876,259.027,65.876c-153.162,0-143.009,50.139-160.082,51.56 C57.128,120.813,0,169.687,0,226.746c0,57.148,23.702,112.864,92.638,112.864c-4.196,23.673,4.165,62.024,78.62,62.024 c35.664,0,85.852,0,103.149,0c0,56.369,85.034,43.14,114.898,43.14c29.941,0,34.818-32.062,29.358-40.385 C511.99,403.679,525.092,306.224,502.198,263.697z"/>
          </svg>
        </div>
        <div className="text-xs text-center text-gray-400 mt-1">Brain</div>
      </div>

      {/* Speaker 1 */}
      <div className="absolute bottom-5 left-4 md:left-8 xl:left-16">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-blue-500 flex items-center justify-center mb-1">
            <svg 
              className="w-6 h-6 text-blue-400"
              style={{
                animation: 'speaker1Wave 6s infinite'
              }}
              viewBox="0 0 24 24"
            >
              <path d="M19 6C20.5 7.5 21 10 21 12C21 14 20.5 16.5 19 18M16 8.99998C16.5 9.49998 17 10.5 17 12C17 13.5 16.5 14.5 16 15M3 10.5V13.5C3 14.6046 3.5 15.5 5.5 16C7.5 16.5 9 21 12 21C14 21 14 3 12 3C9 3 7.5 7.5 5.5 8C3.5 8.5 3 9.39543 3 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-xs text-blue-400">Speaker 1</div>
        </div>
      </div>

      {/* Speaker 2 */}
      <div className="absolute bottom-5 right-4 md:right-8 xl:right-16">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-green-500 flex items-center justify-center mb-1">
            <svg 
              className="w-6 h-6 text-green-400"
              style={{
                animation: 'speaker2Wave 6s infinite'
              }}
              viewBox="0 0 24 24"
            >
              <path d="M19 6C20.5 7.5 21 10 21 12C21 14 20.5 16.5 19 18M16 8.99998C16.5 9.49998 17 10.5 17 12C17 13.5 16.5 14.5 16 15M3 10.5V13.5C3 14.6046 3.5 15.5 5.5 16C7.5 16.5 9 21 12 21C14 21 14 3 12 3C9 3 7.5 7.5 5.5 8C3.5 8.5 3 9.39543 3 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-xs text-green-400">Speaker 2</div>
        </div>
      </div>

      {/* Wave Paths */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid meet">
        {/* Speaker 1 Waves */}
        <g className="speaker1-waves">
          {[0, 1, 2].map((i) => (
            <path
              key={`wave1-${i}`}
              d="M60,130 Q105,90 150,70"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4"
              style={{
                animation: `wave1 2s infinite ${i * 0.3}s, waveOpacity1 6s infinite`,
                opacity: 0.4
              }}
            />
          ))}
        </g>

        {/* Speaker 2 Waves */}
        <g className="speaker2-waves">
          {[0, 1, 2].map((i) => (
            <path
              key={`wave2-${i}`}
              d="M240,130 Q195,90 150,70"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4"
              style={{
                animation: `wave2 2s infinite ${i * 0.3}s, waveOpacity2 6s infinite`,
                opacity: 0.4
              }}
            />
          ))}
        </g>
        
        {/* Lag indicator for Speaker 1 */}
        <g className="lag-indicator-1">
          <circle 
            cx="105" 
            cy="90" 
            r="4" 
            fill="#3b82f6" 
            opacity="0"
            style={{
              animation: 'lagIndicator1 6s infinite'
            }}
          />
          <text 
            x="95" 
            y="80" 
            fontSize="8" 
            fill="#ffffff" 
            textAnchor="middle" 
            opacity="0"
            style={{
              animation: 'lagIndicator1 6s infinite'
            }}
          >
            ~1.5s lag
          </text>
        </g>

        {/* Lag indicator for Speaker 2 */}
        <g className="lag-indicator-2">
          <circle 
            cx="195" 
            cy="90" 
            r="4" 
            fill="#10b981" 
            opacity="0"
            style={{
              animation: 'lagIndicator2 6s infinite'
            }}
          />
          <text 
            x="205" 
            y="80" 
            fontSize="8" 
            fill="#ffffff" 
            textAnchor="middle" 
            opacity="0"
            style={{
              animation: 'lagIndicator2 6s infinite'
            }}
          >
            ~1.5s lag
          </text>
        </g>
      </svg>

      {/* All animations are defined in the external CSS file */}
    </div>
  );
};

export default AttentionLagVisualizer;
