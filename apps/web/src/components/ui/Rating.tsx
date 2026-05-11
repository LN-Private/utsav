import React from 'react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  readOnly = true,
  onRatingChange,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = rating - i > 0 && rating - i < 1;
        
        return (
          <button
            key={i}
            onClick={() => !readOnly && onRatingChange?.(i + 1)}
            disabled={readOnly}
            className={cn(!readOnly && 'cursor-pointer hover:scale-110 transition-transform')}
          >
            <svg
              className={cn(sizeClasses[size], 'text-yellow-400')}
              fill={filled || partial ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l.145.435c.11.338.412.588.77.619l.455.038c.955.084 1.387 1.24.685 1.884l-.364.326c-.285.25-.39.663-.26.997l.135.378c.162.458-.035.917-.378 1.1l-.408.236c-.317.178-.43.58-.274.897l.172.345c.185.364-.014.764-.377.858l-.445.104c-.354.083-.565.4-.497.726l.059.361c.068.376-.24.676-.586.56l-.385-.167c-.318-.137-.668-.033-.873.254l-.229.34c-.165.256-.496.324-.744.146l-.342-.229c-.236-.161-.54-.185-.782-.057l-.36.168c-.362.168-.795-.097-.816-.492l-.016-.337c-.008-.382.26-.677.596-.677h.001c.336 0 .604.278.604.614v.001c0 .336-.278.604-.614.604h-.001c-.336 0-.604-.278-.604-.614v-.001c0-.336.278-.604.614-.604h.001z"
              />
            </svg>
          </button>
        );
      })}
      {rating > 0 && <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>}
    </div>
  );
};