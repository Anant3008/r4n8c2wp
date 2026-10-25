# WindSight frontend structure

- `App.tsx`: application providers only.
- `app/`: the workstation shell, page composition, and navigation metadata.
- `pages/`: Overview, Forecast Explorer, Accuracy Analysis, Forecast History, and Data Explorer.
- `components/layout/`: sidebar, headers, shared filters, messages, and footer.
- `components/charts/`: generation/error visualizations and tooltips.
- `components/analysis/`: metrics, publication history, interval inspection, and interval navigation.
- `components/overview/`: the quiet summary, chart section, review list, and expandable details.
- `components/records/`: record filters, table, and pagination.
- `components/common/`: shared surfaces, observation formatting, and chart states.
- `hooks/`: workstation orchestration and record filtering/pagination state.
- `lib/`: stateless chart configuration, ranking/navigation helpers, and daily summaries.

`analysisLocation.ts` remains the source of truth for URL-backed analysis state.
`data.ts` retains the existing synthetic fixtures and metric calculations.
`analysisFormatting.ts` owns shared display formatting.

The root `AnalystWorkspace.tsx`, `AnalysisInteractions.tsx`, and
`AnalysisDisplay.tsx` files are compatibility exports; existing imports continue
to work without owning component implementations.

## Visual contract

The refactor preserves the existing DOM, class names, design-system components,
and `index.css` token/font wiring. Components receive data and callbacks through
typed props; URL navigation and dataset selection stay outside presentational
components.

## Checks

```sh
node scripts/check-analysis.cjs
pnpm exec tsc --noEmit
pnpm build
```
