// Fix: Declare window.__sidebarGestureLock for TypeScript
declare global {
  interface Window {
    __sidebarGestureLock?: boolean;
  }
}
import React, { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Message, AIModel, RouterResult, ChatSession, GroundingChunk } from '../types';
import { Icons } from '../constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatArea.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, LineChart, Line 
} from 'recharts';

interface ChatAreaProps {
  session: ChatSession;
  isLoading: boolean;
  routingInfo: RouterResult | null;
  onExport: () => void;
  onShare: () => void;
  onModelChange: (model: AIModel | 'auto') => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onRegenerate: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onFeedback: (messageId: string, feedback: 'good' | 'bad' | null) => void;
  streamingTokens?: number;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onSuggestionClick?: (text: string) => void;
}

// Cross-platform clipboard helper — falls back to execCommand for insecure contexts (HTTP, WebViews)
const copyToClipboard = (text: string) => {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
};
const fallbackCopy = (text: string) => {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
};

// iOS-safe file download — uses navigator.share on iOS Safari where <a download> is ignored
const downloadFile = (blob: Blob, filename: string) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS && navigator.share && navigator.canShare?.({ files: [new File([blob], filename)] })) {
    navigator.share({ files: [new File([blob], filename, { type: blob.type })] }).catch(() => {
      // User cancelled share — fallback to opening in new tab
      window.open(URL.createObjectURL(blob), '_blank');
    });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

const EnhancedTable = ({ children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const handleCopyData = () => {
    if (!tableRef.current) return;
    const rows = Array.from(tableRef.current.querySelectorAll('tr')) as HTMLTableRowElement[];
    const tsv = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('th, td')) as HTMLElement[];
      return cells.map(cell => cell.innerText.trim()).join('\t');
    }).join('\n');
    copyToClipboard(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="group/table relative my-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]/5 transition-all hover:border-[var(--text-secondary)]/30 shadow-sm">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover/table:opacity-100 transition-opacity">
        <button onClick={handleCopyData} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all active:scale-95">
          {copied ? <Icons.Check className="w-3 h-3" /> : <Icons.Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar"><table ref={tableRef} className="w-full">{children}</table></div>
    </div>
  );
};

const EnhancedChart = ({ dataStr }: { dataStr: string }) => {
  try {
    const config = JSON.parse(dataStr);
    const { type = 'area', data, label = 'Data Insights' } = config;
    const accentColor = 'var(--accent)';
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-3 rounded-lg shadow-xl">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-0.5">{label}</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{payload[0].value}</p>
          </div>
        );
      }
      return null;
    };
    return (
      <div className="my-6 p-4 sm:p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/20 relative overflow-hidden group/chart transition-all">
        <div className="mb-4 flex justify-between items-center opacity-60"><h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{label}</h4></div>
        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)', fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.2 }} />
                <Bar dataKey="value" fill={accentColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : type === 'line' ? (
              <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)', fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" stroke={accentColor} strokeWidth={2.5} dot={{ r: 2.5, fill: 'var(--bg-primary)', strokeWidth: 1.5 }} activeDot={{ r: 4 }} />
              </LineChart>
            ) : (
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={accentColor} stopOpacity={0.15}/><stop offset="95%" stopColor={accentColor} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)', fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke={accentColor} strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  } catch (err) { return null; }
};

const MermaidBlock = ({ code }: { code: string }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Sanitize Mermaid code: escape unquoted parentheses inside node labels
  // that Mermaid misinterprets as shape delimiters (e.g., "(Auth, User Profiles)")
  const sanitizeMermaidCode = (raw: string): string => {
    return raw.replace(
      // Match node definitions like:  nodeId[Label text(something)] or nodeId(Label(something))
      // Captures lines with node labels containing nested parens
      /^(\s*\w[\w\d_-]*)\s*(\[|[\(])(.+?)(\]|[\)])(\s*$)/gm,
      (match, nodeId, openShape, label, closeShape, trailing) => {
        // If already quoted, leave it alone
        if (label.startsWith('"') && label.endsWith('"')) return match;
        // Escape inner parens inside the label text by wrapping in quotes
        if (/\(/.test(label) && openShape === '[') {
          return `${nodeId}${openShape}"${label}"${closeShape}${trailing}`;
        }
        return match;
      }
    ).replace(
      // Fix unquoted labels with parens in bracket nodes across multiline: id["text<br>(details)"]
      // Catch the common AI pattern: id[Text<br>(something, something)]
      /(\w[\w\d_-]*)\[([^\]"]*\([^\]]*\)[^\]"]*)\]/g,
      (match, nodeId, label) => {
        if (label.startsWith('"') && label.endsWith('"')) return match;
        return `${nodeId}["${label}"]`;
      }
    ).replace(
      // Catch round-bracket shape nodes with inner parens: id(Text<br>(details))
      // Mermaid can't handle nested () - wrap label in quotes
      /(\w[\w\d_-]*)\(([^)"]*\([^)]*\)[^)"]*)\)/g,
      (match, nodeId, label) => {
        if (label.startsWith('"') && label.endsWith('"')) return match;
        return `${nodeId}("${label}")`;
      }
    );
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        const sanitized = sanitizeMermaidCode(code);
        const { svg: rendered } = await mermaid.render(id, sanitized);
        if (!cancelled) setSvg(rendered);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Invalid Mermaid syntax');
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  const handleDownloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    downloadFile(blob, 'diagram.svg');
  };

  if (error) {
    return <div className="my-6 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 text-sm">Diagram error: {error}</div>;
  }

  return (
    <div className="relative group/mermaid my-6 border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--code-bg)] shadow-sm transition-all hover:border-[var(--text-secondary)]/20">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--code-header)] border-b border-[var(--border)]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-50">DIAGRAM</span>
        {svg && (
          <button onClick={handleDownloadSvg} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <Icons.Download className="w-3 h-3" />
            Download SVG
          </button>
        )}
      </div>
      {svg ? (
        <div className="p-4 flex justify-center overflow-x-auto custom-scrollbar [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="p-8 flex justify-center"><div className="w-5 h-5 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" /></div>
      )}
    </div>
  );
};

const ProductGrid = memo(({ dataStr }: { dataStr: string }) => {
  const products = useMemo(() => {
    try {
      const parsed = JSON.parse(dataStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [dataStr]);

  if (!products.length) return null;

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Products</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p: any, i: number) => (
          <a
            key={i}
            href={p.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col border border-[var(--border)] rounded-xl p-4 bg-[var(--bg-secondary)] hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all duration-200"
          >
            {p.image && (
              <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain" loading="lazy" />
              </div>
            )}
            <h4 className="text-sm font-bold text-[var(--text-primary)] line-clamp-2 mb-1 group-hover:text-[var(--accent)] transition-colors">{p.name}</h4>
            {p.description && <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">{p.description}</p>}
            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="text-base font-bold text-[var(--accent)]">{p.price}</span>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                {p.rating && <span>⭐ {p.rating}</span>}
                {p.store && <span className="bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full text-[11px]">{p.store}</span>}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View Product</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});

const CodeBlock = memo(({ children, className }: { children?: React.ReactNode; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const language = className?.replace('language-', '') || '';
  const codeString = String(children).replace(/\n$/, '');
  // Touch lock logic for horizontal scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = 0;
    let startY = 0;
    let isScrolling = false;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (!isScrolling && dx > 10 && dx > dy && el.scrollWidth > el.clientWidth) {
        isScrolling = true;
        window.__sidebarGestureLock = true;
      }
    };
    const onTouchEnd = () => {
      setTimeout(() => { window.__sidebarGestureLock = false; }, 80);
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);
  if (className === 'language-chart') return <EnhancedChart dataStr={codeString} />;
  if (language === 'mermaid') return <MermaidBlock code={codeString} />;
  if (language === 'products') return <ProductGrid dataStr={codeString} />;

  const handleCopy = () => {
    copyToClipboard(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
      cpp: 'cpp', c: 'c', csharp: 'cs', go: 'go', rust: 'rs',
      ruby: 'rb', php: 'php', swift: 'swift', kotlin: 'kt',
      html: 'html', css: 'css', scss: 'scss', sql: 'sql',
      json: 'json', yaml: 'yml', xml: 'xml', markdown: 'md',
      bash: 'sh', shell: 'sh', powershell: 'ps1', csv: 'csv',
      toml: 'toml', ini: 'ini', dockerfile: 'Dockerfile',
    };
    const mimeMap: Record<string, string> = {
      csv: 'text/csv', json: 'application/json', html: 'text/html',
      xml: 'application/xml', sql: 'application/sql', markdown: 'text/markdown',
    };
    const nameMap: Record<string, string> = {
      csv: 'data', json: 'data', html: 'document', sql: 'query',
      markdown: 'document', xml: 'data',
    };
    const ext = extMap[language] || language || 'txt';
    const mime = mimeMap[language] || 'text/plain';
    const baseName = nameMap[language] || 'code';
    const blob = new Blob([codeString], { type: mime });
    downloadFile(blob, `${baseName}.${ext}`);
  };

  // Memoize syntax highlighting — only recompute when code content changes
  const highlightedHtml = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(codeString, { language }).value;
      } else {
        return hljs.highlightAuto(codeString).value;
      }
    } catch {
      return codeString;
    }
  }, [codeString, language]);

  return (
    <div ref={containerRef} className="relative group/code my-6 border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--code-bg)] shadow-sm max-w-full transition-all hover:border-[var(--text-secondary)]/20">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--code-header)] border-b border-[var(--border)]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-50">{language || 'SOURCE'}</span>
        <div className="flex items-center gap-3">
          <button onClick={handleDownload} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <Icons.Download className="w-3 h-3" />
            Download
          </button>
          <button onClick={handleCopy} className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all ${copied ? 'text-emerald-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            {copied ? <Icons.Check className="w-3 h-3" /> : <Icons.Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto custom-scrollbar leading-relaxed"><code ref={codeRef} className={`hljs ${className || ''} block p-5 w-fit min-w-full text-[0.875rem] sm:text-[0.875rem]`} dangerouslySetInnerHTML={{ __html: highlightedHtml }} /></pre>
    </div>
  );
});

// ── Memoized message component — prevents re-rendering unchanged messages during streaming ──
interface MessageItemProps {
  msg: Message;
  isLast: boolean;
  isLoading: boolean;
  copiedId: string | null;
  editingId: string | null;
  editContent: string;
  speakingMsgId: string | null;
  onCopyText: (text: string, id: string) => void;
  onStartEdit: (id: string, content: string) => void;
  onCancelEdit: () => void;
  onSubmitEdit: (id: string) => void;
  onEditContentChange: (val: string) => void;
  onRegenerate: (id: string) => void;
  onFeedback: (id: string, fb: 'good' | 'bad' | null) => void;
  onSpeak: (id: string, text: string) => void;
  onSuggestionClick?: (text: string) => void;
  markdownComponents: any;
  remarkPlugins: any;
}

const MessageItem = memo(({ msg, isLast, isLoading, copiedId, editingId, editContent, speakingMsgId, onCopyText, onStartEdit, onCancelEdit, onSubmitEdit, onEditContentChange, onRegenerate, onFeedback, onSpeak, onSuggestionClick, markdownComponents, remarkPlugins }: MessageItemProps) => {
  return (
    <div className={`group flex flex-col gap-3 animate-in fade-in duration-600 ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-full`}>
      <div className="relative max-w-full sm:max-w-[92%] w-auto min-w-0">
        <div className={`p-6 sm:p-7 rounded-2xl border transition-all ${msg.role === 'user' ? 'bg-[var(--bg-tertiary)]/30 border-[var(--border)] text-[var(--text-primary)] shadow-sm' : 'bg-transparent border-transparent text-[var(--text-primary)]'} overflow-hidden`}>
          {msg.documents && msg.documents.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {msg.documents.map((doc, di) => {
                const ext = doc.title.split('.').pop()?.toLowerCase() || '';
                const isZip = ext === 'zip';
                const fileInfo: Record<string, { color: string; label: string; icon: string }> = {
                  pdf: { color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'PDF', icon: '📄' },
                  docx: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'DOC', icon: '📝' },
                  doc: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'DOC', icon: '📝' },
                  xlsx: { color: 'text-green-400 bg-green-500/10 border-green-500/20', label: 'XLS', icon: '📊' },
                  xls: { color: 'text-green-400 bg-green-500/10 border-green-500/20', label: 'XLS', icon: '📊' },
                  csv: { color: 'text-green-400 bg-green-500/10 border-green-500/20', label: 'CSV', icon: '📊' },
                  zip: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', label: 'ZIP', icon: '📦' },
                  json: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', label: 'JSON', icon: '{ }' },
                  md: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', label: 'MD', icon: '📑' },
                };
                const info = fileInfo[ext] || { color: 'text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border-[var(--border)]', label: 'TXT', icon: '📄' };
                const zipFileCount = isZip ? (doc.content.match(/--- File: /g)?.length || 0) : 0;
                return (
                  <div key={di} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${info.color} min-w-[120px] max-w-[220px]`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${info.color}`}>
                      <span className="text-xs">{info.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{doc.title}</p>
                      <p className="text-[11px] text-[var(--text-secondary)]">{isZip ? `${zipFileCount} file${zipFileCount !== 1 ? 's' : ''}` : `${info.label} file`}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {isLoading && msg.role === 'assistant' && !msg.content ? (
            <div className="flex items-center gap-3 py-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse delay-150" />
              </div>
              <span className="text-[13px] sm:text-sm font-medium text-[var(--text-secondary)] animate-pulse">Thinking...</span>
            </div>
          ) : editingId === msg.id ? (
            <div className="space-y-4">
              <textarea value={editContent} onChange={(e) => onEditContentChange(e.target.value)} aria-label="Edit message content" placeholder="Edit your message..." className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 text-[15px] sm:text-base focus:outline-none focus:border-[var(--accent)] transition-all leading-relaxed text-[var(--text-primary)] shadow-inner" rows={3} />
              <div className="flex gap-2"><button onClick={() => onSubmitEdit(msg.id)} className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-[13px] sm:text-sm font-semibold active:scale-95 transition-all shadow-lg shadow-[var(--accent)]/10">Update</button><button onClick={onCancelEdit} className="px-5 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[13px] sm:text-sm font-semibold border border-[var(--border)] active:scale-95 transition-all">Cancel</button></div>
            </div>
          ) : (
            <div className="markdown-body"><ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>{msg.content}</ReactMarkdown></div>
          )}
          {msg.image && <div className="mt-8 rounded-xl overflow-hidden border border-[var(--border)] shadow-xl"><img src={`data:${msg.image.mimeType};base64,${msg.image.inlineData.data}`} alt="Context Attached" className="max-w-full h-auto" /></div>}
          {msg.groundingChunks && msg.groundingChunks.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[var(--border)] animate-in fade-in duration-700">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-2">
                {msg.groundingChunks.map((chunk: GroundingChunk, i: number) => {
                  const uri = chunk.web?.uri || chunk.maps?.uri;
                  const title = chunk.web?.title || chunk.maps?.title;
                  if (!uri) return null;
                  return (
                    <a key={i} href={uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)]/40 border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all group shadow-sm active:scale-[0.98]">
                      <span className="text-[12px] sm:text-[13px] font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate max-w-[180px]">{title || "Source"}</span>
                      <Icons.PanelLeftOpen className="w-2 h-2 opacity-30 group-hover:opacity-100 rotate-180 transition-opacity" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className={`mt-2 flex items-center gap-1 ${msg.role === 'assistant' ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity ${msg.role === 'user' ? 'justify-end pr-2' : 'pl-2'}`}>
          <button onClick={() => onCopyText(msg.content, msg.id)} aria-label="Copy message" data-nexus-tooltip={copiedId === msg.id ? 'Copied' : 'Copy'} className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)] transition-all">{copiedId === msg.id ? <Icons.Check className="w-3.5 h-3.5 text-[var(--accent)]" /> : <Icons.Copy className="w-3.5 h-3.5" />}</button>
          {msg.role === 'user' && <button onClick={() => onStartEdit(msg.id, msg.content)} aria-label="Edit message" data-nexus-tooltip="Edit" className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)] transition-all"><Icons.Edit className="w-3.5 h-3.5" /></button>}
          {msg.role === 'assistant' && (
            <>
              <button onClick={() => onRegenerate(msg.id)} aria-label="Regenerate response" data-nexus-tooltip="Retry" className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)] transition-all"><Icons.RotateCcw className="w-3.5 h-3.5" /></button>
              <button 
                onClick={() => onSpeak(msg.id, msg.content)} 
                aria-label={speakingMsgId === msg.id ? "Stop speaking" : "Read aloud"} 
                data-nexus-tooltip={speakingMsgId === msg.id ? "Stop" : "Read aloud"} 
                className={`p-2 rounded-xl transition-all ${
                  speakingMsgId === msg.id 
                    ? 'text-[var(--accent)] bg-[var(--accent)]/10 animate-pulse' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-primary)]'
                }`}
              >
                {speakingMsgId === msg.id ? <Icons.VolumeX className="w-3.5 h-3.5" /> : <Icons.Volume2 className="w-3.5 h-3.5" />}
              </button>
              <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
              <button 
                onClick={() => onFeedback(msg.id, msg.feedback === 'good' ? null : 'good')} 
                aria-label="Good response" 
                data-nexus-tooltip="Good response" 
                className={`p-2 rounded-xl transition-all ${
                  msg.feedback === 'good' 
                    ? 'text-[var(--accent)] bg-[var(--accent)]/10' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-primary)]'
                }`}
              >
                <Icons.ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => onFeedback(msg.id, msg.feedback === 'bad' ? null : 'bad')} 
                aria-label="Bad response" 
                data-nexus-tooltip="Bad response" 
                className={`p-2 rounded-xl transition-all ${
                  msg.feedback === 'bad' 
                    ? 'text-red-400 bg-red-500/10' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-primary)]'
                }`}
              >
                <Icons.ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
        {isLast && msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && !isLoading && (
          <div className="mt-8 flex flex-col gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-wrap gap-2">{msg.suggestions.map((suggestion, i) => (<button key={i} onClick={() => onSuggestionClick?.(suggestion)} className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)]/20 border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all text-[13px] sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] text-left active:scale-[0.97] shadow-sm">{suggestion}</button>))}</div>
          </div>
        )}
      </div>
    </div>
  );
}, (prev, next) => {
  // Custom equality — only re-render when THIS message's data actually changes
  if (prev.msg.content !== next.msg.content) return false;
  if (prev.msg.feedback !== next.msg.feedback) return false;
  if (prev.msg.suggestions !== next.msg.suggestions) return false;
  if (prev.isLast !== next.isLast) return false;
  if (prev.isLoading !== next.isLoading) return false;
  if ((prev.copiedId === prev.msg.id) !== (next.copiedId === next.msg.id)) return false;
  if ((prev.editingId === prev.msg.id) !== (next.editingId === next.msg.id)) return false;
  if (prev.editingId === prev.msg.id && prev.editContent !== next.editContent) return false;
  if ((prev.speakingMsgId === prev.msg.id) !== (next.speakingMsgId === next.msg.id)) return false;
  return true;
});

const ChatArea: React.FC<ChatAreaProps> = ({ 
  session, 
  isLoading, 
  onExport, 
  onToggleSidebar,
  isSidebarOpen,
  onRegenerate,
  onEditMessage,
  onFeedback,
  theme,
  onThemeToggle,
  onSuggestionClick
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = session?.messages || [];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const scrollRafRef = useRef<number>(0);
  const autoScrollRafRef = useRef<number>(0);

  // Strip markdown for clean TTS speech
  const stripMarkdown = useCallback((text: string): string => {
    return text
      .replace(/```[\s\S]*?```/g, '. code block omitted. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/^\s*[-*+]\s/gm, '')
      .replace(/^\s*\d+\.\s/gm, '')
      .replace(/^\s*>\s/gm, '')
      .replace(/---/g, '')
      .replace(/\|[^\n]+\|/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();
  }, []);

  // TTS: speak or stop a message
  const speakMessage = useCallback((msgId: string, text: string) => {
    const synth = window.speechSynthesis;
    if (speakingMsgId === msgId) {
      synth.cancel();
      setSpeakingMsgId(null);
      utteranceRef.current = null;
      return;
    }
    synth.cancel();
    const cleaned = stripMarkdown(text);
    if (!cleaned) return;

    // Chrome desktop bug: voices may not be loaded yet.
    // If no voices, wait for them, then retry once.
    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      // Pick a good voice if available (prefer en-US, avoid novelty voices)
      const voices = synth.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
        || voices.find(v => v.lang.startsWith('en-US') && !v.localService)
        || voices.find(v => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => { setSpeakingMsgId(null); utteranceRef.current = null; };
      utterance.onerror = (e) => { 
        // 'interrupted' and 'canceled' are normal when user stops
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          setSpeakingMsgId(null); 
          utteranceRef.current = null; 
        }
      };
      utteranceRef.current = utterance;
      setSpeakingMsgId(msgId);
      // Chrome workaround: cancel + small delay before speaking
      synth.cancel();
      setTimeout(() => synth.speak(utterance), 50);
    };

    if (synth.getVoices().length === 0) {
      // Voices not loaded yet — wait for voiceschanged
      let spoken = false;
      const onVoicesChanged = () => {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        if (!spoken) { spoken = true; doSpeak(); }
      };
      synth.addEventListener('voiceschanged', onVoicesChanged);
      // Fallback: if voiceschanged never fires (Firefox), try after 500ms anyway
      setTimeout(() => {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        if (!spoken) { spoken = true; doSpeak(); }
      }, 500);
    } else {
      doSpeak();
    }
  }, [speakingMsgId, stripMarkdown]);

  // Cleanup TTS on session change or unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      cancelAnimationFrame(scrollRafRef.current);
      cancelAnimationFrame(autoScrollRafRef.current);
    };
  }, [session?.id]);

  useEffect(() => {
    if (scrollRef.current && autoScroll) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: isLoading ? 'auto' : 'smooth'
          });
        }
      });
    }
  }, [messages, isLoading, autoScroll]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
      setAutoScroll(isAtBottom);
      setShowScrollDown(!isAtBottom);
    });
  }, []);

  const handleCopyText = useCallback((text: string, id: string) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleStartEdit = useCallback((id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const submitEdit = useCallback((id: string) => {
    if (editContent.trim()) {
      onEditMessage(id, editContent.trim());
      setEditingId(null);
    }
  }, [editContent, onEditMessage]);

  const getModelDisplayName = (model?: AIModel) => {
    if (!model) return "Nexus AI";
    switch (model) {
      case AIModel.GPT4: return "Reasoning & Planning";
      case AIModel.CLAUDE: return "Coding & Writing";
      case AIModel.GEMINI: return "Search & Speed";
      default: return "Nexus AI";
    }
  };

  // Stable memoized markdown components — prevents re-creation on every render
  const markdownComponents = useMemo(() => ({
    table: EnhancedTable,
    p: ({ children }: any) => <div className="mb-4 leading-relaxed">{children}</div>,
    code: ({ node, inline, className, children, ...props }: any) => {
      // Always render fenced code blocks as block
      if (!inline) return <CodeBlock className={className} children={children} />;

      // Only render as inline if it's a single identifier (no spaces, no symbols, no newlines)
      const text = String(children).trim();
      const identifierPattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
      if (identifierPattern.test(text)) {
        return <code className={`${className || ''} inline-code text-[var(--accent)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded-md text-[0.875em] font-semibold border border-[var(--border)]`} {...props}>{children}</code>;
      }
      // Otherwise, treat as block code
      return <CodeBlock className={className} children={children} />;
    }
  }), []);

  const remarkPluginsStable = useMemo(() => [remarkGfm], []);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Remove dot and all top-right controls on mobile */}
      <div className="fixed top-6 right-8 z-40 gap-2 bg-[var(--bg-primary)]/90 rounded-2xl shadow-xl border border-[var(--border)] px-3 py-2 backdrop-blur-md items-center hidden sm:flex">
        <button
          onClick={onThemeToggle}
          aria-label="Toggle theme"
          data-nexus-tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)] transition-colors"
        >
          {theme === 'dark' ? <Icons.Sun className="w-4 h-4" /> : <Icons.Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={onExport}
          aria-label="Export conversation"
          data-nexus-tooltip="Export chat"
          className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)] transition-colors"
        >
          <Icons.Download className="w-4 h-4" />
        </button>
      </div>
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-2 sm:px-0 py-8 sm:py-14 touch-action-pan-y overscroll-behavior-contain">
        <div className="max-w-[900px] w-full mx-auto flex flex-col gap-12 pb-32">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-32 text-center animate-in fade-in duration-1000">
               <div className="w-16 h-16 bg-[var(--accent)]/5 rounded-2xl flex items-center justify-center border border-[var(--accent)]/10"><Icons.Robot className="w-8 h-8 text-[var(--accent)] opacity-30" /></div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              isLast={idx === messages.length - 1}
              isLoading={isLoading}
              copiedId={copiedId}
              editingId={editingId}
              editContent={editContent}
              speakingMsgId={speakingMsgId}
              onCopyText={handleCopyText}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSubmitEdit={submitEdit}
              onEditContentChange={setEditContent}
              onRegenerate={onRegenerate}
              onFeedback={onFeedback}
              onSpeak={speakMessage}
              onSuggestionClick={onSuggestionClick}
              markdownComponents={markdownComponents}
              remarkPlugins={remarkPluginsStable}
            />
          ))}
          {isLoading && !messages.some(m => m.id.startsWith('assistant-')) && (
            <div className="flex flex-col gap-4 items-start animate-in fade-in duration-500">
              <div className="flex gap-2 p-5 rounded-2xl bg-[var(--bg-tertiary)]/20 border border-[var(--border)] shadow-inner"><div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" /><div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse delay-100" /><div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse delay-200" /></div>
            </div>
          )}
        </div>
      </div>
      {showScrollDown && (
        <button onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })} aria-label="Scroll to latest message" className="absolute bottom-8 right-8 sm:right-12 w-11 h-11 rounded-full glass border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] shadow-2xl z-20 hover:scale-110 active:scale-90 transition-all"><svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 13l5 5 5-5M7 6l5 5 5-5" /></svg></button>
      )}
    </div>
  );
};

export default ChatArea;