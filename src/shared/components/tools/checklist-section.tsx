export interface ChecklistGroup {
  title: string;
  description?: string;
  items: string[];
}

export function ChecklistSection({
  title,
  description,
  sections,
}: {
  title?: string;
  description?: string;
  sections: ChecklistGroup[];
}) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      {title || description ? (
        <div className="space-y-1">
          {title ? <h3 className="text-lg font-semibold">{title}</h3> : null}
          {description ? (
            <p className="text-muted-foreground text-sm leading-6">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4">
        {sections.map((section) => (
          <section key={section.title} className="rounded-md border p-4" data-print-block>
            <div className="space-y-1">
              <h4 className="font-semibold">{section.title}</h4>
              {section.description ? (
                <p className="text-muted-foreground text-sm leading-6">
                  {section.description}
                </p>
              ) : null}
            </div>
            <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
