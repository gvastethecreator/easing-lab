import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EasingPresetBrowser } from './EasingPresetBrowser';

vi.mock('./UniversalGraphCard', () => ({
  UniversalGraphCard: ({ title, onSelect }: { title: string; onSelect: () => void }) => (
    <button type="button" aria-label={`Select ${title}`} onClick={onSelect}>
      {title}
    </button>
  ),
}));

describe('EasingPresetBrowser', () => {
  it('muestra las cards de curvas y permite cargar un preset', () => {
    const onSelect = vi.fn();

    render(
      <EasingPresetBrowser p1={{ x: 0.25, y: 0.1 }} p2={{ x: 0.25, y: 1 }} onSelect={onSelect} />
    );

    expect(screen.getByRole('button', { name: 'Select Custom Easing' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select In Out Cubic' }));

    expect(onSelect).toHaveBeenCalledWith([0.645, 0.045, 0.355, 1]);
  });
});
