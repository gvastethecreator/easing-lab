import React, { useMemo } from "react";
import { gsap } from "gsap";
import { UniversalGraphCard } from "./UniversalGraphCard";
import { GSAPEasingCategory, type GSAPEasingFunction } from "../types";

const createFallbackLinearPath = (width: number, height: number) =>
  `M 0 ${height} L ${width} 0`;

const generateGSAPPath = (ease: string, width: number, height: number, samples: number = 100): string => {
  let easeFunction: gsap.EaseFunction | null = null;
  try {
    const parsed = gsap.parseEase(ease);
    if (typeof parsed === "function") {
      easeFunction = parsed;
    }
  } catch {
    easeFunction = null;
  }

  if (!easeFunction) {
    return createFallbackLinearPath(width, height);
  }

  const points: string[] = [`M 0 ${height}`];
  const precision = 2;
  for (let i = 1; i <= samples; i++) {
    const progress = i / samples;
    const easedValue = easeFunction(progress);
    const x = (progress * width).toFixed(precision);
    const y = (height - easedValue * height).toFixed(precision);
    points.push(`L ${x} ${y}`);
  }
  return points.join(" ");
};

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
    [functions],
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
            isCustom={func.category === GSAPEasingCategory.CUSTOM}
          />
        );
      })}
    </div>
  );
});

GSAPGallery.displayName = "GSAPGallery";
