"use client";

const items = [
  {
    type: "device",
    number: "01",
    eyebrow: "DEVICE REPAIR",
    title: "Broken technology → working again",
    description:
      "Hardware and software problems become a clean, working setup your team can depend on.",
  },
  {
    type: "website",
    number: "02",
    eyebrow: "WEB DEVELOPMENT",
    title: "Outdated website → modern business presence",
    description:
      "Old layouts, weak branding, and confusing pages transform into a cleaner, faster, more professional experience.",
  },
  {
    type: "network",
    number: "03",
    eyebrow: "NETWORK SUPPORT",
    title: "Disconnected office → connected team",
    description:
      "Network and Wi-Fi issues move from red alerts and dropped connections to a stable working environment.",
  },
  {
    type: "onboarding",
    number: "04",
    eyebrow: "EMPLOYEE SETUP",
    title: "Messy onboarding → ready-to-work employee",
    description:
      "Accounts, email, devices, and permissions come together into one organized onboarding process.",
  },
];

function DeviceAnimation() {
  return (
    <div className="repair-animation animation-frame">
      <div className="repair-grid" />
      <div className="device-shell">
        <div className="device-screen">
          <div className="screen-crack crack-one" />
          <div className="screen-crack crack-two" />
          <div className="screen-noise">
            <span />
            <span />
            <span />
          </div>

          <div className="repair-scan-line" />

          <div className="fixed-screen">
            <div className="fixed-logo">ST</div>
            <div className="fixed-status">
              <i />
              SYSTEM RESTORED
            </div>
          </div>
        </div>

        <div className="device-base">
          <span />
        </div>
      </div>

      <div className="repair-badge repair-badge-before">
        <i />
        ERROR DETECTED
      </div>

      <div className="repair-badge repair-badge-after">
        <i />
        WORKING
      </div>

      <div className="repair-progress">
        <span />
      </div>
    </div>
  );
}

function WebsiteAnimation() {
  return (
    <div className="website-animation animation-frame">
      <div className="browser-shell browser-old">
        <div className="browser-topbar">
          <span />
          <span />
          <span />
          <div />
        </div>

        <div className="old-site">
          <div className="old-banner">WELCOME TO OUR WEBSITE!!!</div>
          <div className="old-columns">
            <div />
            <div />
            <div />
          </div>
          <div className="old-copy">
            <span />
            <span />
            <span />
            <span />
          </div>
          <button>CLICK HERE</button>
        </div>
      </div>

      <div className="website-transform-beam" />

      <div className="browser-shell browser-new">
        <div className="browser-topbar">
          <span />
          <span />
          <span />
          <div />
        </div>

        <div className="new-site">
          <div className="new-nav">
            <b>ST</b>
            <div>
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="new-hero">
            <small>MODERN BUSINESS TECHNOLOGY</small>
            <strong>Built to look<br />more professional.</strong>
            <p />
            <button>Get Started</button>
          </div>

          <div className="new-cards">
            <div />
            <div />
            <div />
          </div>
        </div>
      </div>

      <div className="web-status old-web-status">OUTDATED</div>
      <div className="web-status new-web-status">MODERNIZED</div>
    </div>
  );
}

function NetworkAnimation() {
  return (
    <div className="network-animation animation-frame">
      <div className="network-map">
        <div className="network-node node-router">
          <span className="router-light" />
          <b>ROUTER</b>
        </div>

        <div className="network-path path-one" />
        <div className="network-path path-two" />
        <div className="network-path path-three" />

        <div className="network-node node-laptop">
          <span>▱</span>
          <b>LAPTOP</b>
        </div>

        <div className="network-node node-phone">
          <span>▯</span>
          <b>MOBILE</b>
        </div>

        <div className="network-node node-cloud">
          <span>☁</span>
          <b>CLOUD</b>
        </div>

        <div className="network-packet packet-one" />
        <div className="network-packet packet-two" />
        <div className="network-packet packet-three" />
      </div>

      <div className="signal-bars">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="network-down">
        <i />
        CONNECTION LOST
      </div>

      <div className="network-up">
        <i />
        NETWORK ONLINE
      </div>
    </div>
  );
}

function OnboardingAnimation() {
  return (
    <div className="onboarding-animation animation-frame">
      <div className="employee-card">
        <div className="employee-avatar">
          <span />
        </div>
        <div className="employee-lines">
          <strong>NEW EMPLOYEE</strong>
          <span />
          <span />
        </div>
      </div>

      <div className="setup-step setup-email">
        <div className="setup-icon">@</div>
        <div>
          <span>BUSINESS EMAIL</span>
          <b>Creating...</b>
        </div>
        <i />
      </div>

      <div className="setup-step setup-device">
        <div className="setup-icon">▱</div>
        <div>
          <span>DEVICE</span>
          <b>Configuring...</b>
        </div>
        <i />
      </div>

      <div className="setup-step setup-access">
        <div className="setup-icon">⌁</div>
        <div>
          <span>ACCESS</span>
          <b>Assigning...</b>
        </div>
        <i />
      </div>

      <div className="onboarding-line line-email" />
      <div className="onboarding-line line-device" />
      <div className="onboarding-line line-access" />

      <div className="employee-ready">
        <span>✓</span>
        READY TO WORK
      </div>
    </div>
  );
}

function Visual({ type }: { type: string }) {
  if (type === "device") return <DeviceAnimation />;
  if (type === "website") return <WebsiteAnimation />;
  if (type === "network") return <NetworkAnimation />;
  return <OnboardingAnimation />;
}

export default function TransformationShowcase() {
  return (
    <section className="section transformation-section">
      <div className="container">
        <div className="transformation-header">
          <div>
            <p className="kicker">SEE THE DIFFERENCE</p>
            <h2>
              We turn technology problems
              <em> into working solutions.</em>
            </h2>
          </div>

          <p>
            Instead of only telling businesses what we do, the site now shows
            it. Each animation represents the kind of before-and-after result
            Sailan Tech is built to deliver.
          </p>
        </div>

        <div className="transformation-stack">
          {items.map((item, index) => (
            <article
              className={`transformation-row ${index % 2 ? "reverse" : ""}`}
              key={item.title}
            >
              <div className="transformation-copy">
                <span className="transformation-number">{item.number}</span>
                <p className="transformation-eyebrow">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="before-after-labels">
                  <span>BEFORE</span>
                  <i />
                  <span>AFTER</span>
                </div>
              </div>

              <div className="transformation-visual">
                <Visual type={item.type} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
