import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "cn";

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      ref={ref}
      onClick={() => {
        if (!disabled && onCheckedChange) {
          onCheckedChange(!checked);
        }
      }}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-slate-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors",
        checked ? "bg-emerald-800 text-white border-emerald-800" : "bg-white text-transparent",
        className
      )}
      {...props}
    >
      <Check className={cn("h-3.5 w-3.5 stroke-[3]", checked ? "opacity-100" : "opacity-0")} />
    </button>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
