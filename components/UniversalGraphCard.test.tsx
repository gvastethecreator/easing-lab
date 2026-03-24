import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UniversalGraphCard } from './UniversalGraphCard';

const writeTextMock = vi.fn().mockResolvedValue(undefined);

vi.mock('gsap', () => ({
    gsap: {
        set: vi.fn(),
        to: vi.fn(),
        killTweensOf: vi.fn(),
        context: vi.fn((callback: () => void) => {
            callback();
            return { revert: vi.fn() };
        }),
    },
}));

describe('UniversalGraphCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: writeTextMock,
            },
        });

        writeTextMock.mockClear();
    });

    it('mantiene un snapshot estable de la tarjeta base', () => {
        const { asFragment } = render(
            <UniversalGraphCard
                id="ease-in-out"
                title="Ease In Out"
                subtitle="cubic-bezier(0.42, 0, 0.58, 1)"
                description="Curva equilibrada para entradas y salidas."
                pathData="M 0 224 C 94 224, 130 0, 224 0"
                animationEase="power1.out"
                onSelect={vi.fn()}
                copyValue="cubic-bezier(0.42, 0, 0.58, 1)"
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it('copia el easing y muestra feedback visual temporal', () => {
        const { container } = render(
            <UniversalGraphCard
                id="ease-in-out"
                title="Ease In Out"
                subtitle="cubic-bezier(0.42, 0, 0.58, 1)"
                description="Curva equilibrada para entradas y salidas."
                pathData="M 0 224 C 94 224, 130 0, 224 0"
                animationEase="power1.out"
                onSelect={vi.fn()}
                copyValue="cubic-bezier(0.42, 0, 0.58, 1)"
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /copy easing value/i }));

        expect(writeTextMock).toHaveBeenCalledWith('cubic-bezier(0.42, 0, 0.58, 1)');
        expect(screen.getByText(/copied!/i)).toBeInTheDocument();

        const overlay = container.querySelector('.absolute.inset-0.z-30');
        expect(overlay).toHaveClass('opacity-100');

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(overlay).toHaveClass('opacity-0');
    });
});
