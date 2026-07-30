import React, { useMemo, useState } from "react";
import { FilterControls } from "../components/FilterControls";
import { GSAPGallery } from "../components/GSAPGallery";
import { MultiPointCurveEditor } from "../components/MultiPointCurveEditor";
import { GSAP_EASING_FUNCTIONS } from "../gsapConstants";
import { convertGsapEaseToPoints } from "../utils/gsapUtils";
import {
  GSAPEasingCategory,
  type AnimationEngine,
  type GSAPEasingFunction,
  type PathPoint,
} from "../types";

interface GSAPViewProps {
  customEaseId: string;
  points: PathPoint[];
  setPoints: React.Dispatch<React.SetStateAction<PathPoint[]>>;
  progressRef: React.MutableRefObject<{ progress: number }>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  range: number;
  setRange: React.Dispatch<React.SetStateAction<number>>;
  engine: AnimationEngine;
}

export const GSAPView: React.FC<GSAPViewProps> = ({
  customEaseId,
  points,
  setPoints,
  progressRef,
  duration,
  setDuration,
  range,
  setRange,
  engine,
}) => {
  const [activeCategory, setActiveCategory] = useState<GSAPEasingCategory>(GSAPEasingCategory.ALL);

  const customGSAPEasing = useMemo<GSAPEasingFunction>(
    () => ({
      id: "custom-bezier",
      name: "Custom Ease",
      category: GSAPEasingCategory.CUSTOM,
      ease: customEaseId,
      description: "Your custom ease created in the editor.",
    }),
    [customEaseId],
  );

  const functionsToDisplay = useMemo(() => {
    if (activeCategory === GSAPEasingCategory.CUSTOM) {
      return [customGSAPEasing];
    }

    const catalog = GSAP_EASING_FUNCTIONS.filter(
      (func) => activeCategory === GSAPEasingCategory.ALL || func.category === activeCategory,
    ).toSorted((a, b) => a.name.localeCompare(b.name));

    return activeCategory === GSAPEasingCategory.ALL ? [customGSAPEasing, ...catalog] : catalog;
  }, [activeCategory, customGSAPEasing]);

  const categoryItems = useMemo(
    () => Object.values(GSAPEasingCategory).map((value) => ({ label: value, value })),
    [],
  );

  const handleCardClick = (ease: string) => {
    if (ease === customEaseId) return;

    const newPoints = convertGsapEaseToPoints(ease);
    if (newPoints.length > 0) {
      setPoints(newPoints);
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-28">
            <MultiPointCurveEditor
              points={points}
              setPoints={setPoints}
              customEaseId={customEaseId}
              duration={duration}
              setDuration={setDuration}
              range={range}
              setRange={setRange}
              progressRef={progressRef}
              engine={engine}
            />
          </div>
        </aside>
        <section className="lg:col-span-2" aria-label="GSAP easing presets">
          <div className="flex flex-col gap-8">
            <div className="flex flex-row items-center justify-start gap-4">
              <FilterControls
                items={categoryItems}
                activeItem={activeCategory}
                setActiveItem={setActiveCategory}
                buttonClassName="text-sm font-medium"
              />
            </div>
            <GSAPGallery functions={functionsToDisplay} onCardClick={handleCardClick} />
          </div>
        </section>
      </div>
    </div>
  );
};
