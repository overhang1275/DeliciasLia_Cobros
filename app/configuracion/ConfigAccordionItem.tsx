"use client";

import { motion } from "motion/react";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { ChevronRight } from "@/components/AppIcon";

export function ConfigAccordionItem({
  children,
  defaultOpen = false,
  description,
  isOpen: controlledOpen,
  onOpenChange,
  title,
  variant = "default"
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  title: string;
  variant?: "default" | "soft";
}) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? localOpen;
  const contentId = useId();
  const toggleOpen = () => {
    const nextOpen = !isOpen;
    setLocalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <section className={variant === "soft" ? "rounded-[1.75rem] bg-[var(--app-bg)]" : "rounded-[1.75rem] border bg-white shadow-sm"}>
      <h2>
        <button
          aria-controls={contentId}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-3 p-4 text-left"
          type="button"
          onClick={toggleOpen}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold text-[var(--brand)]">{title}</span>
            <span className="ui-label block">{description}</span>
          </span>
          <ChevronRight className={`size-5 shrink-0 text-[var(--primary)] transition ${isOpen ? "rotate-90" : ""}`} aria-hidden="true" />
        </button>
      </h2>
      <motion.div
        animate={isOpen ? "open" : "closed"}
        className="overflow-hidden"
        id={contentId}
        initial={false}
        variants={{
          closed: { height: 0, opacity: 0 },
          open: { height: "auto", opacity: 1 }
        }}
      >
        <div className="grid gap-4 border-t p-4">{children}</div>
      </motion.div>
    </section>
  );
}
