import { cn } from '@/lib/cn';
import { cva, type VariantProps } from "class-variance-authority";
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

// 1. Define button variants using cva
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl px-4 text-white", 
  {
    variants: {
      variant: {
        primary: "bg-white/80" ,
        secondary: "bg-zinc-200/40 text-white", 
      },
      size: {
        default: "py-2", 
        sm: "py-2 text-sm",
        lg: "py-2 text-xl", 
        icon: "w-10", 
      },
    },
    defaultVariants: {
      variant: "primary", 
      size: "default", 
    },
  }
);

// 2. Define text variants for consistency inside the button
const buttonTextVariants = cva(
  "text-center font-semibold text-lg", // Base text styles
  {
    variants: {
      variant: {
        primary: "text-black", // Text color for primary button
        secondary: "text-white", // Text color for secondary button
      },
      size: {
        default: "text-lg",
        sm: "text-sm",
        lg: "text-xl",
        icon: "", 
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ComponentPropsWithoutRef<typeof TouchableOpacity>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<View, ButtonProps>(
  ({ className, variant, size, isLoading = false, children, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator
            className='h-8'
            color={variant === 'primary' ? 'black' : 'white'}
          />
        ) : (
          <Text className={cn(buttonTextVariants({ variant, size }))}>
            {children}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

