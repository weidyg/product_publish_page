import { Button, Form, Input, Space, Trigger } from "@arco-design/web-react";
import { useEffect, useState } from "react";
import useMergeValue from "@arco-design/web-react/es/_util/hooks/useMergeValue";
import SalePropCard from "../SalePropCard";
import { SalePropOption } from "../SalePropCard/interface";
import { IconDelete, IconInfoCircle, IconPlus } from "@arco-design/web-react/icon";
import ImageUpload from "../../ImageUpload";
import _ from "lodash";
import { MyFormItemProps } from "../../../pages/product/edit/interface";

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
        onChange, options, isGroup, allowCustom } = props;
    const { form } = Form.useFormContext();
    const [visible, setVisible] = useState(false);
    const [isSelVal, setIsSelVal] = useState(false);
    const [value, setValue] = useMergeValue<string>('', {
        defaultValue: 'defaultValue' in props ? props.defaultValue : undefined,
        value: 'value' in props ? props.value : undefined,
    });
    function popup() {
        const fieldGroup = topGropFieldName && form.getFieldValue(topGropFieldName);
        const currGroupId = fieldGroup?.value;
        const fieldValue = form.getFieldValue(topValuesFieldName);
        const currValIds = fieldValue && fieldValue.map((m: any) => m?.value);
        return <SalePropCard
            group={currGroupId}
            values={currValIds}
            isGroup={isGroup}
            options={options}
            onOk={(vals?: string[], gVal?: string) => {
                const changeGroup = currGroupId !== gVal;
                const newFieldValue = changeGroup ? [] : [...(fieldValue || [])];
                const newAddValIds = vals?.filter(f => !newFieldValue.some(s => `${f}` == `${s?.value}`));
                const newGroup = options.find(f => f.group?.value == gVal)?.group;
                const opts: SalePropOption[] = (isGroup ? options.filter(f => f.group?.value == gVal) : options) || [];
                if (newAddValIds && newAddValIds.length > 0) {
                    for (let index = 0; index < newAddValIds.length; index++) {
                        const v = newAddValIds[index];
                        const text = opts?.find((f: any) => f.value == v)?.label;
                        const currFieldValue = newFieldValue[fieldKey] || {};
                        if (index == 0  /**  && !currFieldValue.text */) {
                            newFieldValue[fieldKey] = { ...currFieldValue, value: v, text: text }
                        } else {
                            newFieldValue.push({ value: v, text: text });
                        }
                    }
                    form.setFieldValue(topValuesFieldName, newFieldValue);
                }
                if (changeGroup && topGropFieldName) {
                    form.setFieldValue(topGropFieldName, newGroup);
                }
                setVisible(false);
            }}
            onCancel={() => {
                setVisible(false);
            }}
        />
    }

    const handleChange = (newValue: any) => {
        if (!('value' in props)) { setValue(value); }
        onChange && onChange(newValue);
        valueFieldName && form.setFieldValue(valueFieldName, undefined);
    };

    useEffect(() => {
        var id = valueFieldName && form.getFieldValue(valueFieldName);
        setIsSelVal(id && id !== value);
    }, [value])

    function StandardIcon() {
        return <img style={{ width: '14px', }}
            src="data:image/png;base64,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" />
    }

    function childrenDom() {
        return <Input allowClear
            placeholder={"请选择输入"}
            style={{ width: '200px' }}
            suffix={isSelVal ? <StandardIcon /> : ''}
            value={value}
            readOnly={allowCustom == false}
            onChange={(val) => {
                handleChange(val);
                if (!val && !visible) { setVisible(true); }
                if (val && visible) { setVisible(false); }
            }}
        />
    }
    return options.length > 0
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
                // if (!value) {
                setVisible(visible);
                // }
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
    nestItems?: MyFormItemProps[]
}
function SalePropInputFormItem(props: SalePropInputFormItemProps) {
    const { fieldKey, fieldName, nestItems, options, topValuesFieldName, topGropFieldName, isGroup } = props;
    const imgForm = nestItems?.find(f => f.name == 'img');
    const remarkForm = nestItems?.find(f => f.name == 'remark');

    return (<Space>
        {imgForm &&
            <Form.Item
                field={`${fieldName}.${imgForm.name}`}
            >
                <ImageUpload size='mini' />
            </Form.Item>
        }

        <Space size={1}>
            <Form.Item
                field={`${fieldName}.text`}
                rules={[{ required: true }]}
            >
                <SalePropInput
                    isGroup={isGroup}
                    options={options as any}
                    fieldKey={fieldKey}
                    textFieldName={`${fieldName}.text`}
                    valueFieldName={`${fieldName}.value`}
                    topGropFieldName={topGropFieldName}
                    topValuesFieldName={topValuesFieldName!}
                />
            </Form.Item>
            <Form.Item hidden
                field={`${fieldName}.value`}>
                <Input />
            </Form.Item>

            {remarkForm &&
                <Form.Item
                    field={`${fieldName}.${remarkForm.name}`}
                >
                    <Input allowClear
                        placeholder={remarkForm.label}
                        style={{ width: '118px' }}
                    />
                </Form.Item>
            }
        </Space>
    </Space>
    )
}

function SalePropFormItem(props: MyFormItemProps) {
    const { label, nestItems, namePath, name, options
        , optionGroupUnique: isGroup } = props;
    const fieldName = namePath?.join('.') || name;
    const groupFieldName = isGroup ? `${fieldName}.group` : undefined;
    const valueFieldName = isGroup ? `${fieldName}.value` : fieldName;
    return (
        <Form.Item label={label} field={fieldName}>
            {groupFieldName &&
                <Form.Item field={groupFieldName} hidden>
                    <Input />
                </Form.Item >
            }
            <Form.List field={valueFieldName!}>
                {(fields, { add, remove, move }) => {
                    if (fields.length == 0) {
                        fields.push({ key: 0, field: `${fieldName}[${0}]` });
                    }
                    return (<Space wrap>
                        {fields.map(({ field }, index) => {
                            return (
                                <Space key={index} wrap size={4}>
                                    <SalePropInputFormItem
                                        fieldKey={index}
                                        fieldName={field}
                                        topValuesFieldName={valueFieldName}
                                        topGropFieldName={groupFieldName}
                                        nestItems={nestItems}
                                        isGroup={isGroup}
                                        options={options as any}
                                    />
                                    <Form.Item >
                                        <Button type='text'
                                            icon={<IconDelete />}
                                            onClick={() => { remove(index); }}>
                                        </Button>
                                    </Form.Item>
                                </Space>
                            );
                        })}
                        <Form.Item shouldUpdate>
                            {(values) => {
                                const salePropValues: any[] = _.get(values, valueFieldName!) || [];
                                const disabledAdd = !(salePropValues && salePropValues.every(e => e?.text));
                                return <Button
                                    type='text'
                                    icon={<IconPlus />}
                                    disabled={disabledAdd}
                                    onClick={() => { add(); }}
                                >
                                    新增
                                </Button>
                            }}
                        </Form.Item>
                    </Space>);
                }}
            </Form.List>
        </Form.Item>
    );
    return <></>
}

export default SalePropFormItem