import { ToolFAQItem } from '@/lib/tools';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';

export function ToolFAQ({
  title = 'Frequently asked questions',
  items,
}: {
  title?: string;
  items: ToolFAQItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="container py-12 md:py-16" aria-labelledby="tool-faq-heading">
      <div className="mx-auto max-w-3xl space-y-6">
        <h2 id="tool-faq-heading" className="text-2xl font-semibold">
          {title}
        </h2>
        <Accordion type="single" collapsible className="rounded-lg border px-4">
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
