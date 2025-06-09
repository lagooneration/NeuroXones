import { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import PropTypes from 'prop-types';
import AlgorithmAnimation, { ANIMATION_DURATIONS } from "./animations/AlgorithmAnimation";
import CountUp from "./CountUp";
import { FiCircle, FiCode, FiFileText, FiLayers } from "react-icons/fi";

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

const DEFAULT_ITEMS = [
  {
    id: 1,
    title: "Demcus",
    description: "Demucs is a deep learning model for music source separation, designed to separate vocals and instruments from audio tracks.",
    icon: <FiCircle />,
    time: "50"
  },
  {
    id: 2,
    title: "ConvTasNet",
    description: "ConvTasNet is a convolutional time-domain audio separation network that uses deep learning to separate audio sources in the time domain.",
    icon: <FiCode />,
    time: "6"
  },
  {
    id: 3,
    title: "AAD",
    description: "AAD (Audio Attention Decoder) is a neural network model that uses attention mechanisms to separate audio sources based on their characteristics.",
    icon: <FiFileText />,
    time: "12"
  },
  {
    id: 4,
    title: "DPRNN",
    description: "DPRNN (Dual Path Recurrent Neural Network) is a model that combines recurrent neural networks with dual-path processing to enhance audio source separation.",
    icon: <FiLayers />,
    time: "8"
  }
];

function CarouselItem({ item, index, x, itemWidth, trackItemOffset, isVisible, round, isResetting, effectiveTransition }) {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
  const outputRange = [90, 0, -90];
  const rotateY = useTransform(x, range, outputRange, { clamp: false });

  return (
    <motion.div
      key={`${item.id}-${index}`}
      className={`relative shrink-0 flex flex-col ${
        round ? "items-center justify-center text-center bg-[#060606] border-0"
        : "items-start justify-between bg-[#030412] border border-[#1a1a2e] rounded-[12px]"
      } overflow-hidden cursor-grab active:cursor-grabbing shadow-lg`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : "100%",
        rotateY,
        ...(round && { borderRadius: "50%" }),
      }}
      transition={effectiveTransition}
    >
      <div className="p-5 w-full">
        <div className="mb-3 flex justify-between items-center">
          <div className="font-black text-xl text-white">
            {item.title} 
          </div>
          <div className="text-xl text-white">
            ⚠️<CountUp
              from={0}
              to={parseInt(item.time)}
              separator=","
              direction="up"
              duration={1}
              className="count-up-text"
            />
            s
          </div>
        </div>
        
        {item.id && ["Demcus", "ConvTasNet", "AAD", "DPRNN"].includes(item.title) && (
          <div className="mt-4">
            <Suspense fallback={<div className="w-full h-40 flex items-center justify-center text-white">Loading animation...</div>}>
              <AlgorithmAnimation 
                algorithmId={item.id} 
                shouldPlay={isVisible && !isResetting} 
              />
            </Suspense>
          </div>
        )}
        <div className="mt-4">
          <p className="text-sm text-white text-center leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

CarouselItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired,
    time: PropTypes.string.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  x: PropTypes.object.isRequired,
  itemWidth: PropTypes.number.isRequired,
  trackItemOffset: PropTypes.number.isRequired,
  isVisible: PropTypes.bool.isRequired,
  round: PropTypes.bool.isRequired,
  isResetting: PropTypes.bool.isRequired,
  effectiveTransition: PropTypes.object.isRequired
};

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
  onSlideChange = null,
}) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;
  
  const carouselItems = useMemo(() => {
    return loop ? [...items, items[0]] : items;
  }, [items, loop]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentAlgorithmId, setCurrentAlgorithmId] = useState(null);
  const autoplayTimerRef = useRef(null);
  const containerRef = useRef(null);
  const x = useMotionValue(0);

  // Track current algorithm in an effect
  useEffect(() => {
    const currentItem = carouselItems[currentIndex];
    if (currentItem) {
      if (["Demcus", "ConvTasNet", "AAD", "DPRNN"].includes(currentItem.title)) {
        setCurrentAlgorithmId(currentItem.id);
        setIsAnimationPlaying(true);
      } else {
        setCurrentAlgorithmId(null);
        setIsAnimationPlaying(false);
      }
    }
  }, [currentIndex, carouselItems]);

  // Handle mouse hover events
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  // Handle autoplay with dynamic timing
  useEffect(() => {
    let timer;
    
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const playNextSlide = () => {
        setCurrentIndex((prev) => {
          const newIndex = prev === items.length - 1 && loop ? prev + 1 
            : prev === carouselItems.length - 1 ? (loop ? 0 : prev)
            : prev + 1;
          
          if (onSlideChange && newIndex !== prev) {
            onSlideChange(newIndex % items.length);
          }
          return newIndex;
        });
      };

      let delay = autoplayDelay;
      if (currentAlgorithmId && ANIMATION_DURATIONS[currentAlgorithmId]) {
        delay = ANIMATION_DURATIONS[currentAlgorithmId] + 1000;
      }
      
      timer = setTimeout(playNextSlide, delay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
    onSlideChange,
    currentIndex,
    currentAlgorithmId
  ]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      window.requestAnimationFrame(() => {
        setIsResetting(false);
      });
    }
  };

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const newIndex = Math.max(0, Math.min(
      carouselItems.length - 1,
      currentIndex + (
        (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) ? 1 :
        (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) ? -1 : 0
      )
    ));
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      if (onSlideChange) {
        onSlideChange(newIndex % items.length);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden p-4 ${
        round ? "rounded-full border border-white" : "rounded-[24px] border border-[#1a1a2e] bg-[#030412]"
      }`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px` }),
      }}
    >
      <motion.div
        className="flex"
        drag="x"
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        dragConstraints={{
          left: -((carouselItems.length - 1) * trackItemOffset),
          right: 0,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => (
          <CarouselItem
            key={`${item.id}-${index}`}
            item={item}
            index={index}
            x={x}
            itemWidth={itemWidth}
            trackItemOffset={trackItemOffset}
            isVisible={index === currentIndex}
            round={round}
            isResetting={isResetting}
            effectiveTransition={effectiveTransition}
          />
        ))}
      </motion.div>

      <div className={`flex w-full justify-center ${round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : ""}`}>
        <div className="mt-4 flex w-[150px] justify-between px-8">
          {items.map((_, index) => (
            <motion.div
              key={`dot-${index}`}
              className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
                currentIndex % items.length === index
                  ? round ? "bg-white" : "bg-[#3a29ff]"
                  : round ? "bg-[#555]" : "bg-[rgba(58,41,255,0.3)]"
              }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.2 : 1,
              }}
              onClick={() => {
                setCurrentIndex(index);
                if (onSlideChange) {
                  onSlideChange(index);
                }
              }}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

Carousel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired,
    time: PropTypes.string.isRequired
  })),
  baseWidth: PropTypes.number,
  autoplay: PropTypes.bool,
  autoplayDelay: PropTypes.number,
  pauseOnHover: PropTypes.bool,
  loop: PropTypes.bool,
  round: PropTypes.bool,
  onSlideChange: PropTypes.func
};
