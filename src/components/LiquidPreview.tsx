import React, { useState } from 'react';

export function LiquidPreview({ text }: { text: string }) {
  const [highlightedVar, setHighlightedVar] = useState<string | null>(null);

  const processText = (text: string) => {
    // Replace Liquid tags with styled spans
    text = text.replace(/{%.*?%}/g, (match) => {
      return `<span class="liquid-tag">${match}</span>`;
    });

    // Replace Liquid variables with styled spans
    text = text.replace(/{{.*?}}/g, (match) => {
      return `<span class="liquid-var">${match}</span>`;
    });

    // Convert newlines to <br> tags, but remove excessive empty lines
    text = text.replace(/\n{3,}/g, '\n\n');

    // Wrap list items with proper HTML
    text = text.replace(/(?:^|\n)(\s*•.*(?:\n(?!\s*•).*)*)/g, (match, p1) => {
      const items = p1.split('\n').map(item => 
        item.trim().startsWith('•') ? `<li>${item.trim().substring(1).trim()}</li>` : item
      ).join('');
      return `<ul class="preview-list">${items}</ul>`;
    });

    // Now replace remaining newlines with <br> tags
    text = text.replace(/\n/g, '<br>');

    return text;
  };

  const processedText = processText(text);

  return (
    <div 
      className="liquid-preview-container bg-white dark:bg-[hsl(222.2,84%,10%)] p-4 h-full overflow-auto"
      dangerouslySetInnerHTML={{ __html: processedText }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('liquid-var')) {
          setHighlightedVar(target.textContent?.replace(/[{}]/g, '').trim() || null);
        }
      }}
    />
  );
}

export default LiquidPreview;