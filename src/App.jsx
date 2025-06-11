import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
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

// Loading fallback
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
