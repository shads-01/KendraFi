"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Strict reduced motion check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!prefersReducedMotion.matches) {
      // Luxurious, calm, fluid inertial scroller (calibrated 1:1 wheel speed)
      const lenis = new Lenis({
        lerp: 0.065,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.0,
        infinite: false,
        autoResize: true,
      });

      lenisRef.current = lenis;
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

      let rafId = 0;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      const onMotionChange = (e: MediaQueryListEvent) => {
        if (e.matches && lenisRef.current) {
          cancelAnimationFrame(rafId);
          lenisRef.current.destroy();
          lenisRef.current = null;
        }
      };
      prefersReducedMotion.addEventListener("change", onMotionChange);
    }

    // -------------------------------------------------------------
    // Viewport Card Entrance & Stagger Motion Engine
    // -------------------------------------------------------------
    const cardSelector =
      ".kf-scenario-card, .kf-roster-card, .kf-kpi-card, .kf-stage-card, .kf-card, .kf-ledger-ticket, .kf-proof-strip";

    const assignStaggers = () => {
      // Pre-assign sequential stagger indices (0, 1, 2, ...) to sibling card grids
      const groupContainers = [
        ".kf-scenario-cards",
        ".kf-roster-grid",
        ".kf-kpi-grid",
        ".kf-command-grid",
        ".kf-backtest-split",
        ".kf-hero-inline-metrics",
      ];
      groupContainers.forEach((sel) => {
        document.querySelectorAll(sel).forEach((container) => {
          const cards = Array.from(container.children);
          cards.forEach((child, idx) => {
            if (child instanceof HTMLElement && !child.style.getPropertyValue("--card-stagger")) {
              child.style.setProperty("--card-stagger", String(idx));
            }
          });
        });
      });

      // Individual cards without sibling grid default to stagger 0
      document.querySelectorAll(cardSelector).forEach((card) => {
        const el = card as HTMLElement;
        if (!el.style.getPropertyValue("--card-stagger")) {
          el.style.setProperty("--card-stagger", "0");
        }
      });
    };

    const revealCard = (el: HTMLElement) => {
      if (el.classList.contains("is-revealed")) return;
      el.classList.add("is-revealed");

      // Once entrance transition completes (850ms + stagger * 120ms), settle the card
      // so interactive hover and unhover respond smoothly with 0ms delay!
      const stagger = Number(el.style.getPropertyValue("--card-stagger")) || 0;
      const totalEntranceMs = 850 + stagger * 120;

      window.setTimeout(() => {
        el.classList.add("is-settled");
      }, totalEntranceMs + 40);
    };

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            revealCard(el);
            // Animate only once when it first appears; never replay on scroll away and back
            cardObserver.unobserve(el);
          }
        });
      },
      {
        threshold: 0.08, // Requires at least 8% visible inside viewport before triggering
        rootMargin: "0px 0px -40px 0px", // Waits until card is 40px inside visible viewport so user actually witnesses the rise!
      }
    );

    const observeCards = () => {
      assignStaggers();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll(cardSelector).forEach((card) => {
        const el = card as HTMLElement;
        if (!el.classList.contains("is-revealed")) {
          const rect = el.getBoundingClientRect();
          // If the card is already substantially inside the viewport on initial mount:
          if (rect.top < vh - 60 && rect.bottom > 40) {
            // Already visible in viewport on mount: reveal with smooth stagger
            requestAnimationFrame(() => {
              revealCard(el);
            });
          } else {
            // Below viewport: observe for scroll entrance
            cardObserver.observe(el);
          }
        }
      });
    };

    // Run initial scan
    observeCards();

    // Re-observe cards when DOM mutations occur (e.g. view switching or scenario changes)
    const mutationObserver = new MutationObserver(() => {
      observeCards();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      cardObserver.disconnect();
      mutationObserver.disconnect();
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return null;
}
