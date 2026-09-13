import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const technologies = [
  { name: 'TypeScript', position: 'top-[4%] left-1/2 -translate-x-1/2' },
  { name: 'JavaScript', position: 'top-[23%] right-0' },
  { name: 'Python', position: 'top-[48%] right-0' },
  { name: 'Java', position: 'top-[73%] right-[6%]' },
  { name: 'Flask', position: 'bottom-[2%] right-[12%]' },
  { name: 'Django', position: 'bottom-[2%] left-[12%]' },
  { name: 'SQL', position: 'top-[73%] left-[6%]' },
  { name: 'MongoDB', position: 'top-[48%] left-0' },
  { name: 'React', position: 'top-[23%] left-0' },
] as const;

const domains = [
  {
    name: 'Interfaces',
    caption: 'React · React Native · HTML5 · CSS3',
    color: [120, 229, 239],
  },
  {
    name: 'Systems',
    caption: 'Node.js · Flask · Django · MongoDB · SQL',
    color: [161, 157, 255],
  },
  {
    name: 'Security',
    caption: 'Linux · HTTPS · SHA-256',
    color: [224, 186, 128],
  },
];

// A perspective-projected Fibonacci sphere: lightweight Canvas 2D, no 3D dependency.
// Coordinates describe a geometric constellation, not live infrastructure or telemetry.
export default function SystemConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0.4);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (event: MediaQueryListEvent) => setPaused(event.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeContext = canvas.getContext('2d');
    if (!maybeContext) return;
    const context = maybeContext;
    const points = Array.from({ length: 150 }, (_, i) => {
      const y = 1 - (i / 149) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = Math.PI * (3 - Math.sqrt(5)) * i;
      return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
    });
    let frame = 0;
    let width = 0;
    let height = 0;
    let lastTime = 0;
    let visible = true;
    const color = domains[selected].color.join(',');
    function render(time: number) {
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      if (!paused) phaseRef.current += delta * 0.1;
      context.clearRect(0, 0, width, height);
      const angle = phaseRef.current;
      const size = Math.min(width * 0.36, height * 0.37);
      const transformed = points.map((point) => {
        const x = point.x * Math.cos(angle) - point.z * Math.sin(angle);
        const z = point.x * Math.sin(angle) + point.z * Math.cos(angle);
        const y = point.y * Math.cos(0.25) - z * Math.sin(0.25);
        const depth = point.y * Math.sin(0.25) + z * Math.cos(0.25);
        const scale = 2.8 / (2.8 - depth * 0.4);
        return {
          x: width / 2 + x * size * scale,
          y: height / 2 + y * size * scale,
          z: depth,
        };
      });
      for (let i = 0; i < points.length; i++) {
        const a = transformed[i];
        for (let j = i + 1; j < points.length; j++) {
          const p = points[i],
            q = points[j];
          const distance =
            (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2;
          if (distance > 0.19) continue;
          const b = transformed[j];
          const alpha = 0.06 + (a.z + b.z + 2) * 0.065;
          context.strokeStyle = `rgba(${color},${alpha})`;
          context.lineWidth = 0.6;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
      for (const point of transformed) {
        context.fillStyle = `rgba(${color},${0.2 + (point.z + 1) * 0.4})`;
        context.beginPath();
        context.arc(point.x, point.y, point.z > 0.5 ? 2 : 1.2, 0, Math.PI * 2);
        context.fill();
      }
      if (!paused && visible && !document.hidden)
        frame = requestAnimationFrame(render);
    }
    function restart() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      render(performance.now());
    }
    const observer = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      restart();
    });
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    });
    observer.observe(canvas);
    visibility.observe(canvas);
    document.addEventListener('visibilitychange', restart);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', restart);
    };
  }, [paused, selected]);

  return (
    <div className={`constellation constellation-${selected}`}>
      <div className="constellation-top">
        <span>CONNECTED BY CURIOSITY</span>
        <button
          onClick={() => setPaused(!paused)}
          aria-label={
            paused
              ? 'Play constellation animation'
              : 'Pause constellation animation'
          }
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
        </button>
      </div>
      <div className="constellation-stage">
        <canvas ref={canvasRef} aria-hidden="true" />
        <span className="constellation-core" aria-hidden="true">
          jb<span>.</span>
        </span>
        <ul
          className="absolute inset-0 m-0 list-none p-0"
          aria-label="Languages, frameworks, and databases I have worked with or studied"
        >
          {technologies.map((technology) => (
            <li
              key={technology.name}
              className={`graph-label ${technology.position}`}
            >
              {technology.name}
            </li>
          ))}
        </ul>
      </div>
      <div
        className="domain-selector"
        role="group"
        aria-label="Explore technical focus"
      >
        {domains.map((domain, index) => (
          <button
            key={domain.name}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span>0{index + 1}</span>
            {domain.name}
          </button>
        ))}
      </div>
      <p className="domain-caption" aria-live="polite">
        {domains[selected].caption}
      </p>
    </div>
  );
}
