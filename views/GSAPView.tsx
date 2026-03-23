import React, { useState, useMemo } from 'react';
import { GSAP_EASING_FUNCTIONS } from '../gsapConstants';
import { GSAPEasingCategory, GSAPEasingFunction, PathPoint } from '../types';
import { GSAPGallery } from '../components/GSAPGallery';
import { FilterControls } from '../components/FilterControls';
import { MultiPointCurveEditor } from '../components/MultiPointCurveEditor';
import { convertGsapEaseToPoints } from '../utils/gsapUtils';

interface GSAPViewProps {
  customEaseId: string;
  points: PathPoint[];
  setPoints: (p: PathPoint[]) => void;
  progressRef: React.MutableRefObject<{ progress: number }>;
  duration: number;
  setDuration: (d: number) => void;
  range: number;
  setRange: (r: number) => void;
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
}) => {
  const [activeCategory, setActiveCategory] = useState<GSAPEasingCategory>(GSAPEasingCategory.ALL);

  const customGSAPEasing = useMemo<GSAPEasingFunction>(
    () => ({
      id: 'custom-bezier',
      name: 'Custom Ease',
      category: GSAPEasingCategory.CUSTOM,
      ease: customEaseId,
      description: 'Your custom ease created in the editor.',
    }),
    [customEaseId]
  );

  const functionsToDisplay = useMemo(() => {
    const allFuncs = [customGSAPEasing, ...GSAP_EASING_FUNCTIONS];

    if (activeCategory === GSAPEasingCategory.ALL) {
      return allFuncs.sort((a, b) => {
        if (a.id === 'custom-bezier') return -1;
        if (b.id === 'custom-bezier') return 1;
        return a.name.localeCompare(b.name);
      });
    }
    if (activeCategory === GSAPEasingCategory.CUSTOM) {
      return [customGSAPEasing];
    }
    return GSAP_EASING_FUNCTIONS.filter((func) => func.category === activeCategory).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [activeCategory, customGSAPEasing]);

  const categoryItems = useMemo(
    () =>
      (Object.values(GSAPEasingCategory) as GSAPEasingCategory[]).map((c) => ({
        label: c,
        value: c,
      })),
    []
  );

  const handleCardClick = (ease: string) => {
    if (ease === customEaseId) return;

    const newPoints = convertGsapEaseToPoints(ease);
    if (newPoints.length > 0) {
      setPoints(newPoints);
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            />
          </div>
        </aside>
        <main className="lg:col-span-2">
          <div className="flex flex-col gap-8">
            <div className="flex flex-row items-center justify-start gap-4">
              <FilterControls
                items={categoryItems}
                activeItem={activeCategory}
                setActiveItem={(value) => setActiveCategory(value)}
                buttonClassName="text-sm font-medium"
              />
            </div>
            <GSAPGallery functions={functionsToDisplay} onCardClick={handleCardClick} />
          </div>
        </main>
      </div>
    </div>
  );
};
