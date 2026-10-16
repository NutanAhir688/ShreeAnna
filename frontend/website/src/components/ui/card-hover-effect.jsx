import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
  onItemClick,
}) => {
  let [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-6 gap-4",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item?.title || idx}
          className="relative group block p-2 h-full w-full cursor-pointer"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onItemClick && onItemClick(item, idx)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.1 },
                }}
              />
            )}
          </AnimatePresence>
          <Card className={item.className}>
            <div className="flex items-center justify-between mb-3">
              {item.icon}
              {item.badge}
            </div>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
            {item.footer && (
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                {item.footer}
              </div>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-5 overflow-hidden bg-slate-900 border border-slate-800 group-hover:border-amber-500/40 relative z-20 transition-all duration-300",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-1">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}) => {
  return (
    <h4 className={cn("text-slate-100 font-bold tracking-tight text-base mt-2", className)}>
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}) => {
  return (
    <p
      className={cn(
        "mt-2 text-slate-400 tracking-wide leading-relaxed text-xs",
        className
      )}
    >
      {children}
    </p>
  );
};
