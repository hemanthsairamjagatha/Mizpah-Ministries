import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="block text-sm font-medium font-inter text-navy-800"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          style={{ fontFamily: "'Inter', sans-serif", ...props.style }}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg border text-sm font-inter text-navy-900 bg-white placeholder:text-navy-400 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400',
            error ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 hover:border-slate-400',
            className
          )}
          {...props}
        />
        {error && (
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-xs text-rose-500 font-inter"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-xs text-navy-500 font-inter"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const textareaId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="block text-sm font-medium font-inter text-navy-800"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          style={{ fontFamily: "'Inter', sans-serif", ...props.style }}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg border text-sm font-inter text-navy-900 bg-white placeholder:text-navy-400 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 resize-y',
            error ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 hover:border-slate-400',
            className
          )}
          {...props}
        />
        {error && (
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-xs text-rose-500 font-inter"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-xs text-navy-500 font-inter"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
