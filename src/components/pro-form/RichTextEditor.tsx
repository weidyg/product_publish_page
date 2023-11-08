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
            'bold', 'underline',  /*'italic',*/ 'color', 'bgColor', '|',
            'fontSize', 'fontFamily', /*'lineHeight',*/ '|',
            // 'bulletedList', 'numberedList', '|',
            // 'insertTable', 'divider', '|',
            'undo', 'redo', '|',
            'fullScreen',
        ]
    }
    const editorConfig: Partial<IEditorConfig> = {
        placeholder: '请输入内容...',
        MENU_CONF: {
            'uploadImage': {
                // // 用户自定义插入图片
                // customInsert(res, insertFn) {
                //     console.log('customInsert', res)
                //     const imgInfo = res.data[0] || {}
                //     const { url, alt, href } = imgInfo
                //     if (!url) throw new Error(`Image url is empty`)

                //     // 自己插入图片
                //     console.log('自己插入图片', url)
                //     insertFn(url, alt, href)
                // },

                // // 用户自定义上传图片
                // customUpload(file, insertFn) {
                //     console.log('customUpload', file)

                //     return new Promise((resolve) => {
                //         // 插入一张图片，模拟异步
                //         setTimeout(() => {
                //             const src = `https://www.baidu.com/img/flexible/logo/pc/result@2.png?r=${Math.random()}`
                //             insertFn(src, '百度 logo', src)
                //             resolve('ok')
                //         }, 500)
                //     })
                // },

                // // 自定义选择图片（如图床）
                // customBrowseAndUpload(insertFn) {
                //     alert('自定义选择图片，如弹出图床')

                //     // 插入一张图片，模拟异步
                //     setTimeout(() => {
                //         const src = 'https://www.baidu.com/img/flexible/logo/pc/result@2.png'
                //         insertFn(src, '百度 logo', src) // 插入图片
                //     }, 500)
                // },
            }
        }
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