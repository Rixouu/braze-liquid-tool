'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw, Book, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/Tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SampleDataEditor from '@/components/ui/SampleDataEditor';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import ThemeToggle from '@/components/ThemeToggle';
import HighlightedLiquidEditor from './HighlightedLiquidEditor';
import LiquidPreview from './LiquidPreview';
import { Sidebar } from './Sidebar';
import { DocumentationDialog } from './DocumentationDialog';
import { GeneralDocumentationDialog } from './GeneralDocumentationDialog';
import { engine } from '@/lib/liquid-engine';
import { Template } from '@/types';
import { templates } from '@/templates/templateData';

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

  // Define flattenObject function within the component
  const flattenObject = (obj: Record<string, any>, prefix = ''): Record<string, any> => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], `${pre}${k}`));
      } else {
        acc[`${pre}${k}`] = obj[k];
      }
      return acc;
    }, {} as Record<string, any>);
  };

  const updatePreview = useCallback(async (content: string, data: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const liquidContent = content.replace(/\[\[(.*?)\]\]/g, '{{$1}}');
      const flattenedData = flattenObject(data);
      Object.keys(flattenedData).forEach(key => {
        if (typeof flattenedData[key] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(flattenedData[key])) {
          flattenedData[key] = new Date(flattenedData[key]);
        }
      });
      const renderedContent = await engine.parseAndRender(liquidContent, flattenedData);
      setPreviewContent(renderedContent);
    } catch (err: unknown) {
      console.error("Template rendering error:", err);
      setError(`Error rendering template: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSampleDataChange = useCallback((newData: Record<string, any>) => {
    setEditableSampleData(newData);

    // Update the editedContent with the new sample data
    let updatedContent = selectedTemplate ? selectedTemplate.content : editedContent;
    const updateContentWithData = (data: Record<string, any>, prefix = '') => {
      Object.entries(data).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          updateContentWithData(value, fullKey);
        } else {
          const regex = new RegExp(`\\[\\[${fullKey}\\]\\]`, 'g');
          updatedContent = updatedContent.replace(regex, String(value));
        }
      });
    };

    updateContentWithData(newData);
    setEditedContent(updatedContent);

    // Trigger preview update with new data
    updatePreview(updatedContent, newData);
  }, [selectedTemplate, editedContent, updatePreview]);

  const handleContentChange = useCallback((newContent: string) => {
    setEditedContent(newContent);
  }, []);

  useEffect(() => {
    updatePreview(editedContent, editableSampleData);
  }, [editedContent, editableSampleData, updatePreview]);

  const handleTemplateChange = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setSelectedTemplateId(template.id);
    setEditableSampleData(template.sampleData);

    let updatedContent = template.content;
    const updateContentWithData = (data: Record<string, any>, prefix = '') => {
      Object.entries(data).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          updateContentWithData(value, fullKey);
        } else {
          const regex = new RegExp(`\\[\\[${fullKey}\\]\\]`, 'g');
          updatedContent = updatedContent.replace(regex, String(value));
        }
      });
    };

    updateContentWithData(template.sampleData);
    setEditedContent(updatedContent);
    updatePreview(updatedContent, template.sampleData);
  }, [updatePreview]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleCopy = () => {
    const finalContent = editedContent.replace(/\[\[(.*?)\]\]/g, '{{$1}}');
    navigator.clipboard.writeText(finalContent);
  }

  const handleReset = () => {
    if (selectedTemplate) {
      setEditedContent(selectedTemplate.content);
      setEditableSampleData(selectedTemplate.sampleData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#000000] dark:to-[#0a0a0a] flex justify-center items-center">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-full">
        <Card className="bg-white dark:bg-black">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold">Liquid Syntax Editor</CardTitle>
              <div className="flex items-center space-x-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setIsGeneralDocumentationOpen(true)}>
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
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Template Library</CardTitle>
                    <CardDescription>Choose a template to get started</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="search"
                      placeholder="Search templates..."
                      className="mb-4 w-full"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <ScrollArea className="h-[300px] w-full">
                      <div className="pr-4 min-w-[300px]">
                        {filteredTemplates.length > 0 ? (
                          filteredTemplates.map((template) => (
                            <Button
                              key={template.id}
                              variant="ghost"
                              className={`w-full justify-start mb-2 px-4 py-3 ${selectedTemplateId === template.id
                                ? "bg-gray-200 dark:bg-[#1a1a1a] active"
                                : "dark:bg-black"
                                }`}
                              onClick={() => handleTemplateChange(template)}
                            >
                              <Book size={18} />
                              <span className="ml-2">{template.name}</span>
                            </Button>
                          ))
                        ) : (
                          <p className="text-center text-gray-500">No templates found</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Sample Data</CardTitle>
                    <CardDescription>Edit to test different scenarios</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SampleDataEditor
                      sampleData={editableSampleData}
                      onChange={handleSampleDataChange}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1.5">
                      <CardTitle>Editor and Preview</CardTitle>
                      <CardDescription>Write your Liquid syntax and see the result</CardDescription>
                    </div>
                    <div className="editor-header-buttons">
                      <Button variant="outline" size="sm" onClick={() => setIsDocumentationOpen(true)}>
                        Documentation
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            Template Info
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96 p-4">
                          {selectedTemplate && (
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{selectedTemplate.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTemplate.description}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Variables:</h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {selectedTemplate.documentation.variables.map((variable, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                      <div className="flex items-center mb-1">
                                        <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                          {variable.name}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 dark:text-gray-300">{variable.description}</p>
                                      {variable.example && (
                                        <div className="mt-1">
                                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Example:</span>
                                          <code className="ml-1 text-xs bg-gray-100 dark:bg-gray-600 px-1 py-0.5 rounded">
                                            {variable.example}
                                          </code>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Tips:</h4>
                                <div className="bg-yellow-50 dark:bg-[#1a1a1a] p-3 rounded-md">
                                  <ul className="space-y-1">
                                    {selectedTemplate.documentation.notes.split('\n').map((note, index) => (
                                      <li key={index} className="text-xs text-yellow-700 dark:text-yellow-300 flex items-start">
                                        <span className="text-yellow-500 mr-2">•</span>
                                        {note}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[600px]">
                    <div className="relative h-full flex flex-col">
                      <div className="flex-grow overflow-hidden">
                        <HighlightedLiquidEditor
                          value={editedContent}
                          onChange={handleContentChange}
                          className="w-full h-full rounded-md border border-input bg-white dark:bg-[#1a1a1a]"
                          options={{
                            style: {
                              minHeight: '600px',
                              padding: '1rem',
                              lineHeight: '1.5',
                              fontSize: '0.875rem',
                            }
                          }}
                        />
                      </div>
                      <div className="mt-4 space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCopy}
                          className="bg-green-100 hover:bg-green-200 text-green-700"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReset}
                          className="bg-red-100 hover:bg-red-200 text-red-700"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                    </div>
                    <div className="bg-[hsl(210,20%,98.04%);] dark:bg-[#1a1a1a] p-4 rounded-md h-full overflow-auto">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : error ? (
                        <Alert variant="destructive">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            <pre className="whitespace-pre-wrap overflow-auto max-h-40">{error}</pre>
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <LiquidPreview text={previewContent} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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