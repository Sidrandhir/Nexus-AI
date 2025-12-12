import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // A very simple manual parser to avoid dependency issues in strict environments
  // Supports code blocks (```), bold (**), and basic paragraphs
  
  const renderContent = () => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Code block
        const lines = part.split('\n');
        const language = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        
        return (
          <div key={index} className="relative group my-4 rounded-lg overflow-hidden bg-[#1e1e1e] border border-gray-700">
            <div className="flex justify-between items-center px-4 py-2 bg-[#2d2d2d] border-b border-gray-700 text-xs text-gray-400">
              <span className="font-mono">{language || 'code'}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
              <code>{code}</code>
            </pre>
          </div>
        );
      } else {
        // Text block
        // Handle bolding **text**
        const paragraphs = part.split('\n\n').filter(p => p.trim());
        
        return (
          <div key={index}>
            {paragraphs.map((para, pIndex) => {
              // Simple bold parser
              const boldParts = para.split(/(\*\*.*?\*\*)/g);
              return (
                <p key={pIndex} className="mb-4 text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {boldParts.map((subPart, sIndex) => {
                    if (subPart.startsWith('**') && subPart.endsWith('**')) {
                      return <strong key={sIndex} className="font-bold text-white">{subPart.slice(2, -2)}</strong>;
                    }
                    // Handle simple links [Text](url)
                    const linkMatch = subPart.match(/\[(.*?)\]\((.*?)\)/);
                    if (linkMatch) {
                        const [full, text, url] = linkMatch;
                        const split = subPart.split(full);
                        return (
                            <span key={sIndex}>
                                {split[0]}
                                <a href={url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{text}</a>
                                {split[1]}
                            </span>
                        )
                    }
                    return subPart;
                  })}
                </p>
              );
            })}
          </div>
        );
      }
    });
  };

  return <div className="markdown-body">{renderContent()}</div>;
};

export default MarkdownRenderer;
