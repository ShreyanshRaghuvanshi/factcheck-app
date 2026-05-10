import { useState, useCallback, useRef } from "react";

const COLORS = {
  bg: "#0A0E1A",
  surface: "#111827",
  card: "#1A2235",
  border: "#1E2D45",
  accent: "#3B82F6",
  teal: "#0D9488",
  amber: "#F59E0B",
  red: "#EF4444",
  green: "#10B981",
  white: "#F8FAFC",
  muted: "#64748B",
  text: "#CBD5E1",
};

const STATUS_CONFIG = {
  VERIFIED: { color: COLORS.green, bg: "#052e16", label: "✓ VERIFIED", icon: "✓" },
  INACCURATE: { color: COLORS.amber, bg: "#451a03", label: "⚠ INACCURATE", icon: "⚠" },
  FALSE: { color: COLORS.red, bg: "#3f0f0f", label: "✗ FALSE / UNVERIFIABLE", icon: "✗" },
};

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0A0E1A;
    color: #CBD5E1;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .app {
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }

  /* Header */
  .header { text-align: center; margin-bottom: 2.5rem; }
  .header-tag {
    display: inline-block;
    font-family: 'Space Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: #3B82F6;
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.25);
    padding: 0.25rem 0.75rem;
    border-radius: 2px;
    margin-bottom: 1rem;
  }
  .header h1 {
    font-family: 'Space Mono', monospace;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    font-weight: 700;
    color: #F8FAFC;
    line-height: 1.15;
    margin-bottom: 0.6rem;
  }
  .header h1 span { color: #3B82F6; }
  .header p { font-size: 0.95rem; color: #64748B; max-width: 500px; margin: 0 auto; line-height: 1.6; }

  /* Upload zone */
  .upload-zone {
    border: 2px dashed #1E2D45;
    border-radius: 8px;
    background: #111827;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
  }
  .upload-zone:hover, .upload-zone.drag-over {
    border-color: #3B82F6;
    background: rgba(59,130,246,0.04);
  }
  .upload-zone input {
    position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }
  .upload-icon {
    font-size: 2.5rem; margin-bottom: 0.8rem; display: block;
  }
  .upload-zone h3 { color: #F8FAFC; font-size: 1rem; margin-bottom: 0.4rem; }
  .upload-zone p { font-size: 0.85rem; color: #64748B; }

  /* File chosen */
  .file-chosen {
    display: flex; align-items: center; gap: 0.75rem;
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #10B981;
  }

  /* Button */
  .btn {
    display: block; width: 100%;
    margin-top: 1.25rem;
    padding: 0.85rem 1.5rem;
    background: #3B82F6;
    color: white;
    border: none; border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem; font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    letter-spacing: 0.02em;
  }
  .btn:hover:not(:disabled) { background: #2563EB; }
  .btn:active:not(:disabled) { transform: scale(0.99); }
  .btn:disabled { background: #1E2D45; color: #475569; cursor: not-allowed; }

  /* Status bar */
  .status-bar {
    display: flex; align-items: center; gap: 0.75rem;
    background: #111827;
    border: 1px solid #1E2D45;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1.5rem;
    font-family: 'Space Mono', monospace;
    font-size: 0.8rem;
    color: #64748B;
  }
  .spinner {
    width: 18px; height: 18px;
    border: 2px solid #1E2D45;
    border-top-color: #3B82F6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Progress steps */
  .steps {
    display: flex; gap: 0;
    margin: 1.25rem 0;
    background: #111827;
    border: 1px solid #1E2D45;
    border-radius: 6px;
    overflow: hidden;
  }
  .step {
    flex: 1; padding: 0.6rem 0.5rem;
    text-align: center;
    font-size: 0.72rem;
    font-family: 'Space Mono', monospace;
    color: #475569;
    border-right: 1px solid #1E2D45;
    transition: background 0.3s, color 0.3s;
  }
  .step:last-child { border-right: none; }
  .step.active { background: rgba(59,130,246,0.12); color: #3B82F6; }
  .step.done { background: rgba(16,185,129,0.08); color: #10B981; }

  /* Results header */
  .results-header {
    display: flex; align-items: center; justify-content: space-between;
    margin: 2rem 0 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #1E2D45;
  }
  .results-header h2 {
    font-family: 'Space Mono', monospace;
    font-size: 0.85rem;
    color: #F8FAFC;
    letter-spacing: 0.1em;
  }
  .badge-row { display: flex; gap: 0.5rem; }
  .badge {
    font-size: 0.7rem; font-family: 'Space Mono', monospace;
    padding: 0.2rem 0.5rem; border-radius: 3px; font-weight: 700;
  }

  /* Claim card */
  .claim-card {
    background: #1A2235;
    border: 1px solid #1E2D45;
    border-radius: 8px;
    margin-bottom: 1rem;
    overflow: hidden;
    animation: fadeUp 0.3s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .claim-header {
    display: flex; align-items: flex-start; gap: 0.75rem;
    padding: 1rem 1rem 0.75rem;
  }
  .claim-status-pill {
    flex-shrink: 0;
    font-family: 'Space Mono', monospace;
    font-size: 0.65rem; font-weight: 700;
    padding: 0.25rem 0.6rem; border-radius: 3px;
    letter-spacing: 0.05em; margin-top: 2px;
  }
  .claim-text {
    font-size: 0.9rem; color: #F8FAFC; line-height: 1.5; flex: 1;
  }

  .claim-body { padding: 0 1rem 1rem; }

  .verdict-box {
    border-radius: 5px; padding: 0.75rem 0.9rem;
    margin-top: 0.5rem;
  }
  .verdict-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.68rem; letter-spacing: 0.12em;
    margin-bottom: 0.35rem; font-weight: 700;
  }
  .verdict-text { font-size: 0.875rem; line-height: 1.55; color: #CBD5E1; }

  .correction-box {
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 5px; padding: 0.75rem 0.9rem;
    margin-top: 0.5rem;
  }
  .correction-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.65rem; color: #3B82F6;
    letter-spacing: 0.12em; margin-bottom: 0.3rem;
  }
  .correction-text { font-size: 0.875rem; color: #93C5FD; line-height: 1.5; }

  /* Summary bar */
  .summary {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem; margin: 1.5rem 0;
  }
  .summary-card {
    background: #111827;
    border: 1px solid #1E2D45;
    border-radius: 6px;
    padding: 1rem;
    text-align: center;
  }
  .summary-num {
    font-family: 'Space Mono', monospace;
    font-size: 2rem; font-weight: 700; display: block;
    margin-bottom: 0.25rem;
  }
  .summary-label { font-size: 0.78rem; color: #64748B; }

  /* Error */
  .error-box {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 6px; padding: 1rem;
    font-size: 0.875rem; color: #FCA5A5;
    margin-top: 1rem;
  }

  /* Key instructions note */
  .api-note {
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.25);
    border-radius: 6px; padding: 0.75rem 1rem;
    font-size: 0.8rem; color: #FCD34D;
    margin-bottom: 1.5rem;
    font-family: 'Space Mono', monospace;
    line-height: 1.5;
  }
`;

// ── PDF text extraction via FileReader ───────────────────────────────────────
async function extractTextFromPDF(file) {
  // Use PDF.js from CDN for text extraction
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        if (!pdfjsLib) {
          // fallback: read as plain text if PDF.js not loaded
          resolve(`[PDF: ${file.name}] Could not extract text - using filename only.`);
          return;
        }
        const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
        let text = "";
        for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((s) => s.str).join(" ") + "\n";
        }
        resolve(text.trim() || "Could not extract text from PDF.");
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ── Anthropic API call ────────────────────────────────────────────────────────
async function factCheckWithClaude(pdfText, apiKey) {
  const systemPrompt = `You are a rigorous fact-checking agent. A user has uploaded a PDF document. Your job is to:
1. Extract every specific, verifiable claim from the text (statistics, dates, financial figures, technical assertions, named facts).
2. For each claim, assess its accuracy based on your knowledge up to early 2025.
3. Return ONLY a valid JSON array — no markdown, no extra text, no code blocks.

Each item in the array must have:
{
  "claim": "the exact claim text from the document",
  "status": "VERIFIED" | "INACCURATE" | "FALSE",
  "reasoning": "1-2 sentences explaining why",
  "correction": "the accurate fact if status is INACCURATE or FALSE, otherwise null"
}

Rules:
- VERIFIED: claim matches known facts or reasonable interpretation
- INACCURATE: claim contains outdated or slightly wrong data  
- FALSE: claim is clearly wrong or there is no credible evidence
- Extract 5-12 claims. Prioritize numbers, dates, and named facts over opinions.
- If the document is very short or has no verifiable claims, still return at least 3 entries noting what is or isn't verifiable.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Please fact-check the following document text:\n\n${pdfText.slice(0, 8000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text || "[]";

  // Strip any accidental markdown fences
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function FactCheckApp() {
  const [file, setFile] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState(0); // 0=idle, 1=extracting, 2=analyzing, 3=done, -1=error
  const [stepLabel, setStepLabel] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const STEPS = ["UPLOAD", "EXTRACT", "ANALYZE", "REPORT"];

  const handleFile = useCallback((f) => {
    if (f && f.type === "application/pdf") setFile(f);
    else if (f) setError("Please upload a PDF file.");
  }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const runCheck = async () => {
    if (!file) return;
    if (!apiKey.trim()) { setError("Please enter your Anthropic API key."); return; }
    setError(""); setResults([]); setStep(1);

    try {
      // Step 1: Load PDF.js dynamically
      setStepLabel("Loading PDF parser...");
      await new Promise((res) => {
        if (window["pdfjs-dist/build/pdf"]) { res(); return; }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          window["pdfjs-dist/build/pdf"].GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          res();
        };
        document.head.appendChild(script);
      });

      // Step 2: Extract text
      setStepLabel("Extracting text from PDF...");
      const text = await extractTextFromPDF(file);

      // Step 3: Call Claude
      setStep(2);
      setStepLabel("Analyzing claims with Claude...");
      const claims = await factCheckWithClaude(text, apiKey.trim());

      setResults(claims);
      setStep(3);
      setStepLabel("Analysis complete.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStep(-1);
    }
  };

  const counts = {
    VERIFIED: results.filter((r) => r.status === "VERIFIED").length,
    INACCURATE: results.filter((r) => r.status === "INACCURATE").length,
    FALSE: results.filter((r) => r.status === "FALSE").length,
  };

  return (
    <>
      <style>{styles}</style>

      {/* Load PDF.js */}
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        async
      />

      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-tag">TRUTH LAYER · FACT-CHECK AGENT</div>
          <h1>
            AI <span>Fact-Check</span>
          </h1>
          <p>
            Upload a PDF. We extract every verifiable claim, cross-reference it
            against Claude's knowledge base, and flag inaccuracies.
          </p>
        </div>

        {/* API Key */}
        <div className="api-note">
          ⚡ ANTHROPIC API KEY REQUIRED — Your key is never stored. Used only for
          this session.
        </div>
        <input
          type="password"
          placeholder="sk-ant-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            width: "100%", padding: "0.75rem 1rem",
            background: "#111827", border: "1px solid #1E2D45",
            borderRadius: "6px", color: "#F8FAFC",
            fontFamily: "'Space Mono', monospace", fontSize: "0.82rem",
            outline: "none", marginBottom: "1rem",
          }}
        />

        {/* Upload Zone */}
        <div
          className={`upload-zone${dragOver ? " drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={(e) => handleFile(e.target.files[0])}
            style={{ display: "none" }}
          />
          <span className="upload-icon">📄</span>
          <h3>Drop your PDF here or click to browse</h3>
          <p>Supports up to ~15 pages · PDF only</p>
        </div>

        {file && (
          <div className="file-chosen">
            <span>✓</span>
            <span>
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}

        {/* Button */}
        <button
          className="btn"
          onClick={runCheck}
          disabled={!file || step === 1 || step === 2}
        >
          {step === 1 || step === 2
            ? "Analyzing..."
            : step === 3
            ? "✓ Run Again"
            : "Run Fact-Check →"}
        </button>

        {/* Progress */}
        {(step === 1 || step === 2 || step === 3) && (
          <>
            <div className="steps">
              {STEPS.map((st, i) => (
                <div
                  key={st}
                  className={`step ${
                    step > i + 1 ? "done" : step === i + 1 ? "active" : ""
                  }`}
                >
                  {step > i + 1 ? "✓ " : ""}
                  {st}
                </div>
              ))}
            </div>
            {step < 3 && (
              <div className="status-bar">
                <div className="spinner" />
                <span>{stepLabel}</span>
              </div>
            )}
          </>
        )}

        {/* Error */}
        {error && <div className="error-box">⚠ {error}</div>}

        {/* Results */}
        {results.length > 0 && (
          <>
            {/* Summary */}
            <div className="summary">
              {Object.entries(counts).map(([k, v]) => (
                <div className="summary-card" key={k}>
                  <span
                    className="summary-num"
                    style={{ color: STATUS_CONFIG[k].color }}
                  >
                    {v}
                  </span>
                  <span className="summary-label">{k}</span>
                </div>
              ))}
            </div>

            <div className="results-header">
              <h2>CLAIM ANALYSIS · {results.length} CLAIMS</h2>
              <div className="badge-row">
                {Object.entries(counts).map(([k, v]) =>
                  v > 0 ? (
                    <span
                      key={k}
                      className="badge"
                      style={{
                        color: STATUS_CONFIG[k].color,
                        background: STATUS_CONFIG[k].bg,
                      }}
                    >
                      {STATUS_CONFIG[k].icon} {v}
                    </span>
                  ) : null
                )}
              </div>
            </div>

            {results.map((r, i) => {
              const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.FALSE;
              return (
                <div
                  className="claim-card"
                  key={i}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="claim-header">
                    <span
                      className="claim-status-pill"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <span className="claim-text">"{r.claim}"</span>
                  </div>
                  <div className="claim-body">
                    <div
                      className="verdict-box"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}
                    >
                      <div className="verdict-label" style={{ color: cfg.color }}>
                        ANALYSIS
                      </div>
                      <div className="verdict-text">{r.reasoning}</div>
                    </div>
                    {r.correction && (
                      <div className="correction-box">
                        <div className="correction-label">CORRECT FACT</div>
                        <div className="correction-text">{r.correction}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}