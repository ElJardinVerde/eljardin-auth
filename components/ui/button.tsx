import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { shadCn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-slate-300",
  {
    variants: {
      variant: {
        default:
          "bg-slate-300 text-slate-900 shadow hover:bg-slate-400 dark:bg-slate-300 dark:text-slate-900 dark:hover:bg-slate-400",
        destructive:
          "bg-red-300 text-slate-900 shadow-sm hover:bg-red-400 dark:bg-red-300 dark:text-slate-900 dark:hover:bg-red-400",
        outline:
          "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-100 dark:border-slate-200 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
        secondary:
          "bg-slate-200 text-slate-900 shadow-sm hover:bg-slate-300 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300",
        ghost: "bg-transparent hover:bg-slate-200 hover:text-slate-900 dark:bg-transparent dark:hover:bg-slate-200 dark:hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-900 dark:hover:text-slate-900",
        green: "bg-green-500 text-white hover:bg-green-600",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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
        className={shadCn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
