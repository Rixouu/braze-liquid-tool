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
import { X, BookOpen, Code, Lightbulb } from 'lucide-react';
import { Section } from '@/components/Section';
import { cn } from '@/lib/utils';

const GENERAL_SECTIONS = [
  { id: 'general-introduction', label: 'Introduction' },
  { id: 'general-syntax', label: 'Syntax' },
  { id: 'general-use-cases', label: 'Use cases' },
] as const;

interface GeneralDocumentationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeneralDocumentationDialog({ isOpen, onOpenChange }: GeneralDocumentationDialogProps) {
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>(GENERAL_SECTIONS[0].id);

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
    if (!isOpen) return;
    setActiveSection(GENERAL_SECTIONS[0].id);
    requestAnimationFrame(() => {
      const root = scrollBodyRef.current;
      if (root) root.scrollTop = 0;
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
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
      GENERAL_SECTIONS.forEach(({ id }) => {
        const el = root.querySelector(`#${id}`);
        if (el) obs?.observe(el);
      });
    }, 0);
    return () => {
      window.clearTimeout(tid);
      obs?.disconnect();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/50" />
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex h-[min(85dvh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="shrink-0 border-b border-border bg-card px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-xl font-semibold text-foreground sm:text-2xl">
                General Documentation
              </DialogTitle>
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
            <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
              General information about Liquid syntax and usage
            </DialogDescription>

            <nav className="mt-4 flex flex-wrap gap-2" aria-label="Documentation sections">
              {GENERAL_SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  aria-current={activeSection === id ? 'true' : undefined}
                  className={cn(
                    'touch-manipulation rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    activeSection === id
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-muted/60 text-foreground hover:border-primary/40 hover:bg-muted',
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div
            ref={scrollBodyRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
          >
            <div className="space-y-8 text-foreground">
              <Section id="general-introduction" title="Introduction to Liquid" icon={<BookOpen className="h-6 w-6" />}>
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">
                    Liquid is a template language created by Shopify and written in Ruby. It is now used by many
                    systems, including Jekyll, a static site generator. Liquid uses a combination of tags, objects, and
                    filters to load dynamic content.
                  </p>
                </div>
              </Section>

              <Section id="general-syntax" title="Basic Syntax" icon={<Code className="h-6 w-6" />}>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/40 p-4">
                    <h4 className="mb-2 font-semibold text-foreground">Output</h4>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Output tags are used to display content on the page. They are denoted by double curly braces:
                    </p>
                    <pre className="rounded-md border border-border bg-background p-2 text-sm">
                      <code>&#123;&#123; variable_name &#125;&#125;</code>
                    </pre>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/40 p-4">
                    <h4 className="mb-2 font-semibold text-foreground">Tags</h4>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Tags are used for logic and control flow. They are denoted by curly brace percentage signs:
                    </p>
                    <pre className="rounded-md border border-border bg-background p-2 text-sm">
                      <code>
                        &#123;% if condition %&#125;
                        {'\n'} // content
                        {'\n'}&#123;% endif %&#125;
                      </code>
                    </pre>
                  </div>
                </div>
              </Section>

              <Section id="general-use-cases" title="Common Use Cases" icon={<Lightbulb className="h-6 w-6" />}>
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                    <li>Displaying user-specific data</li>
                    <li>Conditional rendering based on user attributes</li>
                    <li>Formatting dates and times</li>
                    <li>Creating loops for repetitive content</li>
                    <li>Applying text transformations</li>
                  </ul>
                </div>
              </Section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
