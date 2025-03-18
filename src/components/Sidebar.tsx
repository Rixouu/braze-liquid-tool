'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Template, SidebarProps } from '@/types';

export function Sidebar({ templates, onSelectTemplate, selectedTemplateId }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  const groupedTemplates = useMemo(() => {
    return filteredTemplates.reduce((acc, template) => {
      const category = template.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {} as Record<string, Template[]>);
  }, [filteredTemplates]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="sidebar dark:bg-black p-4">
      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category} className="mb-2">
          <button
            onClick={() => toggleCategory(category)}
            className="flex items-center justify-between w-full text-left px-2 py-1 bg-gray-100 dark:bg-[#1e1e1e] rounded"
          >
            <span className="font-medium">{category}</span>
            {expandedCategories.includes(category) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          {expandedCategories.includes(category) && (
            <div className="ml-4 mt-1">
              {categoryTemplates.map(template => (
                <Button
                  key={template.id}
                  variant="ghost"
                  className={`w-full justify-start mb-2 px-4 py-3 ${selectedTemplateId === template.id
                    ? "bg-gray-200 dark:bg-[#1a1a1a] active"
                    : "dark:bg-black"
                    }`}
                  onClick={() => onSelectTemplate(template)}
                >
                  <Book size={18} />
                  <span className="ml-2">{template.name}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 