export interface SEOContentSection {
  title: string;
  body?: string;
  items?: string[];
}

export function SEOContent({
  title = 'Helpful notes',
  intro,
  sections,
}: {
  title?: string;
  intro?: string;
  sections: SEOContentSection[];
}) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border p-5 md:p-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        {intro ? (
          <p className="text-muted-foreground text-sm leading-6">{intro}</p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h3 className="text-base font-semibold">{section.title}</h3>
            {section.body ? (
              <p className="text-muted-foreground text-sm leading-6">
                {section.body}
              </p>
            ) : null}
            {section.items && section.items.length > 0 ? (
              <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm leading-6">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </section>
  );
}
