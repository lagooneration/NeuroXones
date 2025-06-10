import { useEffect, useState, useRef, Suspense, useMemo, lazy, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import PropTypes from 'prop-types';
import { ANIMATION_DURATIONS } from "./animations/AlgorithmAnimation";
import CountUp from "./CountUp";
import { FiCircle, FiCode, FiFileText, FiLayers } from "react-icons/fi";
import { observerOptions } from "../lib/performance";
import { motionConfig } from "./animations/motionConfig";

// Lazy load the animation component
const AlgorithmAnimation = lazy(() => import("./animations/AlgorithmAnimation"));

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
  
  // Memoize the animation to prevent unnecessary re-renders
  const animationComponent = useMemo(() => {
    if (item.id && ["Demcus", "ConvTasNet", "AAD", "DPRNN"].includes(item.title)) {
      return (
        <Suspense fallback={<div className="w-full h-40 flex items-center justify-center text-white">Loading...</div>}>
          <AlgorithmAnimation 
            algorithmId={item.id} 
            shouldPlay={isVisible && !isResetting} 
            key={`algorithm-${item.id}-${isVisible ? 'visible' : 'hidden'}`}
          />
        </Suspense>
      );
    }
    return null;
  }, [item.id, item.title, isVisible, isResetting]);

  // If not visible and not adjacent to visible item, render a placeholder
  if (!isVisible && !isResetting && Math.abs(index - Math.floor(-x.get() / trackItemOffset)) > 1) {
    return (
      <div
        className="shrink-0"
        style={{
          width: itemWidth,
          height: round ? itemWidth : "100%"
        }}
      />
    );
  }

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
        // Add will-change property for better performance
        willChange: "transform",
        // Only render content when visible or adjacent to visible
        contain: "content"
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
        
        {/* Only render animation when item is visible */}
        <div className="mt-4">
          {animationComponent}
        </div>
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
  // Calculate item width responsively
  const [itemWidth, setItemWidth] = useState(baseWidth - containerPadding * 2);
  const [trackItemOffset, setTrackItemOffset] = useState(itemWidth + GAP);
  
  // Memoize carousel items to prevent unnecessary re-renders
  const carouselItems = useMemo(() => {
    return loop ? [...items, items[0]] : items;
  }, [items, loop]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentAlgorithmId, setCurrentAlgorithmId] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const autoplayTimerRef = useRef(null);
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const observerRef = useRef(null);

  // Track current algorithm in an effect
  useEffect(() => {
    const currentItem = carouselItems[currentIndex];
    if (currentItem) {
      if (["Demcus", "ConvTasNet", "AAD", "DPRNN"].includes(currentItem.title)) {
        setCurrentAlgorithmId(currentItem.id);
      } else {
        setCurrentAlgorithmId(null);
      }
    }
  }, [currentIndex, carouselItems]);

  // Use IntersectionObserver to pause animations when off-screen
  useEffect(() => {
    if (containerRef.current && typeof IntersectionObserver !== 'undefined') {
      const currentContainer = containerRef.current;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          setIsVisible(entry.isIntersecting);
        },
        observerOptions
      );
      
      observerRef.current.observe(currentContainer);
      
      return () => {
        if (observerRef.current) {
          observerRef.current.unobserve(currentContainer);
          observerRef.current.disconnect();
        }
      };
    }
  }, []);

  // Handle resize events for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Get the actual width of the container
        const containerWidth = containerRef.current.clientWidth;
        // Adjust for padding
        const newItemWidth = containerWidth - containerPadding * 2;
        setItemWidth(newItemWidth);
        setTrackItemOffset(newItemWidth + GAP);
      }
    };

    // Set initial width
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [containerPadding]);

  // Handle mouse hover events with passive listeners for better performance
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      
      container.addEventListener("mouseenter", handleMouseEnter, { passive: true });
      container.addEventListener("mouseleave", handleMouseLeave, { passive: true });
      
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  // Handle autoplay with dynamic timing using a single timer reference
  useEffect(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
    
    if (autoplay && isVisible && (!pauseOnHover || !isHovered)) {
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
      // Add extra delay for AAD and DPRNN which need more initialization time
      if (currentAlgorithmId && ANIMATION_DURATIONS[currentAlgorithmId]) {
        delay = ANIMATION_DURATIONS[currentAlgorithmId] + 1000;
        
        // Add additional time for AAD and DPRNN specifically
        if (currentAlgorithmId === 3 || currentAlgorithmId === 4) {
          delay += 1000; 
        }
      }
      
      autoplayTimerRef.current = setTimeout(playNextSlide, delay);
    }
    
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    isVisible,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
    onSlideChange,
    currentIndex,
    currentAlgorithmId
  ]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  // Handle animation completion efficiently
  const handleAnimationComplete = useCallback(() => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      
      // Use requestAnimationFrame for smoother transitions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsResetting(false);
        });
      });
    }
  }, [loop, currentIndex, carouselItems.length, x]);

  // Optimize drag handling for better performance
  const handleDragEnd = useCallback((_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Use simpler calculation for better performance
    let indexChange = 0;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      indexChange = 1;
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      indexChange = -1;
    }
    
    if (indexChange !== 0) {
      const newIndex = Math.max(0, Math.min(carouselItems.length - 1, currentIndex + indexChange));
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        if (onSlideChange) {
          onSlideChange(newIndex % items.length);
        }
      }
    }
  }, [carouselItems.length, currentIndex, items.length, onSlideChange]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden p-4 w-full ${
        round ? "rounded-full border border-white" : "rounded-[24px] border border-[#1a1a2e] bg-[#030412]"
      }`}
      style={{
        maxWidth: `${baseWidth}px`,
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
          willChange: "transform", // Optimize for animation
          contain: "layout", // Prevent unnecessary repaints
          touchAction: "pan-y" // Allow vertical scrolling on touch devices
        }}
        dragConstraints={{
          left: -((carouselItems.length - 1) * trackItemOffset),
          right: 0,
        }}
        dragElastic={0.1} // Reduce elasticity for better performance
        dragTransition={motionConfig.dragTransition} // Use optimized drag physics
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={isResetting ? { duration: 0 } : motionConfig.transition}
        onAnimationComplete={handleAnimationComplete}
        layoutDependency={motionConfig.layoutDependency}
        reducedMotion={motionConfig.reducedMotion}
      >
        {/* Only render visible items and their adjacent ones for better performance */}
        {carouselItems.map((item, index) => {
          // Only render items that are currently visible or adjacent to visible
          const isVisible = index === currentIndex;
          const isAdjacent = Math.abs(index - currentIndex) <= 1;
          
          if (!isVisible && !isAdjacent && !isResetting) {
            return <div key={`${item.id}-${index}`} style={{ width: itemWidth, height: "100%" }} />;
          }
          
          return (
            <CarouselItem
              key={`${item.id}-${index}`}
              item={item}
              index={index}
              x={x}
              itemWidth={itemWidth}
              trackItemOffset={trackItemOffset}
              isVisible={isVisible}
              round={round}
              isResetting={isResetting}
              effectiveTransition={effectiveTransition}
            />
          );
        })}
      </motion.div>

      {/* Optimize dot indicators with memoized rendering */}
      <div className={`flex w-full justify-center ${round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : ""}`}>
        <div className="mt-4 flex w-[150px] justify-between px-8">
          {items.map((_, index) => {
            const isActive = currentIndex % items.length === index;
            return (
              <motion.div
                key={`dot-${index}`}
                className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
                  isActive
                    ? round ? "bg-white" : "bg-[#3a29ff]"
                    : round ? "bg-[#555]" : "bg-[rgba(58,41,255,0.3)]"
                }`}
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
                onClick={() => {
                  setCurrentIndex(index);
                  if (onSlideChange) {
                    onSlideChange(index);
                  }
                }}
                transition={{ duration: 0.15 }}
                style={{ willChange: "transform" }}
              />
            );
          })}
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
