import { projects as existingProjects, type Project } from './projects';

/** Publish only after the .io domain, HTTPS, and launch checks pass. */
export const keyforgeProject: Project = {
  id: 'keyforge',
  number: '02',
  title: 'KeyForge',
  category: 'Developer tools',
  kind: 'ADAPTIVE TYPING + PROGRAMMING PRACTICE',
  status: 'In development',
  featured: true,
  headline: 'Build speed in the syntax you actually write.',
  description: 'A Keybr-based typing trainer extended with a separate programming studio, detailed performance insights, and continuous practice for keys, character pairs, and syntax fragments.',
  stack: ['React', 'TypeScript', 'Node.js', 'WebSockets', 'Render'],
  problem: 'Ordinary typing practice rarely targets the punctuation, indentation, naming patterns, and repeated fragments developers use every day. Reaching an initial target should not retire a pattern from practice.',
  implementation: 'Extends the open-source Keybr application with Code Lab: 16 language and tool tracks, seven practice paths, timed and untimed sessions, error policies, local history, and JSON/CSV exports. Continuous refinement mixes repair, review, and exploration using recent language-specific telemetry. A single-port Render adapter serves both the website and native racing connections.',
  boundary: 'Built on Keybr with AGPL attribution; the base typing engine and racing implementation are upstream work. Code Lab history is browser-local, not cloud-synced. Custom snippets are never executed. Hosted accounts are disabled while production storage and authentication are finalized. The custom-domain launch is pending; continuous practice does not guarantee unlimited speed gains.',
  diagram: ['Measure', 'Find friction', 'Remix practice', 'Repeat'],
  source: 'https://github.com/Breedlove-Jason/jason-breedlove-portfolio/tree/feature/keyforge-typing/keyforge',
  liveUrl: 'https://jasonbreedlove.io/',
  liveLabel: 'Practice with KeyForge',
};

// Preserve all original projects and their stable IDs. Keep MemoryBeam first;
// display KeyForge immediately after it, then recompute presentation numbers.
const withoutKeyforge = existingProjects.filter(project => project.id !== keyforgeProject.id);
const memorybeamIndex = withoutKeyforge.findIndex(project => project.id === 'memorybeam');
const insertAt = memorybeamIndex < 0 ? 0 : memorybeamIndex + 1;
export const projects: Project[] = [
  ...withoutKeyforge.slice(0, insertAt),
  keyforgeProject,
  ...withoutKeyforge.slice(insertAt),
].map((project, index) => ({ ...project, number: String(index + 1).padStart(2, '0') }));
