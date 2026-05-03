import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/40 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-background shadow-gold-sm hover:bg-gold-light font-semibold",
        destructive:
          "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
        outline:
          "border border-border bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
        secondary:
          "bg-surface-elevated border border-border text-text-primary hover:bg-surface-hover",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-surface-hover",
        link: "text-gold underline-offset-4 hover:underline p-0 h-auto",
        success:
          "bg-success/10 text-success border border-success/20 hover:bg-success/20",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 rounded-md px-3 text-xs",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
