"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
import AttentionLagVisualizer from "./AttentionLagVisualizer";

export const Timeline = ({ data }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  // Function to render content based on the content string
  const renderContent = (content) => {
    // Check if this is a visualizer directive
    if (content === "visualizer: true") {
      return (
        <div className="bg-[#0c0d20] rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-white mb-2">Attention Switching Lag:</h4>
          <AttentionLagVisualizer />
          <p className="text-xs text-gray-400 text-center italic mt-2">
            ~1.5s lag for attention decoding by current AAD models
          </p>
        </div>
      );
    }
      // Check if this is a YouTube URL directive
    if (content.startsWith("youtubeUrl:")) {
      const youtubeUrl = content.substring("youtubeUrl:".length).trim();
      return (
        <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mb-6">
          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src={youtubeUrl}
            title="YouTube Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    
    // Check if this is an image directive
    if (content.startsWith("imagePath:")) {
      const imagePath = content.substring("imagePath:".length).trim();
      return (
        <div className="w-full overflow-hidden rounded-lg mb-6">
          <img 
            src={imagePath}
            alt="Timeline"
            className="w-full h-auto object-contain rounded-lg"
            title="RnD"
          />
        </div>
      );
    }
    
    // Default: treat as regular text content
    return <p className="mb-3 font-normal text-neutral-400">{content}</p>;
  };

  return (
    <div className="c-space section-spacing" ref={containerRef}>
      <h2 className="text-4xl text-center lg:text-6xl font-bold">Research & Development</h2>
      <div ref={ref} className="relative pb-10">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky z-40 flex flex-col items-center self-start max-w-xs md:flex-row top-40 lg:max-w-sm md:w-full">
              <div className="absolute flex items-center justify-center w-10 h-10 rounded-full -left-[15px] bg-midnight">
                <div className="w-4 h-4 p-2 border rounded-full bg-neutral-800 border-neutral-700" />
              </div>
              <div className="flex-col hidden gap-2 text-xl font-bold md:flex md:pl-20 md:text-4xl text-neutral-300">
                <h3>{item.date}</h3>
                <h3 className="text-3xl text-neutral-400">{item.title}</h3>
                <h3 className="text-3xl text-neutral-500">{item.job}</h3>
              </div>
            </div>

            <div className="relative w-full pl-20 pr-4 md:pl-4">
              <div className="block mb-4 text-2xl font-bold text-left text-neutral-300 md:hidden ">
                <h3>{item.date}</h3>
                <h3>{item.job}</h3>
              </div>
              {item.contents.map((content, idx) => (
                <React.Fragment key={idx}>
                  {renderContent(content)}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-1 left-1 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-lavender/50 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

Timeline.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      title: PropTypes.string,
      job: PropTypes.string,
      contents: PropTypes.arrayOf(PropTypes.string)
    })
  ).isRequired
};
