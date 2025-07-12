import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-space font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-white shadow-elegant hover:shadow-premium btn-glow hover:scale-105 font-medium",
        destructive:
          "bg-destructive text-destructive-foreground shadow-elegant hover:bg-destructive/90 hover:scale-105",
        outline:
          "border-2 border-primary bg-background text-primary shadow-elegant hover:bg-primary hover:text-white hover:scale-105 font-medium",
        secondary:
          "bg-muted text-foreground shadow-elegant hover:bg-muted/80 hover:scale-105 font-medium",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-orange text-white shadow-premium hover:shadow-glow transform hover:scale-105 btn-glow font-semibold",
        cta: "bg-orange-accent hover:bg-orange-accent/90 text-white shadow-elegant hover:shadow-glow transform hover:scale-105 font-semibold",
        hero: "bg-gradient-primary text-white shadow-glow hover:shadow-premium transform hover:scale-110 btn-glow font-bold text-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-2xl px-8 text-base font-semibold",
        xl: "h-14 rounded-2xl px-10 text-lg font-semibold",
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
