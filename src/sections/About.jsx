import { useRef } from "react";
import Card from "../components/Card";
import { Braint } from "../components/Braint";
import CopyEmailButton from "../components/CopyEmailButton";
import { Frameworks } from "../components/FrameWorks";
import { Canvas } from "@react-three/fiber";
import SimButton from "../components/SimButton";

const About = () => {
  const grid2Container = useRef();
  return (
    <section className="c-space section-spacing" id="about">
      <h2 className="text-heading">Concept</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18rem] mt-12">
        {/* Grid 1 */}
        <div className="flex items-end grid-default-color grid-1">
          <img
            src="assets/hp.png"
            className="absolute scale-[1.75] -right-[5rem] -top-[1rem] md:scale-[3] md:left-50 md:inset-y-10 lg:scale-[2.5]"
          />
          <div className="z-10">
            <p className="headtext">Neuro-Steered Attention</p>
            <p className="subtext">
              Auditory attention is a cognitive process that allows us to focus on specific sounds or information in our environment while filtering out distractions. It plays a crucial role in how we perceive and interact with the world around us.
            </p>
          </div>
          <div className="absolute inset-x-0 pointer-evets-none -bottom-4 h-1/2 sm:h-1/3 bg-gradient-to-t from-indigo" />
        </div>
        {/* Grid 2 */}
        <div className="grid-default-color grid-2">
          <div
            ref={grid2Container}
            className="flex items-center justify-center w-full h-full"
          >
            <img
            src="assets/ci.png"
            className="absolute z-0 -top-[120px]"
            alt=""
          />
          <div className="z-10">
            <p className="absolute left-4 bottom-4 headtext">Cochlear Implant Integration</p>
          </div>
        </div>
        
        </div>
        {/* Grid 3 */}
        <div className="grid-black-color grid-3">
          <div className="z-10 w-[50%]">
            <p className="headtext">Temporal Response Function</p>
            <p className="subtext">
               (TRF) facilitates a mapping between features of sound & EEG responses. 
            </p>
          </div>
          <figure className="absolute left-[25%] top-[5%] w-[70%] h-[70%]">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              className="w-full h-full"
              style={{ pointerEvents: "none" }}
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
            >
              <ambientLight />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
              />
              <Braint scale={0.045} position={[0.8, -1.3, 0]} />
            </Canvas>
          </figure>
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
          <div className="z-10 w-[50%]">
            <p className="headText">Industrial Applications</p>
            <p className="subtext">
              Neuro-Steered headphones can be used in industries, including healthcare, education, and entertainment, to enhance auditory experiences.
            </p>
          </div>
          <div className="absolute inset-y-0 md:inset-y-9 w-full h-full start-[50%] md:scale-125">
            <Frameworks />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
