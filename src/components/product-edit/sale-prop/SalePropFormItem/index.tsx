import { Button, Form, FormItemProps, Input, Message, Space, Tag, Trigger } from "@arco-design/web-react";
import { useContext, useEffect, useRef, useState } from "react";
import useMergeValue from "@arco-design/web-react/es/_util/hooks/useMergeValue";
import SalePropCard from "../SalePropCard";
import { SalePropOption } from "../SalePropCard/interface";
import { IconDelete, IconPlus } from "@arco-design/web-react/icon";
import { get, throttle } from "lodash";
import { RefInputType } from "@arco-design/web-react/es/Input";
import { MyFormItemProps } from "../../interface";
import ImageUpload from "../../../ImageUpload";
import { sizeCompare } from "../../until";
import { ProductEditContext } from "../..";

export interface SalePropInputProps {
    isGroup?: boolean,
    options: SalePropOption[],
    fieldKey: number,
    valueFieldName?: string,
    textFieldName?: string,
    topValuesFieldName: string,
    topGropFieldName?: string,
    defaultValue?: string,
    value?: string,
    onChange?: (value: string) => void,
    allowCustom?: boolean;
}


function SalePropInput(props: SalePropInputProps) {
    const { fieldKey, topValuesFieldName, topGropFieldName, valueFieldName,
        onChange, options: allOptions, isGroup, allowCustom } = props;
    const { form } = Form.useFormContext();
    const [visible, setVisible] = useState(false);
    const [isSelVal, setIsSelVal] = useState(false);
    const [value, setValue] = useMergeValue<string>('', {
        defaultValue: 'defaultValue' in props ? props.defaultValue : undefined,
        value: 'value' in props ? props.value : undefined,
    });

    const group = topGropFieldName && form.getFieldValue(topGropFieldName);
    const fieldValue: any[] = form.getFieldValue(topValuesFieldName);
    const currVals = fieldValue && fieldValue.filter(f => f && f?.text != f?.value) || [];
    const currValIds = currVals.filter(f => f?.text != value).map((m: any) => m?.value);

    function popup() {
        return <SalePropCard
            group={group?.value}
            values={currValIds}
            isGroup={isGroup}
            options={allOptions}
            onOk={(vals?: string[], gVal?: string) => {
                const changeGroup = group?.value !== gVal;
                const newGroup = allOptions.find(f => f.group?.value == gVal)?.group;
                if (topGropFieldName && newGroup) { form.setFieldValue(topGropFieldName, newGroup); }

                const options = (isGroup ? allOptions.filter(f => f.group?.value == newGroup?.value) : allOptions) || [];
                const newFieldValue = changeGroup ? [] : [...(fieldValue || [])];
                const newAddValIds = vals?.filter(f => !newFieldValue.some(s => `${f}` == `${s?.value}`));
                if (newAddValIds && newAddValIds.length > 0) {
                    for (let index = 0; index < newAddValIds.length; index++) {
                        const v = newAddValIds[index];
                        const text = options?.find((f: any) => f.value == v)?.label;
                        const currFieldValue = newFieldValue[fieldKey] || {};
                        if (index == 0  /**  && !currFieldValue.text */) {
                            newFieldValue[fieldKey] = { ...currFieldValue, value: v, text: text }
                        } else {
                            newFieldValue.push({ value: v, text: text });
                        }
                    }
                }

                const tempFieldValue: any[] = [];
                newFieldValue.forEach((f) => {
                    if (f && !tempFieldValue.some((fi) => fi.text == f.text)) {
                        tempFieldValue.push(f);
                    }
                });
                if (JSON.stringify(fieldValue) != JSON.stringify(tempFieldValue)) {
                    form.setFieldValue(topValuesFieldName, tempFieldValue);
                }
                setVisible(false);
                updataIcon();
            }}
            onCancel={() => {
                setVisible(false);
            }}
        />
    }

    const handleChange = (newValue: any) => {
        let option;
        const old = fieldValue?.find((f: any) => sizeCompare(f?.text, newValue));
        if (old == null) {
            const options = (isGroup ? allOptions.filter(f => f.group?.value == group?.value) : allOptions) || [];
            option = options.find(f => sizeCompare(f?.label, newValue)) || { label: newValue, value: newValue };
        }
        else if (old?.text) {
            Message.error(`已经存在值 “${old?.text}”，不允许重复设置！`);
        }
        if (!('value' in props)) { setValue(option?.label); }
        onChange && onChange(option?.label);
        valueFieldName && form.setFieldValue(valueFieldName, option?.value);
    };

    useEffect(() => { updataIcon() }, []);
    const updataIcon = throttle(function () {
        const id = valueFieldName && form.getFieldValue(valueFieldName);
        const newIsSelVal = id && id !== value;
        if (isSelVal != newIsSelVal) { setIsSelVal(id && id !== value); }
    }, 100, { leading: false, trailing: true })

    function StandardIcon() {
        return <img style={{ width: '14px', }} src="data:image/png;base64,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" />
    }

    const defaultPlaceholder = `请选择${allowCustom ? '或输入' : ''}`;
    const placeholder = visible ? value || defaultPlaceholder : defaultPlaceholder;
    const inputRef = useRef<RefInputType>(null);
    function childrenDom() {
        return <Input allowClear
            ref={inputRef}
            style={{ width: '180px' }}
            placeholder={placeholder}
            readOnly={!allowCustom}
            suffix={isSelVal ? <StandardIcon /> : ''}
            onBlur={() => { updataIcon(); }}
            value={visible ? undefined : value}
            onChange={(val) => {
                handleChange(val);
                if (!val && !visible) { setVisible(true); }
                if (val && visible) { setVisible(false); }
            }}
        />
    }

    return allOptions.length > 0
        ? <Trigger
            popup={popup}
            trigger='focus'
            position='bl'
            classNames='zoomInTop'
            popupAlign={{ bottom: 8, }}
            blurToHide={false}
            autoFitPosition={false}
            popupVisible={visible}
            clickOutsideToClose={true}
            onVisibleChange={(visible) => {
                // if (visible && value) {
                //     setPlaceholder(value);
                // } else {
                //     setPlaceholder(defaultPlaceholder);
                // }
                setVisible(visible);
            }}
        >
            {childrenDom()}
        </Trigger >
        : childrenDom()
}

export interface SalePropInputFormItemProps {
    fieldKey: number,
    fieldName: string,
    topValuesFieldName?: string,
    topGropFieldName?: string,
    isGroup?: boolean,
    options: SalePropOption[],
    nestItems?: MyFormItemProps[],
    allowCustom?: boolean
}
type UIFormItemProps = Omit<FormItemProps, 'rules'>;
function SalePropInputFormItem(props: SalePropInputFormItemProps & UIFormItemProps) {
    const { allowCustom, nestItems, options,
        fieldKey, fieldName, topValuesFieldName, topGropFieldName, isGroup,
        ...formItemProps
    } = props;
    const imgForm = nestItems?.find(f => f.name == 'img');
    const remarkForm = nestItems?.find(f => f.name == 'remark');

    const { form } = Form.useFormContext();
    const fieldValue = form.getFieldValue(topValuesFieldName!);
    return (<Space>
        {imgForm &&
            <Form.Item {...formItemProps}
                field={`${fieldName}.${imgForm.name}`}
            >
                <ImageUpload size='mini' />
            </Form.Item>
        }

        <Space size={1}>
            <Form.Item {...formItemProps}
                field={`${fieldName}.text`}
                rules={[
                    { required: true, },
                    {
                        validator(value, cb) {
                            const length = fieldValue?.filter((f: any) => sizeCompare(f?.text, value))?.length;
                            if (length > 1) { return cb(`内容“${value}”不能重复，请检查`); }
                            return cb();
                        },
                    },
                ]}
            >
                <SalePropInput
                    isGroup={isGroup}
                    options={options as any}
                    fieldKey={fieldKey}
                    textFieldName={`${fieldName}.text`}
                    valueFieldName={`${fieldName}.value`}
                    topGropFieldName={topGropFieldName}
                    topValuesFieldName={topValuesFieldName!}
                    allowCustom={allowCustom}
                />
            </Form.Item>
            <Form.Item hidden  {...formItemProps}
                field={`${fieldName}.value`}>
                <Input />
            </Form.Item>

            {remarkForm &&
                <Form.Item  {...formItemProps}
                    field={`${fieldName}.${remarkForm.name}`}
                >
                    <Input allowClear
                        placeholder={remarkForm.label}
                        style={{ width: '98px' }}
                    />
                </Form.Item>
            }
        </Space>
    </Space>
    )
}


function SalePropFormItem(props: MyFormItemProps) {
    const { label, nestItems, namePath, name, options, allowCustom
        , optionGroupUnique: isGroup, value = [] } = props;
    const fieldName = namePath?.join('.') || name;
    const groupFieldName = isGroup ? `${fieldName}.group` : undefined;
    const valueFieldName = isGroup ? `${fieldName}.value` : fieldName;
    const { form } = Form.useFormContext();

    const { originalSaleProps = [] } = useContext(ProductEditContext);

    const originalSaleProp = originalSaleProps?.find(f => f?.name == label)
        || originalSaleProps?.find(f => f?.name?.replace('大小', '') == label?.replace('大小', ''))
        || originalSaleProps?.find(f => f?.name?.replace('分类', '') == label?.replace('分类', ''))
        ;
    const originalValues = originalSaleProp?.values || [];
    const fieldValue: any[] = valueFieldName && form.getFieldValue(valueFieldName);
    const fieldValueText: any[] = fieldValue?.map((m: any) => m?.text) || [];
    const notMateVals = originalValues.filter(m => !fieldValueText.some(s => sizeCompare(m, s)));
    
    const _label = <>
        <span>{label}</span>
        {notMateVals?.length > 0 && <>
            <span style={{
                fontSize: '12px',
                marginLeft: '8px',
                color: 'var(--color-text-3)',
            }}>未选：</span>
            <Space wrap>
                {notMateVals.map((m, i) => {
                    return <Tag key={i} color='red' size='small'>{m}</Tag>
                })}
            </Space>
        </>
        }
    </>
    return (
        <Form.Item layout='vertical' label={_label} field={fieldName} style={{ marginBottom: '0px' }}>
            {groupFieldName &&
                <Form.Item field={groupFieldName} hidden>
                    <Input />
                </Form.Item >
            }
            <Form.List field={valueFieldName!}>
                {(fields, { add, remove, move }) => {
                    if (fields.length == 0) { fields.push({ key: 0, field: `${fieldName}[${0}]` }); }
                    return (
                        <Space wrap>
                            {fields.map(({ field }, index) => {
                                return (
                                    <Space key={index} wrap size={[4, 0]} style={{ marginBottom: "0px" }}>
                                        <SalePropInputFormItem
                                            fieldKey={index}
                                            fieldName={field}
                                            topValuesFieldName={valueFieldName}
                                            topGropFieldName={groupFieldName}
                                            nestItems={nestItems}
                                            isGroup={isGroup}
                                            options={options as any}
                                            allowCustom={allowCustom}
                                        />
                                        <Form.Item>
                                            <Button type='text' status='danger'
                                                shape='circle'
                                                icon={<IconDelete />}
                                                onClick={() => {
                                                    form?.clearFields(field);
                                                    remove(index);
                                                }}>
                                            </Button>
                                        </Form.Item>
                                    </Space>
                                    // </Card>
                                );
                            })}
                            <Form.Item shouldUpdate={
                                (prevValues: Partial<FormData>, currentValues: Partial<FormData>, info: { isFormList?: boolean; field?: any; isInner?: boolean; }) => {
                                    return info?.field == valueFieldName;
                                }
                            }>
                                {(values) => {
                                    const salePropValues: any[] = get(values, valueFieldName!) || [];
                                    const disabledAdd = !salePropValues.every(e => e?.text)
                                        || (fields.length == 1 && salePropValues.length == 0);
                                    return <Button
                                        type='text'
                                        icon={<IconPlus />}
                                        disabled={disabledAdd}
                                        onClick={() => { add(); }}
                                        style={{ padding: '2px' }}
                                    >
                                        新增
                                    </Button>
                                }}
                            </Form.Item>
                        </Space>
                    );
                }}
            </Form.List>
        </Form.Item>
    );
}

export default SalePropFormItem