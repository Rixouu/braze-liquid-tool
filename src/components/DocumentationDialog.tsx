'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { X, Eye, BookOpen, Variable, Code, AlertTriangle } from 'lucide-react';
import { Section } from '@/components/Section';
import { Template, VariableType } from '@/types';
import { cn } from '@/lib/utils';

const DOC_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'variables', label: 'Variables' },
  { id: 'examples', label: 'Examples' },
] as const;

interface DocumentationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}

export function TemplateDocumentationContent({
  template,
  className,
}: {
  template: Template;
  className?: string;
}) {
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>(DOC_SECTIONS[0].id);

  const scrollToSection = useCallback((id: string) => {
    const root = scrollBodyRef.current;
    if (!root) return;
    const el = root.querySelector(`#${id}`);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveSection(id);
  }, []);

  useEffect(() => {
    setActiveSection(DOC_SECTIONS[0].id);
    requestAnimationFrame(() => {
      const root = scrollBodyRef.current;
      if (root) root.scrollTop = 0;
    });
  }, [template.id]);

  useEffect(() => {
    let obs: IntersectionObserver | undefined;
    const tid = window.setTimeout(() => {
      const root = scrollBodyRef.current;
      if (!root) return;
      obs = new IntersectionObserver(
        (entries) => {
          const intersecting = entries
            .filter((e) => e.isIntersecting && e.target.id)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const top = intersecting[0];
          if (top?.target?.id) setActiveSection(top.target.id);
        },
        { root, rootMargin: '-12% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5, 1] },
      );
      DOC_SECTIONS.forEach(({ id }) => {
        const el = root.querySelector(`#${id}`);
        if (el) obs?.observe(el);
      });
    }, 0);
    return () => {
      window.clearTimeout(tid);
      obs?.disconnect();
    };
  }, [template.id]);

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', className)}>
      <div className="shrink-0 border-b border-border bg-card px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xl font-semibold text-foreground sm:text-2xl">{template.name}</div>
            <div className="mt-1.5 text-sm text-muted-foreground">{template.description}</div>
          </div>
        </div>

        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Documentation sections">
          {DOC_SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              aria-current={activeSection === id ? 'true' : undefined}
              className={cn(
                'touch-manipulation rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                activeSection === id
                  ? 'border-[#32026A] bg-[#32026A] text-white shadow-sm'
                  : 'border-border bg-muted/60 text-foreground hover:border-primary/40 hover:bg-muted',
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div ref={scrollBodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
        <div className="space-y-8 text-foreground">
          <Section id="overview" title="Overview" icon={<Eye className="h-6 w-6" />}>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">{template.documentation.overview}</p>
            </div>
          </Section>

          <Section id="usage" title="Usage" icon={<BookOpen className="h-6 w-6" />}>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="mb-4 text-sm text-muted-foreground">{template.documentation.usage}</p>
              <div className="rounded-md border border-amber-200/80 bg-amber-50/90 p-3">
                <h4 className="mb-2 flex items-center text-sm font-medium text-amber-900">
                  <AlertTriangle className="mr-2 h-4 w-4 shrink-0" />
                  Notes
                </h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-amber-900/90">
                  {template.documentation.notes.split('\n').map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section id="variables" title="Variables" icon={<Variable className="h-6 w-6" />}>
            <div className="grid grid-cols-1 gap-4">
              {template.documentation.variables.map((variable: VariableType, index: number) => (
                <div key={index} className="rounded-lg border border-border bg-muted/40 p-4 shadow-sm">
                  <div className="mb-2 flex items-center">
                    <span className="rounded bg-primary/15 px-2 py-1 font-mono text-sm text-primary">
                      {variable.name}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{variable.description}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="font-semibold">Type:</span> {variable.type || 'Not specified'}
                  </div>
                  {variable.example && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold text-muted-foreground">Example:</span>
                      <code className="ml-2 rounded bg-muted px-1 py-0.5 text-xs">{variable.example}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section id="examples" title="Examples" icon={<Code className="h-6 w-6" />}>
            {template.examples.map((example, index) => (
              <div key={index} className="mb-6 last:mb-0 rounded-lg border border-border bg-muted/40 p-4">
                <h4 className="mb-3 text-sm font-medium text-foreground">{example.description}</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="mb-1 text-xs font-medium text-muted-foreground">Input</h5>
                    <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 text-xs">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                  <div>
                    <h5 className="mb-1 text-xs font-medium text-muted-foreground">Output</h5>
                    <div className="rounded-md border border-border bg-background p-3 text-sm">{example.output}</div>
                  </div>
                </div>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

export function DocumentationDialog({ isOpen, onOpenChange, template }: DocumentationDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/50" />
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex h-[min(85dvh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
            <DialogTitle className="text-lg font-semibold text-foreground sm:text-xl">Template Documentation</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close documentation"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <TemplateDocumentationContent template={template} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
