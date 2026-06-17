import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--cloud)] text-[var(--ink-soft)]",
        outline: "border-[var(--rule)] text-[var(--ink-soft)]",
        accent: "border-transparent bg-[var(--accent-light)] text-[var(--accent-deep)]",
        baixo: "border-transparent bg-[var(--accent-light)] text-[var(--accent-deep)]",
        medio: "border-transparent bg-[#f6ecd2] text-[#8a6d1f]",
        alto: "border-transparent bg-[#f7e2d2] text-[#a8531f]",
        critico: "border-transparent bg-[#f6d8d4] text-[#9c2e26]",
        muted: "border-transparent bg-[var(--paper-soft)] text-[var(--steel)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
