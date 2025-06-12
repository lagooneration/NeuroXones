import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import { Grid } from 'ldrs/react';
import 'ldrs/react/Grid.css';
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";

// Lazy load non-critical components
const About = lazy(() => import("./sections/About"));
const Experiences = lazy(() => import("./sections/Experiences"));
const Testimonial = lazy(() => import("./sections/Testimonial"));
const Contact = lazy(() => import("./sections/Contact"));
const Footer = lazy(() => import('./sections/Footer'));
const AudioExperience = lazy(() => import('./sections/AudioExperience'));
const Algo = lazy(() => import('./sections/Algo'));

// App-wide loading screen
const AppLoadingScreen = () => (
  <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
    <div className="text-center">
      <Grid
        size={60}
        speed={1.5}
        color="rgb(99, 102, 241)"
        className="mb-4 mx-auto"
      />
      <h2 className="text-white text-xl font-bold">NeuroXones</h2>
    </div>
  </div>
);

// Component loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-64">
    <div className="w-12 h-12 border-4 border-t-4 rounded-full border-neutral-700 border-t-indigo-500 animate-spin"></div>
  </div>
);

const HomePage = () => (
  <>
    <Hero />
    <Suspense fallback={<LoadingFallback />}>
      <About />
    </Suspense>    
    <Suspense fallback={<LoadingFallback />}>
      <Algo />
    </Suspense>
    <Suspense fallback={<LoadingFallback />}>
      <Experiences />
    </Suspense>
    <Suspense fallback={<LoadingFallback />}>
      <Testimonial />
    </Suspense>
    <Suspense fallback={<LoadingFallback />}>
      <Contact />
    </Suspense>
  </>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading delay or check for assets loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <AppLoadingScreen />;
  }
  
  return (
    <Router>
      <div className="container mx-auto max-w-7xl">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/simulation" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AudioExperience />
              </Suspense>
            } 
          />
        </Routes>
        <Suspense fallback={<div className="h-16"></div>}>
          <Footer />
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
