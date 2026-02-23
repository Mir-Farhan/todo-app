import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-primary text-white shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/50",
        secondary:
          "bg-gradient-secondary text-white shadow-md shadow-secondary/30 hover:shadow-lg hover:shadow-secondary/50",
        destructive:
          "bg-gradient-danger text-white shadow-md shadow-danger/30 hover:shadow-lg hover:shadow-danger/50",
        outline:
          "border-2 border-primary/50 bg-background/50 backdrop-blur-sm text-foreground hover:bg-primary/10 hover:border-primary/50",
        success:
          "bg-gradient-success text-white shadow-md shadow-success/30 hover:shadow-lg hover:shadow-success/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
