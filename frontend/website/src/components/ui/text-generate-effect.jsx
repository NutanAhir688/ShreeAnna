import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.15),
      }
    );
  }, [scope.current]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className={cn(
                "opacity-0",
                word.toLowerCase().includes("millet") ||
                  word.toLowerCase().includes("revolution") ||
                  word.toLowerCase().includes("shreeanna") ||
                  word.toLowerCase().includes("farm-to-fork")
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 font-extrabold"
                  : "text-white"
              )}
              style={{
                filter: filter ? "blur(8px)" : "none",
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="leading-snug tracking-tight">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
