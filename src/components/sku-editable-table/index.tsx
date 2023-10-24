import React, { useState, useRef, useEffect, useContext, useCallback, useMemo, useImperativeHandle, Ref, forwardRef, ReactNode } from 'react';
import { Button, Table, Input, Select, Form, FormInstance, Space, TableColumnProps, Popover, Message, Checkbox, Tag, Link, InputNumber } from '@arco-design/web-react';
import { FieldUiType, MyFormItemProps } from '../../pages/product/edit/interface';
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';
import { FieldNames, calcDescartes, getSkuItems, getSkuSaleProp, getTips, getUiTypeOrDefault, getUniquekey, getValiRules, isNumberOrStrNumber } from '../until';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import styles from './index.module.less'
import { isObject } from '@arco-design/web-react/es/_util/is';

const EditableContext = React.createContext<{
    getForm?: () => FormInstance | null,
}>({});

type SkuColumnProps = TableColumnProps & { formProps?: MyFormItemProps, rootField?: string, uiType?: FieldUiType };
const getSkuTableColumns = (formItems: MyFormItemProps[], rootField?: string, pName?: string, isSkuProps?: boolean): SkuColumnProps[] => {
    let columns: SkuColumnProps[] = [];
    if (!isSkuProps) {
        columns.push({
            title: "No",
            // editable: true,
            align: 'center',
            rootField: rootField,
            dataIndex: 'index',
            width: 60
        })
    }
    for (let index = 0; index < formItems.length; index++) {
        const skuItem = formItems[index] || {};
        const { label, name, type, tips = [], tags = [] } = skuItem;
        let dataIndex = pName ? `${pName}.${name}` : name;
        const [_, getTipValues] = getTips(tips);
        const tipValues = getTipValues(null) || [];
        const extra = tipValues.map((value: any, index: any) => <div key={index} dangerouslySetInnerHTML={{ __html: value }} />);
        const uiType = !isSkuProps ? getUiTypeOrDefault(skuItem) : undefined;
        if (type?.includes('complex')) {
            const skuProps = FieldNames.skuProps(tags);
            const _columns = getSkuTableColumns(skuItem?.subItems || [], rootField, dataIndex, skuProps);
            columns = columns.concat(_columns);
        } else {
            columns.push({
                title: <div className={styles['product-sku-table-title']}>
                    {skuItem?.rules?.required && (
                        <span className={styles['product-sku-table-symbol']}>
                            <svg fill="currentColor" viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M583.338667 17.066667c18.773333 0 34.133333 15.36 34.133333 34.133333v349.013333l313.344-101.888a34.133333 34.133333 0 0 1 43.008 22.016l42.154667 129.706667a34.133333 34.133333 0 0 1-21.845334 43.178667l-315.733333 102.4 208.896 287.744a34.133333 34.133333 0 0 1-7.509333 47.786666l-110.421334 80.213334a34.133333 34.133333 0 0 1-47.786666-7.509334L505.685333 706.218667 288.426667 1005.226667a34.133333 34.133333 0 0 1-47.786667 7.509333l-110.421333-80.213333a34.133333 34.133333 0 0 1-7.509334-47.786667l214.186667-295.253333L29.013333 489.813333a34.133333 34.133333 0 0 1-22.016-43.008l42.154667-129.877333a34.133333 34.133333 0 0 1 43.008-22.016l320.512 104.106667L412.672 51.2c0-18.773333 15.36-34.133333 34.133333-34.133333h136.533334z"></path></svg>
                        </span>
                    )}
                    <span> {label}</span>
                    {tips.length > 0 && (
                        <Popover content={extra}
                            triggerProps={{
                                popupStyle: {
                                    width: 'fit-content'
                                },
                                autoFitPosition: false
                            }}>
                            <IconQuestionCircle style={{
                                cursor: 'pointer',
                                marginLeft: '4px',
                                fontSize: '16px'
                            }} />
                        </Popover>
                    )}
                </div>,
                // editable: true,
                dataIndex: dataIndex,
                align: 'center',
                width: uiType ? 140 : 120,
                formProps: skuItem,
                rootField: rootField,
                uiType: uiType,
            });
        }
    }
    return columns;
}

function EditableRow(props: { [x: string]: any; children: any; record: any; className: any; }) {
    const { index, children, record, className, onHandleForm, ...rest } = props;
    const refForm = useRef<FormInstance>(null);
    const getForm = () => refForm.current;

    useEffect(() => {
        const form = getForm && getForm();
        onHandleForm && onHandleForm(record['key'], form, 'add');
        return () => {
            onHandleForm && onHandleForm(record['key'], form, 'del');
        }
    }, []);

    return (
        <EditableContext.Provider value={{ getForm }}>
            <Form
                id={`skuRowForm${index}`}
                wrapper='tr'
                ref={refForm}
                wrapperProps={rest}
                children={children}
                style={{ display: 'table-row' }}
                className={`${className} editable-row`}
                scrollToFirstError={true}
            />
        </EditableContext.Provider>
    );
}

function EditableCell(props: any) {
    const { children, rowData, column, onHandleSave } = props;
    const { dataIndex, formProps, uiType } = column;
    const { name, rules = {}, options = [] } = formProps || {};
    const isPrice = name?.toLowerCase()?.includes('price');
    const formItemRules = getValiRules(rules, isPrice);
    const { getForm } = useContext(EditableContext);

    const cellValueChangeHandler = (value: any) => {
        const values = { [dataIndex]: value, };
        onHandleSave && onHandleSave({ ...rowData, ...values });
    };

    useEffect(() => {
        const form = getForm && getForm();
        form?.setFieldValue(dataIndex, rowData[dataIndex]);
    }, [rowData[dataIndex]]);

    return (<>
        <Form.Item noStyle
            style={{ margin: 0 }}
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
            field={dataIndex}
            rules={formItemRules}
            initialValue={rowData[dataIndex]}
        >
            {uiType == 'input' ? (
                <Input placeholder={'请输入'}
                    onChange={cellValueChangeHandler} />
            ) : uiType == 'inputNumber' ? (
                <InputNumber
                    placeholder={'请输入'}
                    onChange={cellValueChangeHandler}
                    max={isNumberOrStrNumber(rules?.maxValue) ? rules.maxValue : undefined}
                    min={isNumberOrStrNumber(rules?.minValue) ? rules.minValue : isPrice ? 0.01 : 1}
                    precision={isPrice ? 2 : undefined}
                    step={isPrice ? 0.01 : undefined}
                />
            ) : uiType == 'select' ? (
                <Select
                    placeholder={'请选择'}
                    onChange={cellValueChangeHandler}
                    options={options}
                    triggerProps={{
                        autoAlignPopupWidth: false,
                        autoAlignPopupMinWidth: true,
                        position: 'bl',
                    }}
                />
            ) : (
                <>{children}</>
            )}
        </Form.Item>
    </>
    );
}


type SkuFormItemProps = MyFormItemProps & { salePropValues: any };
function SkuEditableTable(props: SkuFormItemProps, ref: Ref<any>) {
    const { subItems = [], salePropValues = [], name, namePath, } = props;
    const rootField = namePath?.join('.') || name;
    const [value, setValue] = useMergeValue<any[]>([], {
        defaultValue: 'defaultValue' in props ? props.defaultValue : undefined,
        value: 'value' in props ? props.value : undefined,
    });

    const handleChange = (newData: any[]) => {
        if (JSON.stringify(value) != JSON.stringify(newData)) {
            if (!('value' in props)) { setValue(newData); }
            if (props.onChange) { props.onChange(newData); }
        }
    }

    const [skuSalePropObjVal, SetSkuSalePropObjVal] = useState<any>({});
    const [skuBatchFillValue, SetSkuBatchFillValue] = useState<any>({});
    const [fillDataLoading, SetFillDataLoading] = useState<boolean>(false);
    const [showMoreBatch, SetShowMoreBatch] = useState<boolean>(false);

    const [skuSaleProp, skuSalePropName] = useMemo(() => {
        const skuSaleProp = subItems.find((f: MyFormItemProps) => FieldNames.skuProps(f?.tags));
        const skuSalePropName = skuSaleProp?.name!;
        return [skuSaleProp, skuSalePropName]
    }, []);

    useEffect(() => {
        const salePropNames = skuSaleProp?.subItems?.map(m => m.name!) || [];
        const skuSalePropValue = getSkuSaleProp(salePropNames, salePropValues);
        const newData = getSkuItems(skuSalePropValue, skuSalePropName, value);
        handleChange(newData);
        SetSkuSalePropObjVal(skuSalePropValue || {});
    }, [JSON.stringify(salePropValues)]);

    const columns = useMemo(() => {
        const _columns = getSkuTableColumns(subItems, rootField);
        return _columns.map((column) => {
            return {
                ...column,
                render(value: any, _item: any, _index: any) {
                    if (column.dataIndex == 'index') { return _index + 1; }
                    if (value && isObject(value)) {
                        const { text, remark } = value;
                        return remark ? `${text}(${remark})` : text;
                    }
                    return value;
                },
            }
        })
    }, []);

    const getskuBatchFillKeys = () => {
        const skuBatchFillPropValueObjs = skuBatchFillValue[skuSalePropName] || {};
        const tempSkuBatchFillPropValueObjs: { [x: string]: string } = {};
        Object.keys(skuSalePropObjVal).forEach(key => {
            let values = skuBatchFillPropValueObjs[key] || [];
            // console.log("getskuBatchFillKeys", key, values, skuBatchFillValue);
            if (values.length == 0) { values = (skuSalePropObjVal[key] || []).map((m: { value: any; }) => m.value); }
            tempSkuBatchFillPropValueObjs[key] = values;
        });
        const skuBatchFillPropValues = calcDescartes(tempSkuBatchFillPropValueObjs, (v) => v) || [];
        const keys = skuBatchFillPropValues.map(m => getUniquekey(m));
        return keys || [];
    }

    const handleFillSkuData = () => {
        const fillData = Object.assign({}, skuBatchFillValue);
        delete fillData[skuSalePropName];
        if (Object.keys(fillData).length == 0) { return; }
        SetFillDataLoading(true);
        setTimeout(() => {
            let updateCount = 0;
            const keys = getskuBatchFillKeys();
            const newData = (value || []).map((m: any, i: number) => {
                if (!keys.includes(m.key)) { return m; }
                updateCount++;
                return { ...m, ...fillData };
            });
            handleChange(newData);
            SetSkuBatchFillValue({});
            Message.success(`成功改变${updateCount}条数据`);
            SetFillDataLoading(false);
        }, 10);
    }

    const skuFillChange = (name: string, value: any) => {
        SetSkuBatchFillValue((data: any) => {
            return { ...data, [name]: value }
        });
    }

    function handleSave(row: any) {
        const newData = [...data];
        const index = newData.findIndex((item) => row.key === item.key);
        newData.splice(index, 1, { ...newData[index], ...row });
        handleChange(newData);
    }

    const [forms, setForms] = useState<{ [key: string]: FormInstance }>({});
    function handleForm(key: string, form: FormInstance, operate: 'add' | 'del') {
        setForms((forms: { [key: string]: FormInstance }) => {
            if (operate == 'add' && form) { forms[key] = form; }
            if (operate == 'del' && forms[key]) { delete forms[key]; }
            return forms;
        });
    }

    useImperativeHandle(ref, () => {
        return {
            validate: async () => {
                const tempForms = Object.values(forms);
                for (let index = 0; index < tempForms.length; index++) {
                    const form = tempForms[index];
                    await form.validate();
                }
            },
        };
    });

    const data = value.filter(f => f.key);
    return (
        <div>
            <Space wrap>
                {subItems.map((m, i) => {
                    const { label, name, options = [] } = m;
                    if (!name) { return; }
                    const uiType = getUiTypeOrDefault(m);
                    const isSkuProps = FieldNames.skuProps(m?.tags);
                    if (isSkuProps) {
                        let selectLength = 0;
                        const propValue = skuBatchFillValue[name] || {};
                        Object.keys(propValue || {}).forEach(f => {
                            selectLength += propValue[f]?.length || 0;
                        });
                        return <Select key={i} style={{ width: '180px' }}
                            placeholder={'当前默认选定所有规格'}
                            value={selectLength > 0 ? '查看已选规格' : undefined}
                            triggerProps={{
                                autoAlignPopupWidth: false,
                                autoAlignPopupMinWidth: true,
                                position: 'bl',
                            }}
                        >
                            <div style={{ padding: '0px 12px 2px', maxWidth: '360px' }}>
                                {m?.subItems?.map((pm, pi) => {
                                    const { label: pLabel, name: pName } = pm;
                                    if (!pName) { return; }
                                    const sspvs = skuSalePropObjVal[pName] || [];
                                    const propValue = skuBatchFillValue[name] || {};
                                    return <div key={pi}>
                                        <div style={{ margin: '8px 4px' }}>{pLabel}</div>
                                        <Checkbox.Group
                                            value={propValue[pName]}
                                            onChange={(value) => {
                                                propValue[pName] = value;
                                                skuFillChange(name, propValue);
                                            }} >
                                            {sspvs.map((sm: any, si: number) => {
                                                return (
                                                    <Checkbox key={si} value={sm.value}
                                                        style={{ margin: '0px 2px 4px 0px' }}>
                                                        {({ checked }) => {
                                                            return (
                                                                <Tag key={si}
                                                                    color={checked ? 'arcoblue' : ''}
                                                                    bordered>
                                                                    {sm.text}
                                                                </Tag>
                                                            );
                                                        }}
                                                    </Checkbox>
                                                );
                                            })}
                                        </Checkbox.Group>
                                    </div>
                                })}
                                <div style={{ margin: '8px 4px', }}>
                                    <Link hoverable={false}
                                        onClick={() => { skuFillChange(name, undefined); }}
                                        style={{ fontSize: '12px', color: 'var(--color-text-1)' }}
                                    >
                                        清空已选
                                    </Link>
                                </div>
                            </div>
                        </Select>
                    }
                    return (i < 5 || showMoreBatch) && <div key={i}>
                        {uiType == 'input' ? (
                            <Input allowClear
                                placeholder={label}
                                style={{ width: '120px' }}
                                value={skuBatchFillValue[name]}
                                onChange={value => { skuFillChange(name, value); }}
                            />
                        ) : uiType == 'inputNumber' ? (
                            <InputNumber placeholder={label}
                                style={{ width: '120px' }}
                                value={skuBatchFillValue[name]}
                                onChange={value => { skuFillChange(name, value); }}
                            />
                        ) : uiType == 'select' ? (
                            <Select allowClear
                                placeholder={label}
                                options={options}
                                triggerProps={{
                                    autoAlignPopupWidth: false,
                                    autoAlignPopupMinWidth: true,
                                    position: 'bl',
                                }}
                                style={{ width: '120px' }}
                                value={skuBatchFillValue[name]}
                                onChange={value => { skuFillChange(name, value); }}
                            />
                        ) : (
                            <>_</>
                        )}
                    </div>
                })}
                <Button type='primary'
                    loading={fillDataLoading}
                    onClick={handleFillSkuData}>
                    批量填充
                </Button>
                {subItems?.length > 5 &&
                    <Button type='secondary'
                        onClick={() => {
                            SetShowMoreBatch(!showMoreBatch);
                        }}>
                        {showMoreBatch ? '收起' : '更多批量'}
                    </Button>
                }
            </Space >
            <Table
                size='small'
                pagination={false}
                scroll={{ y: 320, x: true }}
                data={data}
                // columns={columns}
                onRow={() => ({
                    onHandleForm: handleForm
                })}
                columns={columns.map((column) => {
                    return {
                        ...column,
                        onCell: () => ({
                            onHandleSave: handleSave
                        }),
                    }
                })}
                components={{
                    body: {
                        row: EditableRow,
                        cell: EditableCell,
                    },
                }}
            />
        </div>
    );
}

const SkuEditableTableComponent = forwardRef(SkuEditableTable);
SkuEditableTableComponent.displayName = 'SkuEditableTable';
export default SkuEditableTableComponent;