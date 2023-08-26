import React, { useState, useRef, useContext, useEffect, useMemo } from 'react';
import { Table, Input, Select, Form, FormInstance, InputNumber, TableColumnProps, Popover } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { MyFormDependRules, MyFormItemProps } from '../pages/product/interface';
import { checkDependRules, getUniquekey, getValiRules, smoothData } from './untis';
import styles from './SkuEditableTable.module.less'
import * as _ from "lodash"
const EditableContext = React.createContext<{ addRowFormRef?: (p: () => FormInstance) => void }>({});
const EditableRowContext = React.createContext<{ getForm?: () => FormInstance }>({});

type SkuColumnProps = TableColumnProps & { formProps: MyFormItemProps };

const getDefaultUiType = (props: MyFormItemProps) => {
    const { type, options = [], uiType, rules = {} } = props;
    const { allowCustom, valueType, maxValue, minValue, ..._rules } = rules;
    const length = options.length;

    if (uiType) { return uiType; }
    if (type == 'singleCheck') {
        return (length > 3 || allowCustom) ? 'select' : 'radio';
    } else if (type == 'input') {
        return (valueType == 'number' || maxValue || minValue) ? 'inputNumber' : 'input';
    }
    return uiType;
}

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
            if (value) { return <div key={index} dangerouslySetInnerHTML={{ __html: value }} style={{ width: 'fit-content' }} /> }
        }));
    };
    return [shouldUpdate, getValues];
}


const getSkuTableColumns = (formItems: MyFormItemProps[], pName?: string): SkuColumnProps[] => {
    let columns: SkuColumnProps[] = [];
    for (let index = 0; index < formItems.length; index++) {
        const skuItem = formItems[index];
        const { label, name, type } = skuItem;
        let dataIndex = pName ? `${pName}.${name}` : name;
        const tips = skuItem?.rules?.tips || [];
        const [_, getTipValues] = getTips(tips);
        const uiType = getDefaultUiType(skuItem);
        if (type?.includes('complex')) {
            const _columns = getSkuTableColumns(skuItem?.formItems || [], dataIndex);
            columns = columns.concat(_columns);
        } else {
            columns.push({
                title: <div className={styles['product-sku-table-title']}>
                    {skuItem?.rules?.required ? (
                        <span className={styles['product-sku-table-symbol']}>
                            <svg fill="currentColor" viewBox="0 0 1024 1024" width="1em" height="1em"><path d="M583.338667 17.066667c18.773333 0 34.133333 15.36 34.133333 34.133333v349.013333l313.344-101.888a34.133333 34.133333 0 0 1 43.008 22.016l42.154667 129.706667a34.133333 34.133333 0 0 1-21.845334 43.178667l-315.733333 102.4 208.896 287.744a34.133333 34.133333 0 0 1-7.509333 47.786666l-110.421334 80.213334a34.133333 34.133333 0 0 1-47.786666-7.509334L505.685333 706.218667 288.426667 1005.226667a34.133333 34.133333 0 0 1-47.786667 7.509333l-110.421333-80.213333a34.133333 34.133333 0 0 1-7.509334-47.786667l214.186667-295.253333L29.013333 489.813333a34.133333 34.133333 0 0 1-22.016-43.008l42.154667-129.877333a34.133333 34.133333 0 0 1 43.008-22.016l320.512 104.106667L412.672 51.2c0-18.773333 15.36-34.133333 34.133333-34.133333h136.533334z"></path></svg>
                        </span>
                    ) : undefined}
                    <span> {label}</span>
                    {tips.length > 0 ? (
                        <Popover content={getTipValues({})}
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
                    ) : undefined}
                </div>,
                editable: true,
                formProps: skuItem,
                dataIndex: dataIndex,
                align: 'center',
                width: uiType == 'input' ? 160 : 120
            });
        }
    }
    return columns;
}


function EditableRow(props: any) {
    const { children, record, className, ...rest } = props;
    const { addRowFormRef } = useContext(EditableContext);

    const refForm = useRef(null);
    const getForm = () => refForm.current;
    const providerValue: any = { getForm }
    addRowFormRef && addRowFormRef(getForm as any);
    return (
        <EditableRowContext.Provider value={providerValue}>
            <Form size='small'
                style={{ display: 'table-row' }}
                className={`${className} editable-row`}
                children={children}
                ref={refForm}
                wrapper='tr'
                wrapperProps={rest}
            />
        </EditableRowContext.Provider>
    );
}

function EditableCell(props: any) {
    const { children, record, rowData, column, onHandleSave } = props;
    const { getForm } = useContext(EditableRowContext);

    const { dataIndex, formProps, } = column;
    const { name, rules = {}, options = [] } = formProps || {};
    const { maxValue, minValue, ..._rules } = rules;

    const uiType = getDefaultUiType(formProps);
    const formItemRules = getValiRules(rules);

    const cellValueChangeHandler = (value: any) => {
        const form = getForm && getForm();
        form?.validate([column.dataIndex], (errors: any, values: any) => {
            if (!errors || !errors[column.dataIndex]) {
                onHandleSave && onHandleSave({ ...rowData, ...values });
            }
        });
    };

    const initialValue = _.get(rowData, dataIndex);
    const isPrice = name?.toLowerCase()?.includes('price');
    return (
        <Form.Item
            style={{ margin: 0 }}
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
            initialValue={initialValue}
            field={dataIndex}
            rules={formItemRules}
        >
            {uiType == 'input' ? (
                <Input
                    onPressEnter={cellValueChangeHandler}
                />
            ) : uiType == 'inputNumber' ? (
                <InputNumber min={minValue?.value}
                    precision={isPrice ? 2 : undefined}
                    step={isPrice ? 0.01 : undefined}
                    onChange={cellValueChangeHandler}
                />
            ) : uiType == 'select' ? (
                <Select options={options}
                    triggerProps={{
                        autoAlignPopupWidth: false,
                        autoAlignPopupMinWidth: true,
                        position: 'bl',
                    }}
                    onChange={cellValueChangeHandler}
                />
            ) : (
                <>{children}</>
            )}
        </Form.Item>
    );
}

type SkuEditableTableProps = MyFormItemProps & { allFormItems: MyFormItemProps[], values: any };
function SkuEditableTable(props: SkuEditableTableProps) {
    const { allFormItems = [], formItems = [], values, name, value: propValue, onChange, ...restProps } = props;
    const [data, setData] = useState<Array<any>>([]);
    const columns = getSkuTableColumns(formItems);

    function handleSave(row: any) {
        const newData = [...data];
        const index = newData.findIndex((item) => row.key === item.key);
        newData.splice(index, 1, { ...newData[index], ...row });
        setData(newData);
    }

    useEffect(() => {
        if (JSON.stringify(data) != JSON.stringify(propValue)) {
            onChange(data);
        }
    }, [JSON.stringify(data)])

    const skuPropName = 'props';
    const salePropName = 'saleProp';
    const skuSaleData = useMemo(() => {
        let _skuSaleData: any = {};
        const skuSaleProps = formItems.find(f => f.name == skuPropName)?.formItems || [];
        const salePropForms = allFormItems.find(f => f.name == salePropName)?.formItems || [];
        for (let index = 0; index < skuSaleProps.length; index++) {
            const { name } = skuSaleProps[index];
            if (name) {
                _skuSaleData[name] = [];
                var _prop = salePropForms.find(f => f.name == name);
                const { type: _type, namePath: _namePath = [] } = _prop || {};
                if (!(_type?.includes('complex'))) {
                    if (_namePath.length > 0) {
                        const _values = _.get(values, _namePath);
                        for (let _i = 0; _i < _values.length; _i++) {
                            const _value = _values[_i];
                            const _label = _prop?.options?.find(f => f.value == _value)?.label || _value;
                            _skuSaleData[name].push({ label: _label, value: _value })
                        }
                    }
                } else {
                    const dd = _prop?.formItems || [];
                    const dds = dd.find(f => f.name?.includes('sizeGroup'))?.namePath;
                    if (dds) {
                        const vvvv = _.get(values, dds);
                        if (vvvv) {
                            const svfis = dd.find(f => f.name?.includes('sizeValue'))?.formItems || [];
                            const svfi = svfis.find(f => f.name == `size-${vvvv}`)
                            const svfinp = svfi?.namePath || [];
                            if (svfinp?.length > 0) {
                                const _values = _.get(values, svfinp) || [];
                                for (let _i = 0; _i < _values.length; _i++) {
                                    const _value = _values[_i];
                                    const _label = svfi?.options?.find(f => f.value == _value)?.label || _value;
                                    _skuSaleData[name].push({ label: _label, value: _value })
                                }
                            }
                        }
                    }
                }
            }
        }
        return _skuSaleData;
    }, [JSON.stringify(values['saleProp'])])

    useEffect(() => {
        const newData: any[] = [];
        const saleObjs = smoothData(skuSaleData, v => v.value);
        saleObjs.forEach(obj => {
            const key = getUniquekey(obj);
            // const _value = propValue?.find((f: any) => (f.key || getUniquekey(f[skuPropName])) == key);
            const _value = propValue?.find((f: any) => getUniquekey(f[skuPropName]) == key);
            let dataItem: any = { key, ..._value }
            dataItem[skuPropName] = obj;
            newData.push(dataItem)
        });
        setData(newData);
    }, [JSON.stringify(skuSaleData)])

    const addRowFormRef = (getForm?: () => FormInstance) => {
        console.log('addRowFormRef');
    }


    return (
        <>
            <EditableContext.Provider value={{ addRowFormRef: addRowFormRef }} >
                <Table
                    data={data}
                    components={{
                        body: {
                            row: EditableRow,
                            cell: EditableCell,
                        },
                    }}
                    columns={columns.map((column) => {
                        const onCell = column.editable
                            ? () => ({ onHandleSave: handleSave, })
                            : undefined
                        return {
                            ...column,
                            render(value, item, index) {
                                if (value) {
                                    const lastName = column.dataIndex?.split('.')?.findLast(f => true);
                                    if (!lastName) { return value; }
                                    const skuProp: any[] = skuSaleData[lastName] || [];
                                    const label = skuProp?.find(f => f.value == value)?.label;
                                    return label || value;
                                }
                                return value;
                            },
                            onCell: onCell,
                        }
                    })}
                    size='small'
                    border={{ wrapper: true, cell: true }}
                    scroll={{ y: 320, x: true }}
                    pagination={false}
                />
            </EditableContext.Provider>
        </>
    );
}

export default SkuEditableTable;