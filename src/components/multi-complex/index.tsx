
import { useRef, useState } from 'react';
import { Form, Space, Input, Button, Select, Upload, Progress, InputNumber, Radio, FormItemProps } from '@arco-design/web-react';
import { IconDelete, IconPlus, IconEdit } from '@arco-design/web-react/icon';
import styles from './index.module.less'
import { FieldUiType, MyFormDependRules, MyFormItemProps } from '../../pages/product/interface';
import { checkDependRules, getValiRules } from '../untis';

const getTips = (tipRules: MyFormDependRules[]): [
    (prev: any, next: any, info: any) => boolean,
    (values: any) => any
] => {
    let shouldUpdateList: Array<(prev: any, next: any, info: any) => boolean> = [];
    let getValuefunList: Array<(values: any) => any> = [];
    tipRules?.forEach(tipRule => {
        const [_shouldUpdate, _getValue] = checkDependRules(tipRule || {});
        shouldUpdateList.push(_shouldUpdate);
        getValuefunList.push(_getValue);
    });

    const shouldUpdate = (prev: any, next: any, info: any) => {
        for (let index = 0; index < shouldUpdateList.length; index++) {
            const fun = shouldUpdateList[index];
            const value = fun && fun(prev, next, info);
            if (value == true) { return true; }
        }
        return false;
    };

    const getValues = (values: any) => {
        return (getValuefunList.map((fun, index) => {
            const value = fun && fun(values);
            if (value) { return <div key={index} dangerouslySetInnerHTML={{ __html: value }} /> }
        }));
    };
    return [shouldUpdate, getValues];
}

const getUiTypeOrDefault = (_props: MyFormItemProps): FieldUiType | undefined => {
    const { uiType, type, allowCustom, options = [], rules = {} } = _props;
    if (uiType) { return uiType; }
    switch (type) {
        case 'input':
            {
                const numReg = /^[0-9]+.?[0-9]*/;
                const isNum = numReg.test(`${rules.maxValue}`) || numReg.test(`${rules.minValue}`);
                return rules.valueType == 'url' ? 'imageUpload' : isNum ? 'inputNumber' : 'input';
            }
        case 'singleCheck':
            {
                const length = options.length;
                return (length > 3 || allowCustom) ? 'select' : 'radio';
            }
        case 'multiCheck':
            {
                return 'multiSelect'
            }
        case 'complex':
            {

            }
        case 'multiComplex':
            {

            }
    }
}




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


export function ProFormItem(props: MyFormItemProps) {
    // const uiType = getDefaultUiType(_props);
    // const props = { ..._props, uiType }

    // const { type, label: propLabel, value, name, namePath = [],
    //     noStyle, noLabel, 
    //     tips, hide,  rules: propRules 
    // } = props || {};

    // const rules = getValiRules(propRules, propLabel);

    // const field = namePath.join('.');
    // const [tipShouldUpdate, getTipValues] = getTips(tips || []);
    // const [disShouldUpdate, getDisValue] = checkDependRules(hide || {});


    // const label = (uiType == 'checkBox' || noLabel) ? undefined : propLabel;
    // const isComplex = type?.toLowerCase().indexOf('complex') !== -1;


    const { label, name, namePath, value, options = [], hide, tips, rules, readOnly } = props || {};

    const _uiType = getUiTypeOrDefault(props);
    const _rules = getValiRules(rules);
    const [tipShouldUpdate, getTipValues] = getTips(tips || []);
    const [disShouldUpdate, isHide] = checkDependRules(hide || {});
    const shouldUpdate = (prev: any, next: any, info: any) => {
        return tipShouldUpdate(prev, next, info) || disShouldUpdate(prev, next, info);
    }

    return (
        <Form.Item noStyle shouldUpdate={shouldUpdate} >
            {(values) => {
                const _hide = isHide(values) === true;
                if (_hide) { return; }
                const extra = getTipValues(values);
                const formItemProps: FormItemProps = {
                    label, extra,
                    rules: _rules,
                    disabled: readOnly,
                    initialValue: value,
                    field: namePath?.join('.') || name,
                }
                return _uiType == 'input' ? (
                    <Form.Item {...formItemProps} >
                        <Input
                            allowClear
                            style={{ maxWidth: '734px' }}
                        />
                    </Form.Item>
                ) : _uiType == 'inputNumber' ? (
                    <Form.Item {...formItemProps}>
                        <InputNumber
                            style={{ maxWidth: '358px' }}
                        />
                    </Form.Item>
                ) : _uiType == 'radio' ? (
                    <Form.Item {...formItemProps}>
                        <Radio.Group options={options} />
                    </Form.Item>
                ) : _uiType == 'select' || _uiType == 'multiSelect' ? (
                    <Form.Item {...formItemProps}>
                        <Select
                            mode={_uiType == 'multiSelect' ? 'multiple' : undefined}
                            options={options}
                            allowClear
                            showSearch
                            style={{ maxWidth: '358px' }}
                        />
                    </Form.Item>
                ) : _uiType == 'imageUpload' ? (
                    <Form.Item {...formItemProps}>
                        <PictureUpload />
                    </Form.Item >
                ) : undefined;
            }}
        </Form.Item>
    )
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
