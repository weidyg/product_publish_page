export type MyFormItemProps = {
    type?: FormItemType;
    label?: string;
    name?: string;
    namePath?: string[];
    value?: any;
    rules?: MyFormRules;
    options?: { label: string; value: string; }[];
    subItems?: MyFormItemProps[];
    nestItems?: MyFormItemProps[];

    uiType?: FieldUiType;
    readOnly?: boolean;
    allowCustom?: boolean;

    tips?: MyFormDependRules[];
    hide?: MyFormDependRules;

    // // [key: string]: any;
    fieldName?: string;
    defaultValue?: any;
    onChange?: any;
    noLabel?: boolean;
    noStyle?: boolean;
}
export type MyFormRules = {
    valueType?: string;
    required?: boolean;
    regex?: string;
    maxValue?: number;
    minValue?: number;
    maxLength?: number;
    minLength?: number;
}
export type FormItemType = 'input' | 'multiInput' | 'singleCheck' | 'multiCheck' | 'complex' | 'multiComplex';
export type FieldUiType = 'input' | 'inputNumber' | 'radio' | 'select' | 'checkBox' | 'multiSelect' | 'imageUpload'
    | 'skuEditTable';

export type MyFormDependRules = {
    value?: any,
    dependGroup?: MyFormDependGroup
}
export type MyFormDependGroup = {
    operator?: 'and' | 'or',
    expresses?: MyFormDependExpress[],
    groups?: MyFormDependGroup[],
}
export type MyFormDependExpress = {
    namePath: string[];
    fieldName: string,
    fieldValue: string,
    symbol?: '==' | '!='
}


