interface FullscreenStateProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function FullscreenState({ eyebrow, title, description }: FullscreenStateProps) {
  return (
    <section className="fullscreen-state">
      <div className="fullscreen-state__card">
        <p className="section-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="section-copy">{description}</p>
      </div>
    </section>
  );
}
