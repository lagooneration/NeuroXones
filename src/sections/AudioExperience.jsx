import { useEffect } from 'react';
import ParkAudioScene from '../components/ParkAudioScene';
import TitleHeader from '../components/TitleHeader';
import { Link } from 'react-router-dom';

const AudioExperience = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);  return (
    <section className="h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="absolute top-12 left-4 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/50 backdrop-blur-sm rounded-lg text-white hover:bg-gray-800 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 10H5M5 10L10 15M5 10L10 5" />
          </svg>
          Home
        </Link>
      </div>
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-10">
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-gray-400 z-10">
        Move cursor to focus on sound of interest
      </div>
      <div className="h-full">
        <ParkAudioScene />
      </div>
    </section>
  );
};

export default AudioExperience;
