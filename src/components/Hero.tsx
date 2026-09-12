import { ArrowDown, ArrowUpRight, Download } from 'lucide-react';
import SystemConstellation from './SystemConstellation.tsx';

export default function Hero() {
  return (
    <section id="home" className="hero shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="small-line" /> JASON BREEDLOVE / DEVELOPER & VETERAN
        </div>
        <h1 id="hero-title">
          A builder’s mind.
          <br />A soldier’s <span>resolve.</span>
        </h1>
        <p className="hero-intro">
          I build thoughtful interfaces, connected systems, and software that
          earns trust. Full-stack development, shaped by a decorated military
          career and a security-first mindset.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#projects">
            Explore selected work <ArrowUpRight size={19} aria-hidden="true" />
          </a>
          <a
            className="button button-quiet"
            href="/Jason-Breedlove-Resume.pdf"
            download
          >
            Download résumé <Download size={17} aria-hidden="true" />
          </a>
        </div>
        <a className="hero-scroll" href="#projects">
          <span>
            <ArrowDown size={17} aria-hidden="true" />
          </span>{' '}
          THE WORK SPEAKS FIRST
        </a>
      </div>
      <SystemConstellation />
    </section>
  );
}
