
import { useState } from 'react';
import { Image, Form, Space, Input, Select, Upload, Progress, InputNumber, Radio, FormItemProps, Grid, Link } from '@arco-design/web-react';
import { IconDelete, IconPlus, IconEdit, IconImageClose } from '@arco-design/web-react/icon';
import styles from './index.module.less'
import { MyFormItemProps } from '../../pages/product/interface';
import { checkDependRules, getTips, getUiTypeOrDefault, getValiRules } from '../untis';
import SkuEditableTable from '../sku-editable-table';

function PictureUpload(props: {
    size?: 'default' | 'mini',
    text?: string,
    value?: string,
    onChange?: (value: string) => {}
}) {
    const { size = 'default', text = '图片', value, onChange } = props;
    const [file, setFile] = useState<any>(value && {status:'error', uid: new Date(), url: value });
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
                {file?.url ? (
                    <>
                        <Image className={styles['upload-picture-img']}
                            src={file.url} loader={true} />
                        <div className={styles['upload-picture-mask']}>
                            <IconEdit />
                        </div>
                    </>
                ) : (
                    <div title={text}
                        className={styles['upload-picture-text']}>
                        <IconPlus />
                        <div>{text}</div>
                    </div>
                )}
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
    const { type, name, namePath, value, subItems = [], nestItems = [], ...rest } = props;
    const field = namePath?.join('.') || name;

    let formItems = [...subItems];
    if (nestItems.length > 0) {
        formItems = [...nestItems];
        formItems.unshift({
            ...rest,
            name: 'value',
            type: type == 'multiCheck' ? 'singleCheck' : type,
            namePath: namePath?.concat('value')
        });
    }

    return (
        <Form.List field={field!} noStyle>
            {(fields, { add, remove, move }) => {
                if (fields.length == 0) {
                    fields.push({ field: `${field}[0]`, key: 0 });
                }
                return (
                    <Space wrap size={'mini'}>
                        {fields.map(({ field }, index) => {
                            return (
                                <Space key={index} size={'mini'}>
                                    {
                                        formItems?.map((sm, si) => {
                                            const uiType = sm.type == 'singleCheck' ? 'select' : sm.uiType;
                                            return (
                                                <ProFormItem key={si}
                                                    {...sm} noStyle
                                                    uiType={uiType} picSize={'mini'}
                                                    fieldName={field + '.' + sm.name}
                                                />
                                            )
                                        })
                                    }
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


export function ProFormItem(props: MyFormItemProps & { formSchema?: MyFormItemProps[], picSize?: 'mini' }) {
    const {
        type, label, name, namePath, value, options = [], subItems = [], nestItems = [],
        hide, tips, rules, readOnly, allowCustom,
        fieldName, noStyle, picSize
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
                const tipValues = getTipValues(values) || [];
                const extra = tipValues.map((value, index) => <div key={index} dangerouslySetInnerHTML={{ __html: value }} />);

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
                    nestItems.length > 0 ? (
                        <Form.Item {...formItemProps}>
                            <ProFormList {...props} />
                        </Form.Item >
                    ) : (
                        <Form.Item {...formItemProps}>
                            <Select allowClear showSearch
                                options={options}
                                allowCreate={allowCustom}
                                mode={_uiType == 'multiSelect' ? 'multiple' : undefined}
                                placeholder={`请选择${_uiType == 'multiSelect' ? '或输入' : ''}${label}`}
                                style={{ maxWidth: '358px', minWidth: '180px' }}
                            />
                        </Form.Item>
                    )
                ) : _uiType == 'imageUpload' ? (
                    <Form.Item {...formItemProps}>
                        <PictureUpload size={picSize} />
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
                    <Form.Item {...formItemProps}>
                        <ProFormList {...props} />
                    </Form.Item >
                ) : <div>---{label}---</div>;
            }}
        </Form.Item>
    )
}
