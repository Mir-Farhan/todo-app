import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-primary text-white shadow-lg shadow-primary/30 hover:scale-105 hover:shadow-primary/50 active:scale-95",
        destructive:
          "bg-gradient-danger text-white shadow-lg shadow-danger/30 hover:scale-105 hover:shadow-danger/50 active:scale-95",
        outline:
          "border-2 border-primary/30 bg-background/50 backdrop-blur-sm shadow-md hover:bg-primary/10 hover:border-primary/50 hover:scale-105 active:scale-95",
        secondary:
          "bg-gradient-secondary text-white shadow-lg shadow-secondary/30 hover:scale-105 hover:shadow-secondary/50 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-8 rounded-lg px-4 text-xs py-2",
        lg: "h-12 rounded-xl px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
