
import { useRef, useState } from 'react';
import { Form, Space, Input, Button, Select, Upload, Progress, InputNumber, Radio, FormItemProps, Grid, List, Link } from '@arco-design/web-react';
import { IconDelete, IconPlus, IconEdit, IconImageClose } from '@arco-design/web-react/icon';
import styles from './index.module.less'
import { FieldUiType, MyFormDependRules, MyFormItemProps } from '../../pages/product/interface';
import { checkDependRules, getValiRules } from '../untis';
import SkuEditableTable from '../SkuEditableTable';

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
    const { uiType, type, name, allowCustom, options = [], rules = {} } = _props;
    if (uiType) { return uiType; }
    if (name == 'sku') {
        return 'skuEditTable';
    }
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
    }
}



let uuid = 0;
function PictureUpload(props: {
    size?: 'default' | 'mini',
    text?: string,
    value?: string,
    onChange?: (value: string) => {}
}) {
    const { size = 'default', text = '', value, onChange } = props;
    const [file, setFile] = useState<any>(value && { uid: new Date(), url: value });
    return (
        <Upload
            action='/'
            fileList={file ? [file] : []}
            onChange={(_, currentFile) => {
                const url = URL.createObjectURL(currentFile?.originFile as any);
                setFile({ ...currentFile, url });
                onChange && onChange(url);
            }}
            onProgress={(currentFile) => {
                setFile(currentFile);
            }}
            showUploadList={false}
        >
            <div className={`${styles['upload-picture']} ${size == 'mini' && styles['mini']}`}>
                {file?.url ? (<>
                    <img src={file.url} />
                    <div className={styles['upload-picture-mask']}>
                        <IconEdit />
                    </div>
                </>) : file?.status === 'error' ? (
                    <div className={styles['upload-picture-error']}>
                        <IconImageClose />
                    </div>
                ) :
                    <div title={text}
                        className={styles['upload-picture-text']}>
                        <IconPlus />
                        {size != 'mini' && <div>{text}</div>}
                    </div>
                }
                {file?.status === 'uploading' && file.percent < 100 && (
                    <Progress
                        size={size}
                        type='circle'
                        percent={file.percent}
                        className={styles['upload-picture-progress']}
                    />
                )}
            </div>
        </Upload>
    );
}



function ProFormList(props: MyFormItemProps) {
    const { name, namePath, subItems = [] } = props;
    const field = namePath?.join('.') || name;
    return (
        <Form.List field={field!} noStyle>
            {(fields, { add, remove, move }) => {
                return (
                    <Space wrap size={'mini'}>
                        {fields.map(({ field }, index) => {
                            return (
                                <Space key={index} size={'mini'}>
                                    {subItems?.map((sm, si) => {
                                        const uiType = sm.type == 'singleCheck' ? 'select' : sm.uiType;
                                        return (
                                            <ProFormItem key={si}
                                                {...sm}
                                                uiType={uiType}
                                                noStyle
                                                fieldName={field + '.' + sm.name}
                                            />
                                        )
                                    })}
                                    <Form.Item noStyle>
                                        <Space size={'mini'}>
                                            <Link status='error' onClick={() => {
                                                remove(index); if (fields.length == 1) { add(); }
                                            }}>
                                                <IconDelete />
                                            </Link>

                                            {index == fields.length - 1 &&
                                                <Link onClick={() => { add(); }}>
                                                    <IconPlus />
                                                </Link>
                                            }
                                        </Space>
                                    </Form.Item>
                                </Space>
                            );
                        })}
                    </Space>
                );
            }}
        </Form.List>
    );
}


export function ProFormItem(props: MyFormItemProps & { formSchema?: MyFormItemProps[] }) {
    const {
        type, label, name, namePath, value, options = [],
        subItems = [], hide, tips, rules, readOnly, allowCustom,
        fieldName, noStyle
    } = props || {};

    const _fieldName = fieldName || namePath?.join('.') || name;
    const _uiType = getUiTypeOrDefault(props);
    const _rules = getValiRules(rules);
    const [tipShouldUpdate, getTipValues] = getTips(tips || []);
    const [disShouldUpdate, isHide] = checkDependRules(hide || {});
    const shouldUpdate = (prev: any, next: any, info: any) => {
        // return tipShouldUpdate(prev, next, info) || disShouldUpdate(prev, next, info);
        return true;
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
                    field: _fieldName,
                    noStyle: noStyle,
                }
                return _uiType == 'input' ? (
                    <Form.Item {...formItemProps} >
                        <Input allowClear
                            placeholder={`请输入${label}`}
                            style={{ maxWidth: '734px', minWidth: '220px' }}
                        />
                    </Form.Item>
                ) : _uiType == 'inputNumber' ? (
                    <Form.Item {...formItemProps}>
                        <InputNumber
                            placeholder={`请输入${label}`}
                            style={{ maxWidth: '358px', minWidth: '80px' }}
                        />
                    </Form.Item>
                ) : _uiType == 'radio' ? (
                    <Form.Item {...formItemProps}>
                        <Radio.Group options={options} />
                    </Form.Item>
                ) : _uiType == 'select' || _uiType == 'multiSelect' ? (
                    <Form.Item {...formItemProps}>
                        <Select allowClear showSearch
                            options={options}
                            allowCreate={allowCustom}
                            mode={_uiType == 'multiSelect' ? 'multiple' : undefined}
                            placeholder={`请选择${_uiType == 'multiSelect' ? '或输入' : ''}${label}`}
                            style={{ maxWidth: '358px', minWidth: '180px' }}
                        />
                    </Form.Item>
                ) : _uiType == 'imageUpload' ? (
                    <Form.Item {...formItemProps}>
                        <PictureUpload />
                    </Form.Item >
                ) : _uiType == 'skuEditTable' ? (
                    <Form.Item {...formItemProps}>
                        <SkuEditableTable {...props}
                            allFormItems={props.formSchema || []}
                            values={values} />
                    </Form.Item >
                ) : type == 'complex' ? (
                    <Form.Item {...formItemProps}>
                        {name == 'catProp' ? (
                            <Grid cols={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2, xxl: 3, xxxl: 3 }} colGap={12}>
                                {subItems?.map((sm, si) => {
                                    const uiType = sm.type == 'singleCheck' ? 'select' : sm.uiType;
                                    return (
                                        <Grid.GridItem key={'complex' + si} style={{ maxWidth: '358px' }}>
                                            <ProFormItem key={si} {...sm} uiType={uiType} />
                                        </Grid.GridItem>
                                    )
                                })}
                            </Grid>
                        ) : (
                            <Space wrap>
                                {subItems?.map((sm, si) => {
                                    return (<ProFormItem key={si} {...sm} />)
                                })}
                            </Space>
                        )}

                    </Form.Item >
                ) : type == 'multiComplex' ? (
                    <>
                        <Form.Item {...formItemProps}>
                            <ProFormList {...props} />
                        </Form.Item >
                    </>
                ) : <div>---{label}---</div>;
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
