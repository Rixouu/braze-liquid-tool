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

  const highlightContent = (content: string) => {
    const tokens = [
      { name: 'string', regex: /'[^']*'|"[^"]*"/ },
      { name: 'keyword', regex: /\b(?:if|else|elsif|endif|assign|capture|endcapture|case|when|endcase|for|endfor|abort_message|tablerow|endtablerow|unless|endunless|comment|endcomment)\b/ },
      { name: 'number', regex: /\b\d+\b/ },
      { name: 'operator', regex: /==|!=|>=|<=|>|<|=|\+|-|\*|\/|\||:/ },
    ];

    const combinedRegex = new RegExp(tokens.map(t => `(${t.regex.source})`).join('|'), 'g');
    let lastIndex = 0;
    let result = '';
    let match;
    
    while ((match = combinedRegex.exec(content)) !== null) {
      // Add text before the match, escaping HTML
      const before = content.slice(lastIndex, match.index);
      result += before.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Find which token type matched
      const captureIndex = match.slice(1).findIndex(val => val !== undefined);
      if (captureIndex !== -1) {
        const token = tokens[captureIndex];
        const color = token.name === 'string' ? stringColor :
                      token.name === 'keyword' ? keywordColor :
                      token.name === 'number' ? numberColor :
                      operatorColor;
        
        const escapedMatch = match[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        result += `<span style="color: ${color};${FW}">${escapedMatch}</span>`;
      }
      
      lastIndex = combinedRegex.lastIndex;
    }
    
    result += content.slice(lastIndex).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return result;
  };

  // Split string by tags/variables, keeping the delimiters
  const parts = str.split(/(\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\})/g);
  
  return parts.map((part, index) => {
    if (index % 2 === 0) {
      // Outside tag
      return part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else {
      // Inside tag or variable
      const isTag = part.startsWith('{%');
      const prefix = isTag ? '{%' : '{{';
      const suffix = isTag ? '%}' : '}}';
      const inner = part.slice(2, -2);
      const outerColor = isTag ? tagColor : varColor;
      
      return `<span style="color: ${outerColor};${FW}">${prefix}</span>${highlightContent(inner)}<span style="color: ${outerColor};${FW}">${suffix}</span>`;
    }
  }).join('').replace(/\n/g, '<br>');
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