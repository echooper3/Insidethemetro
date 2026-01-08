import React from 'react';

// Basic renderer to handle bolding and newlines from Gemini response
// since we can't easily pull in a full markdown library without npm install in this environment
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const formatText = (text: string) => {
    // Split by newlines
    return text.split('\n').map((line, i) => {
      // Very basic bold parser: **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      
      return (
        <div key={i} className={`mb-2 ${line.trim().startsWith('*') || line.trim().startsWith('-') ? 'pl-4' : ''}`}>
           {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-slate-900">{part.slice(2, -2)}</strong>;
              }
              return <span key={j} className="text-slate-700">{part}</span>;
           })}
        </div>
      );
    });
  };

  return (
    <div className="prose prose-slate max-w-none">
      {formatText(content)}
    </div>
  );
};

export default MarkdownRenderer;
