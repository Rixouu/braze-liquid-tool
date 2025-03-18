import React from 'react';

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ id, title, icon, children }: SectionProps) {
  return (
    <div id={id} className="mb-6">
      <h3 className="text-xl font-semibold mb-3 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
} 