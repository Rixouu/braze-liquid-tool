import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";

const FW = 'font-weight:400;'

const liquidHighlight = (str: string) => {
  const tagColor = '#c084fc'
  const varColor = '#67e8f9'
  const stringColor = '#86efac'
  const numberColor = '#fda4af'
  const keywordColor = '#c084fc'
  const operatorColor = '#e2d9f3'

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

  useEffect(() => {
    setContent(value);
    updateHighlight(value);
  }, [value]);

  useEffect(() => {
    updateHighlight(content);
  }, [content]);

  const updateHighlight = (text: string) => {
    if (highlightRef.current) {
      highlightRef.current.innerHTML = liquidHighlight(text);
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
        className="absolute left-0 top-0 z-10 h-full w-full resize-none bg-transparent p-[11px] font-mono text-sm font-normal text-transparent caret-[#A78BFA]"
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
        className="pointer-events-none absolute left-0 top-0 m-0 h-full w-full overflow-auto p-[11px] font-mono text-sm font-normal text-[#E2D9F3]"
        aria-hidden="true"
        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', ...options.style }}
      />
    </div>
  );
};

export default HighlightedLiquidEditor;
