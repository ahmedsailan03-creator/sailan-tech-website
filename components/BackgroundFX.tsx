"use client";

import { useEffect } from "react";

export default function BackgroundFX() {
  useEffect(() => {
    const root = document.documentElement;

    const update = () => {
      root.style.setProperty("--scroll-y", `${window.scrollY}px`);
    };

    const move = (event: MouseEvent) => {
      root.style.setProperty("--mouse-x", `${event.clientX}px`);
      root.style.setProperty("--mouse-y", `${event.clientY}px`);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("mousemove", move, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("mousemove", move);
    };
  }, []);

  return (
    <div className="global-fx" aria-hidden="true">
      <div className="cursor-glow" />
      <div className="fx-orb fx-orb-a" />
      <div className="fx-orb fx-orb-b" />
      <div className="fx-grid" />
    </div>
  );
}
