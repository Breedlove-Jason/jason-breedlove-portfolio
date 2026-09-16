// Descriptions are grounded in repository files and the existing portfolio.
// Source visibility was checked on September 11, 2026. See docs/CONTENT_SOURCES.md.
export interface Project {
  id: string;
  number: string;
  title: string;
  category: 'Mobile & systems' | 'Full stack' | 'Python & data' | 'Developer tools' | 'Games';
  kind: string;
  status: 'In development' | 'Research prototype' | 'Public source' | 'Live demo';
  featured?: boolean;
  headline: string;
  description: string;
  stack: string[];
  problem: string;
  implementation: string;
  boundary: string;
  diagram: string[];
  source?: string;
  notebook?: string;
  liveUrl?: string;
  liveLabel?: string;
}

export const projects: Project[] = [
  {
    id: 'memorybeam', number: '01', title: 'MemoryBeam', category: 'Mobile & systems',
    kind: 'MOBILE + EMBEDDED SYSTEMS', status: 'In development',
    headline: 'From a moment on your phone to a memory you can hold.',
    description: 'A cross-platform app for recording, editing, and delivering personal videos to a physical MemoryBeam keepsake.',
    stack: ['React Native', 'TypeScript', 'Expo', 'Swift', 'Kotlin', 'SQLite'],
    problem: 'Preserve a finished video and deliver it reliably to a dedicated device, even when a local connection is interrupted.',
    implementation: 'The app combines guided capture, a teleprompter, non-destructive editing, and a delivery experience for finished videos.',
    boundary: 'This showcase covers the companion app experience. Device internals and proprietary delivery implementation are not published. Complete device interoperability remains in development.',
    diagram: ['Capture', 'Edit', 'Send', 'Enjoy'],
  },
  {
    id: 'legion', number: '02', title: 'American Legion Post 84', category: 'Full stack',
    kind: 'FULL-STACK OPERATIONS PLATFORM', status: 'In development',
    headline: 'Software in service of a community.',
    description: 'A unified admin platform for member records, content, events, dues, donations, and payment workflows.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Stripe'],
    problem: 'Bring the everyday administration of a veterans’ organization into a coherent set of digital workflows.',
    implementation: 'The project includes responsive CMS and admin modules, member and officer management, Stripe checkout and webhook flows, payment tracking, and notification infrastructure. Prisma provides the data layer over PostgreSQL.',
    boundary: 'An active development project. Production adoption and organization-wide rollout are not claimed.',
    diagram: ['Admin UI', 'Server routes', 'Prisma', 'PostgreSQL'],
  },
  {
    id: 'cryptoforge', number: '03', title: 'CryptoForge', category: 'Python & data',
    kind: 'MACHINE LEARNING + DATA ENGINEERING', status: 'Research prototype',
    headline: 'Research that can be reproduced.',
    description: 'A modular market research framework for data ingestion, feature engineering, calibrated classifiers, and walk-forward evaluation.',
    stack: ['Python', 'pandas', 'LightGBM', 'XGBoost', 'scikit-learn'],
    problem: 'Evaluate market models against chronological data, explicit costs, and reproducible inputs instead of relying on isolated headline metrics.',
    implementation: 'Provider-oriented data adapters normalize market records, partition datasets, and write SHA-256 manifests. The research pipeline supports probability calibration, chronological walk-forward splits, parameter sweeps, fixture-backed runs, and bounded provider retries.',
    boundary: 'Research, paper, and shadow workflows. The data layer is read-only and does not place live orders. No profitability or predictive-performance claim is made.',
    diagram: ['Market data', 'Features', 'Model zoo', 'Walk-forward'],
  },
  {
    id: 'envranger', number: '04', title: 'Envranger', category: 'Developer tools',
    kind: 'TYPESCRIPT DEVELOPER TOOLING', status: 'Public source',
    headline: 'Make configuration explain itself.',
    description: 'A CLI and terminal interface for scanning, validating, and managing environment configuration across JavaScript and TypeScript projects.',
    stack: ['TypeScript', 'Node.js', 'Commander', 'React Ink'],
    problem: 'Keep application configuration, environment examples, and developer expectations aligned as a codebase grows.',
    implementation: 'The project documents source scanning for process.env references, configuration checks, type generation, example synchronization, linting, presets, and a terminal wizard. The implementation uses Commander and Ink.',
    boundary: 'An early public project, version 0.1.0. Source is available on GitHub; npm publication is not asserted.',
    diagram: ['Scan source', 'Validate keys', 'Generate types', 'Sync example'],
    source: 'https://github.com/Breedlove-Jason/envranger',
  },
  {
    id: 'productstore', number: '05', title: 'MERN Product Store', category: 'Full stack',
    kind: 'REACT + EXPRESS + MONGODB', status: 'Public source',
    headline: 'A complete path from interface to database.',
    description: 'A full-stack product management application with a Vite-powered React frontend and an Express API backed by MongoDB.',
    stack: ['React', 'Vite', 'Express', 'MongoDB', 'Docker'],
    problem: 'Connect product management in the browser to a persistent backend with a straightforward deployment model.',
    implementation: 'The repository separates the React client from the Node and Express API. MongoDB supplies storage, with Docker Compose and Nginx deployment instructions alongside the source.',
    boundary: 'A public full-stack practice project. Repository documentation includes deployment guidance; live hosting has not been verified.',
    diagram: ['React', 'Express API', 'MongoDB', 'Docker'],
    source: 'https://github.com/Breedlove-Jason/productStore-MERN',
  },
  {
    id: 'reuters', number: '06', title: 'Reuters Similarity Lab', category: 'Python & data',
    kind: 'NLP + DOCUMENT RETRIEVAL', status: 'Public source',
    headline: 'Explore what makes two articles similar.',
    description: 'An interactive experiment in word n-grams and Jaccard similarity across the complete Reuters-21578 collection, with 19,043 article bodies available for search.',
    stack: ['Python', 'Jupyter', 'Google Colab', 'Matplotlib'],
    problem: 'Find related news articles efficiently while keeping every similarity score explainable and the experiment reproducible.',
    implementation: 'A checksum-verified downloader loads all 22 corpus files. An inverted index computes exact Jaccard rankings for unigrams, bigrams, and trigrams. The notebook includes interactive search, visual comparisons, and measured benchmarks. All 30 benchmark rankings matched exhaustive search.',
    boundary: 'Lexical overlap, not semantic understanding or classification accuracy. Six unit tests pass; notebook cells ran locally against the full corpus. Hosted Colab and browser widget interaction await a smoke test.',
    diagram: ['Reuters corpus', 'Word n-grams', 'Inverted index', 'Ranked matches'],
    source: 'https://github.com/Breedlove-Jason/reuters-similarity-lab',
    notebook: 'https://colab.research.google.com/github/Breedlove-Jason/reuters-similarity-lab/blob/master/notebooks/reuters_similarity.ipynb',
  },
  {
    id: 'pacman', number: '07', title: 'Pacman JS', category: 'Games',
    kind: 'VANILLA JAVASCRIPT + GAMEPLAY', status: 'Public source',
    headline: 'One more run.',
    description: 'A browser arcade game with a responsive maze, buffered keyboard turns, touch controls, power pellets, and a local personal best.',
    stack: ['JavaScript', 'CSS Grid', 'ES modules', 'Node.js'],
    problem: 'Keep movement, collisions, and restarts predictable while making a classic maze playable across screen sizes.',
    implementation: 'Preserves the original maze and CSS characters. Finite ghost movement avoids blocked loops, pellets resolve before collisions, and a single input handler survives restarts. A dependency-free build replaces the original Parcel toolchain.',
    boundary: 'An unofficial educational tribute. Ghosts use simple randomized movement. Source and automated checks are available; public deployment and browser gameplay verification are pending.',
    diagram: ['Input', 'Movement', 'Collision', 'Score'],
    source: 'https://github.com/Breedlove-Jason/pacman-js',
  },
  {
    id: 'fieldnotes', number: '08', title: 'Field Notes — Flask Blog', category: 'Full stack',
    kind: 'PYTHON + PUBLISHING', status: 'Public source',
    headline: 'A place for ideas from the build.',
    description: 'A Flask journal with readable project stories, accounts, comments, and an editor dashboard for publishing and managing posts.',
    stack: ['Python', 'Flask', 'PostgreSQL', 'SQLAlchemy'],
    problem: 'Connect a readable journal to persistent publishing workflows and explicit editorial permissions.',
    implementation: 'Server-rendered templates, validated forms, CSRF-protected writes, filtered article HTML, plain-text comments, and an editor-only publishing desk. Eight integration tests cover the key routes and permissions.',
    boundary: 'Includes clearly marked sample articles maintained in source. Live editorial account setup is in progress.',
    diagram: ['Flask views', 'Forms', 'SQLAlchemy', 'PostgreSQL'],
    source: 'https://github.com/Breedlove-Jason/flask_blog',
    liveUrl: 'https://blog.jasonbreedlove.dev',
    liveLabel: 'Read blog',
  },
  {
    id: 'yelpcamp', number: '09', title: 'YelpCamp', category: 'Full stack',
    kind: 'EXPRESS + MAPS + API INTEGRATION', status: 'Live demo',
    headline: 'Find a campsite. Share the experience.',
    description: 'A campground discovery and review app with interactive maps, Recreation.gov data, image uploads, and five-star ratings.',
    stack: ['Node.js', 'Express', 'MongoDB', 'Bootstrap', 'Mapbox', 'Cloudinary'],
    problem: 'Bring campground listings, location services, images, and community reviews into one usable experience.',
    implementation: 'Server-rendered EJS and Bootstrap views connect to MongoDB, Mapbox geocoding and clustered maps, Cloudinary image storage, and server-side RIDB requests with optional Redis caching. Persistent sessions and ownership checks protect account and editing workflows.',
    boundary: 'Inspired by C. Steele Web Development Bootcamp, with custom styling and integrations. RIDB enrichment displays a bounded sample. Source is private; the deployed app is available to explore.',
    diagram: ['Bootstrap + EJS', 'Express', 'APIs', 'MongoDB'],
    liveUrl: 'https://yelp-camp-mu-amber.vercel.app',
    liveLabel: 'Explore YelpCamp',
  },
];
