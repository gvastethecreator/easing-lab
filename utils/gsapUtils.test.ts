import { describe, expect, it } from "vitest";
import { convertGsapEaseToPoints, generateGSAPPath } from "./gsapUtils";

describe("gsapUtils", () => {
  it("genera un path SVG para un easing válido", () => {
    const path = generateGSAPPath("power1.out", 100, 100, 4);

    expect(path.startsWith("M 0 100")).toBe(true);
    expect(path).toContain("L 100.00");
  });

  it("usa una diagonal de fallback para un easing inválido", () => {
    expect(generateGSAPPath("ease.que.no.existe", 120, 80, 4)).toBe("M 0 80 L 120 0");
  });

  it("convierte un easing en puntos con endpoints estables", () => {
    const points = convertGsapEaseToPoints("linear", 4);

    expect(points).toHaveLength(5);
    expect(points[0]).toMatchObject({ x: 0, y: 0 });
    expect(points.at(-1)).toMatchObject({ x: 1, y: 1 });
    expect(points[0]?.handle2).toBeDefined();
    expect(points.at(-1)?.handle1).toBeDefined();
  });

  it("usa puntos lineales de fallback para un easing inválido", () => {
    expect(convertGsapEaseToPoints("ease.que.no.existe")).toEqual([
      { x: 0, y: 0, handle2: { x: 0.25, y: 0 } },
      { x: 1, y: 1, handle1: { x: 0.75, y: 1 } },
    ]);
  });
});
