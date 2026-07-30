import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnimationPreview } from "./AnimationPreview";

vi.mock("gsap", () => ({
  gsap: {
    parseEase: vi.fn(() => (progress: number) => progress),
  },
}));

describe("AnimationPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mantiene un snapshot estable en su render inicial", () => {
    const { asFragment } = render(
      <AnimationPreview
        ease="power1.out"
        duration={1.5}
        range={1}
        progressRef={{ current: { progress: 0.25 } }}
        engine="gsap"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("cambia de modo de preview y oculta el control de trails fuera de Move", () => {
    render(
      <AnimationPreview
        ease="power1.out"
        duration={1.5}
        range={1}
        progressRef={{ current: { progress: 0.5 } }}
        engine="gsap"
      />,
    );

    expect(screen.getByRole("button", { name: /trails/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /rotate/i }));

    expect(screen.queryByRole("button", { name: /trails/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rotate/i })).toHaveClass("bg-accent-primary");
  });
});
