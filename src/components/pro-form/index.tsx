
import { Form, Space, Input, Select, InputNumber, Radio, FormItemProps, Grid, Link, Button, Checkbox, Message, Spin, Empty, Alert } from '@arco-design/web-react';
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon';
import styles from './index.module.less'
import SkuEditableTable from '../sku-editable-table';
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";
import ImageUpload from '../ImageUpload';
import { FieldNames, checkDependRules, getTips, getUiTypeOrDefault, getValiRules } from '../until';
import SalePropFormItem from '../sale-prop/SalePropFormItem';
import { MyFormItemProps } from '../../pages/product/edit/interface';
import _, { debounce } from 'lodash';
import { useCallback, useContext, useEffect, useState } from 'react';
import { getRemoteOptions } from '../api';
import { ProductEditContext } from '../../pages/product/edit';
import { ErrorBoundary } from 'react-error-boundary';


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

function RemoteSelect(props: any) {
    const { label, optionAction, options: propOptions = [], value, onChange, ...rest } = props
    const [options, setOptions] = useState(propOptions);
    const [fetching, setFetching] = useState(false);
    const { getShopId } = useContext(ProductEditContext);
    useEffect(() => {
        if (optionAction && options.length == 0) {
            debouncedFetchOptions(optionAction);
        }
    }, []);
    const debouncedFetchOptions = useCallback(
        debounce(async (optionAction: string, forceUpdate?: boolean) => {
            if (fetching) { return; }
            setFetching(true);
            try {
                const shopId = getShopId && getShopId();
                if (shopId! > 0) {
                    setOptions([]);
                    const options = await getRemoteOptions(shopId, optionAction, forceUpdate);
                    setOptions(options);
                    forceUpdate && Message.success(`${label}同步成功！`);
                } else {
                    console.log('getShopId error', getShopId);
                }
            } catch (error: any) {
                Message.error(error?.message || error);
            } finally {
                setFetching(false);
            }
        }, 500), []);

    return <div>
        <Select
            value={value}
            onChange={onChange}
            options={options}
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

function FormItem(props: any) {
    const { children, label, ...formItemProps } = props;
    return <ErrorBoundary fallback={
        <Form.Item label={label}>
            <Alert type='error' content={`组件渲染出错`} />
        </Form.Item>
    }>
        <Form.Item label={label} {...formItemProps} >{children}</Form.Item>
    </ErrorBoundary>
}

export function ProFormItem(props: MyFormItemProps & { picSize?: 'mini' } & { salePropFieldName?: string }) {
    const {
        type, label = '', name, namePath, value,
        optionAction, options = [], subItems = [], nestItems = [],
        hide, tips, rules, readOnly, allowCustom,
        fieldName, noStyle, picSize, allowClear = true,
        valueType, salePropFieldName
    } = props || {};

    const _fieldName = fieldName || namePath?.join('.') || name;
    const [tipShouldUpdate, getTipValues] = getTips(tips || []);
    const [disShouldUpdate, isHide] = checkDependRules(hide || {});
    const shouldUpdate = (prev: any, next: any, info: any) => {
        if (JSON.stringify(prev) == JSON.stringify(next)) { return false; }
        let _shouldUpdate = tipShouldUpdate(prev, next, info) || disShouldUpdate(prev, next, info)
            || FieldNames.sku(props) || FieldNames.saleProp(props);
        return _shouldUpdate!;
    }
    const { form } = Form.useFormContext();
    return (
        <Form.Item noStyle shouldUpdate={shouldUpdate} >
            {(values) => {
                const _hide = isHide(values) === true;
                if (_hide) {
                    form.setFieldValue(_fieldName!, undefined);
                    return;
                }
                const tipValues = getTipValues(values) || [];
                const extra = tipValues.map((value: any, index: any) => <div key={index} dangerouslySetInnerHTML={{ __html: value }} />);

                const _uiType = getUiTypeOrDefault(props);
                const _rules = getValiRules(rules);

                const isPrice = name?.toLocaleLowerCase()?.includes('price');
                const inputNumberProps = {
                    precision: isPrice ? 2 : undefined,
                    step: isPrice ? 0.01 : undefined
                }

                const formItemProps: FormItemProps = {
                    label, extra,
                    rules: _rules,
                    disabled: readOnly,
                    initialValue: value,
                    field: _fieldName,
                    noStyle: noStyle,
                    style: subItems.length > 0 ? { marginBottom: '0px' } : {}
                }

                return _uiType == 'input' ? (
                    <FormItem {...formItemProps} >
                        <Input allowClear={allowClear}
                            placeholder={`请输入${label}`}
                            style={{ maxWidth: '734px', minWidth: '220px' }}
                        // showWordLimit={isNumber(rules?.maxLength)}
                        // maxLength={
                        //     isNumber(rules?.maxLength)
                        //         ? { length: rules!.maxLength, errorOnly: true }
                        //         : undefined
                        // } 
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
                    nestItems.length > 0 ? (
                        <FormItem {...formItemProps}>
                            <ProFormList {...props} />
                        </FormItem >
                    ) : (
                        <FormItem {...formItemProps}>
                            {optionAction ? (
                                <RemoteSelect showSearch
                                    allowClear={allowClear && _uiType != 'multiSelect'}
                                    label={label}
                                    optionAction={optionAction}
                                    options={options}
                                    allowCreate={allowCustom}
                                    mode={_uiType == 'multiSelect' ? 'multiple' : undefined}
                                    placeholder={`请选择${_uiType == 'multiSelect' ? '或输入' : ''}${label}`}
                                    style={{ maxWidth: '274px', minWidth: '96px' }}
                                />
                            ) : (
                                <Select showSearch
                                    allowClear={allowClear && _uiType != 'multiSelect'}
                                    options={options}
                                    allowCreate={allowCustom}
                                    mode={_uiType == 'multiSelect' ? 'multiple' : undefined}
                                    placeholder={`请选择${_uiType == 'multiSelect' ? '或输入' : ''}${label}`}
                                    style={{ maxWidth: '358px', minWidth: '180px' }}
                                />
                            )}
                        </FormItem>
                    )
                ) : _uiType == 'imageUpload' ? (
                    <FormItem {...formItemProps}>
                        <ImageUpload size={picSize} />
                    </FormItem >
                ) : _uiType == 'richTextEditor' ? (
                    <FormItem {...formItemProps}>
                        <ReactQuill theme="snow" className={styles['desc']} />
                    </FormItem>
                ) : type == 'complex' ? (
                    FieldNames.cateProp(props) ? (
                        <FormItem {...formItemProps}>
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
                        </FormItem >
                    )
                        : FieldNames.saleProp(props) ? (
                            <FormItem {...formItemProps}>
                                {subItems?.map((m, i) => {
                                    return (m.type == 'multiCheck' || m.type == 'complex')
                                        ? <SalePropFormItem key={i} {...m} />
                                        : <div key={i}></div>
                                })}
                            </FormItem >
                        )
                            : (
                                <FormItem {...formItemProps}>
                                    <Space wrap={true}>
                                        {subItems?.map((sm: any, si: any) => {
                                            return (<ProFormItem key={si} {...sm} />)
                                        })}
                                    </Space>
                                </FormItem >
                            )
                ) : type == 'multiComplex' ? (
                    FieldNames.sku(props) ? (
                        <FormItem {...formItemProps}>
                            <SkuEditableTable {...props}
                                salePropValues={_.get(values, salePropFieldName!)}
                            />
                        </FormItem >
                    ) : (
                        <FormItem {...formItemProps}>
                            <ProFormList {...props} />
                        </FormItem >
                    )
                ) : <div>---{label}---</div>;
            }}
        </Form.Item>
    )
}