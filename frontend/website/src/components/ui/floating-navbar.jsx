import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";

export const FloatingNav = ({
  navItems,
  className,
  rightElement,
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      let direction = current - scrollYProgress.getPrevious();

      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-[calc(100vw-1rem)] sm:max-w-fit fixed top-3 sm:top-5 inset-x-0 mx-auto border border-slate-800 rounded-full bg-slate-950/85 backdrop-blur-xl shadow-lg z-[5000] px-2.5 sm:px-4 py-1.5 sm:py-2 items-center justify-between gap-1.5 sm:gap-4",
          className
        )}
      >
        <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
          {navItems.map((navItem, idx) => (
            <a
              key={`link-${idx}`}
              href={navItem.link}
              className={cn(
                "relative text-slate-300 items-center flex space-x-1 hover:text-amber-400 text-xs font-medium px-2 sm:px-2.5 py-1 sm:py-1.5 transition-colors"
              )}
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block text-xs">{navItem.name}</span>
            </a>
          ))}
        </div>

        {rightElement}
      </motion.div>
    </AnimatePresence>
  );
};
