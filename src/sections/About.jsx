import { useRef } from "react";
import SimButton from "../components/SimButton";
import Attention from './Attention';
import LazyImage from "../components/LazyImage";

const About = () => {  const grid2Container = useRef();
  const grid3Container = useRef();
  const grid5Container = useRef();
  const brainRef = useRef();
  return (
    <section className="c-space section-spacing" id="about">
    <Attention />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18rem] mt-12">
        {/* Grid 1 */}        <div className="flex items-end grid-default-color grid-1">
          <LazyImage
            src="assets/hp.png"
            className="absolute scale-[1.75] -right-[5rem] -top-[1rem] md:scale-[3] md:left-50 md:inset-y-10 lg:scale-[2.5]"
            alt="Headphone visualization"
          />
          <div className="z-10">
            <p className="headtext">Headphone Integration</p>
            <p className="subtext">
              Move beyond passive listening, choosing your own soundscapes
              </p>
          </div>
          <div className="absolute inset-x-0 pointer-evets-none -bottom-4 h-1/2 sm:h-1/3 bg-gradient-to-t from-indigo" />
        </div>
        {/* Grid 2 */}
        <div className="grid-black-color grid-3 relative overflow-hidden"> 
          <div
            ref={grid3Container}
            className="flex items-center justify-center w-full h-full relative rounded-[24px] overflow-hidden"
            > 
            <LazyImage
              src="assets/projects/auditorycortex.jpg"
              className="absolute inset-0 w-full h-full object-cover"
              alt="Auditory cortex visualization"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="z-10 p-4 absolute inset-0 flex flex-col justify-end md:justify-center">
              <div className="w-full md:max-w-[80%]">
                <p className="headtext text-white md:text-white text-2xl md:text-3xl font-bold mb-2">Temporal Response Mapping</p>
                <p className="text-gray-300 md:text-gray/90 text-sm md:text-base">
                  Machine learning models trained on your EEG responses, enhancing your listening experience.
                </p>
              </div>
            </div>
          </div>
        </div>
        
                
        {/* Grid 3 */}
        <div className="grid-default-color grid-2">        
        <div
            ref={grid2Container}
            className="flex items-center justify-center w-full h-full rounded-[24px] relative overflow-hidden"
          >            
          <LazyImage
            src="images/vr.png"
            className="absolute z-0 -top-[30px]"
            alt="VR headset visualization"
          />
          <div className="z-10">
            <p className="absolute left-4 bottom-0 headtext">AR/VR Integration</p>
          </div>
        </div>

        </div>
        {/* Grid 4 */}
        <div className="grid-special-color grid-4">
          <div className="flex flex-col items-center justify-center gap-4 size-full">
            <p className="text-center headtext">
              Experience Neuro-Steered listening?
            </p>
            <SimButton />
          </div>
        </div>        
        {/* Grid 5 */}
        <div className="grid-default-color grid-5">
           <div
            ref={grid5Container}
            className="flex items-center justify-center w-full h-full rounded-[24px] relative overflow-hidden"
          >
          <LazyImage
            src="assets/ci.png"
            className="absolute z-0 -top-[40px] md:-top-[170px]"
            alt="Cochlear Implant visualization"
          />
          <div className="z-10">
            <p className="absolute left-2 bottom-0 headtext">Cochlear Implant Integration</p>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default About;
