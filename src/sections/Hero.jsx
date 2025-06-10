import Aurora from "../components/Aurora";
import OptimizedTrueFocus from '../components/OptimizedTrueFocus';
import HeroButton from "../components/HeroButton";
import HeroExperience from "../components/models/hero_models/HeroExperience";
import { motion } from "framer-motion";
import { ElegantShape } from "../components/ElegantShape";
import LazyImage from "../components/LazyImage";

const Hero = () => {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <>
    {/* Elegant Shapes */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>


    <section id="hero" className="relative w-full overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      

      {/* Aurora effect (keeping existing) */}
      <div className="absolute w-full z-10">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={2.0}
          speed={0.5}
        />
      </div>

      <div className="relative z-10 mt-20 sm:mt-24 md:mt-28 xl:mt-20 w-full h-[80vh] md:h-dvh flex flex-col xl:flex-row items-start xl:items-center justify-center px-3 sm:px-5 md:px-6 xl:px-0">
        {/* LEFT: Hero Content */}
        <header className="flex flex-col justify-center w-full max-w-full md:max-w-[90%] lg:max-w-[80%] xl:max-w-[50%] px-2 sm:px-4 md:px-6 lg:px-10 xl:px-20 py-5">
          <div className="flex flex-col gap-4 md:gap-7">
              <motion.div
                custom={0}
                variants={fadeUpVariants}                
                initial="hidden"
                animate="visible"
              >
                <LazyImage 
                  src="/assets/logos/heading.svg" 
                  alt="Heading" 
                  className="w-36 sm:w-42 md:w-48" 
                  fetchPriority="high"
                />
              </motion.div>

              <motion.div
                custom={1}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="flex items-start gap-2 md:gap-4">                
                <OptimizedTrueFocus 
                  sentence="Attention Detection"
                  manualMode={false}
                  blurAmount={5}
                  borderColor="blue"
                  animationDuration={2}
                  pauseBetweenAnimations={1}
                  importance="high"
                />
              </motion.div>
              
              <motion.p 
                custom={2}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="text-white-50 text-sm sm:text-base md:text-lg lg:text-xl relative z-10 pointer-events-none"
              >
                (BCI) Brain Computer Interface.
              </motion.p>
              
              <motion.div 
                custom={3}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="mt-2"
              >
                <HeroButton> 
                  Simulate
                </HeroButton>
              </motion.div>
          </div>
        </header>

        {/* RIGHT: 3D Model or Visual */}
        <figure className="w-full xl:w-1/2 h-[50vh] md:h-[60vh] xl:h-full relative">
          <div className="w-full h-full absolute top-0 right-0">
            <HeroExperience />
          </div>
        </figure>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/30 pointer-events-none" />
    </section>

    </>
  );
};

export default Hero;