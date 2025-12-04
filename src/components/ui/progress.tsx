'use client';

import * as React from 'react';

const Progress = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value, ...props }, ref) => (
    <div
        ref={ref}
        className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className || ''}`}
        {...props}
    >
        <div
            className="h-full bg-dusty-rose transition-all"
            style={{ width: `${value || 0}%` }}
        />
    </div>
));
Progress.displayName = 'Progress';

export { Progress };
