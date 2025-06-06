import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./sections/navbar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Experiences from "./sections/Experiences";
import Testimonial from "./sections/Testimonial";
import Contact from "./sections/Contact";
import Footer from './sections/Footer';
import AudioExperience from './sections/AudioExperience';

const HomePage = () => (
  <>
    <Hero />
    <About />
    <Projects />
    <Experiences />
    <Testimonial />
    <Contact />
  </>
);

const App = () => {
  return (
    <Router>
      <div className="container mx-auto max-w-7xl">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/simulation" element={<AudioExperience />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
