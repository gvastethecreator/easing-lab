import { useEffect } from "react";
import { CustomEase } from "gsap/CustomEase";
import type { PathPoint } from "../types";

interface UseRegisterCustomEaseParams {
  customEaseId: string;
  points: PathPoint[];
}

export const useRegisterCustomEase = ({ customEaseId, points }: UseRegisterCustomEaseParams) => {
  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    const pathParts: string[] = [`M ${points[0].x},${points[0].y}`];

    for (let i = 0; i < points.length - 1; i += 1) {
      const start = points[i];
      const end = points[i + 1];

      if (start.handle2 && end.handle1) {
        pathParts.push(
          `C ${start.handle2.x},${start.handle2.y} ${end.handle1.x},${end.handle1.y} ${end.x},${end.y}`,
        );
      } else {
        pathParts.push(`L ${end.x},${end.y}`);
      }
    }

    CustomEase.create(customEaseId, pathParts.join(" "));
  }, [customEaseId, points]);
};
