import { Button, Form, Input, Space, Trigger } from "@arco-design/web-react";
import { useState } from "react";
import useMergeValue from "@arco-design/web-react/es/_util/hooks/useMergeValue";
import SalePropCard from "../SalePropCard";
import { SalePropOption } from "../SalePropCard/interface";
import { IconDelete, IconPlus } from "@arco-design/web-react/icon";
import ImageUpload from "../../ImageUpload";
import _ from "lodash";
import { MyFormItemProps } from "../../../pages/product/edit/interface";

export interface SalePropInputProps {
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
    const { fieldKey, topValuesFieldName, topGropFieldName,
        valueFieldName, onChange, options, allowCustom } = props;
    const { form } = Form.useFormContext();
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useMergeValue<string>('', {
        defaultValue: 'defaultValue' in props ? props.defaultValue : undefined,
        value: 'value' in props ? props.value : undefined,
    });

    const fieldValue = form.getFieldValue(topValuesFieldName);
    const fieldGroup = topGropFieldName && form.getFieldValue(topGropFieldName);
    const currGroupId = fieldGroup?.value;
    const currValIds = fieldValue && fieldValue.map((m: any) => m?.value);
    const isGroup = options?.some(s => (s?.options?.length || 0) > 0);
    function popup() {
        return <SalePropCard
            group={currGroupId}
            values={currValIds}
            options={options}
            onOk={(vals?: string[], gVal?: string) => {
                const changeGroup = currGroupId !== gVal;
                const newFieldValue = changeGroup ? [] : [...(fieldValue || [])];
                const newAddValIds = vals?.filter(f => !newFieldValue.some(s => `${f}` == `${s?.value}`));

                const newGroup: SalePropOption | undefined = isGroup ? options?.find(f => f.value == gVal) : undefined;
                const { options: newGroupOptions, ...newGroupRest } = newGroup || {};
                const opts: SalePropOption[] = (isGroup ? newGroupOptions : options) || [];
                if (newAddValIds && newAddValIds.length > 0) {
                    for (let index = 0; index < newAddValIds.length; index++) {
                        const v = newAddValIds[index];
                        const text = opts?.find((f: any) => f.value == v)?.label;

                        const currFieldValue = newFieldValue[fieldKey] || {};
                        if (index == 0 && !currFieldValue.text) {
                            newFieldValue[fieldKey] = { ...currFieldValue, value: v, text: text }
                        } else {
                            newFieldValue.push({ value: v, text: text });
                        }
                    }
                    form.setFieldValue(topValuesFieldName, newFieldValue);
                }
                if (changeGroup && topGropFieldName) {
                    form.setFieldValue(topGropFieldName, newGroupRest);
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
    function childrenDom() {
        return <Input allowClear
            placeholder="请选择输入"
            style={{ width: '200px' }}
            value={value}
            readOnly={!allowCustom}
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
                if (!value) {
                    setVisible(visible);
                }
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
    options: SalePropOption[],
    nestItems?: MyFormItemProps[]
}
function SalePropInputFormItem(props: SalePropInputFormItemProps) {
    const { fieldKey, fieldName, nestItems, options, topValuesFieldName, topGropFieldName } = props;
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
    const { label, nestItems, namePath, name, options } = props;
    const fieldName = namePath?.join('.') || name;
    const isGroup = options?.some(s => (s?.options?.length || 0) > 0);
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
                        {fields.map(({ key, field }, index) => {
                            return (
                                <Space key={key} wrap size={4}>
                                    <SalePropInputFormItem
                                        fieldKey={key}
                                        fieldName={field}
                                        topValuesFieldName={valueFieldName}
                                        topGropFieldName={groupFieldName}
                                        nestItems={nestItems}
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