'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Library, SlidersHorizontal, Braces, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SampleDataEditor from '@/components/ui/SampleDataEditor';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import HighlightedLiquidEditor from './HighlightedLiquidEditor';
import LiquidPreview from './LiquidPreview';
import { DocumentationDialog } from './DocumentationDialog';
import { GeneralDocumentationDialog } from './GeneralDocumentationDialog';
import { engine } from '@/lib/liquid-engine';
import type { Template } from '@/types';
import { templates } from '@/templates/templateData';
import { cn } from '@/lib/utils';

const MOBILE_PAGES = [
  { value: 'editor' as const, label: 'Editor', Icon: Braces },
  { value: 'preview' as const, label: 'Preview', Icon: Eye },
  { value: 'snippets' as const, label: 'Snippets', Icon: Library },
  { value: 'vars' as const, label: 'Vars', Icon: SlidersHorizontal },
] as const;

type MobilePage = (typeof MOBILE_PAGES)[number]['value'];

function TemplateInfoBody({ template }: { template: Template }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 text-lg font-semibold">{template.name}</h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold">Variables</h4>
        <div className="grid grid-cols-1 gap-2">
          {template.documentation.variables.map((variable, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-muted/40 p-3 shadow-sm"
            >
              <div className="mb-1 flex items-center">
                <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-sm text-primary">
                  {variable.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{variable.description}</p>
              {variable.example && (
                <div className="mt-1">
                  <span className="text-xs font-semibold text-muted-foreground">Example:</span>
                  <code className="ml-1 rounded bg-muted px-1 py-0.5 text-xs">{variable.example}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold">Tips</h4>
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <ul className="space-y-1">
            {template.documentation.notes.split('\n').map((note, index) => (
              <li key={index} className="flex items-start text-xs text-foreground">
                <span className="mr-2 text-primary">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function LiquidSyntaxEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editableSampleData, setEditableSampleData] = useState<Record<string, any>>({});
  const [previewContent, setPreviewContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
  const [isGeneralDocumentationOpen, setIsGeneralDocumentationOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [mobilePage, setMobilePage] = useState<MobilePage>('snippets');
  const [desktopTab, setDesktopTab] = useState<'editor' | 'snippets' | 'docs'>('editor');

  const flattenObject = useCallback((obj: Record<string, any>, prefix = ''): Record<string, any> => {
    return Object.keys(obj).reduce(
      (acc, k) => {
        const pre = prefix.length ? `${prefix}.` : '';
        const v = obj[k];
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          Object.assign(acc, flattenObject(v as Record<string, any>, `${pre}${k}`));
        } else {
          acc[`${pre}${k}`] = v;
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }, []);

  const updatePreview = useCallback(
    async (content: string, data: Record<string, any>) => {
      setIsLoading(true);
      setError(null);
      try {
        const liquidContent = content.replace(/\[\[(.*?)\]\]/g, '{{$1}}');
        const flattenedData = flattenObject(data);
        Object.keys(flattenedData).forEach((key) => {
          const val = flattenedData[key];
          if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
            flattenedData[key] = new Date(val);
          }
        });
        const renderedContent = await engine.parseAndRender(liquidContent, flattenedData);
        setPreviewContent(renderedContent);
      } catch (err: unknown) {
        setError(`Error rendering template: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    },
    [flattenObject],
  );

  const handleSampleDataChange = useCallback(
    (newData: Record<string, any>) => {
      setEditableSampleData(newData);

      let updatedContent = selectedTemplate ? selectedTemplate.content : editedContent;
      const updateContentWithData = (data: Record<string, any>, prefix = '') => {
        Object.entries(data).forEach(([key, value]) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            updateContentWithData(value as Record<string, any>, fullKey);
          } else {
            const regex = new RegExp(`\\[\\[${fullKey}\\]\\]`, 'g');
            updatedContent = updatedContent.replace(regex, String(value));
          }
        });
      };

      updateContentWithData(newData);
      setEditedContent(updatedContent);
      updatePreview(updatedContent, newData);
    },
    [selectedTemplate, editedContent, updatePreview],
  );

  const handleContentChange = useCallback((newContent: string) => {
    setEditedContent(newContent);
  }, []);

  useEffect(() => {
    updatePreview(editedContent, editableSampleData);
  }, [editedContent, editableSampleData, updatePreview]);

  const handleTemplateChange = useCallback(
    (template: Template) => {
      setSelectedTemplate(template);
      setSelectedTemplateId(template.id);
      setEditableSampleData(template.sampleData);

      let updatedContent = template.content;
      const updateContentWithData = (data: Record<string, any>, prefix = '') => {
        Object.entries(data).forEach(([key, value]) => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            updateContentWithData(value as Record<string, any>, fullKey);
          } else {
            const regex = new RegExp(`\\[\\[${fullKey}\\]\\]`, 'g');
            updatedContent = updatedContent.replace(regex, String(value));
          }
        });
      };

      updateContentWithData(template.sampleData as Record<string, any>);
      setEditedContent(updatedContent);
      updatePreview(updatedContent, template.sampleData as Record<string, any>);
      setMobilePage('vars');
    },
    [updatePreview],
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const handleCopy = () => {
    const finalContent = editedContent.replace(/\[\[(.*?)\]\]/g, '{{$1}}');
    void navigator.clipboard.writeText(finalContent);
  };

  const handleReset = () => {
    if (selectedTemplate) {
      setEditedContent(selectedTemplate.content);
      setEditableSampleData(selectedTemplate.sampleData as Record<string, any>);
    }
  };

  const editorStyle = useMemo(
    () => ({
      minHeight: 0,
      height: '100%',
      padding: '0.75rem',
      lineHeight: '1.5',
      fontSize: '0.875rem',
    }),
    [],
  );

  const editorStyleLg = useMemo(
    () => ({
      minHeight: '560px',
      padding: '1rem',
      lineHeight: '1.5',
      fontSize: '0.875rem',
    }),
    [],
  );

  const templateInfoPopover = (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-10 touch-manipulation sm:min-h-9">
          Template Info
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[min(80dvh,32rem)] w-[min(100vw-2rem,24rem)] max-w-[calc(100vw-1.5rem)] overflow-y-auto p-4">
        {selectedTemplate ? <TemplateInfoBody template={selectedTemplate} /> : (
          <p className="text-sm text-muted-foreground">Select a template to see details.</p>
        )}
      </PopoverContent>
    </Popover>
  );

  const flatSampleData = useMemo(() => flattenObject(editableSampleData), [editableSampleData, flattenObject]);
  const variableCount = useMemo(() => Object.keys(flatSampleData).length, [flatSampleData]);
  const lineCount = useMemo(() => (editedContent ? editedContent.split('\n').length : 0), [editedContent]);
  const errorCount = useMemo(() => (error ? 1 : 0), [error]);

  const groupedTemplates = useMemo(() => {
    const groups = new Map<string, Template[]>();
    for (const t of filteredTemplates) {
      const key = t.category || 'Other';
      const list = groups.get(key);
      if (list) list.push(t);
      else groups.set(key, [t]);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTemplates]);

  const categoryDotClass = useCallback((category: string) => {
    const palette = ['bg-violet-600', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'] as const;
    let hash = 0;
    for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) | 0;
    const idx = Math.abs(hash) % palette.length;
    return palette[idx];
  }, []);

  const onRender = useCallback(() => {
    void updatePreview(editedContent, editableSampleData);
  }, [editedContent, editableSampleData, updatePreview]);

  return (
    <div className="min-h-svh bg-[#F0EDF8] text-[#1A0E3A]">
      <div className="hidden min-h-svh flex-col lg:flex">
        <div className="flex items-center justify-between border-b border-[#E4DFF4] bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-800">
              <img src="/imgs/braze-icon-white.svg" alt="" className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#1A0E3A]">Braze Liquid Editor</span>
              <div className="h-4 w-px bg-[#E4DFF4]" />
              <span className="rounded-full border border-[#DDD6FE] bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-semibold tracking-widest text-[#6D28D9]">
                LIQUID 5
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[#E4DFF4] bg-[#F5F3FF] p-1">
            <button
              type="button"
              onClick={() => setDesktopTab('editor')}
              className={cn(
                'rounded-md px-4 py-1.5 text-xs font-semibold',
                desktopTab === 'editor'
                  ? 'bg-white text-[#6D28D9] shadow-[0_1px_3px_rgba(109,40,217,0.10)]'
                  : 'text-[#8B7BAA]',
              )}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setDesktopTab('snippets')}
              className={cn(
                'rounded-md px-4 py-1.5 text-xs font-semibold',
                desktopTab === 'snippets'
                  ? 'bg-white text-[#6D28D9] shadow-[0_1px_3px_rgba(109,40,217,0.10)]'
                  : 'text-[#8B7BAA]',
              )}
            >
              Snippets
            </button>
            <button
              type="button"
              className={cn(
                'rounded-md px-4 py-1.5 text-xs font-semibold',
                desktopTab === 'docs'
                  ? 'bg-white text-[#6D28D9] shadow-[0_1px_3px_rgba(109,40,217,0.10)]'
                  : 'text-[#8B7BAA]',
              )}
              onClick={() => {
                setDesktopTab('docs');
                setIsGeneralDocumentationOpen(true);
              }}
            >
              Docs
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-[#DDD6FE] bg-white px-3 py-1.5 text-xs font-semibold text-[#6D28D9]"
              onClick={() => setIsDocumentationOpen(true)}
            >
              Template Docs
            </button>
            <button
              type="button"
              className="rounded-lg border border-[#DDD6FE] bg-white px-3 py-1.5 text-xs font-semibold text-[#6D28D9]"
              onClick={() => setIsGeneralDocumentationOpen(true)}
            >
              General Docs
            </button>
            <button
              type="button"
              className="rounded-lg border border-[#DDD6FE] bg-white px-3 py-1.5 text-xs font-semibold text-[#6D28D9]"
              onClick={handleCopy}
            >
              Copy
            </button>
            <button
              type="button"
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
              onClick={onRender}
            >
              Render
            </button>
          </div>
        </div>

        {desktopTab === 'editor' ? (
          <div className="grid flex-1 grid-cols-[220px_minmax(0,1fr)_260px] overflow-hidden">
            <div className="flex flex-col overflow-hidden border-r border-[#E4DFF4] bg-[#FAFAFA]">
              <div className="border-b border-[#EDE9FE] px-4 pb-3 pt-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B1D7A]">
                  Snippets
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-[#DDD6FE] bg-white px-3 py-2">
                  <Input
                    type="search"
                    placeholder="Search templates…"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="h-auto border-0 bg-transparent p-0 text-sm text-[#3B1D7A] shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="px-0 py-2">
                  {groupedTemplates.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-[#A89CC8]">No templates found</div>
                  ) : (
                    groupedTemplates.map(([category, items]) => (
                      <div key={category} className="mb-2">
                        <div className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4B8E0]">
                          {category}
                        </div>
                        {items.map((t) => {
                          const active = selectedTemplateId === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleTemplateChange(t)}
                              className={cn(
                                'flex w-full items-center gap-2 px-4 py-2 text-left transition-colors',
                                active ? 'bg-[#EDE9FE]' : 'hover:bg-[#F5F3FF]',
                              )}
                            >
                              <span className={cn('h-2 w-2 rounded-sm', categoryDotClass(category))} aria-hidden />
                              <span
                                className={cn(
                                  'truncate text-sm',
                                  active ? 'font-medium text-[#6D28D9]' : 'text-[#4A3070]',
                                )}
                              >
                                {t.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="grid min-h-0 grid-rows-2 overflow-hidden">
            <div className="flex min-h-0 flex-col overflow-hidden border-b border-[#E4DFF4]">
              <div className="flex items-center justify-between border-b border-[#EEE8FF] bg-white px-4 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B1D7A]">
                  Liquid template
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-1 text-[11px] font-semibold text-[#7C3AED]"
                    onClick={handleCopy}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-1 text-[11px] font-semibold text-[#7C3AED]"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden bg-[#1E1433]">
                <HighlightedLiquidEditor
                  value={editedContent}
                  onChange={handleContentChange}
                  className="h-full w-full"
                  options={{ style: editorStyleLg }}
                />
              </div>
              <div className="flex items-center gap-2 border-t border-[#FED7AA] bg-[#FFF7ED] px-4 py-2 text-xs text-[#92400E]">
                {error ? (
                  <>
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <span className="truncate">Render error</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                    <span className="truncate text-emerald-700">
                      No errors · {lineCount} lines · {variableCount} variables
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex min-h-0 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#EEE8FF] bg-white px-4 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B1D7A]">
                  Rendered preview
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-1 text-[11px] font-semibold text-[#7C3AED]"
                    onClick={onRender}
                  >
                    Re-render
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto bg-white">
                {isLoading ? (
                  <div className="flex h-full min-h-[200px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                  </div>
                ) : error ? (
                  <div className="p-4">
                    <Alert variant="destructive">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-xs">{error}</pre>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="p-2">
                    <LiquidPreview text={previewContent} />
                  </div>
                )}
              </div>
            </div>
          </div>

            <div className="flex flex-col overflow-hidden border-l border-[#E4DFF4] bg-[#FAFAFA]">
            <div className="border-b border-[#EDE9FE] px-4 pb-3 pt-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B1D7A]">
                Test variables
              </div>
              <div className="mt-1 text-[11px] text-[#A89CC8]">Override attribute values for preview</div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="px-4 py-4">
                <SampleDataEditor sampleData={editableSampleData} onChange={handleSampleDataChange} />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-[#E4DFF4] bg-white px-3 py-2 text-center">
                    <div className="font-mono text-lg font-semibold text-[#3B1D7A]">{variableCount}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A89CC8]">Variables</div>
                  </div>
                  <div className="rounded-xl border border-[#E4DFF4] bg-white px-3 py-2 text-center">
                    <div className="font-mono text-lg font-semibold text-[#3B1D7A]">{lineCount}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A89CC8]">Lines</div>
                  </div>
                  <div className="rounded-xl border border-[#E4DFF4] bg-white px-3 py-2 text-center">
                    <div className="font-mono text-lg font-semibold text-[#3B1D7A]">{errorCount}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A89CC8]">Errors</div>
                  </div>
                  <div className="rounded-xl border border-[#E4DFF4] bg-white px-3 py-2 text-center">
                    <div className="font-mono text-lg font-semibold text-[#3B1D7A]">{selectedTemplate ? '1' : '0'}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A89CC8]">Template</div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="px-4 pb-4">
              <button
                type="button"
                className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white"
                onClick={onRender}
              >
                Render preview
              </button>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-2 text-xs font-semibold text-[#6D28D9]"
                  onClick={handleCopy}
                >
                  Copy template
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-2 text-xs font-semibold text-[#6D28D9]"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          </div>
        ) : desktopTab === 'snippets' ? (
          <div className="grid flex-1 grid-cols-[220px_minmax(0,1fr)] overflow-hidden">
            <div className="flex flex-col overflow-hidden border-r border-[#E4DFF4] bg-[#FAFAFA]">
              <div className="border-b border-[#EDE9FE] px-4 pb-3 pt-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B1D7A]">
                  Snippets
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-[#DDD6FE] bg-white px-3 py-2">
                  <Input
                    type="search"
                    placeholder="Search templates…"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="h-auto border-0 bg-transparent p-0 text-sm text-[#3B1D7A] shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="px-0 py-2">
                  {groupedTemplates.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-[#A89CC8]">No templates found</div>
                  ) : (
                    groupedTemplates.map(([category, items]) => (
                      <div key={category} className="mb-2">
                        <div className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4B8E0]">
                          {category}
                        </div>
                        {items.map((t) => {
                          const active = selectedTemplateId === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleTemplateChange(t)}
                              className={cn(
                                'flex w-full items-center gap-2 px-4 py-2 text-left transition-colors',
                                active ? 'bg-[#EDE9FE]' : 'hover:bg-[#F5F3FF]',
                              )}
                            >
                              <span className={cn('h-2 w-2 rounded-sm', categoryDotClass(category))} aria-hidden />
                              <span
                                className={cn(
                                  'truncate text-sm',
                                  active ? 'font-medium text-[#6D28D9]' : 'text-[#4A3070]',
                                )}
                              >
                                {t.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="min-h-0 overflow-auto p-6">
              <div className="mx-auto max-w-3xl">
                <div className="rounded-2xl border border-[#E4DFF4] bg-white p-6">
                  {selectedTemplate ? (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold text-[#1A0E3A]">{selectedTemplate.name}</h2>
                          <p className="mt-1 text-sm text-[#8B7BAA]">{selectedTemplate.description}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-[#DDD6FE] bg-white px-3 py-2 text-xs font-semibold text-[#6D28D9]"
                            onClick={() => setIsDocumentationOpen(true)}
                          >
                            Template Docs
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
                            onClick={() => setDesktopTab('editor')}
                          >
                            Open in Editor
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#EDE9FE] bg-[#FAFAFA] p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B1D7A]">
                          Variables
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {Object.keys(flatSampleData).length === 0 ? (
                            <div className="text-sm text-[#A89CC8]">No sample data for this template.</div>
                          ) : (
                            Object.entries(flatSampleData).map(([k, v]) => (
                              <div key={k} className="flex min-w-0 items-center gap-2">
                                <span className="min-w-0 flex-1 truncate rounded-lg border border-[#DDD6FE] bg-[#EDE9FE] px-2 py-1 font-mono text-[11px] text-[#6D28D9]">
                                  {k}
                                </span>
                                <span className="shrink-0 text-xs text-[#C4B8E0]">=</span>
                                <span className="min-w-0 flex-1 truncate rounded-lg border border-[#DDD6FE] bg-white px-2 py-1 font-mono text-[11px] text-[#2D1B6B]">
                                  {String(v)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#E4DFF4] bg-white p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3B1D7A]">
                          Sample Data
                        </div>
                        <div className="mt-3">
                          <SampleDataEditor sampleData={editableSampleData} onChange={handleSampleDataChange} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[#8B7BAA]">Select a template on the left to see details.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-xl rounded-2xl border border-[#E4DFF4] bg-white p-6">
              <h2 className="text-lg font-semibold text-[#1A0E3A]">Documentation</h2>
              <p className="mt-1 text-sm text-[#8B7BAA]">Open the general Liquid guide or template-specific docs.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setIsGeneralDocumentationOpen(true)}
                >
                  General Docs
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#DDD6FE] bg-white px-4 py-2 text-sm font-semibold text-[#6D28D9]"
                  onClick={() => setIsDocumentationOpen(true)}
                >
                  Template Docs
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#DDD6FE] bg-white px-4 py-2 text-sm font-semibold text-[#6D28D9]"
                  onClick={() => setDesktopTab('editor')}
                >
                  Back to Editor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-svh flex-col bg-[#E8E2F8] lg:hidden">
        <div className="border-b border-[#EDE9FE] bg-[#F5F3FF] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-800">
                <img src="/imgs/braze-icon-white.svg" alt="" className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#1A0E3A]">Liquid Editor</span>
                <span className="rounded-lg border border-[#DDD6FE] bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-semibold text-[#6D28D9]">
                  Liquid 5
                </span>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
              onClick={onRender}
            >
              Render
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-[#EDE9FE]">
          <div className="h-full overflow-y-auto px-3 py-3">
            {mobilePage === 'editor' ? (
              <div className="overflow-hidden rounded-2xl border border-[#2D1F50] bg-[#1E1433]">
                <div className="flex items-center justify-between border-b border-[#2D1F50] bg-[#281A48] px-4 py-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A78BFA]">
                    Liquid template
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-[#3D2870] bg-[#2D1F50] px-2 py-1 text-[11px] font-semibold text-[#C084FC]"
                      onClick={handleCopy}
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[#3D2870] bg-[#2D1F50] px-2 py-1 text-[11px] font-semibold text-[#C084FC]"
                      onClick={handleReset}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="h-[42dvh] min-h-[260px] overflow-hidden">
                  <HighlightedLiquidEditor
                    value={editedContent}
                    onChange={handleContentChange}
                    className="h-full w-full"
                    options={{ style: editorStyle }}
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 text-xs">
                  {error ? (
                    <span className="text-amber-200">Error</span>
                  ) : (
                    <span className="text-emerald-200">
                      No errors · {lineCount} lines · {variableCount} vars
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {mobilePage === 'preview' ? (
              <div className="overflow-hidden rounded-2xl border border-[#DDD6FE] bg-white">
                <div className="flex items-center justify-between border-b border-[#EDE9FE] px-4 py-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
                    Rendered preview
                  </span>
                  <button
                    type="button"
                    className="rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-1 text-[11px] font-semibold text-[#7C3AED]"
                    onClick={onRender}
                  >
                    Re-render
                  </button>
                </div>
                <div className="max-h-[60dvh] overflow-auto px-2 py-2">
                  {isLoading ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                    </div>
                  ) : error ? (
                    <div className="p-3">
                      <Alert variant="destructive">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-xs">{error}</pre>
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <LiquidPreview text={previewContent} />
                  )}
                </div>
              </div>
            ) : null}

            {mobilePage === 'snippets' ? (
              <div className="overflow-hidden rounded-2xl border border-[#DDD6FE] bg-white">
                <div className="border-b border-[#EDE9FE] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
                    Templates
                  </div>
                  <div className="mt-2 rounded-lg border border-[#DDD6FE] bg-white px-3 py-2">
                    <Input
                      type="search"
                      placeholder="Search templates…"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="h-auto border-0 bg-transparent p-0 text-sm text-[#3B1D7A] shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div className="max-h-[60dvh] overflow-auto py-2">
                  {groupedTemplates.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-[#A89CC8]">No templates found</div>
                  ) : (
                    groupedTemplates.map(([category, items]) => (
                      <div key={category} className="mb-2">
                        <div className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4B8E0]">
                          {category}
                        </div>
                        {items.map((t) => {
                          const active = selectedTemplateId === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleTemplateChange(t)}
                              className={cn(
                                'flex w-full items-center gap-2 px-4 py-2 text-left transition-colors',
                                active ? 'bg-[#EDE9FE]' : 'hover:bg-[#F5F3FF]',
                              )}
                            >
                              <span className={cn('h-2 w-2 rounded-sm', categoryDotClass(category))} aria-hidden />
                              <span className={cn('truncate text-sm', active ? 'font-medium text-[#6D28D9]' : 'text-[#4A3070]')}>
                                {t.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {mobilePage === 'vars' ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-[#DDD6FE] bg-white">
                  <div className="border-b border-[#EDE9FE] px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
                      Test variables
                    </div>
                    <div className="mt-1 text-xs text-[#A89CC8]">Override attribute values for preview</div>
                  </div>
                  <div className="p-3">
                    <SampleDataEditor sampleData={editableSampleData} onChange={handleSampleDataChange} />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="rounded-xl border border-[#DDD6FE] bg-white px-2 py-2 text-center">
                    <div className="font-mono text-base font-semibold text-[#3B1D7A]">{variableCount}</div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#A89CC8]">Vars</div>
                  </div>
                  <div className="rounded-xl border border-[#DDD6FE] bg-white px-2 py-2 text-center">
                    <div className="font-mono text-base font-semibold text-[#3B1D7A]">{lineCount}</div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#A89CC8]">Lines</div>
                  </div>
                  <div className="rounded-xl border border-[#DDD6FE] bg-white px-2 py-2 text-center">
                    <div className="font-mono text-base font-semibold text-[#3B1D7A]">{errorCount}</div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#A89CC8]">Errors</div>
                  </div>
                  <div className="rounded-xl border border-[#DDD6FE] bg-white px-2 py-2 text-center">
                    <div className="font-mono text-base font-semibold text-[#3B1D7A]">{selectedTemplate ? '1' : '0'}</div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#A89CC8]">Tpl</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white"
                    onClick={onRender}
                  >
                    Render preview
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-[#DDD6FE] bg-white px-4 py-3 text-sm font-semibold text-[#6D28D9]"
                    onClick={() => setIsGeneralDocumentationOpen(true)}
                  >
                    Docs
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#DDD6FE] bg-white pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-2">
          <div className="grid grid-cols-4 gap-1 px-3">
            {MOBILE_PAGES.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMobilePage(value)}
                className="flex flex-col items-center gap-1 py-2"
              >
                <div className={cn('flex h-7 w-10 items-center justify-center rounded-lg', mobilePage === value ? 'bg-[#EDE9FE]' : '')}>
                  <Icon className={cn('h-5 w-5', mobilePage === value ? 'text-violet-700' : 'text-[#C4B8E0]')} />
                </div>
                <span className={cn('text-[10px]', mobilePage === value ? 'font-semibold text-[#6D28D9]' : 'text-[#C4B8E0]')}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <DocumentationDialog isOpen={isDocumentationOpen} onOpenChange={setIsDocumentationOpen} template={selectedTemplate} />
      <GeneralDocumentationDialog isOpen={isGeneralDocumentationOpen} onOpenChange={setIsGeneralDocumentationOpen} />
    </div>
  );
}
