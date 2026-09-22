import { ArrowUpRight } from 'lucide-react';
import SectionHeading from './SectionHeading.tsx';

export default function About() {
  return (
    <section id="about" className="section shell">
      <div className="about-layout">
        <div>
          <SectionHeading
            number="03"
            label="THE PERSON BEHIND THE WORK"
            title={
              <>
                Always a student.
                <br />
                Always a builder.
              </>
            }
          />
          <p className="about-copy">
            I’m Jason Breedlove, a highly decorated U.S. Army veteran and
            certified Battalion-Level Information Management Officer based in
            Auburn, California.
          </p>
          <p className="about-copy">
            My experience spans computer security, software development, and
            military leadership. Today, I’m bringing those perspectives together
            in projects that connect people, devices, and data.
          </p>
          <p className="about-copy">
            I use AI throughout my development workflow, with deliberate review
            of architecture, code quality, accessibility, and runtime behavior.
            The responsibility for what I build stays with me.
          </p>
          <a className="text-link" href="#contact">
            Let’s talk engineering <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
