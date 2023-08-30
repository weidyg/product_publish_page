
import { useRef, useState } from 'react';
import { Form, Space, Input, Button, Grid, Select, Upload, Progress } from '@arco-design/web-react';
import { IconArrowRise, IconArrowFall, IconDelete, IconPlus, IconEdit } from '@arco-design/web-react/icon';
import styles from './index.module.less'



function PictureUpload(props: { value?: string, onChange?: (value: string) => {} }) {
    const { value, onChange } = props;
    const [file, setFile] = useState<any>({ uid: value, url: value });
    const cs = `${file && file.status === 'error' ? ' is-error' : ''}`;
    return (
        <Upload
            action='https://arco.design/'
            fileList={file ? [file] : []}
            onChange={(_, currentFile) => {
                const url = URL.createObjectURL(currentFile?.originFile as any);
                setFile({ ...currentFile, url });
                onChange && onChange(url);
            }}
            onProgress={(currentFile) => {
                setFile(currentFile);
                console.log('currentFile', currentFile);
            }}
            showUploadList={false}
        >
            <div className={cs}>
                {file && file.url ? (
                    <div className={styles['upload-picture']}>
                        <img src={file.url} />
                        <div className={styles['upload-picture-mask']}>
                            <IconEdit />
                        </div>
                        {file.status === 'uploading' && file.percent < 100 && (
                            <Progress
                                size='mini'
                                percent={file.percent}
                                className={styles['upload-picture-progress']}
                            />
                        )}
                    </div>
                ) : (
                    <div className={styles['upload-trigger']}>
                        <div className={styles['upload-trigger-text']}>
                            <IconPlus />
                            <div>图片</div>
                        </div>
                    </div>
                )}
            </div>
        </Upload>
    );
}



function ProFormList(props: {
    field: string,
    // children: (field: string) => React.ReactNode
}) {
    return (
        <Form.List field={props.field}>
            {(fields, { add, remove, move }) => {
                return (
                    <Space wrap>
                        {fields.map(({ field, key }) => {
                            return (
                                <Space key={key}>
                                    <Form.Item
                                        field={field + '.img'}
                                    >
                                        <PictureUpload />
                                    </Form.Item>

                                    <Form.Item
                                        field={field + '.value'}
                                    >
                                        <Select options={[
                                            { label: 'one', value: 0, },
                                            { label: 'two', value: 1, },
                                            { label: 'three', value: 2, },
                                        ]} style={{ width: '220px' }} />
                                    </Form.Item>

                                    <Form.Item
                                        field={field + '.remark'}
                                    >
                                        <Input
                                            style={{ width: '100px' }} />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            icon={<IconDelete />}
                                            type='text'
                                            status='danger'
                                            onClick={() => {
                                                remove(key);
                                                if (fields.length == 1) {
                                                    add();
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
                            );
                        })}
                        <Form.Item>
                            <Button
                                icon={<IconPlus />}
                                type='text'
                                onClick={() => {
                                    add();
                                }}
                            >
                                添加规格
                            </Button>
                        </Form.Item>
                    </Space>
                );
            }}
        </Form.List>
    );
}

function MultiComplex() {
    const formRef = useRef<any>();
    return (
        <div style={{ margin: '100px' }}>
            <Form
                ref={formRef}
                autoComplete='off'
                initialValues={{}}
                onValuesChange={(_, v) => {
                    console.log(_, JSON.stringify(v));
                }}
            >
                {/* <ProFormList field='p-1627207'/> */}
                <Form.Item
                    field={'value'}
                    rules={[
                        { required: true },
                        { type: 'number', max: 10, min: 2.01, includes: true },
                        // { type: 'string', maxLength: 10, minLength: 2 },
                        // { type: 'array', minLength: 2, maxLength: 3 }
                    ]}
                >
                    <Input />
                    {/* <Select options={[
                        { label: 'one', value: 0, },
                        { label: 'two', value: 1, },
                        { label: 'three', value: 2, },
                        { label: 'three', value: 3, },
                        { label: 'three', value: 12, },
                    ]}
                        mode='multiple'
                        allowCreate
                        style={{ width: '220px' }}
                    /> */}
                </Form.Item>

                <Button onClick={async () => {
                    const values = await formRef.current.validate();

                }}>提交</Button>
            </Form>
        </div>
    );
}

export default MultiComplex;
