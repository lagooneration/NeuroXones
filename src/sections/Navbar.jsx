import { useState } from "react";
import { motion } from "motion/react";
import ContactButton from "../components/ContactButton";
import LazyImage from "../components/LazyImage";

function Navigation({ isMobile }) {
  return (
    <ul className={`nav-ul ${isMobile ? "flex flex-col space-y-6" : ""}`}>
      <li className="nav-li">
        <a className={`nav-link ${isMobile ? "text-xl text-white/80 hover:text-white" : ""}`} href="/">
          Home
        </a>
      </li>
      <li className="nav-li">
        <a className={`nav-link ${isMobile ? "text-xl text-white/80 hover:text-white" : ""}`} href="/simulation">
          Simulation
        </a>
      </li>
      <li className="nav-li">
        <a className={`nav-link ${isMobile ? "text-xl text-white/80 hover:text-white" : ""}`} href="#about">
          About
        </a>
      </li>      <li className={`nav-li ${isMobile ? "flex justify-center" : ""}`}>
        <a className={`nav-link ${isMobile ? "flex justify-center w-full" : ""}`} href="#contact">
          <ContactButton className={isMobile ? "mx-auto" : ""} />
        </a>
      </li>
    </ul>
  );
}
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed inset-x-0 z-20 w-full backdrop-blur-lg bg-primary/40">
      <div className="mx-auto c-space max-w-7xl">
        <div className="flex items-center justify-between py-2 sm:py-0">
          <a            href="/"
            className="text-xl font-bold transition-colors text-neutral-400 hover:text-white"
          >
            <LazyImage src="/assets/logos/logo-gray.svg" alt="Logo" className="h-6" />
          </a>
          <button            onClick={() => setIsOpen(!isOpen)}
            className="flex cursor-pointer text-neutral-400 hover:text-white focus:outline-none sm:hidden"
          >
            <LazyImage
              src={isOpen ? "assets/close.svg" : "assets/menu.svg"}
              className="w-6 h-6"
              alt="toggle"
            />
          </button>          <nav className="hidden sm:flex">
            <Navigation isMobile={false} />
          </nav>
        </div>
      </div>      {isOpen && (
        <motion.div
          className="block overflow-hidden text-center sm:hidden bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxHeight: "100vh" }}
          transition={{ duration: 0.5 }}
        >
          <nav className="py-8 flex flex-col">
            <Navigation isMobile={true} />
          </nav>
        </motion.div>
      )}
    </div>
  );
};

export default Navbar;
