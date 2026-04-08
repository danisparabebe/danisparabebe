import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, hover = true, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-md overflow-hidden bg-neutral-white shadow-soft transition-all duration-300',
                    hover && 'hover:shadow-hover',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';

interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    aspectRatio?: '3/4' | '4/3' | '1/1';
    hoverZoom?: boolean;
}

const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
    ({ className, aspectRatio = '3/4', hoverZoom = true, ...props }, ref) => {
        return (
            <div className={cn(`aspect-${aspectRatio.replace('/', '-')} overflow-hidden`)}>
                <img
                    ref={ref}
                    className={cn(
                        'w-full h-full object-cover transition-transform duration-300',
                        hoverZoom && 'group-hover:scale-105',
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
CardImage.displayName = 'CardImage';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, ...props }, ref) => {
        return <div ref={ref} className={cn('p-4', className)} {...props} />;
    }
);
CardContent.displayName = 'CardContent';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, ...props }, ref) => {
        return <div ref={ref} className={cn('p-6 flex flex-col space-y-1.5', className)} {...props} />;
    }
);
CardHeader.displayName = 'CardHeader';


interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, ...props }, ref) => {
        return (
            <h4
                ref={ref}
                className={cn('text-neutral-text font-semibold truncate mb-1', className)}
                {...props}
            />
        );
    }
);
CardTitle.displayName = 'CardTitle';

interface CardPriceProps extends React.HTMLAttributes<HTMLParagraphElement> { }

const CardPrice = React.forwardRef<HTMLParagraphElement, CardPriceProps>(
    ({ className, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn('text-lg font-bold text-primary-brand', className)}
                {...props}
            />
        );
    }
);
CardPrice.displayName = 'CardPrice';

export { Card, CardImage, CardContent, CardTitle, CardPrice, CardHeader };
