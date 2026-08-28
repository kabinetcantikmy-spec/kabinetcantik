"use client";
import { useEffect } from "react";

/** Animasi reveal masa scroll untuk laman SaaS (.kcpro .reveal). */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".kcpro .reveal"));
    if (!els.length) return;

    // stagger ikut kedudukan dalam parent
    els.forEach((el) => {
      const sibs = Array.from(el.parentElement?.children || []).filter((c) =>
        c.classList.contains("reveal")
      );
      const idx = Math.max(0, sibs.indexOf(el));
      el.style.transitionDelay = `${idx * 70}ms`;
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
