export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  sampleData: Record<string, any>;
  icon?: React.ReactNode;
  documentation: {
    overview: string;
    usage: string;
    variables: VariableType[];
    notes: string;
  };
  examples: Example[];
}

export interface VariableType {
  name: string;
  description: string;
  type?: string;
  example?: string;
}

export interface Example {
  description: string;
  code: string;
  output: string;
}

export interface SidebarProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  selectedTemplateId: string | null;
} 