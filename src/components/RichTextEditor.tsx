import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Moon,
  Sun,
  Copy,
  Download,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Type,
  X,
} from 'lucide-react';

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  theme?: 'light' | 'dark';
  className?: string;
  placeholder?: string;
}

interface EditorState {
  content: string;
  history: string[];
  historyIndex: number;
  isPreview: boolean;
  isFullscreen: boolean;
  activeFormats: Set<string>;
}

export function RichTextEditor({ initialContent = '', onChange, theme = 'light', className = '', placeholder = 'Start writing...' }: RichTextEditorProps) {
  const [state, setState] = useState<EditorState>({
    content: initialContent,
    history: [initialContent],
    historyIndex: 0,
    isPreview: false,
    isFullscreen: false,
    activeFormats: new Set(),
  });

  const [currentTheme, setCurrentTheme] = useState(theme);

  const editorRef = useRef<HTMLDivElement>(null);

  const themeClasses = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-300',
      toolbar: 'bg-gray-50 border-gray-200',
      button: 'text-gray-700 hover:bg-gray-200',
      active: 'bg-blue-100 text-blue-700',
      dialog: 'bg-white border-gray-300 shadow-lg',
      input: 'bg-white border-gray-300',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      border: 'border-gray-600',
      toolbar: 'bg-gray-800 border-gray-700',
      button: 'text-gray-300 hover:bg-gray-700',
      active: 'bg-blue-900 text-blue-300',
      dialog: 'bg-gray-800 border-gray-600 shadow-xl',
      input: 'bg-gray-800 border-gray-600',
    },
  };

  const t = themeClasses[currentTheme];

  // Initialize editor with initial content
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  // Check active formats based on current selection
  const checkActiveFormats = useCallback(() => {
    const formats = new Set<string>();

    try {
      // Check standard formatting commands
      const commands = ['bold', 'italic', 'underline', 'strikeThrough'];
      commands.forEach(cmd => {
        if (document.queryCommandState(cmd)) {
          formats.add(cmd);
        }
      });

      // Check alignment
      if (document.queryCommandState('justifyLeft')) formats.add('justifyLeft');
      if (document.queryCommandState('justifyCenter')) formats.add('justifyCenter');
      if (document.queryCommandState('justifyRight')) formats.add('justifyRight');

      // Check lists
      if (document.queryCommandState('insertUnorderedList')) formats.add('unorderedList');
      if (document.queryCommandState('insertOrderedList')) formats.add('orderedList');

      // Check for heading formats and blockquotes
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as Element);

        if (element) {
          const headingElement = element.closest('h1, h2, h3, h4, h5, h6');
          if (headingElement) {
            formats.add(`heading${headingElement.tagName.charAt(1)}`);
          }

          if (element.closest('blockquote')) {
            formats.add('blockquote');
          }
        }
      }
    } catch (error) {
      console.warn('Error checking command states:', error);
    }

    setState(prev => ({ ...prev, activeFormats: formats }));
  }, []);

  // Update history and call onChange
  const updateHistory = useCallback(
    (newContent: string) => {
      setState(prev => {
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push(newContent);
        return {
          ...prev,
          content: newContent,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
      onChange?.(newContent);
    },
    [onChange]
  );

  // Execute editor commands
  const execCommand = useCallback(
    (command: string, value?: string) => {
      try {
        if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand(command, false, value);

          const newContent = editorRef.current.innerHTML;
          updateHistory(newContent);

          // Update active formats after command
          setTimeout(checkActiveFormats, 0);
        }
      } catch (error) {
        console.warn('Error executing command:', error);
      }
    },
    [updateHistory, checkActiveFormats]
  );

  // Apply heading with proper block handling
  const applyHeading = useCallback(
    (level: number) => {
      if (!editorRef.current) return;

      editorRef.current.focus();

      try {
        // Use formatBlock for cleaner heading application
        document.execCommand('formatBlock', false, `<h${level}>`);

        const newContent = editorRef.current.innerHTML;
        updateHistory(newContent);
        setTimeout(checkActiveFormats, 0);
      } catch (error) {
        console.warn('Error applying heading:', error);
      }
    },
    [updateHistory, checkActiveFormats]
  );

  // Remove formatting (make paragraph)
  const removeParagraph = useCallback(() => {
    execCommand('formatBlock', '<p>');
  }, [execCommand]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        const newContent = prev.history[newIndex];
        if (editorRef.current) {
          editorRef.current.innerHTML = newContent;
        }
        onChange?.(newContent);
        setTimeout(checkActiveFormats, 0);
        return {
          ...prev,
          content: newContent,
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, [onChange, checkActiveFormats]);

  const handleRedo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        const newContent = prev.history[newIndex];
        if (editorRef.current) {
          editorRef.current.innerHTML = newContent;
        }
        onChange?.(newContent);
        setTimeout(checkActiveFormats, 0);
        return {
          ...prev,
          content: newContent,
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, [onChange, checkActiveFormats]);

  // Handle input changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      updateHistory(newContent);
      checkActiveFormats();
    }
  }, [updateHistory, checkActiveFormats]);

  // Selection change handler
  const handleSelectionChange = useCallback(() => {
    // Only update if the selection is within our editor
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        checkActiveFormats();
      }
    }
  }, [checkActiveFormats]);

  // Add selection change listener
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // Utility functions
  const downloadContent = useCallback(() => {
    const blob = new Blob([state.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.content]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.content);
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
    }
  }, [state.content]);

  const togglePreview = useCallback(() => {
    setState(prev => ({ ...prev, isPreview: !prev.isPreview }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  // Count words more accurately
  const countWords = useCallback((text: string) => {
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    return plainText ? plainText.split(/\s+/).length : 0;
  }, []);

  // Toolbar Button Component
  const ToolbarButton: React.FC<{
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }> = ({ onClick, active, children, title, disabled = false }) => (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`rounded p-2 transition-colors ${disabled ? 'cursor-not-allowed text-gray-400' : active ? t.active : t.button}`}
    >
      {children}
    </button>
  );

  // Dialog Component
  const Dialog: React.FC<{
    show: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }> = ({ show, onClose, title, children }) => {
    if (!show) return null;

    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className={`${t.dialog} mx-4 w-full max-w-md rounded-lg p-6`}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${t.text}`}>{title}</h3>
            <button onClick={onClose} className={`${t.button} rounded p-1`}>
              <X size={16} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const containerClasses = `${
    state.isFullscreen ? 'fixed inset-0 z-40' : 'relative'
  } ${t.bg} ${t.text} ${t.border} border rounded-lg overflow-hidden ${className}`;

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <div className={containerClasses}>
      {/* Toolbar */}
      <div className={`${t.toolbar} flex flex-wrap items-center gap-1 border-b p-2`}>
        {/* History */}
        <div className="mr-2 flex gap-1 border-r pr-2">
          <ToolbarButton onClick={handleUndo} title="Undo (Ctrl+Z)" disabled={!canUndo}>
            <Undo size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={handleRedo} title="Redo (Ctrl+Y)" disabled={!canRedo}>
            <Redo size={16} />
          </ToolbarButton>
        </div>

        {/* Text Formatting */}
        <div className="mr-2 flex gap-1 border-r pr-2">
          <ToolbarButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" active={state.activeFormats.has('bold')}>
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" active={state.activeFormats.has('italic')}>
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" active={state.activeFormats.has('underline')}>
            <Underline size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough" active={state.activeFormats.has('strikeThrough')}>
            <Strikethrough size={16} />
          </ToolbarButton>
        </div>

        {/* Block Formatting */}
        <div className="mr-2 flex gap-1 border-r pr-2">
          <Type size={16} />
          <ToolbarButton onClick={() => applyHeading(1)} title="Heading 1" active={state.activeFormats.has('heading1')}>
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyHeading(2)} title="Heading 2" active={state.activeFormats.has('heading2')}>
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyHeading(3)} title="Heading 3" active={state.activeFormats.has('heading3')}>
            <Heading3 size={16} />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="mr-2 flex gap-1 border-r pr-2">
          <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left" active={state.activeFormats.has('justifyLeft')}>
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center" active={state.activeFormats.has('justifyCenter')}>
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right" active={state.activeFormats.has('justifyRight')}>
            <AlignRight size={16} />
          </ToolbarButton>
        </div>

        {/* Utilities */}
        <div className="mr-2 flex gap-1 border-r pr-2">
          <ToolbarButton onClick={copyToClipboard} title="Copy HTML">
            <Copy size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={downloadContent} title="Download">
            <Download size={16} />
          </ToolbarButton>
        </div>

        {/* View Options */}
        <div className="ml-auto flex gap-1">
          <ToolbarButton onClick={togglePreview} title="Toggle Preview">
            {state.isPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          </ToolbarButton>
          <ToolbarButton onClick={toggleFullscreen} title="Toggle Fullscreen">
            {state.isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </ToolbarButton>
          <ToolbarButton onClick={() => setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light')} title="Toggle Theme">
            {currentTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className={`${state.isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-full'} overflow-auto`}>
        {state.isPreview ? (
          <div className={`p-4 ${t.text} prose max-w-none`} dangerouslySetInnerHTML={{ __html: state.content }} />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className={`p-4 ${t.text} min-h-full outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset`}
            style={{
              lineHeight: '1.6',
              fontSize: '14px',
            }}
            data-placeholder={placeholder}
            suppressContentEditableWarning
          />
        )}
      </div>

      {/* Status Bar */}
      <div className={`${t.toolbar} flex items-center justify-between border-t px-4 py-2 text-sm`}>
        <div className="flex items-center gap-4">
          <span>{state.content.length} characters</span>
          <span>{countWords(state.content)} words</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded px-2 py-1 text-xs ${state.isPreview ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {state.isPreview ? 'Preview' : 'Edit'}
          </span>
          <span className={`rounded px-2 py-1 text-xs ${currentTheme === 'light' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
            {currentTheme === 'light' ? 'Light' : 'Dark'}
          </span>
        </div>
      </div>
    </div>
  );
}
