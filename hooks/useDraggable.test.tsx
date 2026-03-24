import { act, renderHook } from '@testing-library/react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDraggable } from './useDraggable';

describe('useDraggable', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('convierte mousemove en coordenadas SVG durante un drag', () => {
        const listeners = new Map<string, EventListener>();
        const point = {
            x: 0,
            y: 0,
            matrixTransform() {
                return { x: this.x, y: this.y };
            },
        };

        vi.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
            listeners.set(type, listener as EventListener);
        });
        vi.spyOn(window, 'removeEventListener').mockImplementation((type) => {
            listeners.delete(type);
        });

        const onDrag = vi.fn();
        const onDragStart = vi.fn();
        const onDragEnd = vi.fn();

        const containerRef = {
            current: {
                createSVGPoint: () => point,
                getScreenCTM: () => ({ inverse: () => ({}) }),
            } as unknown as SVGSVGElement,
        };

        const { result } = renderHook(() =>
            useDraggable({
                containerRef,
                onDrag,
                onDragStart,
                onDragEnd,
            })
        );

        act(() => {
            result.current.handleMouseDown({
                button: 0,
                clientX: 10,
                clientY: 20,
                preventDefault: vi.fn(),
                stopPropagation: vi.fn(),
            } as unknown as ReactMouseEvent);
        });

        act(() => {
            listeners.get('mousemove')?.({ clientX: 125, clientY: 75 } as unknown as MouseEvent);
        });

        act(() => {
            listeners.get('mouseup')?.({} as unknown as MouseEvent);
        });

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDrag).toHaveBeenLastCalledWith({ x: 125, y: 75 });
        expect(onDragEnd).toHaveBeenCalledTimes(1);
    });
});
