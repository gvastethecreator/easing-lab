import React, { useState, useCallback } from 'react';
import type { Point } from '../types';

interface UseDraggableParams {
  containerRef: React.RefObject<SVGSVGElement | null>;
  onDrag: (point: Point) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

export const useDraggable = ({
  containerRef,
  onDrag,
  onDragStart,
  onDragEnd,
  disabled = false,
}: UseDraggableParams) => {
  const [isDragging, setIsDragging] = useState(false);

  // Converts screen coordinates (clientX, clientY) to SVG User Space coordinates
  const getSVGPoint = useCallback(
    (event: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent): Point | null => {
      const svg = containerRef.current;
      if (!svg) return null;

      // Create an SVGPoint for transformation
      let pt = svg.createSVGPoint();

      // Get client coordinates
      if ('touches' in event) {
        pt.x = event.touches[0].clientX;
        pt.y = event.touches[0].clientY;
      } else {
        pt.x = (event as MouseEvent).clientX;
        pt.y = (event as MouseEvent).clientY;
      }

      // Transform coordinate to SVG space using the inverse of the Screen CTM
      // This handles scaling, viewbox offsets, and CSS resizing automatically.
      try {
        const screenCTM = svg.getScreenCTM();
        if (!screenCTM) return null; // Should not happen in mounted SVG
        const svgP = pt.matrixTransform(screenCTM.inverse());
        return { x: svgP.x, y: svgP.y };
      } catch (e) {
        console.warn('SVG Matrix Transform failed', e);
        return null;
      }
    },
    [containerRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      // Allow touch or left click
      if ('button' in e && e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      onDragStart?.();

      const handleMouseMove = (event: MouseEvent | TouchEvent) => {
        // Prevent scrolling on touch devices while dragging handles
        if (event.type === 'touchmove') {
          // event.preventDefault(); // Sometimes needed, but can block page scroll too aggressively
        }

        const point = getSVGPoint(event);
        if (point) {
          onDrag(point);
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        onDragEnd?.();

        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    },
    [disabled, onDrag, onDragStart, onDragEnd, getSVGPoint]
  );

  return {
    handleMouseDown,
    isDragging,
  };
};
