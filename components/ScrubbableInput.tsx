import React, { useEffect, useId, useRef, useState } from 'react';

interface ScrubbableInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  ariaLabel?: string;
  step?: number;
  min?: number;
  max?: number;
}

export const ScrubbableInput: React.FC<ScrubbableInputProps> = ({
  value,
  onChange,
  label,
  ariaLabel,
  step = 0.01,
  min = 0,
  max = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const startX = useRef(0);
  const startValue = useRef(0);
  const inputId = useId();

  useEffect(
    () => () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    },
    []
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLLabelElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    startX.current = event.clientX;
    startValue.current = value;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLLabelElement>) => {
    if (!isDragging) return;

    const delta = event.clientX - startX.current;
    let nextValue = startValue.current + delta * (step / 2);
    nextValue = Math.max(min, Math.min(max, nextValue));
    onChange(Number(nextValue.toFixed(2)));
  };

  const finishDragging = (event: React.PointerEvent<HTMLLabelElement>) => {
    if (!isDragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number.parseFloat(event.target.value);
    if (Number.isFinite(nextValue)) onChange(nextValue);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const finalValue = Math.max(min, Math.min(max, value));
    onChange(Number(finalValue.toFixed(2)));
  };

  return (
    <div
      className={`relative group flex-1 rounded-md bg-surface-2 transition-colors hover:bg-surface-hover focus-within:ring-1 focus-within:ring-accent-primary ${isDragging ? 'ring-1 ring-accent-primary bg-surface-hover' : ''}`}
    >
      <label
        htmlFor={inputId}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-ew-resize z-10 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
        title="Drag to change value"
      >
        <span
          className={`text-[10px] font-mono select-none transition-colors ${isDragging ? 'text-accent-primary font-bold' : 'text-text-placeholder group-hover:text-text-secondary'}`}
        >
          {label}
        </span>
      </label>

      <input
        id={inputId}
        name={`scrubbable-${inputId.replaceAll(':', '')}`}
        type="number"
        inputMode="decimal"
        aria-label={ariaLabel ?? `${label} value`}
        step={step}
        min={min}
        max={max}
        value={isEditing ? value : value.toFixed(2)}
        onChange={handleInputChange}
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        className="w-full bg-transparent text-right font-mono text-xs py-1.5 pr-2 pl-8 rounded-md focus:outline-none text-text-primary"
      />
    </div>
  );
};
