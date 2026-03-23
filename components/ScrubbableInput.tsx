
import React, { useRef, useState, useEffect } from 'react';

interface ScrubbableInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  step?: number;
  min?: number;
  max?: number;
}

export const ScrubbableInput: React.FC<ScrubbableInputProps> = ({
  value,
  onChange,
  label,
  step = 0.01,
  min = 0,
  max = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const startX = useRef<number>(0);
  const startValue = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    startValue.current = value;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const delta = e.clientX - startX.current;
    // Slow down the sensitivity
    const change = delta * (step / 2);
    let newValue = startValue.current + change;
    
    // Clamp
    if (min !== undefined) newValue = Math.max(min, newValue);
    if (max !== undefined) newValue = Math.min(max, newValue);
    
    onChange(parseFloat(newValue.toFixed(2)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Clamp on blur
    let finalValue = value;
    if (min !== undefined) finalValue = Math.max(min, finalValue);
    if (max !== undefined) finalValue = Math.min(max, finalValue);
    onChange(parseFloat(finalValue.toFixed(2)));
  };

  const handleClickLabel = () => {
      // If needed, we could focus input here, but drag is priority
  };

  return (
    <div className={`relative group flex-1 rounded-md bg-surface-2 transition-colors hover:bg-surface-hover focus-within:ring-1 focus-within:ring-accent-primary ${isDragging ? 'ring-1 ring-accent-primary bg-surface-hover' : ''}`}>
      {/* Label / Scrubber */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-ew-resize z-10"
        onMouseDown={handleMouseDown}
        onClick={handleClickLabel}
        title="Drag to change value"
      >
        <span className={`text-[10px] font-mono select-none transition-colors ${isDragging ? 'text-accent-primary font-bold' : 'text-text-placeholder group-hover:text-text-secondary'}`}>
            {label}
        </span>
      </div>

      <input
        ref={inputRef}
        type="number"
        step={step}
        value={isEditing ? value : value.toFixed(2)}
        onChange={handleInputChange}
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        className="w-full bg-transparent text-right font-mono text-xs py-1.5 pr-2 pl-8 rounded-md focus:outline-none text-text-primary"
      />
    </div>
  );
};
