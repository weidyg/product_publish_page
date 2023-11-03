

import { ReactElement, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Form, Space, Input, Select, InputNumber, Radio, FormItemProps, Grid, Link, Button, Checkbox, Message, Spin, Empty, Alert, InputProps, Card, Typography } from '@arco-design/web-react';
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon';
import { isObject, isString, isUndefined } from '@arco-design/web-react/es/_util/is';
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';
import cs from '@arco-design/web-react/es/_util/classNames';
import _, { debounce, throttle } from 'lodash';
import { ErrorBoundary } from 'react-error-boundary';
import { FieldNames, checkDependRules, getStringLength, getTips, getUiTypeOrDefault, getValiRules, isNumberOrStrNumber, sliceString } from '../until';
import SalePropFormItem from '../sale-prop/SalePropFormItem';
import SkuEditableTable from '../sku-editable-table';
import RichTextEditor from './RichTextEditor';
import ImageUpload from '../ImageUpload';
import { getRemoteOptions } from '../api';
import { ConfigContext } from '@arco-design/web-react/es/ConfigProvider';
import styles from './index.module.less'
import { MyFormItemProps } from '../product-edit/interface';
import { ProductEditContext } from '../product-edit';

function ProFormList(props: MyFormItemProps) {
    const { type, label, name, namePath, value,
        subItems = [], nestItems = [], ...rest } = props;
    const fieldName = namePath?.join('.') || name;
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
    const required = props?.rules?.required;
    return (
        <Form.List field={fieldName!} noStyle>
            {(fields: any, { add, remove, move }: any) => {
                if (required && fields.length == 0) {
                    fields.push({ key: 0, field: `${fieldName}[${0}]` });
                }
                return (
                    <Space wrap size={'mini'}>
                        {fields.map(({ field }: any, index: any) => {
                            return (
                                <Space key={index} size={'mini'}>
                                    {formItems?.map((sm, si) => {
                                        const uiType = sm.type == 'singleCheck' ? 'select' : sm.uiType;
                                        return (
                                            <ProFormItem key={si}
                                                {...sm} noStyle allowClear={false}
                                                uiType={uiType} picSize={'mini'}
                                                fieldName={field + '.' + sm.name} />
                                        )
                                    })}
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

function RemoteSelect(props: any) {
    const { label, optionAction, options: propOptions = [], value, onChange, ...rest } = props
    const [options, setOptions] = useState<any[]>(propOptions);
    const [fetching, setFetching] = useState(false);
    useEffect(() => {
        if (optionAction && options.length == 0) {
            debouncedFetchOptions(optionAction);
        }
    }, []);
    const { shopId, categoryId } = useContext(ProductEditContext);
    const debouncedFetchOptions = useCallback(debounce(async (optionAction: string, forceUpdate?: boolean) => {
        if (fetching) { return; }
        setFetching(true);
        try {
            if (shopId! > 0) {
                setOptions([]);
                const options = await getRemoteOptions(shopId, categoryId, optionAction, forceUpdate);
                setOptions(options);
                const option = options?.find(f => f.value == value);
                if (!option) {
                    const value = options?.length > 0 ? options[0].value : undefined;
                    handleChange(value);
                }
                forceUpdate && Message.success(`${label}同步成功！`);
            } else {
                console.log('shopId error', shopId);
            }
        } catch (error: any) {
            Message.error(error?.message || error);
        } finally {
            setFetching(false);
        }
    }, 500), []);


    const handleChange = (value: any) => {
        onChange && onChange(value);
    }

    return <div>
        <Select
            value={value}
            onChange={handleChange}
            options={options}
            triggerProps={{
                autoAlignPopupWidth: false,
                autoAlignPopupMinWidth: true,
                position: 'bl',
                onVisibleChange(visible) {
                    if (visible && !fetching && options.length == 0) {
                        debouncedFetchOptions(optionAction, false);
                    }
                },
            }}
            renderFormat={(option, value) => {
                if (!option) { return ''; }
                return option?.children;
            }}
            notFoundContent={
                fetching ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                        <Spin style={{ margin: 12 }} />
                    </div>
                ) : <Empty />
            }
            {...rest}
        />
        {optionAction &&
            <Button type='text' icon={<IconRefresh />}
                loading={fetching}
                onClick={() => {
                    debouncedFetchOptions(optionAction, true);
                }}
            >
                {`同步`}
            </Button>
        }
    </div>
}

function fallbackRender(props: any) {
    { console.log(props) }
    return (
        <Form.Item label={props?.label} >
            <Alert type='error'
                title="渲染组件错误"
                content={props?.error?.message}
            />
        </Form.Item>
    );
}

function FormItem(props: any) {
    const { children, label, style, uiType, ...formItemProps } = props;
    return <ErrorBoundary fallbackRender={({ error }) => fallbackRender({ error, label })}>
        <Form.Item  {...formItemProps} label={label} style={style}>
            {children}
        </Form.Item>
    </ErrorBoundary>
}

function formatValue(value: any, maxLength: any, isByteUnit: boolean) {
    const str = value !== null && !isUndefined(value) && !isString(value) ? String(value) : value || '';
    if (maxLength) {
        return sliceString(value, 0, maxLength, isByteUnit);
    }
    return str;
}

interface FormInputProps extends Omit<InputProps, 'maxLength'> {
    maxLength?: number | {
        length: number;
        errorOnly?: boolean;
        unit?: 'byte' | 'default'
    };
}

function FormInput(props: FormInputProps) {
    const { suffix, showWordLimit, maxLength, ...restProps } = props;
    const trueMaxLength = isObject(maxLength) ? maxLength.length : maxLength;
    const mergedMaxLength = isObject(maxLength) && maxLength.errorOnly ? undefined : trueMaxLength;
    const isByteUnit = isObject(maxLength) && maxLength.unit == 'byte';
    // const showByteLength = isObject(maxLength) && maxLength.show == 'byte';

    const { getPrefixCls = () => { }, rtl } = useContext(ConfigContext);
    const prefixCls = getPrefixCls('input');

    const [value, setValue] = useMergeValue('', {
        defaultValue: 'defaultValue' in props ? formatValue(props.defaultValue, mergedMaxLength, isByteUnit) : undefined,
        value: 'value' in props ? formatValue(props.value, mergedMaxLength, isByteUnit) : undefined,
    });

    const onChange = (value: any, e: any) => {
        if (!('value' in props)) { setValue(value); }
        props.onChange && props.onChange(value, e);
    };

    const valueLength = getStringLength(value, isByteUnit);

    const lengthError = useMemo(() => {
        if (!mergedMaxLength && trueMaxLength) {
            return valueLength > trueMaxLength;
        }
        return false;
    }, [valueLength, trueMaxLength, mergedMaxLength]);

    let suffixElement = suffix;
    if (trueMaxLength && showWordLimit) {
        const [leftWord, rightWord] = rtl ? [trueMaxLength, valueLength] : [valueLength, trueMaxLength];
        suffixElement = (
            <span
                className={cs(`${prefixCls}-word-limit`, {
                    [`${prefixCls}-word-limit-error`]: lengthError,
                })}
            >
                {`${leftWord}/${rightWord}`}
                {/* {(!isByteUnit || showByteLength)
                    ? `${leftWord}/${rightWord}`
                    : `${Math.ceil(leftWord / 2)}/${Math.ceil(rightWord / 2)}`
                } */}
            </span>
        );
    }

    return <Input {...restProps}
        value={value} onChange={onChange}
        suffix={suffixElement}
    />
}
type UIFormItemProps = Omit<FormItemProps, 'rules' | 'label'>;

export function ProFormItem(props: MyFormItemProps & UIFormItemProps
    & { picSize?: 'mini', salePropFieldName?: string, parentLabel?: any }) {
    const {
        type, label = '', name, namePath, value, tags = [],
        optionAction, options = [], subItems = [], nestItems = [],
        hide, tips, rules, readOnly, allowCustom,
        fieldName, noStyle, picSize, allowClear = true,
        valueType, salePropFieldName, parentLabel = '', style,
        ...uiFormItemProps
    } = props || {};

    const skuTableRef = useRef<any>();

    const _fieldName = fieldName || namePath?.join('.') || name;
    const [tipShouldUpdate, getTipValues] = getTips(tips || []);
    const [disShouldUpdate, isHide] = checkDependRules(hide || {});
    const shouldUpdate = (prev: any, next: any, info: any) => {
        if (JSON.stringify(prev) == JSON.stringify(next)) { return false; }
        let _shouldUpdate = tipShouldUpdate(prev, next, info) || disShouldUpdate(prev, next, info)
            || FieldNames.sku(tags) || FieldNames.saleProp(tags);
        return _shouldUpdate!;
    }
    const isComplexType = type == 'complex' || type == 'multiComplex';
    const _uiType = getUiTypeOrDefault(props);
    const _rules = getValiRules(rules);
    const isPrice = name?.toLocaleLowerCase()?.includes('price');
    const inputNumberProps = {
        precision: isPrice ? 2 : undefined,
        step: isPrice ? 0.01 : undefined
    }
    const _labelArr = label?.replace('：', ':')?.split(':') || [];
    const _label = label != parentLabel && <span title={label} style={{ marginTop: '10px' }}>
        {_labelArr.length == 2 ? _labelArr[0] : label}
    </span>;
    // const { form } = Form.useFormContext();
    return (
        <Form.Item noStyle shouldUpdate={shouldUpdate} >
            {(values: any) => {
                const _hide = isHide(values) === true;
                if (_hide) {
                    // console.log('_fieldName', _fieldName);
                    // form.setFieldValue(_fieldName!, undefined);
                    return;
                }
                const tipValues = getTipValues(values) || [];
                if (_labelArr.length == 2) { tipValues.unshift(_labelArr[1]) }
                const _extra = tipValues?.length > 0 ? tipValues.map((value: any, index: any) =>
                    index == 0
                        ? <span key={index} dangerouslySetInnerHTML={{ __html: value }} />
                        : <div key={index} dangerouslySetInnerHTML={{ __html: value }} />
                ) : undefined;
                const formItemProps: FormItemProps = {
                    ...uiFormItemProps,
                    label: _label,
                    rules: _rules,
                    disabled: readOnly,
                    initialValue: value,
                    field: _fieldName,
                    noStyle: noStyle,
                    extra: !isComplexType ? _extra : undefined,
                    style: subItems.length > 0 ? { ...style, marginBottom: '0px' } : { ...style },
                }
                const salePropValues = _.get(values, salePropFieldName!);
                return _uiType == 'input' ? (
                    <FormItem {...formItemProps} >
                        <FormInput allowClear={allowClear}
                            placeholder={`请输入${label}`}
                            style={{ maxWidth: '734px', minWidth: '220px' }}
                            showWordLimit={isNumberOrStrNumber(rules?.maxLength)}
                            maxLength={isNumberOrStrNumber(rules?.maxLength)
                                ? { length: rules?.maxLength!, unit: 'byte', errorOnly: true, }
                                : undefined
                            }
                        />
                    </FormItem>
                ) : _uiType == 'inputTextArea' ? (
                    <FormItem {...formItemProps} >
                        <Input.TextArea allowClear={allowClear}
                            placeholder={`请输入${label}`}
                        // style={{ maxWidth: '734px', minWidth: '220px' }}
                        // showWordLimit={isNumber(rules?.maxLength)}
                        // maxLength={
                        //     isNumber(rules?.maxLength)
                        //         ? { length: rules!.maxLength, errorOnly: true }
                        //         : undefined
                        // } 
                        />
                    </FormItem>
                ) : _uiType == 'inputNumber' ? (
                    <FormItem {...formItemProps}>
                        <InputNumber
                            placeholder={`请输入${label}`}
                            style={{ maxWidth: '358px', minWidth: '80px' }}
                            {...inputNumberProps}
                        />
                    </FormItem>
                ) : _uiType == 'radioGroup' ? (
                    <FormItem {...formItemProps}>
                        <Radio.Group options={options} />
                    </FormItem>
                ) : _uiType == 'checkBoxGroup' ? (
                    <FormItem {...formItemProps}>
                        {valueType == 'object' ? (
                            <Space>
                                {options.map((m, i) => {
                                    return <Form.Item key={i}
                                        field={`${_fieldName}.${m.value}`}>
                                        <Checkbox>{m.label}</Checkbox>
                                    </Form.Item>
                                })}
                            </Space>
                        ) : (
                            <Checkbox.Group options={options} />
                        )}
                    </FormItem>
                ) : _uiType == 'select' || _uiType == 'multiSelect' ? (
                    <FormItem {...formItemProps}>
                        {nestItems.length > 0 ? (
                            <ProFormList {...props} />
                        ) : (optionAction ? (
                            <RemoteSelect showSearch
                                filterOption={(inputValue: string, option: ReactElement) =>
                                    option.props.value.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0 ||
                                    option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                }
                                label={label}
                                optionAction={optionAction}
                                options={options}
                                maxTagCount={3}
                                allowCreate={allowCustom}
                                allowClear={allowClear && _uiType != 'multiSelect'}
                                mode={_uiType == 'multiSelect' ? 'multiple' : undefined}
                                placeholder={`请选择${allowCustom ? '或输入' : ''}${label}`}
                                style={{ maxWidth: '274px', minWidth: '96px' }}
                            />
                        ) : (
                            <Select showSearch
                                filterOption={(inputValue: string, option: ReactElement) =>
                                    option.props.value.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0 ||
                                    option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                }
                                options={options}
                                allowCreate={allowCustom}
                                maxTagCount={3}
                                allowClear={allowClear && _uiType != 'multiSelect'}
                                mode={_uiType == 'multiSelect' ? 'multiple' : undefined}
                                placeholder={`请选择${allowCustom ? '或输入' : ''}${label}`}
                                style={{ maxWidth: '358px', minWidth: '180px' }}
                            />
                        ))}
                    </FormItem>
                ) : _uiType == 'imageUpload' ? (
                    <FormItem {...formItemProps} label=''>
                        <ImageUpload size={picSize} text={label} />
                    </FormItem >
                ) : _uiType == 'richTextEditor' ? (
                    <FormItem {...formItemProps}>
                        <RichTextEditor />
                    </FormItem>
                ) : type == 'complex' ? (
                    <Form.Item label={_label} style={{ margin: '0' }}>
                        {_extra && <div style={{ fontSize: '12px', color: 'var(--color-text-3)', margin: '8px 0 4px' }}>{_extra}</div>}
                        <FormItem {...formItemProps} field='' noStyle>
                            {FieldNames.cateProp(tags) ? (
                                <Card style={{ background: 'var(--color-fill-1)', margin: '0 0 18px 0' }}
                                    bodyStyle={{
                                        padding: '16px 16px 0',
                                        maxWidth: "950px",
                                        margin: 'auto'
                                    }}>
                                    <Grid.Row >
                                        {subItems?.filter(f => !['complex', 'multiComplex'].includes(f.type!)).map((sm, si) => {
                                            return (<Grid.Col key={'complex' + si} span={12}>
                                                <ProFormItem key={si} {...sm}
                                                    labelAlign='right'
                                                    layout={'horizontal'}
                                                    className={styles['form-label-ellipsis']}
                                                    uiType={sm.type == 'singleCheck' ? 'select' : sm.uiType}
                                                />
                                            </Grid.Col>
                                            )
                                        })}
                                        {subItems?.filter(f => ['complex', 'multiComplex'].includes(f.type!)).map((sm, si) => {
                                            return (<Grid.Col key={'complex' + si} span={24}>
                                                <ProFormItem key={si} {...sm}
                                                    labelAlign='right'
                                                    layout={'horizontal'}
                                                    className={styles['form-label-ellipsis']}
                                                />
                                            </Grid.Col>
                                            )
                                        })}
                                        {/* </Grid> */}
                                    </Grid.Row>
                                </Card>
                            ) : FieldNames.saleProp(tags) ? (
                                <Card bordered={false} bodyStyle={{ padding: '6px 0 0', maxWidth: "950px", margin: 'auto' }}>
                                    {subItems?.map((m, i) => {
                                        return (m.type == 'multiCheck' || m.type == 'complex')
                                            ? <SalePropFormItem key={i} {...m} />
                                            : <div key={i}></div>
                                    })}
                                </Card>
                            ) : FieldNames.images(tags) ? (
                                <Space wrap={true}>
                                    {subItems?.map((sm: any, si: any) => {
                                        return (<ProFormItem key={si} {...sm} parentLabel={label} />)
                                    })}
                                </Space>
                            ) : (<>
                                {subItems?.map((m: any, i: any) => {
                                    return (<ProFormItem key={i} {...m} parentLabel={label} />)
                                })}
                            </>)
                            }
                        </FormItem >
                    </Form.Item>
                ) : type == 'multiComplex' ? (
                    <Form.Item label={_label}>
                        {_extra && <div style={{ fontSize: '12px', color: 'var(--color-text-3)', margin: '8px 0 4px' }}>{_extra}</div>}
                        {FieldNames.sku(tags) ? (
                            <FormItem {...formItemProps} noStyle
                                rules={[{
                                    validator: async (value: any, callback: (error?: ReactNode) => void) => {
                                        try {
                                            await skuTableRef?.current?.validate();
                                        } catch (error) {
                                            callback('sku 值校验失败');
                                        }
                                    }
                                }]}>
                                <SkuEditableTable ref={skuTableRef} {...props}
                                    salePropValues={salePropValues}
                                />
                            </FormItem >
                        ) : (
                            <FormItem {...formItemProps} noStyle>
                                <ProFormList {...props} />
                            </FormItem >
                        )}
                    </Form.Item>
                ) : <div>---{label}---</div>;
            }}
        </Form.Item >
    )
}