import { FormInstance } from "@arco-design/web-react";

export type MyFormItemOption = {
    label: string;
    value: string;
    group?: {
        label?: string;
        value?: string;
    }
}
export type MyFormItemProps = {
    type?: FormItemType;
    label?: string;
    name?: string;
    namePath?: string[];
    value?: any;
    rules?: MyFormRules;
    optionAction?: string,
    optionGroupUnique?: boolean,
    options?: Array<MyFormItemOption>;
    subItems?: MyFormItemProps[];
    nestItems?: MyFormItemProps[];

    uiType?: FieldUiType;
    readOnly?: boolean;
    allowCustom?: boolean;
    valueType?: FieldValueType;

    tips?: MyFormDependRules[];
    hide?: MyFormDependRules;
    tags?: FieldTag[];

    // // [key: string]: any;
    fieldName?: string;
    defaultValue?: any;
    onChange?: any;
    noLabel?: boolean;
    noStyle?: boolean;
    allowClear?: boolean;
}
export type MyFormRules = {
    required?: boolean;
    regex?: string;
    maxValue?: number;
    minValue?: number;
    maxLength?: number;
    minLength?: number;
}
export type FormItemType = 'input' | 'multiInput' | 'singleCheck' | 'multiCheck' | 'complex' | 'multiComplex';
export type FieldUiType = 'input' | 'inputNumber' | 'inputTextArea'
    | 'radioGroup' | 'select' | 'checkBox' | 'checkBoxGroup' | 'multiSelect' | 'imageUpload'
    | 'skuEditTable' | 'richTextEditor';
export type FieldValueType = 'string' | 'object' | 'array_object' | 'bool';

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

export enum FieldTag {
    Title = "n:title",
    ProductNo = "n:art_no",
    Images = "n:images",
    Description = "n:desc",
    Weight = "n:weight",
    Price = "n:price",
    Quantity = "n:quantity",
    cateProp = "n:cate_prop",
    SaleProp = "n:sale_prop",
    Sku = "n:sku",
    SkuProps = "n:sku_prop",
    SkuStock = "n:sku_stock",
}

export interface ProductEditFormProps {
    className?: string
    platformId?: number,
    shopId?: number,
    categoryId?: string;
    formSchema: MyFormItemProps[];
    formData?: { [x: string]: any };
    form?: FormInstance<FormData, any, any>;
}