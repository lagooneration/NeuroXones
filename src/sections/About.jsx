import { useRef } from "react";
 import { Braint } from "../components/Braint";
// import { Lights } from "../components/Lights";
// import CopyEmailButton from "../components/CopyEmailButton";
import { Frameworks } from "../components/FrameWorks";
import { Canvas } from "@react-three/fiber";
import SimButton from "../components/SimButton";
import { NeuralActivity } from "../components/NeuralActivity";
import SpotlightCard from "../components/SpotlightCard";

const About = () => {
  const grid2Container = useRef();
  const brainRef = useRef();
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
            <p className="headtext">Move beyond passive listening</p>
            <p className="subtext">
              Actively identifying your attentional focus and dynamically enhancing the audio in real-time, precisely as per the user's conscious intent
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
            className="absolute z-0 -top-[80px]"
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
            <p className="headtext">Temporal Response Fn</p>
            <p className="subtext">
               (TRF) facilitates a mapping b/w features of sound & EEG responses from the auditory cortex
            </p>
          </div>
          <figure className="absolute left-[25%] top-[5%] w-[70%] h-[70%]">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              className="w-full h-full"
              style={{ pointerEvents: "none" }}
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
            >              <ambientLight />
              <directionalLight
                position={[10, 10, 5]}
                intensity={2}
              />
              <Braint 
                // ref={brainRef} 
                scale={0.045} 
                position={[0.8, -1.3, 0]} 
              />
              <NeuralActivity
                scale={1.25}
                position={[0.8, -0.2, 0.16]}
                rotation={[-Math.PI/2, -Math.PI / 24, 0]}
                color="#4f9dff"
              />
              {/* <Lights brainRotation={brainRef.current?.rotation.y || 0} /> */}
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
          {/* <SpotlightCard className="h-fit w-fit" spotlightColor="rgba(0, 229, 255, 0.2)">
          </SpotlightCard> */}
          </div>
        </div>
        {/* Grid 5 */}
        <div className="grid-default-color grid-5">
          <div className="z-10 w-[50%]">
            <p className="headText">Industrial Applications</p>
            <p className="subtext">
              Can be used in industries, like healthcare, education, military and entertainment, to enhance auditory experiences.
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
