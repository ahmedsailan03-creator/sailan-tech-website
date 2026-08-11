"use client";

import Image from "next/image";
import { useState } from "react";

export default function Hero3D() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientY - box.top) / box.height - 0.5;
    const y = (event.clientX - box.left) / box.width - 0.5;
    setTilt({ x: x * -12, y: y * 16 });
  };

  return (
    <div
      className="hero-3d-stage"
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="orbit orbit-a" />
      <div className="orbit orbit-b" />
      <div className="orbit orbit-c" />

      <div
        className="hero-3d-object"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div className="logo-platform">
          <div className="platform-glow" />
          <Image
            src="/sailan-logo.png"
            alt="Sailan Tech Solutions logo"
            width={560}
            height={560}
            className="hero-logo-image"
            priority
          />
        </div>

        <div className="glass-chip chip-a">
          <span>IT SUPPORT</span>
          <strong>READY</strong>
          <i />
        </div>

        <div className="glass-chip chip-b">
          <span>MICROSOFT 365</span>
          <strong>ACTIVE</strong>
          <i />
        </div>

        <div className="glass-chip chip-c">
          <span>NETWORK</span>
          <strong>CONNECTED</strong>
          <i />
        </div>

        <div className="glass-chip chip-d">
          <span>SECURITY</span>
          <strong>MONITORED</strong>
          <i />
        </div>
      </div>

      <div className="hero-floor">
        <span />
      </div>
    </div>
  );
}
