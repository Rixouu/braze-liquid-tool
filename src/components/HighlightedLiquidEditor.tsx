import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from 'next-themes';  // Replace with your custom theme hook

const FW = 'font-weight:400;'

const liquidHighlight = (str: string, isDark: boolean) => {
  const tagColor = isDark ? '#c4b5fd' : '#5b21b6'
  const varColor = isDark ? '#7dd3fc' : '#0369a1'
  const stringColor = isDark ? '#fde68a' : '#854d0e'
  const numberColor = isDark ? '#fda4af' : '#9f1239'
  const keywordColor = isDark ? '#6ee7b7' : '#047857'
  const operatorColor = isDark ? '#e2e8f0' : '#57534e'

  // Escape characters that would break the overlay HTML. Do not escape `>`:
  // Liquid tags end with `%}`; turning `>` into `&gt;` breaks `/{%.*?%}/g` and
  // leaves corrupted innerHTML (e.g. string highlighter matching inside spans).
  str = str.replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/</g, '&lt;');

  // Highlight Liquid tags
  str = str.replace(/{%.*?%}/g, (match) => {
    // Highlight keywords within tags
    let highlightedMatch = match.replace(
      /\b(if|else|elsif|endif|assign|capture|endcapture|case|when|endcase|for|endfor|abort_message|tablerow|endtablerow|unless|endunless|comment|endcomment)\b/g,
      `<span style="color: ${keywordColor};${FW}">$1</span>`
    );
    // Highlight numbers within tags
    highlightedMatch = highlightedMatch.replace(/\b(\d+)\b/g,
      `<span style="color: ${numberColor};${FW}">$1</span>`
    );
    // Highlight strings within tags, but not HTML-like attributes
    highlightedMatch = highlightedMatch.replace(/'([^']*?)'/g, (match, p1) => {
      if (match.includes('style') || match.includes('color:')) {
        return match; // Don't highlight these strings
      }
      return `'<span style="color: ${stringColor};${FW}">${p1}</span>'`;
    });
    // Highlight operators and special characters
    highlightedMatch = highlightedMatch.replace(/(\s|^)(==|!=|>=|<=|>|<|=|\+|-|\*|\/|\|)(\s|$)/g,
      `$1<span style="color: ${operatorColor};${FW}">$2</span>$3`
    );
    return `<span style="color: ${tagColor};${FW}">${highlightedMatch}</span>`;
  });

  // Highlight Liquid variables
  str = str.replace(/{{.*?}}/g, (match) => {
    // Highlight numbers within variables
    let highlightedMatch = match.replace(/\b(\d+)\b/g,
      `<span style="color: ${numberColor};${FW}">$1</span>`
    );
    // Highlight strings within variables
    highlightedMatch = highlightedMatch.replace(/'([^']*?)'/g,
      `'<span style="color: ${stringColor};${FW}">$1</span>'`
    );
    // Highlight operators and special characters
    highlightedMatch = highlightedMatch.replace(/(\s|^)(==|!=|>=|<=|>|<|=|\+|-|\*|\/|\|)(\s|$)/g,
      `$1<span style="color: ${operatorColor};${FW}">$2</span>$3`
    );
    return `<span style="color: ${varColor};${FW}">${highlightedMatch}</span>`;
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
        className="font-mono text-sm font-normal w-full h-full resize-none bg-transparent text-transparent caret-foreground z-10 absolute top-0 left-0 p-[11px]"
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
        className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-auto font-mono text-sm font-normal text-foreground p-[11px] m-0"
        aria-hidden="true"
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', ...options.style }}
      />
    </div>
  );
};

export default HighlightedLiquidEditor;