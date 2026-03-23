import React from 'react';
import { CopyIcon } from './Icons';

interface EditorLayoutProps {
  title: React.ReactNode;
  toolbarActions: React.ReactNode;
  canvas: React.ReactNode;
  controls: React.ReactNode;
  preview: React.ReactNode;
  codeString?: string;
  onCopyCode?: () => void;
  isCopied?: boolean;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  title,
  toolbarActions,
  canvas,
  controls,
  preview,
  codeString,
  onCopyCode,
  isCopied,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-surface-1 dark:bg-surface-1 shadow-lg border border-border-subtle overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-border-subtle bg-surface-2/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></div>
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              {title}
            </h2>
          </div>
          <div className="flex gap-1 items-center">{toolbarActions}</div>
        </div>

        {/* Canvas Area */}
        <div className="p-6 bg-surface-base relative flex justify-center border-b border-border-subtle group/canvas">
          {canvas}
        </div>

        {/* Controls Area */}
        <div className="p-5 space-y-6 bg-surface-1/50">
          {controls}

          {/* Code Copy Section */}
          {codeString && onCopyCode && (
            <div className="relative group cursor-pointer" onClick={onCopyCode}>
              <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity pointer-events-none"></div>
              <div className="flex items-center justify-between w-full text-xs font-mono text-text-secondary py-2.5 px-3 border border-border-subtle rounded-lg bg-surface-2/50 group-hover:border-accent-primary/30 transition-colors">
                <span className="truncate mr-2">{codeString}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isCopied && (
                    <span className="text-accent-primary font-bold text-[10px] animate-in fade-in zoom-in">
                      COPIED
                    </span>
                  )}
                  <CopyIcon />
                </div>
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div className="pt-4 border-t border-border-subtle">{preview}</div>
        </div>
      </div>
    </div>
  );
};
