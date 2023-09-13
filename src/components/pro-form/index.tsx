
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Form, Space, Input, Select, Upload, Progress, InputNumber, Radio, FormItemProps, Grid, Link, Button, Popover, Message, Popconfirm } from '@arco-design/web-react';
import { IconDelete, IconPlus, IconEdit } from '@arco-design/web-react/icon';
import styles from './index.module.less'
import { MyFormItemProps } from '../../pages/product/interface';
import { FieldNames, checkDependRules, getTips, getUiTypeOrDefault, getValiRules } from '../untis';
import SkuEditableTable from '../sku-editable-table';
import ReactQuill, { Quill } from 'react-quill';
import "react-quill/dist/quill.snow.css";
import { UploadItem } from '@arco-design/web-react/es/Upload';

function PictureUpload(props: {
    size?: 'default' | 'mini',
    text?: string,
    value?: string,
    onChange?: (value?: string) => {}
}) {
    const { size = 'default', text = '图片', value, onChange, ...rest } = props;

    const defaultFile: UploadItem | undefined = useMemo(() => {
        return value ? { uid: `${new Date().getTime()}`, url: value } : undefined;
    }, [value]);

    const [imgFile, setImgFile] = useState<UploadItem | undefined>(defaultFile);

    useEffect(() => {
        onChange && onChange(imgFile?.url);
    }, [imgFile?.url])

    const handleChange = (_fileList: UploadItem[], file: UploadItem) => {
        let newFile = { ...file };
        if (file.originFile && file.percent == 100) {
            Message.warning('暂不支持图片上传！'); return;
            // newFile.url = URL.createObjectURL(file?.originFile as any);
        }
        if (file?.url != newFile?.url) {
            setImgFile(newFile);
        }
    }
    const handleProgress = (file: UploadItem) => {
        // setImgFile(file);
    }
    const handleDelete = () => {
        setImgFile(undefined);
    }

    function UploadImage(props: { children?: ReactNode }) {
        const { children } = props;
        return <>
            <Upload
                action='/'
                fileList={imgFile ? [imgFile] : []}
                onChange={handleChange}
                onProgress={handleProgress}
                showUploadList={false}
            >
                {children}
            </Upload>
        </>
    }

    function ShowImage(props: { size: 'default' | 'mini' | 'large' }) {
        const { size = 'default' } = props;
        return <>
            <div className={`${styles['upload-picture']} ${styles[size]}`}>
                <img className={styles['upload-picture-image']} src={imgFile?.url} />
                {size != 'mini' &&
                    <div className={styles['upload-picture-mask']}>
                        <Space size={'medium'}>
                            <UploadImage>
                                <IconEdit />
                            </UploadImage>
                            <Popconfirm
                                focusLock
                                title='警告'
                                content='目前暂不支持图片上传，删除后无法再次添加图片，是否继续删除?'
                                onOk={handleDelete}
                            >
                                <IconDelete />
                            </Popconfirm>
                        </Space>
                    </div>
                }
            </div>
        </>
    }

    return (
        <div {...rest}>  {
            imgFile?.url ? (
                size == 'mini' ? (
                    <Popover content={<ShowImage size={'large'} />} >
                        <div><ShowImage size={size} /></div>
                    </Popover>
                ) : (
                    <ShowImage size={size} />
                )
            ) : (
                <UploadImage>
                    <div className={`${styles['upload-picture']} ${styles[size]}`}>
                        {(imgFile?.status === 'uploading' && (imgFile.percent || 100) < 100) ? (
                            <Progress
                                size={size}
                                type='circle'
                                percent={imgFile?.percent || 100}
                                className={styles['upload-picture-progress']}
                            />
                        ) : (
                            <div title={text}
                                className={styles['upload-picture-text']}>
                                <IconPlus />
                                <div>{text}</div>
                            </div>
                        )}
                    </div>
                </UploadImage>
            )
        }
        </div>
    );
}

function ProFormList(props: MyFormItemProps) {
    const { type, label, name, namePath, value, subItems = [], nestItems = [], ...rest } = props;
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
                                                    {...sm} noStyle allowClear={false}
                                                    uiType={uiType} picSize={'mini'}
                                                    fieldName={field + '.' + sm.name}
                                                />
                                            )
                                        })
                                    }
                                    <Form.Item noStyle>
                                        <Link status='error' onClick={() => { remove(index); }}>
                                            <IconDelete />
                                        </Link>
                                    </Form.Item>
                                </Space>
                            );
                        })}
                        <Space key={'add'} size={'mini'}>
                            <Form.Item noStyle>
                                <Button type='text'
                                    icon={<IconPlus />}
                                    onClick={() => { add(); }}>
                                    添加{label}
                                </Button>
                            </Form.Item>
                        </Space>
                    </Space>
                );
            }}
        </Form.List>
    );
}


export function ProFormItem(props: MyFormItemProps & { formSchema?: MyFormItemProps[], picSize?: 'mini' }) {
    const {
        type, label = '', name, namePath, value, options = [], subItems = [], nestItems = [],
        hide, tips, rules, readOnly, allowCustom,
        fieldName, noStyle, picSize, allowClear = true
    } = props || {};

    const _fieldName = fieldName || namePath?.join('.') || name;
    const _uiType = getUiTypeOrDefault(props);
    const _rules = getValiRules(rules);
    const [tipShouldUpdate, getTipValues] = getTips(tips || []);
    const [disShouldUpdate, isHide] = checkDependRules(hide || {});

    const shouldUpdate = (prev: any, next: any, info: any) => {
        let _shouldUpdate = tipShouldUpdate(prev, next, info) || disShouldUpdate(prev, next, info)
            || FieldNames.sku(props);
        return _shouldUpdate!;
    }
    const isPrice = name?.toLocaleLowerCase()?.includes('price');
    const inputNumberProps = {
        precision: isPrice ? 2 : undefined,
        step: isPrice ? 0.01 : undefined
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
                        <Input allowClear={allowClear}
                            placeholder={`请输入${label}`}
                            style={{ maxWidth: '734px', minWidth: '220px' }}
                        />
                    </Form.Item>
                ) : _uiType == 'inputNumber' ? (
                    <Form.Item {...formItemProps}>
                        <InputNumber
                            placeholder={`请输入${label}`}
                            style={{ maxWidth: '358px', minWidth: '80px' }}
                            {...inputNumberProps}
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
                            <Select showSearch
                                allowClear={allowClear && _uiType != 'multiSelect'}
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
                ) : _uiType == 'richTextEditor' ? (
                    <Form.Item {...formItemProps}>
                        <ReactQuill theme="snow" />
                    </Form.Item>
                ) : _uiType == 'skuEditTable' ? (
                    <Form.Item {...formItemProps}>
                        <SkuEditableTable {...props}
                            allFormItems={props.formSchema || []}
                            values={values} />
                    </Form.Item >
                ) : type == 'complex' ? (
                    <Form.Item {...formItemProps}>
                        {FieldNames.cateProp(props) ? (
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
                        ) : FieldNames.saleProp(props) ? (
                            <>
                                {subItems?.map((sm, si) => {
                                    return (<ProFormItem key={si} {...sm} />)
                                })}
                            </>
                        ) : (
                            <Space wrap={false}>
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
