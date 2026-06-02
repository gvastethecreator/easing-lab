import { useCallback, useState } from 'react';
import type { RefObject } from 'react';
import type { Point } from '../types';

interface UseDraggableParams {
  containerRef: RefObject<SVGSVGElement | null>;
  onDrag: (point: Point) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

type DraggableMouseStartEvent = Pick<
  MouseEvent,
  'button' | 'clientX' | 'clientY' | 'preventDefault' | 'stopPropagation'
>;

interface TouchLike {
  clientX: number;
  clientY: number;
}

interface TouchListLike {
  item(index: number): TouchLike | null;
  length: number;
  [index: number]: TouchLike;
}

type DraggableTouchStartEvent = {
  touches: TouchListLike;
  preventDefault: () => void;
  stopPropagation: () => void;
};

type DraggableStartEvent = DraggableMouseStartEvent | DraggableTouchStartEvent;
type DraggableMoveEvent = Pick<MouseEvent, 'clientX' | 'clientY'> | { touches: TouchListLike };

/**
 * Type guard para distinguir eventos táctiles de eventos de mouse.
 */
const isTouchLikeEvent = (
  event: DraggableStartEvent | DraggableMoveEvent
): event is { touches: TouchListLike } => 'touches' in event;

/**
 * Hook reusable para arrastrar handles sobre un SVG y convertir coordenadas de pantalla
 * al espacio interno del SVG (user-space).
 */
export const useDraggable = ({
  containerRef,
  onDrag,
  onDragStart,
  onDragEnd,
  disabled = false,
}: UseDraggableParams) => {
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Convierte coordenadas de pantalla (`clientX/clientY`) a coordenadas del SVG.
   */
  const getSVGPoint = useCallback(
    (event: DraggableStartEvent | DraggableMoveEvent): Point | null => {
      const svg = containerRef.current;
      if (!svg) {
        return null;
      }

      const pt = svg.createSVGPoint();

      if (isTouchLikeEvent(event)) {
        const touch = event.touches.item(0);
        if (!touch) {
          return null;
        }

        pt.x = touch.clientX;
        pt.y = touch.clientY;
      } else {
        pt.x = event.clientX;
        pt.y = event.clientY;
      }

      try {
        const screenCTM = svg.getScreenCTM();
        if (!screenCTM) {
          return null;
        }

        const svgPoint = pt.matrixTransform(screenCTM.inverse());
        return { x: svgPoint.x, y: svgPoint.y };
      } catch (error) {
        console.warn('SVG Matrix Transform failed', error);
        return null;
      }
    },
    [containerRef]
  );

  const handleMouseDown = useCallback(
    (event: DraggableStartEvent) => {
      if (disabled) {
        return;
      }

      if ('button' in event && event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setIsDragging(true);
      onDragStart?.();

      const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
        const point = getSVGPoint(moveEvent);
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
    [disabled, getSVGPoint, onDrag, onDragEnd, onDragStart]
  );

  return {
    handleMouseDown,
    isDragging,
  };
};
