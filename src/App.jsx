'use client'

import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react'
import { ThemeProvider } from 'next-themes'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Button } from "../components/ui/button"
import { ScrollArea } from "../components/ui/scroll-area"
import { Copy, RotateCcw } from 'lucide-react'
import { Liquid } from 'liquidjs';
import ThemeToggle from '../components/ThemeToggle';
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

const HighlightedLiquidEditor = lazy(() => import('../components/HighlightedLiquidEditor'))

const engine = new Liquid({
  dateFormat: '%Y-%m-%d %H:%M:%S',
  timezoneOffset: 0
});

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

const templates = [
  {
    id: 'personal',
    name: 'Personalized Greeting',
    description: 'A simple personalized greeting using customer\'s first name',
    content: 'Hello {{ first_name }},\n\nWelcome to our service!',
    sampleData: {
      first_name: 'John'
    }
  },
  {
    id: 'product',
    name: 'Product Recommendation',
    description: 'Recommend a product based on customer\'s past purchases',
    content: 'Hi {{ first_name }},\n\nBased on your purchase of {{ last_purchased_item }}, we think you\'ll love our new {{ recommended_product }}!',
    sampleData: {
      first_name: 'Alice',
      last_purchased_item: 'Running Shoes',
      recommended_product: 'Fitness Tracker'
    }
  },
  {
    id: 'event',
    name: 'Event Reminder',
    description: 'Reminder for an upcoming event',
    content: 'Dear {{ first_name }},\n\nDon\'t forget about {{ event_name }} on {{ event_date }}. We\'re excited to see you there!',
    sampleData: {
      first_name: 'Emma',
      event_name: 'Annual Tech Conference',
      event_date: 'September 15, 2023'
    }
  },
  {
    id: 'anniversary',
    name: 'App Anniversary',
    description: 'Personalize messages based on a user\'s app anniversary year',
    content: `{% assign this_month = 'now' | date: "%B" %}
{% assign this_day = 'now' | date: "%d" %}
{% assign anniversary_month = custom_attribute.registration_date | date: "%B" %}
{% assign anniversary_day = custom_attribute.registration_date | date: "%d" %}
{% assign anniversary_year = custom_attribute.registration_date | date: "%Y" %}

{% if this_month == anniversary_month and this_day == anniversary_day %}
{% if anniversary_year == '2022' %}
Exactly one year ago today we met for the first time!
{% elsif anniversary_year == '2021' %}
Exactly two years ago today we met for the first time!
{% elsif anniversary_year == '2020' %}
Exactly three years ago today we met for the first time!
{% else %}
Happy app anniversary!
{% endif %}
{% endif %}`,
    sampleData: {
      custom_attribute: {
        registration_date: '2022-07-15'
      },
      now: getCurrentDate()
    }
  },
  {
    id: 'app_usage',
    name: 'Recent App Usage',
    description: 'Personalize messages based on when a user last opened the app',
    content: `{% assign last_used_date = custom_attribute.last_used_app_date | date: "%s" %}
{% assign now = 'now' | date: "%s" %}
{% assign difference_in_days = now | minus: last_used_date | divided_by: 86400 %}

{% if difference_in_days < 3 %}
Happy to see you again so soon!
{% else %}
It's been a while; here are some of our latest updates.
{% endif %}`,
    sampleData: {
      custom_attribute: {
        last_used_app_date: '2023-07-12'
      },
      now: getCurrentDate()
    }
  },
  {
    id: 'countdown',
    name: 'Event Countdown',
    description: 'Calculate a countdown from a set point in time',
    content: `{% assign event_date = '2023-12-31' | date: '%s' %}
{% assign today = 'now' | date: '%s' %}
{% assign difference = event_date | minus: today %}
{% assign difference_days = difference | divided_by: 86400 %}

You have {{ difference_days }} days left until the big event!`,
    sampleData: {
      now: getCurrentDate()
    }
  },
  {
    id: 'platform',
    name: 'Platform-Specific Message',
    description: 'Differentiate copy by device OS',
    content: `{% if targeted_device.platform == "ios" %}
Check out our new features in the App Store!
{% elsif targeted_device.platform == "android" %}
Discover our latest updates on Google Play!
{% else %}
Visit our website for the newest features!
{% endif %}`,
    sampleData: {
      targeted_device: {
        platform: 'ios'
      }
    }
  },
  {
    id: 'timezone',
    name: 'Time Zone Personalization',
    description: 'Send different messages based on time of day in a user\'s local time zone',
    content: `{% assign time = 'now' | time_zone: time_zone %}
{% assign hour = time | date: '%H' | plus: 0 %}

{% if hour >= 5 and hour < 12 %}
Good morning! Start your day with our app.
{% elsif hour >= 12 and hour < 18 %}
Good afternoon! Take a break with our app.
{% elsif hour >= 18 and hour < 22 %}
Good evening! Relax with our app.
{% else %}
Having trouble sleeping? Our app can help you unwind.
{% endif %}`,
    sampleData: {
      time_zone: 'America/New_York',
      now: '2023-07-15T14:30:00'
    }
  }
]

function SampleDataEditor({ sampleData, onChange }) {
  console.log("SampleDataEditor received data:", sampleData);

  const renderField = (key, value, path = []) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">{key}</h4>
          <div className="pl-4 border-l border-gray-200">
            {Object.entries(value).map(([subKey, subValue]) =>
              renderField(subKey, subValue, [...path, key])
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="mb-3">
        <label className="block text-sm text-gray-700 mb-1">{path.concat(key).join('.')}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(path.concat(key).join('.'), e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {sampleData && Object.keys(sampleData).length > 0 ? (
        Object.entries(sampleData).map(([key, value]) => renderField(key, value))
      ) : (
        <p className="text-gray-500 italic">No sample data available</p>
      )}
    </div>
  );
}

export function LiquidSyntaxEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [editedContent, setEditedContent] = useState(selectedTemplate.content)
  const [editableSampleData, setEditableSampleData] = useState(selectedTemplate.sampleData)
  const [previewContent, setPreviewContent] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditedContent(selectedTemplate.content)
    setEditableSampleData(selectedTemplate.sampleData)
    console.log("Selected template:", selectedTemplate)
    console.log("Editable sample data:", selectedTemplate.sampleData)
    updatePreview(selectedTemplate.content, selectedTemplate.sampleData)
  }, [selectedTemplate])

  const handleTemplateChange = useCallback((templateId) => {
    const newTemplate = templates.find(t => t.id === templateId)
    setSelectedTemplate(newTemplate)
  }, []);

  const handleContentChange = useCallback((newContent) => {
    setEditedContent(newContent)
    updatePreview(newContent, editableSampleData)
  }, [editableSampleData, updatePreview]);

  const handleSampleDataChange = useCallback((path, value) => {
    console.log("Updating sample data:", path, value);
    setEditableSampleData(prevData => {
      const newData = { ...prevData };
      let current = newData;
      const keys = path.split('.');
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      console.log("New sample data:", newData);
      return newData;
    });
    updatePreview(editedContent, editableSampleData);
  }, [editedContent, updatePreview]);

  const updatePreview = async (content, data) => {
    setIsLoading(true);
    try {
      const renderedContent = await engine.parseAndRender(content, {
        ...data,
        now: getCurrentDate()
      });
      setPreviewContent(renderedContent.trim());
      setError(null);
    } catch (error) {
      console.error('Error rendering template:', error);
      setError(`Error rendering template: ${error.message}`);
      setPreviewContent('');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(editedContent)
  }, [editedContent]);

  const handleReset = useCallback(() => {
    // Reset the edited content to the original template content
    setEditedContent(selectedTemplate.content);

    // Reset the editable sample data to the original template sample data
    setEditableSampleData(selectedTemplate.sampleData);

    // Update the preview with the original content and sample data
    updatePreview(selectedTemplate.content, selectedTemplate.sampleData);
  }, [selectedTemplate, updatePreview]);

  const memoizedSampleDataEditor = useMemo(() => (
    <SampleDataEditor
      sampleData={editableSampleData}
      onChange={handleSampleDataChange}
    />
  ), [editableSampleData, handleSampleDataChange]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row justify-between items-center py-6 border-b">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Liquid Syntax Editor for Braze</h1>
          </div>
          <p className="text-sm text-muted-foreground flex-1 max-w-xl text-center md:text-left md:px-4">
            Create and edit personalized messages with Liquid syntax. Choose a template, customize, and preview in real-time.
          </p>
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="h-[800px] flex flex-col lg:w-[310px]">
            <CardHeader>
              <CardTitle className="text-xl">Template Selection</CardTitle>
              <CardDescription>Choose a template to start with</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden flex flex-col">
              <Select onValueChange={handleTemplateChange} defaultValue={selectedTemplate.id}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ScrollArea className="h-32 w-full mt-4">
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </ScrollArea>
              <div className="mt-4 flex-grow">
                <h3 className="font-semibold mb-2">Sample Data</h3>
                <div className="h-[calc(100%-2rem)] overflow-auto">
                  {memoizedSampleDataEditor}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <Card className="h-[800px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">Content Editing</CardTitle>
                <CardDescription>Edit your message and preview in real-time</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold mb-2">Template Content</h3>
                  <div className="flex-grow border rounded-md overflow-hidden">
                    <div className="h-full w-full highlighted-liquid-editor-container p-4">
                      <Suspense fallback={<div>Loading editor...</div>}>
                        <HighlightedLiquidEditor
                          initialContent={editedContent}
                          onChange={handleContentChange}
                          className="h-full w-full"
                        />
                      </Suspense>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold mb-2">Live Preview</h3>
                  <div className="flex-grow border rounded-md p-4 overflow-auto relative">
                    {isLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <pre className="font-mono text-sm whitespace-pre-wrap">
                        {previewContent}
                      </pre>
                    )}
                  </div>
                </div>
              </CardContent>
              {error && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <CardFooter className="flex justify-end space-x-2">
                <Button onClick={handleCopy} className="bg-green-100 text-green-700 hover:bg-green-200">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button onClick={handleReset} className="bg-red-100 text-red-700 hover:bg-red-200">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LiquidSyntaxEditor />
    </ThemeProvider>
  )
}
