import { useSyncExternalStore } from 'react';

export const analysisPages = ['overview', 'forecast-explorer', 'accuracy-analysis', 'forecast-history', 'data-explorer'] as const;
export const decisionCutoffs = ['08:00', '10:00', '12:00'] as const;
export type AnalysisLocation = { page: number; date: string; cutoff: string; interval: string | null };
const navigationEvent = 'windsight:analysis-navigation';

export function readAnalysisLocation(search: string): AnalysisLocation {
  const params = new URLSearchParams(search);
  const index = analysisPages.indexOf(params.get('page') as typeof analysisPages[number]);
  const rawDate = params.get('date');
  let date = rawDate && /^2026-01-(0[1-9]|[12]\d|3[01])$/.test(rawDate) ? String(Number(rawDate.slice(-2))) : 'all';
  const cutoff = decisionCutoffs.includes(params.get('cutoff') as typeof decisionCutoffs[number]) ? params.get('cutoff')! : '10:00';
  const rawInterval = params.get('interval');
  let interval: string | null = rawInterval && /^2026-01-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):(00|30):00(?:\.000)?Z$/.test(rawInterval) ? new Date(rawInterval).toISOString().replace('.000Z', 'Z') : null;
  if (interval) {
    const intervalDay = String(Number(interval.slice(8, 10)));
    // An explicitly selected delivery day wins over a contradictory interval.
    if (date !== 'all' && date !== intervalDay) interval = null;
    else date = intervalDay;
  }
  return { page: index < 0 ? 0 : index, date, cutoff, interval };
}

export function analysisURL(href: string, state: AnalysisLocation): URL {
  const url = new URL(href);
  url.searchParams.set('page', analysisPages[state.page] ?? 'overview');
  url.searchParams.set('date', state.date === 'all' ? 'all' : `2026-01-${state.date.padStart(2, '0')}`);
  url.searchParams.set('cutoff', state.cutoff);
  if (state.interval) url.searchParams.set('interval', state.interval);
  else url.searchParams.delete('interval');
  return url;
}

export function subscribeAnalysisLocation(listener: () => void) {
  window.addEventListener('popstate', listener);
  window.addEventListener(navigationEvent, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener(navigationEvent, listener);
  };
}

export function updateAnalysisLocation(patch: Partial<AnalysisLocation>) {
  const current = readAnalysisLocation(window.location.search);
  const next = { ...current, ...patch };
  const candidate = analysisURL(window.location.href, next);
  const normalized = readAnalysisLocation(candidate.search);
  if (JSON.stringify(current) === JSON.stringify(normalized)) return;
  const url = analysisURL(window.location.href, normalized);
  window.history.pushState(window.history.state, '', url);
  window.dispatchEvent(new Event(navigationEvent));
}

const getSnapshot = () => window.location.search;
const getServerSnapshot = () => '';

export function useAnalysisLocation() {
  const search = useSyncExternalStore(subscribeAnalysisLocation, getSnapshot, getServerSnapshot);
  return [readAnalysisLocation(search), updateAnalysisLocation] as const;
}
