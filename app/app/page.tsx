"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Meeting = { _id: string; title: string; audioUrl: string; duration: number };
type Hit = { text: string; start: number; end: number; score: number };

const fmt = (s: number) => {
  if (isNaN(s)) return "00:00";
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function AppTool() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Custom Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [totalDuration, setTotalDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const segRefs = useRef<(HTMLButtonElement | null)[]>([]);

  async function loadMeetings(selectId?: string) {
    try {
      const list: Meeting[] = await fetch("/api/meetings").then((r) => r.json());
      if (!Array.isArray(list)) return;
      setMeetings(list);
      const chosen = list.find((m) => m._id === selectId) ?? meeting ?? list[0] ?? null;
      setMeeting(chosen);
      if (chosen) setTotalDuration(chosen.duration || 0);
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    loadMeetings();
  }, []);

  // Audio Play / Pause
  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
    } else {
      a.play().catch(() => {});
    }
  };

  // Custom Seek Bar Click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const dur = a.duration || totalDuration || 1;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const target = pct * dur;
    a.currentTime = target;
    setCurrentTime(target);
  };

  // Speed Toggle
  const toggleSpeed = () => {
    const a = audioRef.current;
    if (!a) return;
    const nextSpeed = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    a.playbackRate = nextSpeed;
    setPlaybackRate(nextSpeed);
  };

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setStatus(`Transcribing and indexing ${file.name}...`);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", file.name.replace(/\.[^.]+$/, ""));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      await loadMeetings(data.meeting._id);
      setStatus(`Indexed ${data.meeting.title}: ${data.chunkCount} segments.`);
    } catch (err: any) {
      setStatus("");
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onSearch(e?: React.FormEvent, searchQuery?: string) {
    if (e) e.preventDefault();
    const q = (searchQuery ?? query).trim();
    if (!q || !meeting) return;
    setBusy(true);
    setError("");
    setAnswer("");
    setHits([]);
    setActive(null);
    setStatus("Analyzing transcript & neural vectors...");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, meetingId: meeting._id, k: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Search failed (${res.status})`);
      setAnswer(data.answer);
      setHits(data.results);
      setStatus(data.results.length ? "" : "No matching moments found in this recording.");
    } catch (err: any) {
      setStatus("");
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function seek(i: number) {
    const a = audioRef.current;
    if (!a || !hits[i]) return;
    a.currentTime = hits[i].start;
    a.play().catch(() => {});
    setIsPlaying(true);
    setActive(i);
    segRefs.current[i]?.focus();
  }

  function onTimeUpdate(e: React.SyntheticEvent<HTMLAudioElement>) {
    const t = e.currentTarget.currentTime;
    setCurrentTime(t);
    const i = hits.findIndex((h) => t >= h.start && t <= h.end);
    if (i !== -1 && i !== active) setActive(i);
  }

  function renderAnswer(text: string) {
    return text.split(/(\[\d+\])/g).map((part, k) => {
      const m = part.match(/^\[(\d+)\]$/);
      if (!m) return part;
      const i = Number(m[1]) - 1;
      if (!hits[i]) return part;
      return (
        <button
          key={k}
          className="cite"
          onClick={() => seek(i)}
          aria-label={`Play segment ${i + 1} at ${fmt(hits[i].start)}`}
        >
          {part}
        </button>
      );
    });
  }

  const effectiveDuration = totalDuration || (audioRef.current?.duration ?? 0);
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="tool-container">
      {/* Background Audio Node */}
      {meeting && (
        <audio
          ref={audioRef}
          src={meeting.audioUrl}
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={(e) => setTotalDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          style={{ display: "none" }}
        />
      )}

      {/* Top Header Bar */}
      <header className="tool-navbar">
        <div className="nav-left">
          <Link href="/" className="back-btn" title="Back to Landing Page">
            ←
          </Link>
          <div className="brand-badge">
            <span className="dot" data-busy={busy || undefined} aria-hidden="true" />
            <span className="brand-title">SaidWhen</span>
            <span className="mono-sub">PRO // WORKSPACE</span>
          </div>
        </div>

        <div className="nav-right">
          {meetings.length > 0 && (
            <div className="select-wrapper">
              <select
                className="select-custom"
                value={meeting?._id ?? ""}
                disabled={busy}
                onChange={(e) => {
                  const m = meetings.find((x) => x._id === e.target.value) ?? null;
                  setMeeting(m);
                  if (m) setTotalDuration(m.duration);
                  setCurrentTime(0);
                  setIsPlaying(false);
                }}
              >
                {meetings.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title} ({fmt(m.duration)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="btn-upload">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Upload</span>
            <input type="file" accept="audio/*" onChange={onUpload} disabled={busy} />
          </label>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="tool-main">
        {meeting ? (
          <>
            {/* Custom Studio Audio Player Card */}
            <div className="audio-card">
              <div className="audio-card-top">
                <div className="audio-info">
                  <span className="audio-status-pill">ACTIVE RECORDING</span>
                  <h2 className="audio-title">{meeting.title}</h2>
                </div>

                <div className="audio-stats">
                  <span className="mono-time">
                    {fmt(currentTime)} <span className="time-divider">/</span> {fmt(effectiveDuration)}
                  </span>
                  <button className="speed-btn" onClick={toggleSpeed} title="Playback speed">
                    {playbackRate}x
                  </button>
                </div>
              </div>

              {/* Waveform Scrubber Line */}
              <div className="scrubber-container" onClick={handleSeek} title="Click to seek">
                <div className="scrubber-track">
                  <div className="scrubber-fill" style={{ width: `${progressPercent}%` }} />
                  <div className="scrubber-thumb" style={{ left: `${progressPercent}%` }} />
                </div>
              </div>

              {/* Player Controls Bar */}
              <div className="audio-card-bottom">
                <button
                  className="play-pause-btn"
                  onClick={togglePlay}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>

                <div className="player-meta-hint">
                  {isPlaying ? "Playing recording audio..." : "Paused • Click waveform or moment below to jump"}
                </div>
              </div>
            </div>

            {/* Spotlight AI Search Form */}
            <div className="search-card">
              <form className="search-form" onSubmit={(e) => onSearch(e)}>
                <div className="search-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                <input
                  className="search-field"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question or search topics (e.g. 'Why was deadline pushed?')..."
                  disabled={busy}
                />

                <button className="search-btn" type="submit" disabled={busy || !query.trim()}>
                  {busy ? "Searching..." : "Find Moment ↵"}
                </button>
              </form>

              {/* Quick suggestion chips */}
              <div className="suggestion-row">
                <span className="suggestion-label">Suggested:</span>
                {["Key decisions made", "Action items & owners", "Budget discussion"].map((txt) => (
                  <button
                    key={txt}
                    className="suggestion-chip"
                    onClick={() => {
                      setQuery(txt);
                      onSearch(undefined, txt);
                    }}
                  >
                    "{txt}"
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Empty Studio State (Upload Prompt) */
          <div className="empty-upload-card">
            <div className="empty-icon">🎙️</div>
            <h2>No recordings in workspace</h2>
            <p>Upload any audio file (.mp3, .wav, .m4a) to generate automatic transcripts and millisecond-accurate timestamps.</p>
            <label className="btn-upload-large">
              <span>Choose Audio File</span>
              <input type="file" accept="audio/*" onChange={onUpload} disabled={busy} />
            </label>
          </div>
        )}

        {/* Status / Error Toast */}
        {status && (
          <div className="toast-status">
            <span className="spinner" />
            <span>{status}</span>
          </div>
        )}
        {error && <div className="toast-error">Error: {error}</div>}

        {/* AI Answer Summary */}
        {answer && (
          <section className="answer-card">
            <div className="card-tag">SYNTHESIZED ANSWER</div>
            <p className="answer-text">{renderAnswer(answer)}</p>
          </section>
        )}

        {/* Matched Passages List */}
        {hits.length > 0 && (
          <section className="moments-section">
            <div className="moments-header">
              <h3>FOUND MOMENTS ({hits.length})</h3>
              <span className="mono-sub">CLICK TO PLAY FROM EXACT SECOND</span>
            </div>

            <div className="moments-grid">
              {hits.map((h, i) => {
                const isCurrent = active === i;
                return (
                  <button
                    key={i}
                    ref={(el) => {
                      segRefs.current[i] = el;
                    }}
                    className={`moment-card ${isCurrent ? "active-moment" : ""}`}
                    onClick={() => seek(i)}
                  >
                    <div className="moment-top">
                      <span className="moment-timestamp">
                        [{fmt(h.start)} — {fmt(h.end)}]
                      </span>
                      <span className="moment-score">
                        {Math.round(h.score * 100)}% relevance
                      </span>
                    </div>

                    <p className="moment-quote">{h.text}</p>

                    <div className="moment-bar-bg">
                      <div
                        className="moment-bar-fill"
                        style={{ width: `${Math.max(10, Math.min(100, h.score * 100))}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}