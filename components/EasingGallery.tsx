import React from 'react';
import { UniversalGraphCard } from './UniversalGraphCard';
import type { EasingFunction } from '../types';

interface EasingGalleryProps {
  functions: EasingFunction[];
  onCardClick: (bezier: [number, number, number, number]) => void;
}

export const EasingGallery: React.FC<EasingGalleryProps> = React.memo(
  ({ functions, onCardClick }) => {
    return (
      <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {functions.map((func) => (
          <UniversalGraphCard
            key={func.id}
            id={func.id}
            title={func.name}
            description={func.description}
            pathData={func.path}
            animationEase={`cubic-bezier(${func.bezier.join(',')})`}
            copyValue={`cubic-bezier(${func.bezier.join(', ')})`}
            onSelect={() => onCardClick(func.bezier)}
            isCustom={func.id === 'custom'}
          />
        ))}
      </div>
    );
  }
);

EasingGallery.displayName = 'EasingGallery';
