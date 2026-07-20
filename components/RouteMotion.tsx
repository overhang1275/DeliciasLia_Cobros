"use client";

import { MotionConfig, motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function RouteMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        key={pathname}
        initial={{ opacity: 0, y: 10, scale: 0.985 }}
        transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
