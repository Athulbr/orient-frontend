import React, { useCallback, useMemo, useRef } from 'react';
import JoditEditor from 'jodit-react';

export interface SelectionData {
    text: string;
    html: string;
    rect: DOMRect;
}

export interface RichTextEditorHandle {
    saveSelection: () => void;
    replaceSelection: (html: string) => void;
}

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    height?: string;
    onSelectionChange?: (data: SelectionData | null) => void;
    editorHandle?: React.RefObject<RichTextEditorHandle | null>;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Start typing...',
    height = '400px',
    onSelectionChange,
    editorHandle
}) => {
    // Keep latest callbacks in refs so stable callbacks below don't go stale
    const onSelectionChangeRef = useRef(onSelectionChange);
    onSelectionChangeRef.current = onSelectionChange;

    const editorHandleRef = useRef(editorHandle);
    editorHandleRef.current = editorHandle;

    /**
     * jodit-react v5 calls `editorRef(joditInstance)` once the editor is
     * ready. `joditInstance` is the Jodit class instance (NOT a wrapper) so:
     *   - joditInstance.s          → selection module
     *   - joditInstance.s.save()   → bookmark save
     *   - joditInstance.s.restore()→ bookmark restore
     *   - joditInstance.s.insertHTML(html) → replace selection
     *   - joditInstance.editor     → the contenteditable DOM element
     */
    const handleEditorReady = useCallback((joditInstance: any) => {
        if (!joditInstance) return;

        // Expose save/replace to the parent via editorHandle
        const outerRef = editorHandleRef.current;
        if (outerRef) {
            (outerRef as React.MutableRefObject<RichTextEditorHandle | null>).current = {
                saveSelection: () => {
                    joditInstance.s?.save?.();
                },
                replaceSelection: (html: string) => {
                    joditInstance.s?.restore?.();
                    joditInstance.s?.insertHTML?.(html);
                }
            };
        }

        // Jodit 4 uses contenteditable (iframe:false by default).
        // Attach directly to joditInstance.editor – the live contenteditable div.
        const attachEvents = () => {
            const editorEl: HTMLElement | undefined = joditInstance.editor;
            if (!editorEl) return;

            const handleSelectionEvent = () => {
                const cb = onSelectionChangeRef.current;
                if (!cb) return;

                // Use the native browser Selection API – works because the
                // editor is a contenteditable div in the main document.
                const sel = window.getSelection();
                const text = sel?.toString() ?? '';

                if (!text.trim()) {
                    cb(null);
                    return;
                }

                if (!sel || sel.rangeCount === 0) {
                    cb(null);
                    return;
                }

                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Serialize the selected HTML
                const fragment = range.cloneContents();
                const tmp = document.createElement('div');
                tmp.appendChild(fragment);
                const html = tmp.innerHTML;

                cb({ text, html, rect });
            };

            editorEl.addEventListener('mouseup', handleSelectionEvent);
            editorEl.addEventListener('keyup', handleSelectionEvent);
        };

        if (joditInstance.isReady) {
            attachEvents();
        } else {
            joditInstance.waitForReady().then(attachEvents);
        }
    }, []); // stable – all deps accessed via refs

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

            usePlugins: ['lineHeight', 'font', 'fontsize', 'paragraph', 'justify', 'image'],

            uploader: {
                insertImageAsBase64URI: true
            },
            imageDefaultWidth: 300,
            resizer: {
                showSize: true
            },

            buttons: [
                'bold',
                'italic',
                'underline',
                '|',
                'font',
                'fontsize',
                'brush',
                'lineHeight',
                '|',
                'align',
                'ul',
                'ol',
                '|',
                'table',
                'link',
                'image',
                '|',
                'undo',
                'redo',
                '|',
                'print',
                'fullsize'
            ],

            removeButtons: ['source', 'about'],
            lineHeight: ['1', '1.15', '1.5', '2', '2.5', '3'],

            extraButtons: [
                {
                    name: 'Insert Header',
                    icon: 'header',
                    exec: (editor: any) => {
                        editor.s.insertHTML('<h2 style="font-size:24px; font-weight:bold; text-align:center;">REHABMART</h2>');
                    }
                },
                {
                    name: 'Insert Footer',
                    icon: 'footer',
                    exec: (editor: any) => {
                        editor.s.insertHTML(
                            '<footer style="text-align:center; font-size:14px; color:#666; margin-top:20px;">© Rehabmart 2026</footer>'
                        );
                    }
                }
            ]
        }),
        [placeholder, height]
    );

    return (
        <JoditEditor
            // @ts-ignore – editorRef is a valid jodit-react v5 prop
            editorRef={handleEditorReady}
            value={value}
            // @ts-ignore
            config={config}
            onBlur={newContent => onChange(newContent)}
            onChange={newContent => onChange(newContent)}
            className="w-full h-full"
        />
    );
};
