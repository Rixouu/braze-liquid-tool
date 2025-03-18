'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "@radix-ui/react-dialog";
import { Button } from '@/components/ui/button';
import { X, BookOpen, Code, Lightbulb } from 'lucide-react';
import { Section } from '@/components/Section';

interface GeneralDocumentationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeneralDocumentationDialog({ isOpen, onOpenChange }: GeneralDocumentationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-black z-10">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                General Documentation
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <DialogDescription className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              General information about Liquid syntax and usage
            </DialogDescription>
            <nav className="flex space-x-4 mt-4">
              {['Introduction', 'Syntax', 'Use Cases'].map((section) => (
                <a
                  key={section}
                  href={`#general-${section.toLowerCase()}`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {section}
                </a>
              ))}
            </nav>
          </div>

          <div className="p-6 space-y-8 dark:text-gray-200">
            <Section id="general-introduction" title="Introduction to Liquid" icon={<BookOpen className="h-6 w-6" />}>
              <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Liquid is a template language created by Shopify and written in Ruby. It is now used by many systems, including Jekyll, a static site generator. Liquid uses a combination of tags, objects, and filters to load dynamic content.
                </p>
              </div>
            </Section>

            <Section id="general-syntax" title="Basic Syntax" icon={<Code className="h-6 w-6" />}>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Output</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Output tags are used to display content on the page. They are denoted by double curly braces:</p>
                  <pre className="bg-gray-100 dark:bg-[#0d0d0d] p-2 rounded-md text-sm">
                    <code>&#123;&#123; variable_name &#125;&#125;</code>
                  </pre>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Tags</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Tags are used for logic and control flow. They are denoted by curly brace percentage signs:</p>
                  <pre className="bg-gray-100 dark:bg-[#0d0d0d] p-2 rounded-md text-sm">
                    <code>&#123;% if condition %&#125;
  // content
  &#123;% endif %&#125;</code>
                  </pre>
                </div>
              </div>
            </Section>

            <Section id="general-use-cases" title="Common Use Cases" icon={<Lightbulb className="h-6 w-6" />}>
              <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
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
      </DialogContent>
    </Dialog>
  );
} 