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
            placeholder: value && value.trim() !== '' ? '' : placeholder,
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
            usePlugins: ['lineHeight', 'font', 'fontsize', 'paragraph', 'justify', 'image'],

            // Image upload settings
            uploader: {
                insertImageAsBase64URI: true // Insert images as base64 (no server upload needed)
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
                'lineHeight', // ✅ show the line-height dropdown
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

            // ✅ Add custom line height values
            lineHeight: ['1', '1.15', '1.5', '2', '2.5', '3'],
            extraButtons: [
                {
                    name: 'Insert Header',
                    icon: 'header',
                    exec: (editor: any) => {
                        editor.selection.insertHTML('<h2 style="font-size:24px; font-weight:bold; text-align:center;">REHABMART</h2>');
                    }
                },
                {
                    name: 'Insert Footer',
                    icon: 'footer',
                    exec: (editor: any) => {
                        editor.selection.insertHTML(
                            '<footer style="text-align:center; font-size:14px; color:#666; margin-top:20px;">© Rehabmart 2026</footer>'
                        );
                    }
                }
            ]
        }),
        [placeholder, height, value]
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

// const value2 =
//     "<div style='max-width: 800px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;'><div style='background: linear-gradient(135deg, #16a085 0%, #f4d03f 100%); padding: 32px; border-radius: 12px; margin: 0 0 32px 0; box-shadow: 0 10px 25px rgba(22,160,133,0.3);'><h1 style='font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; line-height: 1.2; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;'>Finding Your Perfect Stride: The Ultimate Guide to Adjustable Walking Sticks</h1></div><p style='font-size: 16px; line-height: 1.7; color: #4a5568; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;'>Walking is one of life's simplest pleasures, whether you're strolling through your neighborhood, hiking scenic trails, or simply maintaining your independence as you move through daily life. But for many people, the right support can make all the difference between a comfortable walk and a challenging one.</p><p style='font-size: 16px; line-height: 1.7; color: #4a5568; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;'>Enter the adjustable walking stick—a game-changing mobility aid that adapts to your unique needs, helping you walk with confidence, comfort, and style.</p><h2 style='font-size: 28px; font-weight: 600; color: #2d3748; margin: 20px 0 14px 0; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;'>What Makes Adjustable Walking Sticks Special?</h2><p style='font-size: 16px; line-height: 1.7; color: #4a5568; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;'>Unlike traditional fixed-height canes, adjustable walking sticks offer remarkable versatility. With simple height adjustments, typically ranging from 30 to 39 inches, these walking aids can be customized to your exact specifications. This means whether you're 5'2\" or 6'4\", you can find the perfect fit that promotes proper posture and reduces strain on your joints.</p><p style='font-size: 16px; line-height: 1.7; color: #4a5568; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;'>The beauty of adjustability goes beyond just accommodating different users. If you're recovering from an injury, your needs may change as you heal. If you use different types of footwear, a quick adjustment ensures your walking stick remains at the optimal height whether you're wearing sneakers or dress shoes.</p><h2 style='font-size: 28px; font-weight: 600; color: #2d3748; margin: 20px 0 14px 0; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;'>Key Benefits That Matter</h2><div style='background: linear-gradient(135deg, #fff5e6 0%, #ffffff 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #e67e22;'><p style='font-size: 16px; line-height: 1.7; color: #4a5568; margin: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;'><strong style='font-weight: 700; color: #1a202c;'>Improved Stability and Balance</strong>: A properly fitted walking stick provides crucial support, reducing your risk of falls and giving you the confidence to navigate various terrains.</p></div><hr style='border: none; height: 2px; background: linear-gradient(90deg, transparent, #f39c12, transparent); margin: 32px 0;'><div style='border-left: 5px solid #e67e22; background-color: #fef5e7; padding: 16px 20px; margin: 20px 0; border-radius: 6px;'><p style='font-size: 16px; line-height: 1.7; color: #d68910; margin: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;'>An adjustable walking stick isn't just a medical device—it's a tool for independence and freedom.</p></div></div>";
