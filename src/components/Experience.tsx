import { MapPin } from 'lucide-react';
import SectionHeading from './SectionHeading.tsx';

const roles = [
  {
    date: '2009 — PRESENT',
    title: 'Medically Retired',
    employer: 'United States Army',
    location: 'Auburn, CA',
    description:
      'Medically retired following permanent injuries sustained in war, after an honorable and distinguished career. Successfully transitioned from active service, carrying that experience into a continued focus on technology and software development.',
  },
  {
    date: '2005 — 2009',
    title: 'Administrative Training Officer',
    employer: 'U.S. Army · Auburn Recruiting Station',
    location: 'Fair Oaks, CA',
    description:
      'Supported operational readiness through critical administrative and training responsibilities. Prepared recruits for combat training and deployment, helping people and processes stay ready for the mission.',
  },
  {
    date: '2002 — 2005',
    title: 'Battalion Information Management Officer',
    subtitle: 'Rear Detachment Commander',
    employer: 'U.S. Army · Headquarters Company, 1-64 Armor Battalion',
    location: 'Fort Stewart, GA',
    description:
      'Provided critical IT support and training to the battalion. Managed more than $1 million in assets, maintaining the integrity and readiness of information systems alongside command responsibilities.',
  },
  {
    date: 'BEFORE MILITARY SERVICE',
    title: 'Manager',
    employer: 'Vicorp Industries',
    description:
      'Built a foundation in management before joining the United States Army.',
  },
];

export default function Experience() {
  return (
    <section id="experience" className="section shell">
      <SectionHeading
        number="02"
        label="EXPERIENCE & SERVICE"
        title="Responsibility, earned."
      >
        From leading people to protecting systems, a career grounded in
        readiness and accountability.
      </SectionHeading>
      <div className="experience-layout">
        <aside className="service-aside">
          <span className="service-word">SERVICE</span>
          <p>
            Leadership is a responsibility.
            <br />
            Trust is something you build.
          </p>
          <div className="asset-stat">
            <strong>$1M+</strong>
            <span>
              Information systems assets managed
              <br />
              as Battalion IMO
            </span>
          </div>
        </aside>
        <div className="timeline">
          {roles.map((role) => (
            <article className="timeline-item" key={role.date}>
              <span className="timeline-point" aria-hidden="true" />
              <p className="role-date">{role.date}</p>
              <h3>{role.title}</h3>
              {role.subtitle && (
                <p className="role-subtitle">{role.subtitle}</p>
              )}
              <p className="role-employer">{role.employer}</p>
              {role.location && (
                <p className="role-location">
                  <MapPin size={13} aria-hidden="true" />
                  {role.location}
                </p>
              )}
              <p className="role-description">{role.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
