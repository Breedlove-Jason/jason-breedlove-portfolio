import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const links = [
  ['01', 'Work', '#projects'],
  ['02', 'Expertise', '#expertise'],
  ['03', 'Service', '#experience'],
  ['04', 'About', '#about'],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        document.getElementById('menu-toggle')?.focus();
      }
    };
    if (open) document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [open]);
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a
          href="#home"
          className="brand"
          aria-label="Jason Breedlove, home"
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark">
            jb<span>.</span>
          </span>
          <span className="brand-name">
            JASON BREEDLOVE<span>SECURITY · SOFTWARE · SERVICE</span>
          </span>
        </a>
        <button
          id="menu-toggle"
          className="menu-toggle"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={open ? 'main-nav is-open' : 'main-nav'}
        >
          {links.map(([number, label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              <span>{number}</span>
              {label}
            </a>
          ))}
          <a
            href="#contact"
            className="nav-contact"
            onClick={() => setOpen(false)}
          >
            Let’s connect <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
}
