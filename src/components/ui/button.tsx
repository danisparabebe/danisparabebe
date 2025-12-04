import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-primary-brand hover:bg-primary-hover text-white shadow-soft hover:shadow-hover',
                secondary: 'bg-transparent border border-primary-brand text-primary-brand hover:bg-primary-brand/10',
                icon: 'bg-neutral-white shadow-soft hover:shadow-hover text-neutral-text',
            },
            size: {
                default: 'h-12 px-6 py-3',
                sm: 'h-10 px-4 py-2 text-sm',
                lg: 'h-14 px-8 py-4 text-lg',
                icon: 'h-10 w-10',
            },
            rounded: {
                pill: 'rounded-full',
                default: 'rounded-md',
                full: 'rounded-full',
            },
            uppercase: {
                true: 'uppercase tracking-wider text-sm',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
            rounded: 'pill',
            uppercase: true,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, rounded, uppercase, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, rounded, uppercase, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
