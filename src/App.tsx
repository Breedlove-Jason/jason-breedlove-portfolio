import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import Projects from './components/Projects.tsx';
import Expertise from './components/Expertise.tsx';
import Experience from './components/Experience.tsx';
import About from './components/About.tsx';
import Contact from './components/Contact.tsx';
import { ArrowUp } from 'lucide-react';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <div className="hero-wrap">
          <Hero />
          <div className="shell discipline-strip">
            <span>FULL-STACK DEVELOPMENT</span>
            <span>SECURITY BY DESIGN</span>
            <span>U.S. ARMY VETERAN</span>
            <span>AUBURN, CALIFORNIA</span>
          </div>
        </div>
        <Projects />
        <Expertise />
        <Experience />
        <About />
        <Contact />
      </main>
      <footer className="shell site-footer">
        <a className="footer-brand" href="#home">
          Jason Breedlove<span>Human purpose. Technical precision.</span>
        </a>
        <span>© {new Date().getFullYear()} Jason Breedlove</span>
        <a href="#home" className="back-top">
          Back to top <ArrowUp size={16} aria-hidden="true" />
        </a>
      </footer>
    </>
  );
}
