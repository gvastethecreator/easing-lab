import React, { useMemo } from "react";
import { UniversalGraphCard } from "./UniversalGraphCard";
import { GSAPEasingCategory, type GSAPEasingFunction } from "../types";
import { generateGSAPPath } from "../utils/gsapUtils";

interface GSAPCardProps {
  easing: GSAPEasingFunction;
  onClick: () => void;
}

export const GSAPCard: React.FC<GSAPCardProps> = ({ easing, onClick }) => {
  const pathData = useMemo(() => generateGSAPPath(easing.ease, 224, 224), [easing.ease]);

  return (
    <UniversalGraphCard
      id={easing.id}
      title={easing.name}
      subtitle={easing.ease}
      description={easing.description}
      pathData={pathData}
      animationEase={easing.ease}
      copyValue={easing.ease}
      onSelect={onClick}
      isCustom={easing.category === GSAPEasingCategory.CUSTOM}
    />
  );
};
