"use client";
import { useEffect, useRef, useState } from "react";

type Meeting = { _id: string; title: string; audioUrl: string; duration: number };
type Hit = { text: string; start: number; end: number; score: number };

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const segRefs = useRef<(HTMLButtonElement | null)[]>([]);

  async function loadMeetings(selectId?: string) {
    const list: Meeting[] = await fetch("/api/meetings").then(r => r.json());
    if (!Array.isArray(list)) return;
    setMeetings(list);
    setMeeting(list.find(m => m._id === selectId) ?? meeting ?? list[0] ?? null);
  }
  useEffect(() => { loadMeetings(); }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError("");
    setStatus(`Transcribing and indexing ${file.name}. Leave this tab open.`);
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
      setStatus(""); setError(err.message);
    } finally {
      setBusy(false); e.target.value = "";
    }
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !meeting) return;
    setBusy(true); setError(""); setAnswer(""); setHits([]); setActive(null);
    setStatus("Searching.");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, meetingId: meeting._id, k: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Search failed (${res.status})`);
      setAnswer(data.answer); setHits(data.results);
      setStatus(data.results.length ? "" : "No matching passages in this recording.");
    } catch (err: any) {
      setStatus(""); setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function seek(i: number) {
    const a = audioRef.current;
    if (!a || !hits[i]) return;
    a.currentTime = hits[i].start;
    a.play();
    setActive(i);
    segRefs.current[i]?.focus();
  }

  // Keeps the highlighted segment in sync when the user scrubs the
  // native controls instead of clicking a segment.
  function onTimeUpdate(e: React.SyntheticEvent<HTMLAudioElement>) {
    const t = e.currentTarget.currentTime;
    const i = hits.findIndex(h => t >= h.start && t <= h.end);
    if (i !== -1 && i !== active) setActive(i);
  }

  // Citations like [2] in the answer become buttons that seek to that segment.
  function renderAnswer(text: string) {
    return text.split(/(\[\d+\])/g).map((part, k) => {
      const m = part.match(/^\[(\d+)\]$/);
      if (!m) return part;
      const i = Number(m[1]) - 1;
      if (!hits[i]) return part;
      return (
        <button key={k} className="cite" onClick={() => seek(i)}
          aria-label={`Play segment ${i + 1} at ${fmt(hits[i].start)}`}>
          {part}
        </button>
      );
    });
  }

  return (
    <main className="wrap">
      <header className="head">
        <h1>EchoVault</h1>
        <div className="controls">
          {meetings.length > 0 && (
            <label>
              <span className="sr-only">Recording</span>
              <select className="field" value={meeting?._id ?? ""} disabled={busy}
                onChange={e => setMeeting(meetings.find(m => m._id === e.target.value) ?? null)}>
                {meetings.map(m => (
                  <option key={m._id} value={m._id}>{m.title} · {fmt(m.duration)}</option>
                ))}
              </select>
            </label>
          )}
          <label className="field file">
            Upload recording
            <input type="file" accept="audio/*" onChange={onUpload} disabled={busy} />
          </label>
        </div>
      </header>

      {meeting ? (
        <>
          <div className="player">
            <audio ref={audioRef} src={meeting.audioUrl} controls preload="metadata"
              onTimeUpdate={onTimeUpdate} aria-label={`Audio for ${meeting.title}`} />
          </div>

          <form className="search" onSubmit={onSearch}>
            <input className="field" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search this recording" aria-label="Search this recording" disabled={busy} />
            <button type="submit" disabled={busy || !query.trim()}>Search</button>
          </form>
        </>
      ) : (
        <p className="empty">No recordings yet. Upload one to search it.</p>
      )}

      <p className="status" role="status" aria-live="polite">{status}</p>
      {error && <p className="error" role="alert">{error}</p>}

      {answer && (
        <section className="answer">
          <h2>Answer</h2>
          <p>{renderAnswer(answer)}</p>
        </section>
      )}

      {hits.length > 0 && (
        <section className="segments">
          <h2>{hits.length} passages</h2>
          <ol>
            {hits.map((h, i) => (
              <li key={i}>
                <button className="seg" ref={el => { segRefs.current[i] = el; }}
                  onClick={() => seek(i)} aria-current={active === i ? "true" : undefined}
                  title={`similarity ${h.score.toFixed(3)}`}>
                  <time dateTime={`PT${Math.floor(h.start)}S`}>{fmt(h.start)}–{fmt(h.end)}</time>
                  <p>{h.text}</p>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}