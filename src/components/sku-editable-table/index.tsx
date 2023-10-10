import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Table, Input, Select, Form, InputNumber, TableColumnProps, Popover, Button, Space, Divider, Typography, Checkbox, Tag } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { isObject } from '@arco-design/web-react/es/_util/is';
import * as _ from "lodash"
import styles from './index.module.less'
import { FieldNames, getSkuItems, getSkuSaleProp, getTips, getUiTypeOrDefault, getValiRules, isNumberOrStrNumber } from '../until';
import { FieldUiType, MyFormItemProps } from '../../pages/product/edit/interface';
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';

const EditableRowContext = React.createContext<{ index?: number }>({});

type SkuColumnProps = TableColumnProps & { formProps: MyFormItemProps, rootField?: string, uiType?: FieldUiType };
const getSkuTableColumns = (formItems: MyFormItemProps[], rootField?: string, pName?: string, isSkuProps?: boolean): SkuColumnProps[] => {
    let columns: SkuColumnProps[] = [];
    for (let index = 0; index < formItems.length; index++) {
        const skuItem = formItems[index];
        const { label, name, type, tips = [] } = skuItem;
        let dataIndex = pName ? `${pName}.${name}` : name;
        const [_, getTipValues] = getTips(tips);
        const tipValues = getTipValues(null) || [];
        const extra = tipValues.map((value: any, index: any) => <div key={index} dangerouslySetInnerHTML={{ __html: value }} />);
        const uiType = !isSkuProps ? getUiTypeOrDefault(skuItem) : undefined;
        if (type?.includes('complex')) {
            const skuProps = FieldNames.skuProps(skuItem);
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
                editable: true,
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


function EditableRow(props: any) {
    const { index, children, record, className, ...rest } = props;
    const providerValue: any = { index }
    return (
        <EditableRowContext.Provider value={providerValue}>
            <tr {...rest} >
                {children}
            </tr>
        </EditableRowContext.Provider>
    );
}
function EditableCell(props: any) {
    const { children, rowData, column } = props;
    const { rootField, dataIndex, formProps, uiType } = column;
    const { name, rules = {}, options = [], value } = formProps || {};
    const isPrice = name?.toLowerCase()?.includes('price');
    const formItemRules = getValiRules(rules, isPrice);
    const { index } = useContext(EditableRowContext);
    const field = `${rootField}[${index}]${dataIndex}`;
    const initialValue = _.get(rowData, dataIndex) || value;
    return (<>
        <Form.Item noStyle
            style={{ margin: 0 }}
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
            initialValue={initialValue}
            field={field}
            rules={formItemRules}
        >
            {uiType == 'input' ? (
                <Input placeholder={'请输入'} />
            ) : uiType == 'inputNumber' ? (
                <InputNumber
                    placeholder={'请输入'}
                    max={isNumberOrStrNumber(rules?.maxValue) ? rules.maxValue : undefined}
                    min={isNumberOrStrNumber(rules?.minValue) ? rules.minValue : isPrice ? 0.01 : 1}
                    precision={isPrice ? 2 : undefined}
                    step={isPrice ? 0.01 : undefined}
                />
            ) : uiType == 'select' ? (
                <Select
                    placeholder={'请选择'}
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

function SkuEditableTable(props: MyFormItemProps & { salePropValues: any }) {
    const { subItems = [], salePropValues = [], name, namePath, } = props;

    const [value, setValue] = useMergeValue<any[]>([], {
        defaultValue: 'defaultValue' in props ? props.defaultValue : undefined,
        value: 'value' in props ? props.value : undefined,
    });

    const [skuSalePropValue, SetSkuSalePropValue] = useState<any>({});
    const [skuBatchFillValue, SetSkuBatchFillValue] = useState<any>({});
    useEffect(() => {
        const skuSaleProp = subItems.find((f: any) => FieldNames.skuProps(f));
        const skuSalePropName = skuSaleProp?.name!;
        const salePropNames = skuSaleProp?.subItems?.map(m => m.name!) || [];
        const skuSalePropValue = getSkuSaleProp(salePropNames, salePropValues);
        const newData = getSkuItems(skuSalePropValue, skuSalePropName, value);
        if (JSON.stringify(value) != JSON.stringify(newData)) {
            if (!('value' in props)) { setValue(newData); }
            if (props.onChange) { props.onChange(newData); }
        }
        SetSkuSalePropValue(skuSalePropValue);
    }, [JSON.stringify(salePropValues)]);

    const columns = useMemo(() => {
        const rootField = namePath?.join('.') || name;
        const _columns = getSkuTableColumns(subItems, rootField);
        return _columns.map((column) => {
            return {
                ...column,
                render(value: any, _item: any, _index: any) {
                    if (value) {
                        if (isObject(value)) {
                            const { text, remark } = value;
                            return remark ? `${text}(${remark})` : text;
                        }
                        return value;
                    }
                    return value;
                },
            }
        })
    }, []);

    const data = value.filter(f => f.key);
    return (<>
        {JSON.stringify(skuBatchFillValue)}
        <Space style={{ marginBottom: '8px' }}>
            {subItems.map((m, i) => {
                const isSkuProps = FieldNames.skuProps(m);
                if (isSkuProps) {
                    console.log('skuProps', m);
                    return <Select
                        placeholder={'查看已选规则'}
                        triggerProps={{
                            autoAlignPopupWidth: false,
                            autoAlignPopupMinWidth: true,
                            position: 'bl',
                        }}
                    >
                        <div style={{ padding: '8px' }}>
                            {m?.subItems?.map((pm, pi) => {
                                const sspvs = (pm.name && skuSalePropValue[pm.name]) || [];
                                return <div key={pi}>
                                    <div style={{ margin: '8px 4px' }}>{pm.label}</div>
                                    {sspvs.map((sm: any, si: number) => {
                                        return (
                                            <Checkbox key={si} value={sm.value}>
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
                                </div>
                            })}
                        </div>
                    </Select>
                }
                const uiType = getUiTypeOrDefault(m)
                return <div key={i}>
                    {uiType == 'input' ? (
                        <Input allowClear
                            placeholder={m.label}
                            style={{ width: '120px' }}
                            onChange={value => {
                                if (m.name) {
                                    SetSkuBatchFillValue({
                                        ...skuBatchFillValue,
                                        [m.name]: value
                                    });
                                }
                            }} />
                    ) : uiType == 'inputNumber' ? (
                        <InputNumber placeholder={m.label}
                            style={{ width: '120px' }}
                            onChange={value => {
                                if (m.name) {
                                    SetSkuBatchFillValue({
                                        ...skuBatchFillValue,
                                        [m.name]: value
                                    });
                                }
                            }} />
                    ) : uiType == 'select' ? (
                        <Select allowClear
                            placeholder={m.label}
                            options={m.options}
                            triggerProps={{
                                autoAlignPopupWidth: false,
                                autoAlignPopupMinWidth: true,
                                position: 'bl',
                            }}
                            style={{ width: '120px' }}
                            onChange={value => {
                                if (m.name) {
                                    SetSkuBatchFillValue({
                                        ...skuBatchFillValue,
                                        [m.name]: value
                                    });
                                }
                            }}
                        />
                    ) : (
                        <>_</>
                    )}
                </div>
            })}
            <Button type='primary'>批量填充</Button>
        </Space>
        <Table
            data={data}
            components={{
                body: {
                    row: EditableRow,
                    cell: EditableCell,
                },
            }}
            columns={columns}
            size='small'
            scroll={{ y: 320, x: true }}
            pagination={false}
        />
    </>);
}

export default SkuEditableTable;