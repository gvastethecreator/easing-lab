import { useMemo, useState } from 'react';
import { EASING_FUNCTIONS } from '../constants';
import { EasingCategory, EasingType, type EasingFunction, type Point } from '../types';
import { EasingGallery } from './EasingGallery';
import { FilterControls } from './FilterControls';

interface EasingPresetBrowserProps {
  p1: Point;
  p2: Point;
  onSelect: (bezier: [number, number, number, number]) => void;
}

export const EasingPresetBrowser: React.FC<EasingPresetBrowserProps> = ({ p1, p2, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState<EasingCategory>(EasingCategory.ALL);
  const [activeType, setActiveType] = useState<EasingType>(EasingType.ALL);

  const customEasing = useMemo<EasingFunction>(
    () => ({
      id: 'custom',
      name: 'Custom Easing',
      category: EasingCategory.CUBIC,
      type: EasingType.OTHER,
      bezier: [p1.x, p1.y, p2.x, p2.y],
      path: `M0,224 C${p1.x * 224},${224 - p1.y * 224} ${p2.x * 224},${224 - p2.y * 224} 224,0`,
    }),
    [p1, p2]
  );

  const functions = useMemo(() => {
    const filtered = EASING_FUNCTIONS.filter((item) => {
      const categoryMatches =
        activeCategory === EasingCategory.ALL || item.category === activeCategory;
      const typeMatches = activeType === EasingType.ALL || item.type === activeType;
      return categoryMatches && typeMatches;
    }).toSorted((left, right) => left.name.localeCompare(right.name));

    return [customEasing, ...filtered];
  }, [activeCategory, activeType, customEasing]);

  const categories = useMemo(
    () => Object.values(EasingCategory).map((value) => ({ label: value, value })),
    []
  );
  const types = useMemo(
    () => Object.values(EasingType).map((value) => ({ label: value, value })),
    []
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <FilterControls
          items={categories}
          activeItem={activeCategory}
          setActiveItem={setActiveCategory}
          buttonClassName="text-sm font-medium"
        />
        <FilterControls
          items={types}
          activeItem={activeType}
          setActiveItem={setActiveType}
          label="Type:"
          buttonClassName="text-xs font-medium"
        />
      </div>
      <EasingGallery functions={functions} onCardClick={onSelect} />
    </div>
  );
};
