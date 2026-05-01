import React, { useMemo } from 'react';

export function LiquidPreview({ text }: { text: string }) {
  const normalized = useMemo(() => text.replace(/\r\n/g, '\n').trim(), [text]);

  const renderInline = (input: string) => {
    const nodes: React.ReactNode[] = [];
    const re = /(code\s+)([A-Z0-9_-]{3,})/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(input)) != null) {
      const [full, prefix, token] = match;
      const start = match.index;
      const end = start + full.length;
      if (start > lastIndex) nodes.push(input.slice(lastIndex, start));
      nodes.push(prefix);
      nodes.push(
        <span
          key={`${start}-${end}`}
          className="inline-flex items-center rounded-md border border-[#DDD6FE] bg-[#EDE9FE] px-2 py-0.5 font-mono text-[12px] font-semibold text-[#32026A]"
        >
          {token}
        </span>,
      );
      lastIndex = end;
    }
    if (lastIndex < input.length) nodes.push(input.slice(lastIndex));
    return nodes.length ? nodes : input;
  };

  const blocks = useMemo(() => {
    if (!normalized) return [];
    return normalized.replace(/\n{3,}/g, '\n\n').split(/\n{2,}/g);
  }, [normalized]);

  return (
    <div className="h-full overflow-auto p-3 sm:p-4">
      <div className="min-h-full rounded-2xl border border-[#E4DFF4] bg-[#F8FAFC] p-5 text-[14px] leading-7 text-[#1E293B]">
        {blocks.length === 0 ? (
          <div className="text-sm text-[#64748B]">Render to see output.</div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, i) => {
              const lines = block.split('\n');
              const isBulletList = lines.length > 0 && lines.every((l) => l.trim().startsWith('•'));
              if (isBulletList) {
                return (
                  <ul key={i} className="list-none space-y-1 pl-5">
                    {lines.map((l, j) => (
                      <li key={j} className="relative">
                        <span className="absolute -left-5 top-0 text-[#94A3B8]">•</span>
                        <span>{renderInline(l.trim().slice(1).trim())}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p key={i} className="m-0 text-[#1E293B]">
                  {lines.map((line, j) => (
                    <React.Fragment key={j}>
                      {renderInline(line)}
                      {j < lines.length - 1 ? <br /> : null}
                    </React.Fragment>
                  ))}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiquidPreview;
