import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium font-inter rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      // Primary sky blue #38BDF8 with hover #0284C7
      primary: 'bg-sky-400 text-white hover:bg-sky-600 focus:ring-sky-400 shadow-sm hover:shadow active:scale-[0.99]',
      secondary: 'bg-navy-100 text-navy-800 hover:bg-navy-200 focus:ring-navy-300',
      outline: 'border border-slate-300 bg-white text-navy-800 hover:bg-slate-50 hover:border-slate-400 focus:ring-sky-400',
      danger: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400 shadow-sm',
      ghost: 'text-navy-700 hover:bg-slate-100 focus:ring-slate-300',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{ fontFamily: "'Inter', sans-serif", ...props.style }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon}
        <span style={{ fontFamily: "'Inter', sans-serif" }} className="font-inter">
          {children}
        </span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
