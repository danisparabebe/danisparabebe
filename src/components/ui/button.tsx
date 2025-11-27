import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rosa disabled:pointer-events-none disabled:opacity-50 uppercase tracking-widest",
    {
        variants: {
            variant: {
                default:
                    "bg-rosa text-white shadow-soft hover:bg-rosa/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
                outline:
                    "border border-rosa text-rosa bg-transparent hover:bg-rosa/10",
                ghost: "hover:bg-rosa/10 text-rosa",
                link: "text-rosa underline-offset-4 hover:underline",
                white: "bg-white text-text shadow-soft hover:bg-white/90 hover:shadow-lg",
            },
            size: {
                default: "h-12 px-8 py-2",
                sm: "h-9 px-4 text-xs",
                lg: "h-14 px-10 text-base",
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
