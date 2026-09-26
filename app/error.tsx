"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="wrap section">
      <div className="empty-state">
        <h1>Something interrupted the page.</h1>
        <p>Please try again. Your saved bag is still on this device.</p>
        <button className="button blue" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
