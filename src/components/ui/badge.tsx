import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-gold/20 bg-gold/10 text-gold",
        secondary: "border-border bg-surface text-text-secondary",
        destructive: "border-danger/20 bg-danger/10 text-danger",
        success: "border-success/20 bg-success/10 text-success",
        outline: "text-text-secondary border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
