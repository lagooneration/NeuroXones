import { useRef } from "react";
import SimButton from "../components/SimButton";
import Attention from './Attention';
import LazyImage from "../components/LazyImage";
import MagnetLines from "../components/MagnetLines";

const About = () => {  const grid2Container = useRef();
  const grid3Container = useRef();
  const grid5Container = useRef();
  const brainRef = useRef();
  return (
    <section className="c-space section-spacing" id="about">
    <Attention />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18rem] mt-12">
        {/* Grid 1 */}        
        <div className="flex items-end grid-default-color grid-1">
          <LazyImage
            src="assets/images/hp.png"
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
        </div>        {/* Grid 2 */}
        <div className="grid-black-color grid-3 relative overflow-hidden"> 
          <div
            ref={grid3Container}
            className="flex flex-col w-full h-full relative rounded-[24px] overflow-hidden"
            > 
            <LazyImage
              src="assets/images/ac.png"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              alt="Auditory cortex visualization"
            />
            {/* Main area for MagnetLines (taking up most of the space) */}
              <MagnetLines
                rows={6}
                columns={8}
                containerSize="60vmin"
                lineColor="#f2f2f2"
                lineWidth="0.4vmin"
                lineHeight="3vmin"
                baseAngle={0}
                style={{ margin: "0 auto" }}
              />

            {/* Bottom heading bar (fixed at the bottom) */}
            
            {/* Gradient overlay */}
          </div>
          <div className="w-full text-center bg-black/50 backdrop-blur-sm absolute bottom-0 left-0 right-0 p-4">
                <p className="headtext text-white text-1xl md:text-2xl font-bold">Temporal Response Map</p>
              </div>
        </div>
        
                
        {/* Grid 3 */}
        <div className="grid-default-color grid-3">        
        <div
            ref={grid2Container}
            className="flex items-center justify-center w-full h-full rounded-[24px] relative overflow-hidden"
          >            
          <LazyImage
            src="assets/images/vr.png"
            className="absolute z-0"
            alt="VR headset visualization"
          />
          <div className="z-10">
            <p className="absolute bg-black/60 text-center -bottom-2 w-full left-0 headtext">AR/VR Integration</p>
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
            src="assets/images/ci.png"
            className="absolute z-0 -top-[40px] md:-top-[170px]"
            alt="Cochlear Implant visualization"
          />
          <div className="z-10">
            <p className="absolute bg-black/60 text-center -bottom-2 w-full left-0 headtext">Cochlear Implant Integration</p>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default About;
