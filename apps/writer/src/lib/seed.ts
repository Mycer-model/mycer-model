import type { DB, Source } from './types';
// Fictional sample sources so screens have data. Flagged `sample` and labelled in the UI. Not real papers.
const mk = (id: string, title: string, authors: string[], year: number, journal: string, texts: string[]): Source => ({
  id, title, authors, year, journal, sample: true, createdAt: '2026-01-01T00:00:00.000Z',
  chunks: texts.map((text, i) => ({ id: `${id}-c${i + 1}`, page: i + 1, text })),
});
export const SEED_SOURCES: Source[] = [
  mk('s1', 'Distributed storage and recovery time in coastal grids', ['Okafor, Ngozi', 'Lindqvist, Mats'], 2021, 'Journal of Sample Energy Studies', [
    'Distributed battery storage shortened the average recovery time after storm outages by roughly a third compared with centralised backup. Sites with storage at the feeder level restored critical loads first. The effect was strongest in regions with frequent short outages.',
    'Recovery time depended more on the placement of storage than on its total capacity. Storage placed near hospitals and water pumps delivered the largest resilience gains per unit of capacity.',
  ]),
  mk('s2', 'Coordinated demand response across neighbouring districts', ['Marsh, Eleanor'], 2022, 'Sample Review of Grid Operations', [
    'Demand response coordinated across neighbouring districts reduced peak load stress during heat waves. Districts that shared signals avoided the rebound peaks seen when each district acted alone.',
    'Participation rose when households received simple feedback about their contribution. Automated controls outperformed manual appeals in every tested scenario.',
  ]),
  mk('s3', 'Microgrids as islanding capacity for critical services', ['Tanaka, Ren', 'Abara, Chidi', 'Voss, Lena'], 2020, 'Sample Journal of Microgrids', [
    'Microgrids able to island from the main grid kept critical services running during multi-day outages. Islanding succeeded in most trials, but synchronising back to the main grid caused short interruptions in a minority of cases.',
    'The cost of islanding capability fell as inverter prices dropped, making microgrids viable for smaller communities. Maintenance practices were the main predictor of reliability.',
  ]),
  mk('s4', 'Measuring community energy resilience with composite indicators', ['Halvorsen, Ingrid'], 2023, 'Sample Indicators Quarterly', [
    'Composite indicators of energy resilience combine measures of redundancy, recovery speed and vulnerability. Weighting choices changed regional rankings, so sensitivity analysis is needed before indicators guide policy.',
    'Normalisation methods affected results less than weighting methods did. Transparent reporting of indicator choices improved trust among planners.',
  ]),
];
export function seedDB(): DB {
  const now = new Date().toISOString();
  return {
    user: null, plan: 'free', autocompleteEnabled: true, sources: SEED_SOURCES,
    usage: { key: '', used: 0 },
    docs: [{
      id: 'welcome', title: 'Sample: storage and grid resilience', style: 'apa', updatedAt: now, archivedAt: null,
      content: { type: 'doc', content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Storage and grid resilience' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Coastal grids recover from storms faster when distributed battery storage is placed near critical loads' }] },
      ] },
    }],
  };
}
