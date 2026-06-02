import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DraggableHandle } from './DraggableHandle';
import type { Point } from '../types';

const createContainerRef = () => ({ current: null as SVGSVGElement | null });

describe('DraggableHandle', () => {
  it('permite mover el punto con teclado', () => {
    const onDrag = vi.fn();

    render(
      <svg>
        <DraggableHandle
          point={{ x: 0.5, y: 0.5 }}
          onDrag={onDrag}
          viewBoxSize={100}
          containerRef={createContainerRef()}
          type="handle"
        />
      </svg>
    );

    const slider = screen.getByRole('slider', { name: /control handle/i });
    fireEvent.keyDown(slider, { key: 'ArrowUp' });

    expect(onDrag).toHaveBeenCalledWith({ x: 0.5, y: 0.51 });
  });

  it('dispara selección con Enter y respeta snap en teclado', () => {
    const onSelect = vi.fn();
    const onDrag = vi.fn();

    render(
      <svg>
        <DraggableHandle
          point={{ x: 0.45, y: 0.45 }}
          onDrag={onDrag}
          onSelect={onSelect}
          viewBoxSize={100}
          containerRef={createContainerRef()}
          snapToGrid
          type="handle"
        />
      </svg>
    );

    const slider = screen.getByRole('slider', { name: /control handle/i });
    fireEvent.keyDown(slider, { key: 'Enter' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onDrag).toHaveBeenCalledWith({ x: 0.5, y: 0.5 });
  });

  it('si está deshabilitado no responde al teclado', () => {
    const onDrag = vi.fn();

    render(
      <svg>
        <DraggableHandle
          point={{ x: 0.5, y: 0.5 }}
          onDrag={onDrag}
          viewBoxSize={100}
          containerRef={createContainerRef()}
          isDraggable={false}
          type="anchor"
        />
      </svg>
    );

    const slider = screen.getByRole('slider', { name: /anchor point/i });
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });

    expect(onDrag).not.toHaveBeenCalled();
  });

  it('muestra línea de conexión cuando el handle tiene connectedTo', () => {
    render(
      <svg>
        <DraggableHandle
          point={{ x: 0.4, y: 0.6 }}
          onDrag={vi.fn()}
          viewBoxSize={100}
          containerRef={createContainerRef()}
          type="handle"
          connectedTo={{ x: 0.2, y: 0.2 } satisfies Point}
        />
      </svg>
    );

    expect(document.querySelector('line')).not.toBeNull();
  });
});
