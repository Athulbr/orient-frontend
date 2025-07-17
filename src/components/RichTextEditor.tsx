import React, { useMemo, useRef } from 'react';
import JoditEditor from 'jodit-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder = 'Start typing...', height = 400 }) => {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      placeholder,
      height,
      toolbarAdaptive: false,
      toolbarSticky: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: 'insert_clear_html',
      buttons: [
        'bold',
        'italic',
        'underline',
        '|',
        'fontsize',
        'brush',
        '|',
        'align',
        'ul',
        'ol',
        '|',
        'table',
        'link',
        '|',
        'undo',
        'redo',
        '|',
        'print',
        'fullsize',
      ],
      removeButtons: ['source', 'about'],
    }),
    [placeholder, height]
  );

  return (
    <JoditEditor
      ref={editor}
      value={value}
      // @ts-ignore
      config={config}
      onBlur={newContent => onChange(newContent)}
      onChange={newContent => onChange(newContent)}
    />
  );
};
