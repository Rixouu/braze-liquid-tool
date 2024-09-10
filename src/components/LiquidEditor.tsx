import React, { useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import Prism from 'prismjs';
import 'prismjs/components/prism-liquid';
import 'prismjs/themes/prism.css';

const LiquidEditor = ({ content, onChange }) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
    highlightSyntax();
  };

  const highlightSyntax = () => {
    if (textareaRef.current && highlightRef.current) {
      const code = textareaRef.current.value;
      highlightRef.current.innerHTML = Prism.highlight(code, Prism.languages.liquid, 'liquid');
      syncScroll();
    }
  };

  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    highlightSyntax();
  }, [content]);

  return (
    <div className="liquid-editor">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onScroll={syncScroll}
        className="font-mono text-sm h-[400px] resize-none"
        placeholder="Edit your Liquid syntax here..."
      />
      <pre className="syntax-highlight">
        <code ref={highlightRef} className="language-liquid" />
      </pre>
      <style jsx>{`
        .liquid-editor {
          position: relative;
        }
        .liquid-editor textarea, .liquid-editor pre {
          padding: 1rem;
          font-size: 14px;
          line-height: 1.5;
          background-color: transparent;
          border: 1px solid #e9ecef;
          border-radius: 4px;
        }
        .liquid-editor textarea {
          color: transparent;
          caret-color: #000;
          resize: none;
          z-index: 1;
        }
        .liquid-editor pre {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          margin: 0;
        }
        .liquid-editor :global(textarea:focus) {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
        }
      `}</style>
    </div>
  );
};

export default LiquidEditor;