import Aurora from "../components/Aurora";
import TrueFocus from '../components/TrueFocus';
import HeroButton from "../components/HeroButton";
import HeroExperience from "../components/models/hero_models/HeroExperience";

const Hero = () => {
  return (
    <section id="hero" className="relative w-full overflow-hidden">
      {/* <div className="absolute top-0 left-0 z-10 w-full">
        <img src="/images/bg.png" alt="" className="w-full h-auto" />
      </div> */}
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
              <img src="/assets/logos/heading.svg" alt="Heading" className="w-36 sm:w-42 md:w-48" />


              <div className="flex items-start gap-2 md:gap-4">
              <TrueFocus 
                sentence="Attention Detection"
                manualMode={false}
                blurAmount={5}
                borderColor="green"
                animationDuration={2}
                pauseBetweenAnimations={1}
              />
            </div>
            <p className="text-white-50 text-sm sm:text-base md:text-lg lg:text-xl relative z-10 pointer-events-none">
              Integrated Brain Computer Interface (BCI).
            </p>
            <div className="mt-2">
              <HeroButton> 
                Simulate
              </HeroButton>
            </div>
          </div>
        </header>

        {/* RIGHT: 3D Model or Visual */}
        <figure className="w-full xl:w-1/2 h-[50vh] md:h-[60vh] xl:h-full relative">
          <div className="w-full h-full absolute top-0 right-0">
            <HeroExperience />
          </div>
        </figure>
      </div>

      {/* <AnimatedCounter /> */}
    </section>
  );
};

export default Hero;