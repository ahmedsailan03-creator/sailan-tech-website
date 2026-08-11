"use client";

import { useState } from "react";

export default function HeroCommandCenter() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function move(event: React.MouseEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;

    setTilt({
      x: py * -11,
      y: px * 14,
    });
  }

  return (
    <div
      className="command-stage"
      onMouseMove={move}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="command-orbit command-orbit-a" />
      <div className="command-orbit command-orbit-b" />
      <div className="command-orbit command-orbit-c" />

      <div
        className="command-world"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div className="command-core">
          <div className="core-ring core-ring-a" />
          <div className="core-ring core-ring-b" />
          <div className="core-center">
            <strong>ST</strong>
            <span>TECH CORE</span>
          </div>
        </div>

        <div className="command-panel command-panel-monitor">
          <div className="panel-label">
            <span />
            WORKSTATION
          </div>
          <div className="mini-monitor">
            <div className="mini-monitor-screen">
              <div className="monitor-check">✓</div>
            </div>
            <div className="mini-monitor-stand" />
          </div>
          <strong>HEALTHY</strong>
        </div>

        <div className="command-panel command-panel-network">
          <div className="panel-label">
            <span />
            NETWORK
          </div>
          <div className="wifi-visual">
            <i />
            <i />
            <i />
            <b />
          </div>
          <strong>ONLINE</strong>
        </div>

        <div className="command-panel command-panel-cloud">
          <div className="panel-label">
            <span />
            MICROSOFT 365
          </div>
          <div className="cloud-visual">
            <div />
          </div>
          <strong>ACTIVE</strong>
        </div>

        <div className="command-panel command-panel-web">
          <div className="panel-label">
            <span />
            WEBSITE
          </div>
          <div className="web-mini">
            <div className="web-mini-nav" />
            <div className="web-mini-hero" />
            <div className="web-mini-cards">
              <i />
              <i />
              <i />
            </div>
          </div>
          <strong>MODERN</strong>
        </div>

        <div className="command-data-line data-line-a" />
        <div className="command-data-line data-line-b" />
        <div className="command-data-line data-line-c" />
        <div className="command-data-line data-line-d" />

        <div className="data-packet packet-a" />
        <div className="data-packet packet-b" />
        <div className="data-packet packet-c" />
        <div className="data-packet packet-d" />
      </div>

      <div className="command-floor">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
