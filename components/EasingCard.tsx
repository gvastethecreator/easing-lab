import React from 'react';
import { UniversalGraphCard } from './UniversalGraphCard';
import type { EasingFunction } from '../types';

interface EasingCardProps {
  easing: EasingFunction;
  onClick: () => void;
  duration: number;
}

export const EasingCard: React.FC<EasingCardProps> = ({ easing, onClick, duration: _duration }) => {
  return (
    <UniversalGraphCard
      id={easing.id}
      title={easing.name}
      description={easing.description}
      pathData={easing.path}
      animationEase={`cubic-bezier(${easing.bezier.join(',')})`}
      copyValue={`cubic-bezier(${easing.bezier.join(', ')})`}
      onSelect={onClick}
      isCustom={easing.id === 'custom'}
    />
  );
};
