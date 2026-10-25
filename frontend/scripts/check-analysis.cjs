const ts = require('typescript');
const fs = require('node:fs');
const assert = require('node:assert/strict');

for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
}
require.extensions['.css'] = () => {};

const { readAnalysisLocation, analysisURL, subscribeAnalysisLocation, updateAnalysisLocation } = require('../src/analysisLocation.ts');
const target = { page: 1, date: '15', cutoff: '08:00', interval: '2026-01-15T12:30:00Z' };
const link = analysisURL('https://example.test/preview/windsight?workspace=uk#chart', target);
assert.deepEqual(readAnalysisLocation(link.search), target);
assert.equal(link.pathname, '/preview/windsight');
assert.equal(link.hash, '#chart');
assert.equal(link.searchParams.get('workspace'), 'uk');
assert.deepEqual(readAnalysisLocation('?page=bad&date=2026-01-32&cutoff=99:00&interval=bad'), { page: 0, date: 'all', cutoff: '10:00', interval: null });
assert.equal(readAnalysisLocation('?date=2026-01-14&interval=2026-01-15T12:30:00Z').interval, null);
assert.equal(readAnalysisLocation('?interval=2026-01-15T12:30:00.000Z').date, '15');
assert.equal(readAnalysisLocation('?interval=2026-01-15T12:15:00Z').interval, null);
assert.equal(readAnalysisLocation('?interval=2026-02-01T00:00:00Z').interval, null);

// Exercise the history adapter with real EventTarget notifications.
const browser = new EventTarget();
const entries = ['https://example.test/preview/windsight?workspace=uk#chart'];
let position = 0;
browser.location = new URL(entries[0]);
browser.history = {
  state: { hostState: 'preserved' },
  pushState(state, _, url) {
    entries.splice(position + 1);
    entries.push(String(url));
    position++;
    browser.location = new URL(String(url));
    this.state = state;
  },
  back() { if (position > 0) { browser.location = new URL(entries[--position]); browser.dispatchEvent(new Event('popstate')); } },
  forward() { if (position + 1 < entries.length) { browser.location = new URL(entries[++position]); browser.dispatchEvent(new Event('popstate')); } },
};
global.window = browser;
let notifications = 0;
const unsubscribe = subscribeAnalysisLocation(() => notifications++);
updateAnalysisLocation(target);
assert.equal(entries.length, 2, 'One action must create one history entry');
updateAnalysisLocation(target);
assert.equal(entries.length, 2, 'Repeated selection must not create duplicate entries');
updateAnalysisLocation({ page: 3, cutoff: '12:00' });
assert.equal(entries.length, 3);
browser.history.back();
assert.deepEqual(readAnalysisLocation(browser.location.search), target);
assert.equal(entries.length, 3, 'Restoration must not write another history entry');
browser.history.forward();
assert.equal(readAnalysisLocation(browser.location.search).page, 3);
assert.equal(readAnalysisLocation(browser.location.search).interval, target.interval);
assert.equal(browser.history.state.hostState, 'preserved');
assert.equal(notifications, 4);
updateAnalysisLocation({ date: 'all', interval: null });
assert.equal(readAnalysisLocation(browser.location.search).interval, null);
assert.equal(readAnalysisLocation(browser.location.search).date, 'all');
unsubscribe();
delete global.window;

const React = require('react');
const { renderToString } = require('react-dom/server');
const { ObservationValue, ChartState } = require('../src/AnalysisDisplay.tsx');
const { AnalystChart } = require('../src/AnalystWorkspace.tsx');
const { formatTimestamp } = require('../src/analysisFormatting.ts');
const { num, evaluate, metrics, intervals } = require('../src/data.ts');
assert.equal(formatTimestamp('2026-01-15T00:00:00Z'), '15 Jan 2026, 00:00 UTC');
assert.equal(formatTimestamp('2026-01-15T12:30:00Z', false), '15 Jan 2026, 12:30');
assert.equal(formatTimestamp('invalid'), 'Timestamp unavailable');
assert.equal(num(100, 1), '100.0');
assert.equal(num(-0.1), '0');
assert.ok(renderToString(React.createElement(ObservationValue, { value: 0 })).includes('>0</span>'));
assert.ok(renderToString(React.createElement(ObservationValue, { value: null })).includes('Missing is not zero'));
assert.ok(renderToString(React.createElement(ObservationValue, { value: null, kind: 'forecast' })).includes('Unavailable'));
assert.ok(renderToString(React.createElement(ObservationValue, { value: null, kind: 'error' })).includes('Unscored'));
for (const [status, label] of [['loading', 'Loading observations'], ['error', 'Chart could not be loaded'], ['empty', 'No generation observations']]) {
  assert.ok(renderToString(React.createElement(ChartState, { status })).includes(label));
}
const empty = renderToString(React.createElement(AnalystChart, { rows: [], onSelect() {} }));
const loading = renderToString(React.createElement(AnalystChart, { rows: [], status: 'loading', onSelect() {} }));
assert.ok(empty.includes('class="daily-chart"') && loading.includes('class="daily-chart"'), 'Loading and empty charts must retain the same dimension wrapper');
assert.ok(empty.includes('No generation observations'));
assert.ok(loading.includes('Loading observations'));
assert.ok(!renderToString(React.createElement(AnalystChart, { rows: [{ day: 1, label: '01 Jan', forecast: 0, actual: 0, error: 0 }], onSelect() {} })).includes('No generation observations'));
const sample = evaluate(intervals[1], '10:00');
const unavailable = evaluate({ ...intervals[1], publications: [{ publishTime: '2026-01-01T12:00:00Z', value: 1000 }] }, '10:00');
assert.equal(unavailable.forecast, null);
assert.equal(metrics([sample, unavailable]).pairs, 1);
const App = require('../src/App.tsx').default;
assert.ok(renderToString(React.createElement(App)).includes('Copy link'));
console.log('PASS: URL validation and round trips, history back/forward adapter, atomic updates, UTC formatting, zero vs. missing, fixed precision, stable chart states, eligibility, and app rendering.');
