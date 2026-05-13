import { useState, useEffect, useRef } from "react";

const CONFIG = {
  businessName: "Wizard Wash",
  businessType: "pressure washing and exterior cleaning",
  googleReviewLink:
    "https://www.google.com/search?sca_esv=a5b74293f51c31d7&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOahQjTJLDpqnqzO0lmYkDouDcm94nSc_crxz_2Iklwikx9b7d-SBjt5XYpjB2iX-N3wY9tDwFOKAzKaYSFPtzL0hsgy7&q=Wizard+Wash+Reviews&sa=X&ved=2ahUKEwjI78rNyraUAxX9MlkFHaebIxQQ0bkNegQIPxAH&biw=735&bih=802&dpr=2",
  logoUrl: "https://www.wizardwashva.com/images/Updated%20Logo%20.png",
  services: [
    "house washing",
    "roof cleaning",
    "driveway cleaning",
    "deck restoration",
    "gutter brightening",
    "soft washing",
    "concrete cleaning",
    "patio cleaning",
  ],
};

const RATINGS = [
  { emoji: "😍", label: "Amazing", value: 5 },
  { emoji: "😊", label: "Great", value: 4 },
  { emoji: "🙂", label: "Good", value: 3 },
];

function buildPrompt(rating, service, customerName) {
  const ratingDescriptions = {
    5: "extremely satisfied, enthusiastic, would highly recommend",
    4: "very satisfied, happy with the results, would recommend",
    3: "satisfied, decent experience, results were acceptable",
  };

  return `You are writing a Google review on behalf of a real customer. Generate a natural, authentic-sounding Google review for "${CONFIG.businessName}", a ${CONFIG.businessType} company.

Details:
- Customer rating: ${rating} out of 5 stars
- Customer sentiment: ${ratingDescriptions[rating]}
- Service received: ${service || "exterior cleaning"}
- Customer first name: ${customerName || "a homeowner"}

Requirements:
- Write in first person as the customer
- Keep it between 40-80 words
- Sound natural and human, not corporate or robotic
- Include the specific service they received
- Mention the business name "${CONFIG.businessName}" once naturally
- Include 1-2 SEO-relevant phrases naturally (like "power washing in Richmond VA", "exterior cleaning service", "soft wash", "house washing near me")
- Do NOT use exclamation marks more than once
- Do NOT use the word "definitely" or "highly recommend" together
- Vary sentence structure
- Make it feel like a real person wrote it on their phone

Respond with ONLY the review text. No quotes, no preamble, nothing else.`;
}

export default function ReviewGenerator() {
  const [step, setStep] = useState("rating");
  const [selectedRating, setSelectedRating] = useState(null);
  const [service, setService] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [generatedReview, setGeneratedReview] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [loadingDots, setLoadingDots] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = parseInt(params.get("rating"));
    const name = params.get("name");
    if (name) setCustomerName(decodeURIComponent(name));
    if ([3, 4, 5].includes(r)) {
      setSelectedRating(r);
      setStep("details");
    }
  }, []);

  useEffect(() => {
    if (step !== "generating") return;
    const interval = setInterval(() => {
      setLoadingDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [step]);

  async function generateReview() {
    setStep("generating");
    setError(null);

    try {
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: selectedRating,
          service,
          customerName,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      if (!data.review) throw new Error("No review generated");
      setGeneratedReview(data.review);
      setStep("result");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setStep("details");
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generatedReview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = generatedReview;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleRegenerate() {
    setStep("details");
    setGeneratedReview("");
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <img
            src={CONFIG.logoUrl}
            alt="Wizard Wash"
            style={styles.logo}
          />
          <p style={styles.subtitle}>
            {step === "rating" && "How was your experience?"}
            {step === "details" && "Almost there"}
            {step === "generating" && `Writing your review${loadingDots}`}
            {step === "result" && "Your review is ready"}
          </p>
        </div>

        {/* STEP 1: Rating */}
        {step === "rating" && (
          <div style={styles.section}>
            <p style={styles.instructions}>
              Tap the face that best describes your experience
            </p>
            <div style={styles.ratingRow}>
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => {
                    setSelectedRating(r.value);
                    setStep("details");
                  }}
                  style={styles.ratingBtn}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.background = "rgba(106,13,173,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "rgba(106,13,173,0.06)";
                  }}
                >
                  <span style={styles.emoji}>{r.emoji}</span>
                  <span style={styles.ratingLabel}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Details */}
        {step === "details" && (
          <div style={styles.section}>
            <div style={styles.selectedRating}>
              <span style={{ fontSize: "28px" }}>
                {RATINGS.find((r) => r.value === selectedRating)?.emoji}
              </span>
              <span style={styles.selectedLabel}>
                {RATINGS.find((r) => r.value === selectedRating)?.label}
              </span>
              <button onClick={() => setStep("rating")} style={styles.changeBtn}>
                change
              </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Your first name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Optional"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>What service did we do for you?</label>
              <div style={styles.chipGrid}>
                {CONFIG.services.map((s) => (
                  <button
                    key={s}
                    onClick={() => setService(s)}
                    style={{
                      ...styles.chip,
                      ...(service === s ? styles.chipActive : {}),
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generateReview} style={styles.primaryBtn}>
              Generate My Review
            </button>
          </div>
        )}

        {/* STEP 3: Loading */}
        {step === "generating" && (
          <div style={styles.section}>
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>
                Crafting a review based on your experience
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Result */}
        {step === "result" && (
          <div style={styles.section}>
            <div style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  style={{ ...styles.star, opacity: i < selectedRating ? 1 : 0.2 }}
                >
                  ★
                </span>
              ))}
            </div>

            <div style={styles.reviewBox}>
              <p style={styles.reviewText}>{generatedReview}</p>
            </div>

            <div style={styles.actionRow}>
              <button onClick={handleCopy} style={styles.copyBtn}>
                {copied ? "✓ Copied" : "Copy Review"}
              </button>
              <button onClick={handleRegenerate} style={styles.regenBtn}>
                Regenerate
              </button>
            </div>

            <a
              href={CONFIG.googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.googleBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: "8px", flexShrink: 0 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Paste on Google Reviews
            </a>

            <p style={styles.disclaimer}>
              Feel free to edit the review before posting. Make it yours.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "24px 16px",
    background: "linear-gradient(145deg, #1a0a2e 0%, #2d1654 40%, #1a0a2e 100%)",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(106,13,173,0.2)",
    borderRadius: "20px",
    padding: "32px 24px",
    backdropFilter: "blur(20px)",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  logo: {
    width: "140px",
    height: "auto",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#c4b5d0",
    margin: 0,
    fontWeight: "400",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  instructions: {
    fontSize: "14px",
    color: "#8b7a9e",
    textAlign: "center",
    margin: 0,
  },
  ratingRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  ratingBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "16px 20px",
    borderRadius: "14px",
    border: "1px solid rgba(106,13,173,0.2)",
    background: "rgba(106,13,173,0.06)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  emoji: {
    fontSize: "36px",
    lineHeight: 1,
  },
  ratingLabel: {
    fontSize: "12px",
    color: "#c4b5d0",
    fontWeight: "500",
    fontFamily: "'DM Sans', sans-serif",
  },
  selectedRating: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "center",
    padding: "10px 16px",
    background: "rgba(106,13,173,0.12)",
    borderRadius: "10px",
    border: "1px solid rgba(106,13,173,0.25)",
  },
  selectedLabel: {
    color: "#d8b4fe",
    fontSize: "15px",
    fontWeight: "500",
  },
  changeBtn: {
    background: "none",
    border: "none",
    color: "#8b7a9e",
    fontSize: "12px",
    cursor: "pointer",
    textDecoration: "underline",
    fontFamily: "'DM Sans', sans-serif",
    padding: 0,
  },
  error: {
    padding: "10px 14px",
    borderRadius: "8px",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#fca5a5",
    fontSize: "13px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    color: "#c4b5d0",
    fontWeight: "500",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(106,13,173,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#f1f5f9",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  },
  chipGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  chip: {
    padding: "7px 14px",
    borderRadius: "20px",
    border: "1px solid rgba(106,13,173,0.2)",
    background: "rgba(106,13,173,0.06)",
    color: "#c4b5d0",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s ease",
  },
  chipActive: {
    background: "rgba(0,230,138,0.15)",
    borderColor: "rgba(0,230,138,0.35)",
    color: "#00e68a",
  },
  primaryBtn: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6a0dad, #00e68a)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "4px",
    transition: "opacity 0.15s",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "32px 0",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#00e68a",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#8b7a9e",
    fontSize: "14px",
    margin: 0,
  },
  starsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "4px",
  },
  star: {
    fontSize: "24px",
    color: "#facc15",
  },
  reviewBox: {
    padding: "16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(106,13,173,0.2)",
  },
  reviewText: {
    color: "#e2e8f0",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: 0,
  },
  actionRow: {
    display: "flex",
    gap: "10px",
  },
  copyBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(0,230,138,0.3)",
    background: "rgba(0,230,138,0.1)",
    color: "#00e68a",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  regenBtn: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "1px solid rgba(106,13,173,0.2)",
    background: "rgba(106,13,173,0.06)",
    color: "#c4b5d0",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#fff",
    color: "#1f2937",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "'DM Sans', sans-serif",
  },
  disclaimer: {
    fontSize: "12px",
    color: "#6b5b7b",
    textAlign: "center",
    margin: 0,
  },
};
