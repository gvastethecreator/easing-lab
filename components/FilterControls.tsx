import React from 'react';

interface FilterButtonProps<T> {
  item: { label: string; value: T };
  isActive: boolean;
  onClick: (value: T) => void;
  className?: string;
  key?: React.Key;
}

function FilterButton<T extends string>({
  item,
  isActive,
  onClick,
  className = '',
}: FilterButtonProps<T>) {
  const baseClasses =
    'px-3 py-1 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-surface-base focus:ring-accent-primary';
  const activeClasses = 'bg-accent-primary text-white font-semibold shadow-sm';
  const inactiveClasses =
    'bg-surface-2 dark:bg-surface-2 text-text-secondary dark:text-text-secondary hover:bg-surface-hover dark:hover:bg-surface-hover hover:text-text-primary dark:hover:text-text-primary';

  return (
    <button
      type="button"
      onClick={() => onClick(item.value)}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`}
      aria-pressed={isActive}
    >
      {item.label}
    </button>
  );
}

const updateWithTransition = (updateCallback: () => void) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.startViewTransition || prefersReducedMotion) {
    updateCallback();
    return;
  }

  try {
    document.startViewTransition(updateCallback);
  } catch {
    updateCallback();
  }
};

interface FilterControlsProps<T extends string> {
  items: { label: string; value: T }[];
  activeItem: T;
  setActiveItem: (item: T) => void;
  label?: string;
  buttonClassName?: string;
}

export const FilterControls = <T extends string>({
  items,
  activeItem,
  setActiveItem,
  label,
  buttonClassName,
}: FilterControlsProps<T>) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {label && (
        <span className="text-sm font-medium text-text-secondary dark:text-text-secondary mr-2">
          {label}
        </span>
      )}
      {items.map((item) => (
        <FilterButton
          key={item.value}
          item={item}
          isActive={activeItem === item.value}
          onClick={(value) => updateWithTransition(() => setActiveItem(value))}
          className={buttonClassName}
        />
      ))}
    </div>
  );
};
