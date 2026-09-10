import React from 'react';
import { Source } from '../../types';
import { BookOpen, ExternalLink } from 'lucide-react';

interface SourcesListProps {
  sources?: Source[];
  className?: string;
  title?: string;
}

export const SourcesList: React.FC<SourcesListProps> = ({
  sources,
  className = '',
  title = 'Referenced Medical Knowledge',
}) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
        <BookOpen className="w-3.5 h-3.5 text-teal-400" />
        <span>{title}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sources.map((src, idx) => {
          const name = src.title || src.name || src.source || 'Medical Knowledge Base';
          const description = src.snippet || src.description;
          const url = src.url;

          return (
            <div
              key={idx}
              className="p-4 bg-[#161618] rounded-2xl border border-[#27272A] text-xs text-[#A1A1AA] flex flex-col justify-between hover:border-[#3F3F46] transition-all"
            >
              <div>
                <div className="font-semibold text-[#EDEDED] mb-1.5 flex items-center justify-between gap-2">
                  <span className="truncate">{name}</span>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-teal-400 hover:text-teal-300 shrink-0 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {description && (
                  <p className="text-[#71717A] line-clamp-2 leading-relaxed text-[11px]">
                    {description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

