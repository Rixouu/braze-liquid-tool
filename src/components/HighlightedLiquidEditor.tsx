import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from 'next-themes';

const liquidHighlight = (str: string, isDark: boolean) => {
  // Escape HTML characters to prevent XSS
  str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Highlight Liquid tags
  str = str.replace(/({%.*?%})/g, `<span style="color: ${isDark ? '#ff79c6' : '#905'}">$1</span>`);
  // Highlight Liquid variables
  str = str.replace(/({{.*?}})/g, `<span style="color: ${isDark ? '#8be9fd' : '#07a'}">$1</span>`);
  return str;
};

const HighlightedLiquidEditor = ({ initialContent, onChange }) => {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    setContent(initialContent);
    updateHighlight(initialContent);
  }, [initialContent]);

  useEffect(() => {
    updateHighlight(content);
  }, [theme]);

  const updateHighlight = (text: string) => {
    if (highlightRef.current) {
      highlightRef.current.innerHTML = liquidHighlight(text, theme === 'dark');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateHighlight(newContent);
    onChange(newContent);
  };

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="relative border rounded-md overflow-hidden">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onScroll={handleScroll}
        className="font-mono text-sm w-full h-[200px] sm:h-[300px] resize-none bg-transparent text-transparent caret-black dark:caret-white z-10 relative p-[11px]"
        placeholder="Edit your Liquid syntax here..."
      />
      <pre
        ref={highlightRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-auto whitespace-pre-wrap font-mono text-sm p-[11px] m-0"
        aria-hidden="true"
      ></pre>
    </div>
  );
};

export default HighlightedLiquidEditor;