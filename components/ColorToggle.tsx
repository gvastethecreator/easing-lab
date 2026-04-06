import React, { useRef } from "react";
import { gsap } from "gsap";

interface ColorToggleProps {
  onToggle: () => void;
  nextColor: string;
}

export const ColorToggle: React.FC<ColorToggleProps> = ({ onToggle, nextColor }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    onToggle();
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { scale: 1 },
        { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" },
      );
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="w-4 h-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-accent-primary focus:ring-offset-2 dark:focus:ring-offset-surface-base hover:opacity-90"
      style={{ backgroundColor: nextColor }}
      aria-label="Change accent color"
    >
      {/* The button's fill color now shows the next accent color */}
    </button>
  );
};
