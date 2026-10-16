import React from "react";
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "row-span-1 rounded-2xl group/bento hover:shadow-2xl transition duration-300 p-5 bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 justify-between flex flex-col space-y-4 relative overflow-hidden backdrop-blur-md cursor-pointer",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover/bento:bg-amber-500/10 transition-colors duration-500" />
      {header}
      <div className="group-hover/bento:translate-x-1 transition duration-200 relative z-10">
        <div className="flex items-center justify-between mb-2">
          {icon}
          {badge}
        </div>
        <div className="font-bold text-slate-100 text-lg mb-1 tracking-tight">
          {title}
        </div>
        <div className="font-normal text-slate-400 text-xs leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
