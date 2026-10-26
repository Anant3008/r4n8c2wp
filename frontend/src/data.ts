// Server-supplied BMRS API integration and verified January 2026 data models.
import realIntervals from "./realIntervals.json";

export type Interval = { timestamp: string; day: number; time: string; actual: number | null; publications: { publishTime: string; value: number }[] };

export const intervals: Interval[] = realIntervals as Interval[];

export function evaluate(row: Interval, cutoff: string) {
  const deadline = new Date(row.timestamp);
  const [hour, minute] = cutoff.split(':').map(Number);
  deadline.setUTCDate(deadline.getUTCDate() - 1);
  deadline.setUTCHours(hour, minute, 0, 0);
  const publications = [...row.publications].sort((a, b) => Date.parse(a.publishTime) - Date.parse(b.publishTime));
  const eligible = publications.filter(p => Date.parse(p.publishTime) <= deadline.getTime());
  const publication = eligible.at(-1) ?? null;
  const forecast = publication?.value ?? null;
  return { ...row, publications, forecast, publicationTime: publication?.publishTime ?? null, error: row.actual !== null && forecast !== null ? forecast - row.actual : null, label: `${String(row.day).padStart(2, '0')} Jan ${row.time}`, cutoff: deadline.toISOString() };
}

export type Evaluated = ReturnType<typeof evaluate>;

export const num = (n: number | null, digits = 0) => n === null || !Number.isFinite(n) ? '—' : (Math.abs(n) < 0.5 * 10 ** -digits ? 0 : n).toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function metrics(rows: Evaluated[]) {
  const pairs = rows.filter(r => r.error !== null);
  const avg = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
  const matchedActual = avg(pairs.map(r => r.actual!));
  const mae = avg(pairs.map(r => Math.abs(r.error!)));
  return { forecast: avg(rows.flatMap(r => r.forecast === null ? [] : [r.forecast])), actual: avg(rows.flatMap(r => r.actual === null ? [] : [r.actual])), mae, relativeMae: matchedActual > 0 ? mae / matchedActual * 100 : NaN, rmse: Math.sqrt(avg(pairs.map(r => r.error! ** 2))), bias: avg(pairs.map(r => r.error!)), coverage: rows.length ? rows.filter(r => r.forecast !== null).length / rows.length * 100 : NaN, pairs: pairs.length };
}

export const API_BASE = import.meta.env.VITE_API_URL || "";

export async function fetchIntervals(
  date = "all",
  cutoff = "10:00",
  matchMode = "hourly_block",
): Promise<Evaluated[]> {
  const url = `${API_BASE}/api/intervals?date=${encodeURIComponent(
    date,
  )}&cutoff=${encodeURIComponent(cutoff)}&match_mode=${encodeURIComponent(
    matchMode,
  )}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`API error ${resp.status}: ${resp.statusText}`);
  }
  return resp.json();
}

export async function fetchMetrics(
  date = "all",
  cutoff = "10:00",
  matchMode = "exact",
) {
  const url = `${API_BASE}/api/metrics?date=${encodeURIComponent(
    date,
  )}&cutoff=${encodeURIComponent(cutoff)}&match_mode=${encodeURIComponent(
    matchMode,
  )}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  return resp.json();
}
