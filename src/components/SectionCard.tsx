import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

function SectionCard({ title, actionLabel, onAction, children }: SectionCardProps) {
  return (
    <section className="section-card">
      <div className="section-header">
        <h2>{title}</h2>
        {actionLabel && onAction ? (
          <button type="button" className="ghost-button" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

export default SectionCard;
