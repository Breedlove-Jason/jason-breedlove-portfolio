import { GraduationCap, ArrowUpRight } from 'lucide-react';
import SectionHeading from './SectionHeading.tsx';

export default function About() {
  return (
    <section id="about" className="section shell">
      <div className="about-layout">
        <div>
          <SectionHeading
            number="04"
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
        <div className="education-card">
          <div className="education-top">
            <GraduationCap size={27} strokeWidth={1.4} aria-hidden="true" />
            <span>EDUCATION & CONTINUING STUDY</span>
          </div>
          <h3>Colorado Technical University</h3>
          <div className="degree">
            <span>BACHELOR’S DEGREE</span>
            <strong>Computer Security</strong>
            <p className="degree-honors">
              President’s List & Dean’s List · Multiple terms
            </p>
          </div>
          <div className="degree">
            <span>ASSOCIATE’S DEGREE</span>
            <strong>Information Technology</strong>
            <p className="degree-honors">Graduated with honors</p>
          </div>
          <p className="education-focus">
            Studies in information technology, security, and network management.
          </p>
          <div className="academic-honors">
            <strong>
              4.0<span>GPA</span>
            </strong>
            <div>
              President’s List
              <br />
              Dean’s List
            </div>
          </div>
          <div className="continuing-study">
            <span>ONLINE BOOTCAMPS</span>
            <p>
              Python · JavaScript · React
              <br />
              Web Design · Linux Administration
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
