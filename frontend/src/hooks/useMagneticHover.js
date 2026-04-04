import { useCallback } from "react";
import { useMotionValue, useSpring } from "framer-motion";

const springConfig = {
  stiffness: 190,
  damping: 16,
  mass: 0.2
};

export const useMagneticHover = (strength = 16) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;

      x.set((offsetX / rect.width) * strength);
      y.set((offsetY / rect.height) * strength);
    },
    [strength, x, y]
  );

  const resetPosition = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    springX,
    springY,
    handleMouseMove,
    resetPosition
  };
};
