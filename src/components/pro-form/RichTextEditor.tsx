import '@wangeditor/editor/dist/css/style.css' // 引入 css

import React, { useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';


function RichTextEditor(props: any) {
    const [editor, setEditor] = useState<IDomEditor | null>(null);
    const [value, setValue] = useMergeValue<string>('', {
        defaultValue: 'defaultValue' in props ? props.defaultValue : undefined,
        value: 'value' in props ? props.value : undefined,
    });

    const handleChange = (newValue: any) => {
        if (!('value' in props)) { setValue(value); }
        props.onChange && props.onChange(newValue);
    };

    const toolbarConfig: Partial<IToolbarConfig> = {
        toolbarKeys: [
            'headerSelect', '|',
            'bold', 'underline', 'italic', 'color', 'bgColor', '|',
            'fontSize', 'fontFamily', 'lineHeight', '|',
            'bulletedList', 'numberedList', '|',
            'insertTable', 'divider', '|',
            'undo', 'redo', '|',
            'fullScreen',
        ]
    }
    const editorConfig: Partial<IEditorConfig> = {
        placeholder: '请输入内容...',
    }

    useEffect(() => {
        return () => {
            if (editor == null) { return; }
            editor.destroy(); setEditor(null);
        }
    }, [editor])

    return (
        <>
            <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
                <Toolbar
                    mode="default"
                    editor={editor}
                    defaultConfig={toolbarConfig}
                    style={{ borderBottom: '1px solid #ccc' }}
                />
                <Editor
                    mode="default"
                    value={value}
                    defaultConfig={editorConfig}
                    onCreated={setEditor}
                    onChange={editor => handleChange(editor.getHtml())}
                    style={{ height: '500px', overflowY: 'hidden' }}
                />
            </div>
        </>
    )
}

export default RichTextEditor;