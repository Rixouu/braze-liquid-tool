'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Copy,
  RotateCcw,
  Book,
  Loader2,
  Library,
  SlidersHorizontal,
  Braces,
  Eye,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import SampleDataEditor from '@/components/ui/SampleDataEditor';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import ThemeToggle from '@/components/ThemeToggle';
import HighlightedLiquidEditor from './HighlightedLiquidEditor';
import LiquidPreview from './LiquidPreview';
import { DocumentationDialog } from './DocumentationDialog';
import { GeneralDocumentationDialog } from './GeneralDocumentationDialog';
import { engine } from '@/lib/liquid-engine';
import type { Template } from '@/types';
import { templates } from '@/templates/templateData';
import { cn } from '@/lib/utils';

const MOBILE_FLOW_HINT_KEY = 'braze-liquid-tool-mobile-flow-hint-dismissed';

const MOBILE_NAV = [
  {
    value: 'library' as const,
    step: 1,
    label: 'Library',
    Icon: Library,
    tooltip: 'Choose a template',
  },
  {
    value: 'data' as const,
    step: 2,
    label: 'Data',
    Icon: SlidersHorizontal,
    tooltip: 'Adjust sample fields used in the preview',
  },
  {
    value: 'edit' as const,
    step: 3,
    label: 'Edit',
    Icon: Braces,
    tooltip: 'Edit Liquid with syntax highlighting',
  },
  {
    value: 'preview' as const,
    step: 4,
    label: 'Preview',
    Icon: Eye,
    tooltip: 'See rendered output',
  },
];

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

interface TemplateLibrarySectionProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredTemplates: Template[];
  selectedTemplateId: string | null;
  onSelectTemplate: (template: Template) => void;
  scrollClassName?: string;
}

function TemplateLibrarySection({
  searchTerm,
  onSearchChange,
  filteredTemplates,
  selectedTemplateId,
  onSelectTemplate,
  scrollClassName = 'h-[300px] w-full lg:h-[300px]',
}: TemplateLibrarySectionProps) {
  return (
    <>
      <Input
        type="search"
        placeholder="Search templates…"
        className="mb-3 h-11 w-full touch-manipulation sm:mb-4"
        value={searchTerm}
        onChange={onSearchChange}
      />
      <ScrollArea className={scrollClassName}>
        <div className="min-w-0 pr-3">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <Button
                key={template.id}
                variant="ghost"
                className={`mb-2 min-h-11 w-full touch-manipulation justify-start px-3 py-3 text-left text-sm font-normal text-foreground hover:bg-muted sm:px-4 ${
                  selectedTemplateId === template.id ? 'bg-muted font-medium' : ''
                }`}
                onClick={() => onSelectTemplate(template)}
              >
                <Book className="h-[18px] w-[18px] shrink-0" />
                <span className="ml-2 truncate">{template.name}</span>
              </Button>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No templates found</p>
          )}
        </div>
      </ScrollArea>
    </>
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
  const [mobileTab, setMobileTab] = useState<string>('library');
  const [mobileHintDismissed, setMobileHintDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(MOBILE_FLOW_HINT_KEY) === '1') setMobileHintDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

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
      setMobileTab('data');
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
      minHeight: 'min(42dvh, 520px)',
      padding: '1rem',
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

  return (
    <div className="box-border flex min-h-svh flex-col bg-gradient-to-br from-[hsl(232,32%,96%)] via-[hsl(238,28%,94%)] to-[hsl(252,22%,92%)] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-[max(0.5rem,env(safe-area-inset-top,0px))] dark:from-[hsl(252,45%,6%)] dark:via-[hsl(248,38%,8%)] dark:to-[hsl(232,40%,10%)] sm:justify-center sm:py-4 lg:items-center lg:py-6">
      <div className="mx-auto flex w-full max-w-[100vw] flex-1 flex-col px-2 sm:max-w-full sm:px-4 lg:px-8">
        <Card className="flex min-h-0 flex-1 flex-col border border-border bg-card text-card-foreground shadow-md shadow-primary/5 max-lg:rounded-xl max-lg:border-x-0 sm:max-lg:mx-0 lg:min-h-0 lg:shadow-md">
          <CardHeader className="shrink-0 space-y-3 border-b border-primary/20 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <img
                  src="/imgs/braze-icon-black.svg"
                  alt="Braze icon"
                  aria-hidden={true} 
                  className="h-8 w-8 shrink-0 sm:h-9 sm:w-9 dark:hidden"
                  width={36}
                  height={36}
                />
                <img
                  src="/imgs/braze-icon-white.svg"
                  alt="Braze icon"
                  aria-hidden={true}
                  className="hidden h-8 w-8 shrink-0 sm:h-9 sm:w-9 dark:block"
                  width={36}
                  height={36}
                />
                <CardTitle className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                  Braze Liquid Syntax Editor
                </CardTitle>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 touch-manipulation border-border text-foreground hover:bg-muted sm:h-9 sm:w-9"
                        onClick={() => setIsGeneralDocumentationOpen(true)}
                      >
                        <Book className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Documentation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <ThemeToggle />
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-3 pb-2 sm:p-6">
            {/* Desktop */}
            <div className="hidden min-h-0 flex-1 lg:grid lg:grid-cols-4 lg:gap-6">
              <div className="space-y-6 lg:col-span-1">
                <Card className="w-full">
                  <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
                    <CardTitle className="text-base">Template Library</CardTitle>
                    <CardDescription>Choose a template to get started</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                    <TemplateLibrarySection
                      searchTerm={searchTerm}
                      onSearchChange={handleSearchChange}
                      filteredTemplates={filteredTemplates}
                      selectedTemplateId={selectedTemplateId}
                      onSelectTemplate={handleTemplateChange}
                    />
                  </CardContent>
                </Card>

                <Card className="w-full">
                  <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
                    <CardTitle className="text-base">Sample Data</CardTitle>
                    <CardDescription>Edit to test different scenarios</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                    <SampleDataEditor sampleData={editableSampleData} onChange={handleSampleDataChange} />
                  </CardContent>
                </Card>
              </div>

              <Card className="flex min-h-0 flex-col lg:col-span-3">
                <CardHeader className="shrink-0 space-y-2 p-4 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                      <CardTitle className="text-base lg:text-lg">Editor and Preview</CardTitle>
                      <CardDescription>Write your Liquid syntax and see the result</CardDescription>
                    </div>
                    <div className="editor-header-buttons flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-10 touch-manipulation sm:min-h-9"
                        onClick={() => setIsDocumentationOpen(true)}
                      >
                        Documentation
                      </Button>
                      {templateInfoPopover}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex min-h-0 flex-1 flex-col p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-4">
                    <div className="relative flex min-h-0 flex-col">
                      <div className="min-h-0 flex-1 overflow-hidden lg:min-h-[560px]">
                        <HighlightedLiquidEditor
                          value={editedContent}
                          onChange={handleContentChange}
                          className="h-full w-full rounded-md border border-input bg-background"
                          options={{ style: editorStyleLg }}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="min-h-11 touch-manipulation bg-green-100 font-medium text-green-800 hover:bg-green-200 dark:bg-green-950/60 dark:text-green-200 dark:hover:bg-green-900/70 sm:min-h-9"
                          onClick={handleCopy}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-11 touch-manipulation border-red-200 bg-red-50 font-medium text-red-800 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-900/60 sm:min-h-9"
                          onClick={handleReset}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                    </div>
                    <div className="flex min-h-[min(240px,40dvh)] flex-col rounded-md border border-border bg-muted/40 text-foreground dark:bg-card lg:min-h-[560px]">
                      <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
                        {isLoading ? (
                          <div className="flex h-full min-h-[200px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : error ? (
                          <Alert variant="destructive">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                              <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs">{error}</pre>
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <LiquidPreview text={previewContent} />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile / tablet app shell */}
            <Tabs
              value={mobileTab}
              onValueChange={setMobileTab}
              className="flex min-h-0 flex-1 flex-col gap-2 lg:hidden"
            >
              <div className="rounded-xl border border-dashed border-primary/20 bg-primary/[0.06] px-3 py-2.5 dark:bg-primary/10">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-foreground">
                  <span className="shrink-0 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Steps
                  </span>
                  <span className="text-muted-foreground">
                    {MOBILE_NAV.map((item, i) => (
                      <span key={item.value}>
                        {i > 0 ? <span className="mx-1.5 text-muted-foreground/50">→</span> : null}
                        <span
                          className={cn(
                            mobileTab === item.value && 'rounded-sm bg-background/80 px-1 py-0.5 text-primary shadow-sm dark:bg-background/40',
                          )}
                        >
                          {item.step}. {item.label}
                        </span>
                      </span>
                    ))}
                  </span>
                </div>
                {!mobileHintDismissed ? (
                  <div className="mt-2 flex flex-col gap-2 border-t border-primary/10 pt-2 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Pick a template in <strong className="font-medium text-foreground">Library</strong>
                      —we open <strong className="font-medium text-foreground">Data</strong> next so you can tweak
                      sample values. Then use <strong className="font-medium text-foreground">Edit</strong> for
                      Liquid and <strong className="font-medium text-foreground">Preview</strong> for the rendered
                      message (you can jump between tabs anytime).
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 touch-manipulation self-start px-2 text-xs text-primary hover:bg-primary/10"
                      onClick={() => {
                        setMobileHintDismissed(true);
                        try {
                          localStorage.setItem(MOBILE_FLOW_HINT_KEY, '1');
                        } catch {
                          /* ignore */
                        }
                      }}
                    >
                      Got it
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-muted/20">
                <TabsContent value="library" className="m-0 h-[calc(100dvh-12.5rem)] overflow-y-auto p-3 sm:h-[calc(100dvh-13rem)]">
                  <div className="mb-2">
                    <h2 className="text-base font-semibold">Template Library</h2>
                    <p className="text-xs text-muted-foreground">Choose a template</p>
                  </div>
                  <TemplateLibrarySection
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    filteredTemplates={filteredTemplates}
                    selectedTemplateId={selectedTemplateId}
                    onSelectTemplate={handleTemplateChange}
                    scrollClassName="h-[calc(100dvh-16rem)] w-full sm:h-[calc(100dvh-15rem)]"
                  />
                </TabsContent>

                <TabsContent value="data" className="m-0 h-[calc(100dvh-12.5rem)] overflow-y-auto p-3 sm:h-[calc(100dvh-13rem)]">
                  <div className="mb-2">
                    <h2 className="text-base font-semibold">Sample Data</h2>
                    <p className="text-xs text-muted-foreground">Edit JSON-backed fields</p>
                  </div>
                  <SampleDataEditor sampleData={editableSampleData} onChange={handleSampleDataChange} />
                </TabsContent>

                <TabsContent value="edit" className="m-0 flex h-[calc(100dvh-12.5rem)] flex-col overflow-hidden p-3 sm:h-[calc(100dvh-13rem)]">
                  <div className="mb-2 flex shrink-0 flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-10 flex-1 touch-manipulation sm:min-h-9 sm:flex-none"
                      onClick={() => setIsDocumentationOpen(true)}
                    >
                      Docs
                    </Button>
                    <div className="min-w-0 flex-1 sm:flex-none sm:shrink-0">{templateInfoPopover}</div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-input bg-background">
                    <HighlightedLiquidEditor
                      value={editedContent}
                      onChange={handleContentChange}
                      className="h-full w-full"
                      options={{ style: editorStyle }}
                    />
                  </div>
                  <div className="mt-2 flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="min-h-11 flex-1 touch-manipulation bg-green-100 font-medium text-green-800 hover:bg-green-200 dark:bg-green-950/60 dark:text-green-200"
                      onClick={handleCopy}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 flex-1 touch-manipulation border-red-200 bg-red-50 font-medium text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
                      onClick={handleReset}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="m-0 h-[calc(100dvh-12.5rem)] overflow-y-auto p-3 sm:h-[calc(100dvh-13rem)]">
                  <div className="mb-2">
                    <h2 className="text-base font-semibold">Preview</h2>
                    <p className="text-xs text-muted-foreground">Rendered message</p>
                  </div>
                  <div className="min-h-[min(50dvh,420px)] rounded-md border border-border bg-card p-3">
                    {isLoading ? (
                      <div className="flex min-h-[200px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : error ? (
                      <Alert variant="destructive">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs">{error}</pre>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <LiquidPreview text={previewContent} />
                    )}
                  </div>
                </TabsContent>
              </div>

              <TooltipProvider delayDuration={400}>
                <TabsList className="sticky bottom-0 z-10 grid w-full shrink-0 grid-cols-4 gap-1 rounded-2xl border border-border bg-muted/60 p-1.5 shadow-lg backdrop-blur-sm dark:bg-muted/25 pb-[max(0.35rem,env(safe-area-inset-bottom,0px))]">
                  {MOBILE_NAV.map(({ value, label, Icon, tooltip }) => (
                    <Tooltip key={value}>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value={value}
                          title={tooltip}
                          className={cn(
                            'touch-manipulation flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2',
                            'text-[10px] font-semibold leading-none tracking-tight transition-colors duration-150',
                            'text-muted-foreground data-[state=inactive]:hover:bg-background/70 data-[state=inactive]:hover:text-foreground',
                            'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md',
                            'data-[state=active]:ring-1 data-[state=active]:ring-primary/40',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0 stroke-[1.85]" aria-hidden />
                          <span>{label}</span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[14rem] text-xs">
                        <p>{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TabsList>
              </TooltipProvider>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <DocumentationDialog
        isOpen={isDocumentationOpen}
        onOpenChange={setIsDocumentationOpen}
        template={selectedTemplate}
      />

      <GeneralDocumentationDialog
        isOpen={isGeneralDocumentationOpen}
        onOpenChange={setIsGeneralDocumentationOpen}
      />
    </div>
  );
}
