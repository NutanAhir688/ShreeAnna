import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}) => {
  const containerRef = useRef(null);
  const parentRef = useRef(null);

  const beams = [
    {
      initialX: 10,
      translateX: 10,
      duration: 7,
      repeatDelay: 3,
      delay: 2,
    },
    {
      initialX: 200,
      translateX: 200,
      duration: 6,
      repeatDelay: 4,
      delay: 1,
      className: "h-20",
    },
    {
      initialX: 400,
      translateX: 400,
      duration: 5,
      repeatDelay: 5,
      delay: 3,
    },
    {
      initialX: 600,
      translateX: 600,
      duration: 8,
      repeatDelay: 2,
      delay: 1.5,
      className: "h-24",
    },
    {
      initialX: 800,
      translateX: 800,
      duration: 6.5,
      repeatDelay: 3,
      delay: 0.5,
    },
    {
      initialX: 1000,
      translateX: 1000,
      duration: 7,
      repeatDelay: 4,
      delay: 2.5,
      className: "h-16",
    },
    {
      initialX: 1200,
      translateX: 1200,
      duration: 5.5,
      repeatDelay: 3.5,
      delay: 1,
    },
  ];

  return (
    <div
      ref={parentRef}
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden bg-slate-950",
        className
      )}
    >
      {beams.map((beam, index) => (
        <CollisionMechanism
          key={`${beam.initialX}-${index}`}
          beamOptions={beam}
          containerRef={containerRef}
          parentRef={parentRef}
        />
      ))}

      {children}
      <div
        ref={containerRef}
        className="pointer-events-none absolute bottom-0 w-full inset-x-0 h-4 bg-gradient-to-t from-emerald-500/20 to-transparent"
      />
    </div>
  );
};

const CollisionMechanism = React.forwardRef(
  ({ parentRef, containerRef, beamOptions = {} }, ref) => {
    const beamRef = useRef(null);
    const [collision, setCollision] = useState({
      detected: false,
      coordinates: null,
    });
    const [beamKey, setBeamKey] = useState(0);
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
      const checkCollision = () => {
        if (
          beamRef.current &&
          containerRef.current &&
          parentRef.current
        ) {
          const beamRect = beamRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const parentRect = parentRef.current.getBoundingClientRect();

          if (beamRect.bottom >= containerRect.top) {
            const relativeX =
              beamRect.left - parentRect.left + beamRect.width / 2;
            const relativeY = beamRect.bottom - parentRect.top;

            setCollision({
              detected: true,
              coordinates: {
                x: relativeX,
                y: relativeY,
              },
            });
            setCycle((prev) => prev + 1);
          }
        }
      };

      const animationInterval = setInterval(checkCollision, 50);
      return () => clearInterval(animationInterval);
    }, [cycle, containerRef, parentRef]);

    useEffect(() => {
      if (collision.detected) {
        setTimeout(() => {
          setCollision({ detected: false, coordinates: null });
          setBeamKey((prevKey) => prevKey + 1);
        }, 1500);
      }
    }, [collision]);

    return (
      <>
        <motion.div
          key={beamKey}
          ref={beamRef}
          animate="animate"
          initial={{
            translateY: "-200px",
            translateX: `${beamOptions.initialX || 0}px`,
            rotate: 0,
          }}
          variants={{
            animate: {
              translateY: "1800px",
              translateX: `${beamOptions.translateX || 0}px`,
              rotate: 0,
            },
          }}
          transition={{
            duration: beamOptions.duration || 6,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: beamOptions.delay || 0,
            repeatDelay: beamOptions.repeatDelay || 0,
          }}
          className={cn(
            "absolute left-0 top-0 m-auto h-32 w-0.5 rounded-full bg-gradient-to-t from-emerald-500 via-amber-400 to-transparent",
            beamOptions.className
          )}
        />
        <AnimatePresence>
          {collision.detected && collision.coordinates && (
            <Explosion
              key={`${collision.coordinates.x}-${collision.coordinates.y}`}
              style={{
                left: `${collision.coordinates.x}px`,
                top: `${collision.coordinates.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }
);

CollisionMechanism.displayName = "CollisionMechanism";

const Explosion = ({ ...props }) => {
  const spans = Array.from({ length: 16 }, (_, index) => {
    const angle = (index * 360) / 16;
    const distance = 40 + Math.random() * 30;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;

    return {
      directionX: x,
      directionY: y,
    };
  });

  return (
    <div {...props} className={cn("absolute z-50 h-2 w-2", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute -inset-x-6 top-0 m-auto h-2 w-12 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-xs"
      />
      {spans.map((span, index) => (
        <motion.span
          key={index}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-amber-300 to-emerald-400"
        />
      ))}
    </div>
  );
};
