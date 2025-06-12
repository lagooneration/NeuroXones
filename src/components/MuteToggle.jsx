// Mute/unmute toggle component
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const MuteToggle = ({ isMuted, onToggleMute }) => {
  return (
    <button
      onClick={onToggleMute}
      className={`${isMuted ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-full flex items-center space-x-2 text-sm shadow-lg transform hover:scale-105 transition-all duration-300`}
      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
    >
      {isMuted ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <span>Unmute</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <span>Mute</span>
        </>
      )}
    </button>
  );
};

MuteToggle.propTypes = {
  isMuted: PropTypes.bool.isRequired,
  onToggleMute: PropTypes.func.isRequired
};

export default MuteToggle;
