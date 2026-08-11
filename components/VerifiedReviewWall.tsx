const reviewSlots = Array.from({ length: 12 }, (_, index) => index + 1);

export default function VerifiedReviewWall() {
  return (
    <section className="verified-review-shell">
      <div className="review-wall-grid" aria-hidden="true">
        {reviewSlots.map((slot) => (
          <div className="review-placeholder-card" key={slot}>
            <div className="review-placeholder-stars">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>
            <div className="review-placeholder-lines">
              <i />
              <i />
              <i />
            </div>
            <div className="review-placeholder-person">
              <b />
              <div>
                <i />
                <i />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="review-wall-overlay">
        <span className="review-verified-icon">✓</span>
        <p className="kicker">VERIFIED CLIENT FEEDBACK</p>
        <h3>Real reviews belong here.</h3>
        <p>
          This section is already designed for a large animated review wall.
          Add verified Google or client reviews as Sailan Tech earns them,
          without risking trust with made-up testimonials.
        </p>

        <div className="review-ready-tags">
          <span>Google reviews ready</span>
          <span>Client testimonials ready</span>
          <span>Animated review wall</span>
        </div>
      </div>
    </section>
  );
}
