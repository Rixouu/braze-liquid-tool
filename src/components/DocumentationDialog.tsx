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
import { X, Eye, BookOpen, Variable, Code, AlertTriangle } from 'lucide-react';
import { Section } from '@/components/Section';
import { Template, VariableType } from '@/types';

interface DocumentationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}

export function DocumentationDialog({ isOpen, onOpenChange, template }: DocumentationDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-black z-10">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {template.name}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {template.description}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon" 
                onClick={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex space-x-4 mt-4">
              {['Overview', 'Usage', 'Variables', 'Examples'].map((section) => (
                <a
                  key={section}
                  href={`#${section.toLowerCase()}`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {section}
                </a>
              ))}
            </nav>
          </div>

          <div className="p-6 space-y-8 dark:text-gray-200">
            <Section id="overview" title="Overview" icon={<Eye className="h-6 w-6" />}>
              <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">{template.documentation.overview}</p>
              </div>
            </Section>

            <Section id="usage" title="Usage" icon={<BookOpen className="h-6 w-6" />}>
              <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{template.documentation.usage}</p>
                <div className="bg-yellow-50 dark:bg-[#1e1e1e] p-3 rounded-md">
                  <h4 className="font-medium mb-2 text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Notes:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
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
                  <div key={index} className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center mb-2">
                      <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {variable.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{variable.description}</p>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Type:</span> {variable.type || 'Not specified'}
                    </div>
                    {variable.example && (
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Example:</span>
                        <code className="ml-2 text-xs bg-gray-100 dark:bg-gray-600 px-1 py-0.5 rounded">
                          {variable.example}
                        </code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            <Section id="examples" title="Examples" icon={<Code className="h-6 w-6" />}>
              {template.examples.map((example, index) => (
                <div key={index} className="mb-6 last:mb-0 bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3 text-sm text-gray-700 dark:text-gray-200">{example.description}</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1 text-xs text-gray-500 dark:text-gray-400">Input:</h5>
                      <pre className="bg-gray-100 dark:bg-gray-600 p-3 rounded-md overflow-x-auto text-xs">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1 text-xs text-gray-500 dark:text-gray-400">Output:</h5>
                      <div className="bg-white dark:bg-[#0d0d0d] p-3 rounded-md text-sm border border-gray-200 dark:border-gray-700">
                        {example.output}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 