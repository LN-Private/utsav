import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
}

export const Container: React.FC<ContainerProps> = ({ children, className, fluid = false }) => {
  return (
    <div className={cn(!fluid && 'container mx-auto px-4', className)}>
      {children}
    </div>
  );
};