'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Copy, RotateCcw, Moon, Sun } from 'lucide-react'
import LiquidEditor from './components/LiquidEditor'
import HighlightedLiquidEditor from './components/HighlightedLiquidEditor'
import { ThemeProvider, useTheme } from 'next-themes'

// Sample templates - in a real application, these would be more extensive and possibly fetched from an API
const templates = [
  {
    id: 'personal',
    name: 'Personalized Greeting',
    description: 'A simple personalized greeting using customer\'s first name',
    content: 'Hello {{${first_name}}},\n\nWelcome to our service!'
  },
  {
    id: 'product',
    name: 'Product Recommendation',
    description: 'Recommend a product based on customer\'s past purchases',
    content: 'Hi {{${first_name}}},\n\nBased on your purchase of {{${last_purchased_item}}}, we think you\'ll love our new {{${recommended_product}}}!'
  },
  {
    id: 'event',
    name: 'Event Reminder',
    description: 'Reminder for an upcoming event',
    content: 'Dear {{${first_name}}},\n\nDon\'t forget about {{${event_name}}} on {{${event_date}}}. We\'re excited to see you there!'
  },
  {
    id: 'anniversary',
    name: 'App Anniversary',
    description: 'Personalize messages based on a user\'s app anniversary year',
    content: `\\{\\% assign this_month = 'now' | date: "%B" \\%\\}
\\{\\% assign this_day = 'now' | date: "%d" \\%\\}
\\{\\% assign anniversary_month = \\{\\{custom_attribute.\${registration_date}\\}\\} | date: "%B" \\%\\}
\\{\\% assign anniversary_day = \\{\\{custom_attribute.\${registration_date}\\}\\} | date: "%d" \\%\\}
\\{\\% assign anniversary_year = \\{\\{custom_attribute.\${registration_date}\\}\\} | date: "%Y" \\%\\}

\\{\\% if this_month == anniversary_month and this_day == anniversary_day \\%\\}
\\{\\% if anniversary_year == '2021' \\%\\}
Exactly one year ago today we met for the first time!
\\{\\% elsif anniversary_year == '2020' \\%\\}
Exactly two years ago today we met for the first time!
\\{\\% elsif anniversary_year == '2019' \\%\\}
Exactly three years ago today we met for the first time!
\\{\\% else \\%\\}
Happy app anniversary!
\\{\\% endif \\%\\}
\\{\\% endif \\%\\}`
  },
  {
    id: 'app_usage',
    name: 'Recent App Usage',
    description: 'Personalize messages based on when a user last opened the app',
    content: `\\{\\% assign last_used_date = \\{\\{custom_attribute.\${last_used_app_date}\\}\\} | date: "%s" \\%\\}
\\{\\% assign now = 'now' | date: "%s" \\%\\}
\\{\\% assign difference_in_days = \\{\\{now\\}\\} | minus: \\{\\{last_used_date\\}\\} | divided_by: 86400 \\%\\}

\\{\\% if \\{\\{difference_in_days\\}\\} < 3 \\%\\}
Happy to see you again so soon!
\\{\\% else \\%\\}
It's been a while; here are some of our latest updates.
\\{\\% endif \\%\\}`
  },
  {
    id: 'countdown',
    name: 'Event Countdown',
    description: 'Calculate a countdown from a set point in time',
    content: `\\{\\% assign event_date = '2023-12-31' | date: "%s" \\%\\}
\\{\\% assign today = 'now' | date: "%s" \\%\\}
\\{\\% assign difference = event_date | minus: today \\%\\}
\\{\\% assign difference_days = difference | divided_by: 86400 \\%\\}

You have \\{\\{ difference_days \\}\\} days left until the big event!`
  },
  {
    id: 'platform',
    name: 'Platform-Specific Message',
    description: 'Differentiate copy by device OS',
    content: `\\{\\% if \\{\\{targeted_device.\${platform}\\}\\} == "ios" \\%\\}
Check out our new features in the App Store!
\\{\\% elsif \\{\\{targeted_device.\${platform}\\}\\} == "android" \\%\\}
Discover our latest updates on Google Play!
\\{\\% else \\%\\}
Visit our website for the newest features!
\\{\\% endif \\%\\}`
  },
  {
    id: 'timezone',
    name: 'Time Zone Personalization',
    description: 'Send different messages based on time of day in a user\'s local time zone',
    content: `\\{\\% assign time = 'now' | time_zone: \${time_zone} \\%\\}
\\{\\% assign hour = time | date: '%H' | plus: 0 \\%\\}

\\{\\% if hour >= 5 and hour < 12 \\%\\}
Good morning! Start your day with our app.
\\{\\% elsif hour >= 12 and hour < 18 \\%\\}
Good afternoon! Take a break with our app.
\\{\\% elsif hour >= 18 and hour < 22 \\%\\}
Good evening! Relax with our app.
\\{\\% else \\%\\}
Having trouble sleeping? Our app can help you unwind.
\\{\\% endif \\%\\}`
  }
]

function unescapeLiquid(content) {
  return content
    .replace(/\\{\\%/g, '{%')
    .replace(/\\%\\}/g, '%}')
    .replace(/\\{\\{/g, '{{')
    .replace(/\\}\\}/g, '}}');
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 px-0"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export function LiquidSyntaxEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [editedContent, setEditedContent] = useState(unescapeLiquid(templates[0].content))

  useEffect(() => {
    setEditedContent(unescapeLiquid(selectedTemplate.content))
  }, [selectedTemplate])

  const handleTemplateChange = (templateId) => {
    const newTemplate = templates.find(t => t.id === templateId)
    setSelectedTemplate(newTemplate)
  }

  const handleContentChange = (newContent) => {
    setEditedContent(newContent)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent)
  }

  const handleReset = () => {
    setEditedContent(unescapeLiquid(selectedTemplate.content))
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row justify-between items-center py-6 border-b">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Liquid Syntax Editor</h1>
            <p className="text-2xl font-bold text-foreground">for Braze CRM</p>
          </div>
          <p className="text-sm text-muted-foreground flex-1 max-w-xl text-center md:text-left md:px-4">
            Create and edit personalized messages with Liquid syntax. Choose a template, customize, and preview in real-time.
          </p>
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Selection</CardTitle>
                <CardDescription>Choose a template to start with</CardDescription>
              </CardHeader>
              <CardContent>
                <Select onValueChange={handleTemplateChange} defaultValue={selectedTemplate.id}>
                  <SelectTrigger>
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
                <p className="text-sm text-muted-foreground mt-2">{selectedTemplate.description}</p>
              </CardContent>
            </Card>

            <Card className="lg:hidden">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Preview your message with Liquid syntax</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] sm:h-[300px] w-full rounded-md border p-4">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {editedContent}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Editing</CardTitle>
                <CardDescription>Edit your message while preserving Liquid syntax</CardDescription>
              </CardHeader>
              <CardContent>
                <HighlightedLiquidEditor
                  initialContent={editedContent}
                  onChange={handleContentChange}
                />
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
                <Button onClick={handleCopy} variant="outline" className="w-full sm:w-auto">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </CardFooter>
            </Card>

            <Card className="hidden lg:block">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Preview your message with Liquid syntax</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {editedContent}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class">
      <LiquidSyntaxEditor />
    </ThemeProvider>
  )
}
