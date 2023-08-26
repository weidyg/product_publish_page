export type MyFormNumRules = {
    value?: any,
    include?: boolean
}

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


export type MyFormRules = {
    required?: boolean;
    readOnly?: boolean;
    allowCustom?: boolean;
    valueType?: string;
    regex?: string;
    maxLength?: MyFormNumRules;
    maxValue?: MyFormNumRules;
    minValue?: MyFormNumRules;

    tips?: MyFormDependRules[];
    disable?: MyFormDependRules;
}
export type MyFormItemProps = {
    label?: string;
    name?: string;
    namePath?: string[];
    type?: FormItemType;
    rules?: MyFormRules;
    options?: {
        label: string;
        value: string;
    }[];
    formItems?: MyFormItemProps[];
    isCateProp?: boolean;
    uiType?: FieldUiType;

    // [key: string]: any;
    value?: any;
    defaultValue?: any;
    onChange?: any;
    noLabel?: boolean;
    noStyle?: boolean;
}

export type FieldUiType = 'input' | 'inputNumber' | 'radio' | 'select' | 'checkBox' | 'multiSelect' | 'imageUpload';
export type FormItemType = 'input' | 'multiInput' | 'singleCheck' | 'multiCheck' | 'complex' | 'multiComplex';