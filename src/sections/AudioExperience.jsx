import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ParkAudioScene from '../components/ParkAudioScene';
import TitleHeader from '../components/TitleHeader';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleError = (error) => {
      console.error('Application Error:', error);

      // Don't set error state for audio initialization errors
      if (error.message?.includes('AudioContext')) {
        return;
      }

      setErrorMessage(error.message || 'An unexpected error occurred');
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleReset = useCallback(() => {
    setHasError(false);
    setErrorMessage('');
    // Cleanup any existing audio context
    if (window.audioContext) {
      try {
        window.audioContext.close();
      } catch (error) {
        console.error('Error closing audio context:', error);
      }
      delete window.audioContext;
    }
  }, []);

  if (hasError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-xl mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-4">{errorMessage}</p>
          <button
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
            onClick={handleReset}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return children;
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

const AudioExperience = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // Cleanup any audio context on unmount
    return () => {
      if (window.audioContext) {
        try {
          window.audioContext.close();
        } catch (error) {
          console.error('Error closing audio context:', error);
        }
        delete window.audioContext;
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <section className="h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="absolute top-12 left-4 z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/50 backdrop-blur-sm rounded-lg text-white hover:bg-gray-800 transition-all"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 10H5M5 10L10 15M5 10L10 5" />
            </svg>
            Home
          </Link>
        </div>
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-10">
          <TitleHeader />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-gray-400 z-10">
          Move cursor to focus on sound of interest
        </div>
        <div
          className="h-full"
          role="main"
          aria-label="3D Audio Experience"
        >
          <ParkAudioScene />
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default AudioExperience;
