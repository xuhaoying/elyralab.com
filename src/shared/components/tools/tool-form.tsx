'use client';

import { FormEvent, ReactNode } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/shared/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';

export type ToolFormValue = string | number | boolean | string[];

export interface ToolQuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface ToolQuestion {
  id: string;
  label: string;
  description?: string;
  type: 'radio' | 'select' | 'checkbox' | 'number' | 'text' | 'textarea';
  options?: ToolQuestionOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export type ToolFormValues = Record<string, ToolFormValue | undefined>;

function getStringValue(value: ToolFormValue | undefined) {
  return value == null ? '' : String(value);
}

function getStringArrayValue(value: ToolFormValue | undefined) {
  return Array.isArray(value) ? value : [];
}

function QuestionHelp({ children }: { children?: ReactNode }) {
  if (!children) {
    return null;
  }

  return <p className="text-muted-foreground text-sm leading-6">{children}</p>;
}

export function ToolForm({
  title,
  description,
  questions,
  values,
  onValueChange,
  onSubmit,
  onReset,
  submitLabel = 'Generate plan',
  resetLabel = 'Reset',
  error,
  className,
}: {
  title: string;
  description?: string;
  questions: ToolQuestion[];
  values: ToolFormValues;
  onValueChange: (id: string, value: ToolFormValue) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset?: () => void;
  submitLabel?: string;
  resetLabel?: string;
  error?: string;
  className?: string;
}) {
  return (
    <Card className={cn('rounded-lg', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <form className="space-y-7" onSubmit={onSubmit} noValidate>
          {error ? (
            <div
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
            >
              {error}
            </div>
          ) : null}

          {questions.map((question) => {
            const value = values[question.id];
            const questionId = `tool-question-${question.id}`;
            const helpId = `${questionId}-help`;

            return (
              <section
                key={question.id}
                className="space-y-3"
                aria-labelledby={questionId}
                aria-describedby={question.description ? helpId : undefined}
              >
                <div className="space-y-1">
                  <Label id={questionId} className="text-base font-semibold">
                    {question.label}
                  </Label>
                  <QuestionHelp>
                    {question.description ? (
                      <span id={helpId}>{question.description}</span>
                    ) : null}
                  </QuestionHelp>
                </div>

                {question.type === 'radio' && question.options ? (
                  <RadioGroup
                    value={getStringValue(value)}
                    onValueChange={(nextValue) =>
                      onValueChange(question.id, nextValue)
                    }
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {question.options.map((option) => {
                      const optionId = `${questionId}-${option.value}`;

                      return (
                        <div
                          key={option.value}
                          className="has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex items-start gap-3 rounded-md border p-3 transition-colors"
                        >
                          <RadioGroupItem
                            id={optionId}
                            value={option.value}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={optionId}
                            className="min-w-0 flex-1 cursor-pointer space-y-1 text-sm leading-5"
                          >
                            <span className="block font-medium">
                              {option.label}
                            </span>
                            {option.description ? (
                              <span className="text-muted-foreground block text-xs leading-5">
                                {option.description}
                              </span>
                            ) : null}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                ) : null}

                {question.type === 'select' && question.options ? (
                  <Select
                    value={getStringValue(value)}
                    onValueChange={(nextValue) =>
                      onValueChange(question.id, nextValue)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={question.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}

                {question.type === 'checkbox' && question.options ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {question.options.map((option) => {
                      const selectedValues = getStringArrayValue(value);
                      const checked = selectedValues.includes(option.value);
                      const optionId = `${questionId}-${option.value}`;

                      return (
                        <div
                          key={option.value}
                          className="has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex items-start gap-3 rounded-md border p-3 transition-colors"
                        >
                          <Checkbox
                            id={optionId}
                            checked={checked}
                            onCheckedChange={(nextChecked) => {
                              const nextValues =
                                nextChecked === true
                                  ? [...selectedValues, option.value]
                                  : selectedValues.filter(
                                      (item) => item !== option.value
                                    );

                              onValueChange(question.id, nextValues);
                            }}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={optionId}
                            className="min-w-0 flex-1 cursor-pointer space-y-1 text-sm leading-5"
                          >
                            <span className="block font-medium">
                              {option.label}
                            </span>
                            {option.description ? (
                              <span className="text-muted-foreground block text-xs leading-5">
                                {option.description}
                              </span>
                            ) : null}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {question.type === 'checkbox' && !question.options ? (
                  <div className="flex items-start gap-3 rounded-md border p-3">
                    <Checkbox
                      id={`${questionId}-single`}
                      checked={value === true}
                      onCheckedChange={(nextChecked) =>
                        onValueChange(question.id, nextChecked === true)
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`${questionId}-single`}
                      className="min-w-0 flex-1 cursor-pointer text-sm leading-6"
                    >
                      {question.placeholder || question.label}
                    </Label>
                  </div>
                ) : null}

                {question.type === 'text' || question.type === 'number' ? (
                  <Input
                    id={`${questionId}-input`}
                    type={question.type === 'number' ? 'number' : 'text'}
                    inputMode={question.type === 'number' ? 'numeric' : 'text'}
                    value={getStringValue(value)}
                    min={question.min}
                    max={question.max}
                    step={question.step}
                    placeholder={question.placeholder}
                    onChange={(event) =>
                      onValueChange(question.id, event.target.value)
                    }
                  />
                ) : null}

                {question.type === 'textarea' ? (
                  <Textarea
                    id={`${questionId}-textarea`}
                    value={getStringValue(value)}
                    placeholder={question.placeholder}
                    onChange={(event) =>
                      onValueChange(question.id, event.target.value)
                    }
                  />
                ) : null}
              </section>
            );
          })}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {onReset ? (
              <Button type="button" variant="outline" onClick={onReset}>
                <RotateCcw className="size-4" />
                {resetLabel}
              </Button>
            ) : null}
            <Button type="submit">
              <Sparkles className="size-4" />
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
