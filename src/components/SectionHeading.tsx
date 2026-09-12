import type { ReactNode } from 'react';

interface SectionHeadingProps {
  number: string;
  label: string;
  title: ReactNode;
  children?: ReactNode;
}

export default function SectionHeading({
  number,
  label,
  title,
  children,
}: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span>{number}</span> / {label}
        </p>
        <h2>{title}</h2>
      </div>
      {children && <p className="section-description">{children}</p>}
    </div>
  );
}
