import { Award, GraduationCap } from 'lucide-react';

export function EducationHighlight() {
  return (
    <article className="education-card">
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
    </article>
  );
}

export function ValorHighlight() {
  return (
    <article className="honors-bar">
      <div className="honors-icon">
        <Award size={28} strokeWidth={1.3} aria-hidden="true" />
      </div>
      <div className="honors-copy">
        <p className="eyebrow">MILITARY HONORS / VALOR</p>
        <h3>Composure when it mattered most.</h3>
        <p>
          Awarded the <strong>Army Commendation Medal for Valor</strong> for
          calmness and bravery under intense enemy fire. A defining part of an
          honorable and highly decorated military career.
        </p>
      </div>
    </article>
  );
}

export default function ProfileHighlights() {
  return (
    <section
      id="highlights"
      className="profile-highlights shell"
      aria-labelledby="profile-highlights-title"
    >
      <h2 id="profile-highlights-title" className="sr-only">
        Education and military honors
      </h2>
      <div className="profile-highlights-grid">
        <ValorHighlight />
        <EducationHighlight />
      </div>
    </section>
  );
}
