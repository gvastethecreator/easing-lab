import React, { useMemo } from 'react';
import { UniversalGraphCard } from './UniversalGraphCard';
import type { GSAPEasingFunction } from '../types';
import { generateGSAPPath } from '../utils/gsapUtils';

interface GSAPGalleryProps {
  functions: GSAPEasingFunction[];
  onCardClick: (ease: string) => void;
}

export const GSAPGallery: React.FC<GSAPGalleryProps> = React.memo(({ functions, onCardClick }) => {
  const cards = useMemo(
    () =>
      functions.map((func) => ({
        ...func,
        pathData: generateGSAPPath(func.ease, 224, 224),
      })),
    [functions]
  );
  return (
    <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {cards.map((func) => {
        return (
          <UniversalGraphCard
            key={func.id}
            id={func.id}
            title={func.name}
            subtitle={func.ease}
            description={func.description}
            pathData={func.pathData}
            animationEase={func.ease}
            copyValue={func.ease}
            onSelect={() => onCardClick(func.ease)}
            isCustom={func.category === 'Custom'}
          />
        );
      })}
    </div>
  );
});

GSAPGallery.displayName = 'GSAPGallery';
