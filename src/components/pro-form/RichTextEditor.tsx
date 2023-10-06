
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';
import styles from './index.module.less'

import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function RichTextEditor(props: any) {
    const [value, setValue] = useMergeValue<string>('', {
        defaultValue: 'defaultValue' in props ? props.defaultValue : undefined,
        value: 'value' in props ? props.value : undefined,
    });

    const handleChange = (newValue: any) => {
        if (!('value' in props)) { setValue(value); }
        props.onChange && props.onChange(newValue);
    };

    return <div className={styles['desc']} >
        <CKEditor
            editor={ClassicEditor}
            data={value}
            config={{
                language: 'zh-cn',
                toolbar: {
                    items: [
                        'heading',
                        '|',
                        // 'alignment',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'outdent',
                        'indent',
                        '|',
                        // 'uploadImage',
                        'blockQuote',
                        'insertTable',
                        // 'mediaEmbed',
                        'undo',
                        'redo'
                    ]
                },
            }}
            onChange={(event, editor) => {
                const data = editor.getData();
                handleChange(data);
            }}
            onBlur={(event, editor) => {

            }}
            onFocus={(event, editor) => {

            }}
        />
    </div>
}

export default RichTextEditor;