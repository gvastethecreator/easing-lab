import React, { useState, useMemo } from "react";
import { EasingGallery } from "../components/EasingGallery";
import { FilterControls } from "../components/FilterControls";
import { CurveEditor } from "../components/CurveEditor";
import { EASING_FUNCTIONS } from "../constants";
import { EasingCategory, EasingType, EasingFunction } from "../types";

type Point = { x: number; y: number };

interface CubicBezierViewProps {
  p1: Point;
  setP1: (p: Point) => void;
  p2: Point;
  setP2: (p: Point) => void;
  duration: number;
  setDuration: (d: number) => void;
  range: number;
  setRange: (r: number) => void;
  progressRef: React.MutableRefObject<{ progress: number }>;
}

export const CubicBezierView: React.FC<CubicBezierViewProps> = ({
  p1,
  setP1,
  p2,
  setP2,
  duration,
  setDuration,
  range,
  setRange,
  progressRef,
}) => {
  const [activeCategory, setActiveCategory] = useState<EasingCategory>(EasingCategory.ALL);
  const [activeType, setActiveType] = useState<EasingType>(EasingType.ALL);

  const customEasing = useMemo<EasingFunction>(
    () => ({
      id: "custom",
      name: "Custom Easing",
      category: EasingCategory.CUBIC,
      type: EasingType.OTHER,
      bezier: [p1.x, p1.y, p2.x, p2.y],
      path: `M0,224 C${p1.x * 224},${224 - p1.y * 224} ${p2.x * 224},${224 - p2.y * 224} 224,0`,
    }),
    [p1, p2],
  );

  const filteredFunctions = useMemo(() => {
    return EASING_FUNCTIONS.filter((func) => {
      const categoryMatch =
        activeCategory === EasingCategory.ALL || func.category === activeCategory;
      const typeMatch = activeType === EasingType.ALL || func.type === activeType;
      const isOtherAndFiltered =
        func.type === EasingType.OTHER &&
        activeType !== EasingType.ALL &&
        activeType !== EasingType.OTHER;

      return categoryMatch && typeMatch && !isOtherAndFiltered;
    });
  }, [activeCategory, activeType]);

  const functionsWithCustom = useMemo(() => {
    const sorted = filteredFunctions.toSorted((a, b) => a.name.localeCompare(b.name));
    return [customEasing, ...sorted];
  }, [customEasing, filteredFunctions]);

  const handleCardClick = (bezier: [number, number, number, number]) => {
    setP1({ x: bezier[0], y: bezier[1] });
    setP2({ x: bezier[2], y: bezier[3] });
    // Smooth scroll to top on mobile when selecting
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const categoryItems = useMemo(
    () => (Object.values(EasingCategory) as EasingCategory[]).map((c) => ({ label: c, value: c })),
    [],
  );
  const typeItems = useMemo(
    () => (Object.values(EasingType) as EasingType[]).map((t) => ({ label: t, value: t })),
    [],
  );

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-28">
            <CurveEditor
              p1={p1}
              setP1={setP1}
              p2={p2}
              setP2={setP2}
              duration={duration}
              setDuration={setDuration}
              range={range}
              setRange={setRange}
              progressRef={progressRef}
            />
          </div>
        </aside>
        <main className="lg:col-span-2">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <FilterControls
                items={categoryItems}
                activeItem={activeCategory}
                setActiveItem={(value) => setActiveCategory(value)}
                buttonClassName="text-sm font-medium"
              />
              <FilterControls
                items={typeItems}
                activeItem={activeType}
                setActiveItem={(value) => setActiveType(value)}
                label="Type:"
                buttonClassName="text-xs font-medium"
              />
            </div>
            <EasingGallery functions={functionsWithCustom} onCardClick={handleCardClick} />
          </div>
        </main>
      </div>
    </div>
  );
};
