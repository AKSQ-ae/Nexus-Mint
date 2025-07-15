import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    animated?: boolean
  }
>(({ className, value, variant = 'default', size = 'md', animated = true, ...props }, ref) => {
  const variantClasses = {
    default: "bg-blue-600",
    gradient: "bg-gradient-to-r from-blue-600 to-purple-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    danger: "bg-red-600"
  }

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out",
          variantClasses[variant],
          animated && "animate-progress-fill"
        )}
        style={{ 
          transform: `translateX(-${100 - (value || 0)}%)`,
          '--progress-width': `${value || 0}%`
        } as React.CSSProperties}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

// Enhanced Progress with Label
const ProgressWithLabel = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    label?: string
    showValue?: boolean
    variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    animated?: boolean
  }
>(({ className, value, label, showValue = true, variant = 'default', size = 'md', animated = true, ...props }, ref) => (
  <div className={cn("space-y-2", className)}>
    {(label || showValue) && (
      <div className="flex justify-between items-center text-sm">
        {label && <span className="font-medium text-foreground">{label}</span>}
        {showValue && (
          <span className="text-muted-foreground font-mono">
            {Math.round(value || 0)}%
          </span>
        )}
      </div>
    )}
    <Progress 
      ref={ref} 
      value={value} 
      variant={variant} 
      size={size} 
      animated={animated} 
      {...props} 
    />
  </div>
))
ProgressWithLabel.displayName = "ProgressWithLabel"

// Circular Progress
const CircularProgress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    size?: number
    strokeWidth?: number
    variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger'
    animated?: boolean
    showValue?: boolean
  }
>(({ className, value = 0, size = 120, strokeWidth = 8, variant = 'default', animated = true, showValue = true, ...props }, ref) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  const variantColors = {
    default: "stroke-blue-600",
    gradient: "stroke-gradient-to-r from-blue-600 to-purple-600",
    success: "stroke-green-600",
    warning: "stroke-yellow-600",
    danger: "stroke-red-600"
  }

  return (
    <div 
      ref={ref}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            variantColors[variant],
            animated && "transition-all duration-1000 ease-out"
          )}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-foreground">
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  )
})
CircularProgress.displayName = "CircularProgress"

// Progress Steps
const ProgressSteps = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    steps: string[]
    currentStep: number
    variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger'
  }
>(({ className, steps, currentStep, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: "bg-blue-600 border-blue-600",
    gradient: "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-600",
    success: "bg-green-600 border-green-600",
    warning: "bg-yellow-600 border-yellow-600",
    danger: "bg-red-600 border-red-600"
  }

  return (
    <div ref={ref} className={cn("flex items-center justify-between", className)} {...props}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isUpcoming = index > currentStep

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isCompleted && variantClasses[variant],
                  isCurrent && "border-blue-600 bg-blue-600 text-white",
                  isUpcoming && "border-gray-300 bg-gray-100 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn(
                "mt-2 text-xs font-medium text-center max-w-20",
                isCompleted && "text-blue-600",
                isCurrent && "text-blue-600",
                isUpcoming && "text-gray-400"
              )}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-16 h-0.5 mx-4 transition-all duration-300",
                isCompleted ? "bg-blue-600" : "bg-gray-300"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
})
ProgressSteps.displayName = "ProgressSteps"

export { Progress, ProgressWithLabel, CircularProgress, ProgressSteps }
