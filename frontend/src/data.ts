// Synthetic fixtures only. Replace this module with server-supplied BMRS responses.
export type Interval = { timestamp: string; day: number; time: string; actual: number | null; publications: { publishTime: string; value: number }[] };
export const intervals: Interval[] = Array.from({ length: 1488 }, (_, i) => {
  const day = Math.floor(i / 48) + 1;
  const time = `${String(Math.floor(i % 48 / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`;
  const timestamp = `2026-01-${String(day).padStart(2, '0')}T${time}:00Z`;
  const actual = Math.round(9500 + 3600 * Math.sin(i / 35) + 2300 * Math.cos(i / 77) + 650 * Math.sin(i / 8));
  const previous = new Date(Date.UTC(2026, 0, day - 1)).toISOString().slice(0, 10);
  const baseline = actual + Math.round(730 * Math.sin(i / 13) + 340 * Math.cos(i / 7) + 170);
  return { timestamp, day, time, actual: i % 137 === 0 ? null : actual, publications: [
    { publishTime: `${previous}T06:00:00Z`, value: baseline + 260 },
    { publishTime: `${previous}T09:00:00Z`, value: baseline },
    { publishTime: `${previous}T12:00:00Z`, value: baseline - 190 },
    { publishTime: timestamp, value: actual + 80 },
  ] };
});
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
