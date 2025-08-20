// Accessible input component with validation states
import { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle } from 'lucide-react';

const inputVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:ring-primary-600',
        error: 'border-red-500 focus-visible:ring-red-600',
        success: 'border-green-500 focus-visible:ring-green-600',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  showValidationIcon?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      size,
      label,
      helperText,
      errorMessage,
      showValidationIcon = false,
      leftIcon,
      rightIcon,
      disabled,
      required,
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    
    const finalVariant = errorMessage ? 'error' : variant;
    const describedBy = [
      ariaDescribedBy,
      helperText && helperTextId,
      errorMessage && errorId,
    ]
      .filter(Boolean)
      .join(' ');

    const ValidationIcon = () => {
      if (!showValidationIcon) return null;
      
      if (errorMessage) {
        return (
          <AlertCircle 
            className="h-4 w-4 text-red-500" 
            aria-hidden="true"
          />
        );
      }
      
      if (finalVariant === 'success') {
        return (
          <CheckCircle 
            className="h-4 w-4 text-green-500" 
            aria-hidden="true"
          />
        );
      }
      
      return null;
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="ml-1 text-red-500" aria-label="required">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant: finalVariant, size }),
              leftIcon && 'pl-10',
              (rightIcon || showValidationIcon) && 'pr-10',
              className
            )}
            disabled={disabled}
            required={required}
            aria-describedby={describedBy || undefined}
            aria-invalid={!!errorMessage}
            {...props}
          />
          
          {(rightIcon || showValidationIcon) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {showValidationIcon ? <ValidationIcon /> : rightIcon}
            </div>
          )}
        </div>
        
        {helperText && !errorMessage && (
          <p
            id={helperTextId}
            className="mt-1 text-sm text-gray-600"
          >
            {helperText}
          </p>
        )}
        
        {errorMessage && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';