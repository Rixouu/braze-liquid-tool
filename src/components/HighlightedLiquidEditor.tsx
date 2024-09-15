import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from 'next-themes';  // Replace with your custom theme hook

const liquidHighlight = (str: string, isDark: boolean) => {
  const tagColor = isDark ? '#bd93f9' : '#905';  // Light purple for dark mode
  const varColor = isDark ? '#8be9fd' : '#0550ae';  // Cyan for dark mode
  const stringColor = isDark ? '#f1fa8c' : '#690';  // Light yellow for dark mode
  const numberColor = isDark ? '#ff79c6' : '#0000ff';  // Pink for dark mode
  const keywordColor = isDark ? '#ff79c6' : '#007a00';  // Pink for dark mode
  const operatorColor = isDark ? '#f8f8f2' : '#9a6e3a';  // Light gray for dark mode

  // Escape HTML characters, but preserve Liquid syntax
  str = str.replace(/&(?!amp;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Highlight Liquid tags
  str = str.replace(/{%.*?%}/g, (match) => {
    // Highlight keywords within tags
    let highlightedMatch = match.replace(/\b(if|else|elsif|endif|assign|capture|endcapture)\b/g,
      `<span style="color: ${keywordColor}">$1</span>`
    );
    // Highlight numbers within tags
    highlightedMatch = highlightedMatch.replace(/\b(\d+)\b/g,
      `<span style="color: ${numberColor}">$1</span>`
    );
    // Highlight strings within tags, but not HTML-like attributes
    highlightedMatch = highlightedMatch.replace(/'([^']*?)'/g, (match, p1) => {
      if (match.includes('style') || match.includes('color:')) {
        return match; // Don't highlight these strings
      }
      return `'<span style="color: ${stringColor}">${p1}</span>'`;
    });
    // Highlight operators and special characters
    highlightedMatch = highlightedMatch.replace(/(\s|^)(==|!=|>=|<=|>|<|=|\+|-|\*|\/|\|)(\s|$)/g,
      `$1<span style="color: ${operatorColor}">$2</span>$3`
    );
    return `<span style="color: ${tagColor}">${highlightedMatch}</span>`;
  });

  // Highlight Liquid variables
  str = str.replace(/{{.*?}}/g, (match) => {
    // Highlight numbers within variables
    let highlightedMatch = match.replace(/\b(\d+)\b/g,
      `<span style="color: ${numberColor}">$1</span>`
    );
    // Highlight strings within variables
    highlightedMatch = highlightedMatch.replace(/'([^']*?)'/g,
      `'<span style="color: ${stringColor}">$1</span>'`
    );
    // Highlight operators and special characters
    highlightedMatch = highlightedMatch.replace(/(\s|^)(==|!=|>=|<=|>|<|=|\+|-|\*|\/|\|)(\s|$)/g,
      `$1<span style="color: ${operatorColor}">$2</span>$3`
    );
    return `<span style="color: ${varColor}">${highlightedMatch}</span>`;
  });

  return str.replace(/\n/g, '<br>');
};

const HighlightedLiquidEditor = ({ value, onChange, className, options = {} }: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  options?: { style?: React.CSSProperties };
}) => {
  const [content, setContent] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    setContent(value);
    updateHighlight(value);
  }, [value]);

  useEffect(() => {
    updateHighlight(content);
  }, [theme, content]);

  const updateHighlight = (text: string) => {
    if (highlightRef.current) {
      highlightRef.current.innerHTML = liquidHighlight(text, theme === 'dark');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div
      className={`relative h-full w-full ${className}`}
      role="application"
      aria-label="Liquid Syntax Editor"
    >
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onScroll={handleScroll}
        className="font-mono text-sm w-full h-full resize-none bg-transparent text-transparent caret-black dark:caret-white z-10 absolute top-0 left-0 p-[11px]"
        placeholder="Edit your Liquid syntax here..."
        aria-label="Liquid syntax input"
        aria-multiline="true"
        aria-describedby="editor-description"
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', ...options.style }}
      />
      <div
        id="editor-description"
        className="sr-only"
      >
        This is a Liquid syntax editor. As you type, syntax highlighting will be applied to your code.
      </div>
      <div
        ref={highlightRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-auto font-mono text-sm p-[11px] m-0"
        aria-hidden="true"
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', ...options.style }}
      />
    </div>
  );
};

export default HighlightedLiquidEditor;