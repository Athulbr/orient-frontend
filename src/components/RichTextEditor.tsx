import React, { useMemo, useRef } from 'react';
import JoditEditor from 'jodit-react';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder = 'Start typing...', height = '400px' }) => {
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

            // 👇 This is important!
            usePlugins: ['lineHeight', 'font', 'fontsize', 'paragraph', 'justify'],

            buttons: [
                'bold',
                'italic',
                'underline',
                '|',
                'font',
                'fontsize',
                'brush',
                'lineHeight', // ✅ show the line-height dropdown
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
                'fullsize'
            ],

            removeButtons: ['source', 'about'],

            // ✅ Add custom line height values
            lineHeight: ['1', '1.15', '1.5', '2', '2.5', '3'],
            extraButtons: [
                {
                    name: 'Insert Header',
                    icon: 'header',
                    exec: (editor: any) => {
                        editor.selection.insertHTML('<h2 style="font-size:24px; font-weight:bold; text-align:center;">COMPANY NAME</h2>');
                    }
                },
                {
                    name: 'Insert Footer',
                    icon: 'footer',
                    exec: (editor: any) => {
                        editor.selection.insertHTML(
                            '<footer style="text-align:center; font-size:14px; color:#666; margin-top:20px;">© Company name 2025</footer>'
                        );
                    }
                }
            ]
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
            className="w-full h-full"
        />
    );
};
