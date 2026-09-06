export type Word = { word: string; start: number; end: number; speaker?: number };

export type TimeChunk = {
  text: string;
  start: number;
  end: number;
  speakers: number[];
};

// Sliding time-window chunking. Each chunk covers ~windowSec of audio and
// carries overlapSec into the next one so a thought cut at the boundary
// still appears whole in at least one chunk. Speaker labels are inlined so
// the embedding knows who said what.
export function chunkByTime(
  words: Word[],
  windowSec = 30,
  overlapSec = 5
): TimeChunk[] {
  if (!words.length) return [];
  const chunks: TimeChunk[] = [];
  let i = 0;

  while (i < words.length) {
    const windowStart = words[i].start;
    const windowEnd = windowStart + windowSec;

    let j = i;
    while (j < words.length && words[j].end <= windowEnd) j++;
    if (j === i) j = i + 1;

    chunks.push(buildChunk(words.slice(i, j)));

    const nextStart = windowEnd - overlapSec;
    let k = i + 1;
    while (k < j && words[k].start < nextStart) k++;
    i = k >= j ? j : k;
  }
  return chunks;
}

function buildChunk(words: Word[]): TimeChunk {
  let text = "";
  let current: number | undefined = undefined;
  const speakers = new Set<number>();

  for (const w of words) {
    if (w.speaker !== undefined && w.speaker !== current) {
      current = w.speaker;
      speakers.add(w.speaker);
      text += `\n[Speaker ${w.speaker}] `;
    }
    text += w.word + " ";
  }
  return {
    text: text.trim(),
    start: words[0].start,
    end: words[words.length - 1].end,
    speakers: Array.from(speakers),
  };
}