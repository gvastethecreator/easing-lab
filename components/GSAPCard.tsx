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

interface GSAPCardProps {
  easing: GSAPEasingFunction;
  onClick: () => void;
}

export const GSAPCard: React.FC<GSAPCardProps> = ({ easing, onClick }) => {
  const pathData = useMemo(() => generateGSAPPath(easing.ease, 224, 224), [easing.ease]);

  return (
    <UniversalGraphCard
      id={easing.id}
      title={easing.name}
      subtitle={easing.ease}
      description={easing.description}
      pathData={pathData}
      animationEase={easing.ease}
      copyValue={easing.ease}
      onSelect={onClick}
      isCustom={easing.category === GSAPEasingCategory.CUSTOM}
    />
  );
};
