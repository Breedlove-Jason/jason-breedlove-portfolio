import { Code2, Terminal, ShieldCheck, Database } from 'lucide-react';
import SectionHeading from './SectionHeading.tsx';

const groups = [
  {
    icon: Code2,
    title: 'Interfaces & experiences',
    description:
      'From browser to mobile. Intentional interactions, reusable components, and responsive layouts.',
    skills: [
      'JavaScript',
      'TypeScript',
      'React',
      'React Native',
      'Next.js',
      'HTML5',
      'CSS3',
    ],
  },
  {
    icon: Database,
    title: 'Applications & data',
    description:
      'Connect the interface to the system behind it: APIs, structured data, and application logic.',
    skills: [
      'Python',
      'Node.js',
      'Express',
      'Flask',
      'Java',
      'C#',
      'SQL',
      'MongoDB',
      'PostgreSQL',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Security & integrity',
    description:
      'A background in computer security, ethical hacking, and protecting information systems.',
    skills: [
      'Computer Security',
      'Ethical Hacking',
      'Offensive Security',
      'HTTPS',
      'SHA-256',
    ],
  },
  {
    icon: Terminal,
    title: 'Linux & infrastructure',
    description:
      'Comfortable working below the interface, with operating systems, services, and developer tooling.',
    skills: ['Debian', 'Arch', 'RHEL', 'Linux Administration', 'Docker', 'Git'],
  },
];
export default function Expertise() {
  return (
    <section className="expertise-wrap">
      <div id="expertise" className="section shell">
        <SectionHeading
          number="02"
          label="TECHNICAL RANGE"
          title="From the interface down."
        >
          Software development and security belong in the same conversation.
        </SectionHeading>
        <div className="skills-grid">
          {groups.map(({ icon: Icon, title, description, skills }, index) => (
            <article className="skill-card" key={title}>
              <div className="skill-top">
                <Icon size={25} strokeWidth={1.3} aria-hidden="true" />
                <span>0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="tech-tags">
                {skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
