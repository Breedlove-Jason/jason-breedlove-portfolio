import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Code2,
  Github,
  Smartphone,
  ShieldCheck,
  CheckCheck,
  Video,
  Database,
  Terminal,
  Braces,
  Network,
} from 'lucide-react';
import { projects } from '../data/projects';
import type { Project } from '../data/projects';
import type { LucideIcon } from 'lucide-react';
import SectionHeading from './SectionHeading.tsx';

const filters = [
  'All work',
  'Full stack',
  'Mobile & systems',
  'Python & data',
  'Developer tools',
  'Games',
];
const icons: Record<string, LucideIcon> = {
  memorybeam: Smartphone,
  legion: Database,
  cryptoforge: Network,
  envranger: Terminal,
  productstore: Braces,
  reuters: Database,
  pacman: Code2,
  fieldnotes: Code2,
};

function ProjectDetails({ project }: { project: Project }) {
  return (
    <details className="project-details">
      <summary>
        Engineering notes <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <div className="project-detail-body">
        <h4>The problem</h4>
        <p>{project.problem}</p>
        <h4>The implementation</h4>
        <p>{project.implementation}</p>
        <h4>Current scope</h4>
        <p>{project.boundary}</p>
      </div>
    </details>
  );
}

function MemoryBeamDiagram() {
  const steps = [
    [Video, '01', 'Create', 'Capture & edit'],
    [ShieldCheck, '02', 'Connect', 'Pin & pair'],
    [CheckCheck, '03', 'Preserve', 'Verify the master'],
  ] as const;
  return (
    <div
      className="memorybeam-diagram"
      role="img"
      aria-label="MemoryBeam architecture: create a finished video, connect with certificate-pinned pairing, and preserve it with verified delivery."
    >
      <div className="diagram-label">
        <span>MEMORYBEAM / DELIVERY ARCHITECTURE</span>
        <Code2 size={16} />
      </div>
      <div className="beam-pipeline">
        {steps.map(([Icon, number, title, text], index) => (
          <div className="beam-stage" key={title}>
            <span className="stage-number">{number}</span>
            <div className="stage-icon">
              <Icon size={30} strokeWidth={1.2} />
              {index < 2 && <span className="stage-connector" />}
            </div>
            <strong>{title}</strong>
            <span>{text}</span>
          </div>
        ))}
      </div>
      <div className="protocol-line">
        <span>HTTPS + CERTIFICATE PINNING</span>
        <span>SHA-256 INTEGRITY</span>
      </div>
    </div>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState('All work');
  const visibleProjects = projects.filter(
    (project) => filter === 'All work' || project.category === filter,
  );
  return (
    <section className="section shell projects-section" id="projects">
      <SectionHeading
        number="01"
        label="SELECTED ENGINEERING"
        title={
          <>
            Real problems.
            <br />
            <span className="text-muted">Considered solutions.</span>
          </>
        }
      >
        From mobile experiences to data pipelines, a selection of the systems
        I’m building.
      </SectionHeading>
      <div className="project-toolbar">
        <div
          className="project-filters"
          role="group"
          aria-label="Filter projects"
        >
          {filters.map((value) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <span className="project-count" aria-live="polite">
          {String(visibleProjects.length).padStart(2, '0')} PROJECTS
        </span>
      </div>
      <div className="project-grid">
        {visibleProjects.map((project) => {
          const Icon = icons[project.id];
          return (
            <article
              key={project.id}
              className={`project-card project-${project.id} ${project.featured ? 'project-featured' : ''}`}
            >
              <div className="project-card-content">
                <div className="project-card-top">
                  <span className="project-number">/{project.number}</span>
                  <span className="project-status">{project.status}</span>
                </div>
                <div className="project-type">
                  <Icon size={17} aria-hidden="true" />
                  {project.kind}
                </div>
                <h3>
                  {project.title}
                  <span aria-hidden="true">↗</span>
                </h3>
                <p className="project-headline">{project.headline}</p>
                <p className="project-description">{project.description}</p>
                <div className="tech-tags" aria-label="Technology stack">
                  {project.stack.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              </div>
              {project.featured ? (
                <MemoryBeamDiagram />
              ) : (
                <div className="mini-pipeline" aria-label="Architecture">
                  {project.diagram.map((step, index) => (
                    <span key={step}>
                      {step}
                      {index < project.diagram.length - 1 && (
                        <ArrowRight size={12} aria-hidden="true" />
                      )}
                    </span>
                  ))}
                </div>
              )}
              <div className="project-card-footer">
                <ProjectDetails project={project} />
                <div className="project-links">
                {project.source ? (
                  <a
                    className="source-link"
                    href={project.source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={16} aria-hidden="true" />
                    View source <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                ) : (
                  <a className="source-link" href="#contact">
                    Discuss this project{' '}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                )}
                {project.notebook && (
                  <a className="source-link" href={project.notebook} target="_blank" rel="noopener noreferrer">
                    Open in Colab <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="work-footer">
        <p>More experiments. More things built.</p>
        <a
          href="https://github.com/Breedlove-Jason"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github size={17} aria-hidden="true" />
          Explore my GitHub <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
