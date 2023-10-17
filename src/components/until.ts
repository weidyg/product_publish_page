import _ from "lodash";
import { isArray, isNumber, isString } from "@arco-design/web-react/es/_util/is";
import { FieldTag, FieldUiType, MyFormDependGroup, MyFormDependRules, MyFormItemProps, MyFormRules } from "../pages/product/edit/interface";
import { ReactNode } from "react";

export function isNumberOrStrNumber(obj: any) {
    return isNumber(obj) || !isNaN(Number(obj))
}
export function calcDescartes(obj: ObjVal, getValue?: (val: any) => any) {
    let newObjs: any[] = [];
    const keys = Object.keys(obj);
    for (let index = keys.length - 1; index >= 0; index--) {
        let tempObjs: any[] = [];
        const key = keys[index];
        const vals = obj[key] || [];
        vals.forEach((val: any) => {
            const value = getValue ? getValue(val) : val;
            if (index == keys.length - 1) {
                const newObj = { [key]: value }
                tempObjs.push(newObj);
            } else {
                newObjs.forEach((obj: any) => {
                    const newObj = { [key]: value, ...obj }
                    tempObjs.push(newObj);
                });
            }
        });
        newObjs = [...tempObjs];
    }
    return newObjs;
}


export function sortObj(obj: ObjVal): any {
    if (!obj) { return obj; }
    let newObj: { [key: string]: any } = {};
    let keysSorted = Object.keys(obj).sort();
    for (let i = 0; i < keysSorted.length; i++) {
        newObj[keysSorted[i]] = obj[keysSorted[i]];
    }
    return newObj;
}
export function getUniquekey(obj: ObjVal, getValue?: (val: any) => any): string {
    const newObj = sortObj(obj) || {};
    // console.log('sortObj', obj, newObj);
    const keys = Object.keys(newObj);
    let deepValues = [];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = getValue ? getValue(obj[key]) : obj[key];
        if (typeof value == 'object') {
            const uniquekey = getUniquekey(value);
            deepValues.push(uniquekey);
        } else if (Array.isArray(value)) {
            for (let index = 0; index < value.length; index++) {
                const _obj = value[index];
                const uniquekey = getUniquekey(_obj);
                deepValues.push(uniquekey);
            }
        }
        else {
            deepValues.push(`${key}_${value}`);
        }
    }
    return deepValues.join('|');
}
export type ObjVal = { [key: string]: any }
export type SkuItem = { key?: string; props?: { [x: string]: any };[x: string]: any; }

export function getSkuSaleProp(salePropNames: string[], saleProp: { [x: string]: any; }): any {
    let next = true;
    let obj: any = {};
    salePropNames.forEach(key => {
        if (!next) { return; }
        const salePropItem = saleProp[key];
        if (isArray(salePropItem)) {
            obj[key] = [...salePropItem];
        } else if (isArray(salePropItem?.value)) {
            obj[key] = [...salePropItem?.value];
        }
        obj[key] = obj[key]?.filter((f: any) => !!(f?.text));
        next = obj[key]?.length > 0;
        if (!next) { obj = {}; }
    });
    return obj;
}

export function getSkuItems(skuSaleProp: ObjVal, skuSalePropName: string, skuItems?: SkuItem[]): SkuItem[] {
    const newData: any[] = [];
    const saleObjs = calcDescartes(skuSaleProp);
    const tempSkuItems = skuItems?.map(obj => {
        const tempObj = { ...obj };
        tempObj.key = tempObj.key || getUniquekey(tempObj[skuSalePropName], v => v?.value || v?.text);
        return tempObj;
    });
    saleObjs.forEach(obj => {
        const key = getUniquekey(obj, v => v?.value || v?.text);
        const skuItem = tempSkuItems?.find(f => f.key == key) || {};
        const dataItem: any = { ...skuItem, key, [skuSalePropName]: obj };
        newData.push(dataItem)
    });
    return newData;
}


export const FieldNames = {
    desc: (tags?: FieldTag[]) => tags?.includes(FieldTag.Description),
    cateProp: (tags?: FieldTag[]) => tags?.includes(FieldTag.cateProp),
    saleProp: (tags?: FieldTag[]) => tags?.includes(FieldTag.SaleProp),
    sku: (tags?: FieldTag[]) => tags?.includes(FieldTag.Sku),
    skuProps: (tags?: FieldTag[]) => tags?.includes(FieldTag.SkuProps),
    skuStock: (tags?: FieldTag[]) => tags?.includes(FieldTag.SkuStock),
    quantity: (tags?: FieldTag[]) => tags?.includes(FieldTag.Quantity),
};
export function checkDependGroup(dependGroup: MyFormDependGroup, values: any): boolean | undefined {
    const getDeepValue = (values: any, fieldName: string, namePath: string[]) => {
        let value = values[fieldName];
        if (!value && namePath?.length > 0) {
            value = _.get(values, namePath);
        }
        return value
    }

    const operator = dependGroup?.operator;
    const expresses = dependGroup?.expresses || [];
    const groups = dependGroup?.groups || [];
    const expressLength = expresses?.length || 0;
    const groupLength = groups?.length || 0;
    if (!operator || (expressLength == 0 && groupLength == 0)) { return undefined }
    values = values || {};
    let _isMatcheds: (boolean | undefined)[] = [];
    // let log = "";
    for (let i = 0; i < expressLength; i++) {
        const exp = expresses[i];
        const _val = getDeepValue(values, exp.fieldName, exp.namePath);
        if (exp.symbol == '!=') {
            _isMatcheds.push(_val != exp.fieldValue);
        } else if (exp.symbol == '==') {
            _isMatcheds.push(_val == exp.fieldValue);
        }
        // log += `\n ${exp.fieldName}:${exp.fieldValue} ${exp.symbol} ${_val} `;
    }

    for (let j = 0; j < expressLength; j++) {
        const group = groups[j];
        const checkGroup = checkDependGroup(group, values);
        _isMatcheds.push(checkGroup);
    }

    let isMatched: boolean | undefined = undefined;
    _isMatcheds = _isMatcheds.filter(f => f != undefined);
    if (_isMatcheds.length > 0) {
        if (operator == 'and') {
            isMatched = _isMatcheds.every(e => e === true);
        } else if (operator == 'or') {
            isMatched = _isMatcheds.some(e => e === true);
        }
    }
    // console.log("eee", log, isMatched, operator, _isMatcheds);
    return isMatched;
}

export function checkDependRules(dependRules: MyFormDependRules): [
    (prev: any, next: any, info: any) => boolean,
    (values: any) => any
] {
    const dependGroup = dependRules?.dependGroup;
    const operator = dependGroup?.operator;
    const expressLength = dependGroup?.expresses?.length || 0;
    const groupLength = dependGroup?.groups?.length || 0;

    const needMatch = !!operator && (expressLength > 0 || groupLength > 0);
    const shouldUpdate = (prev: any, next: any, info: any) => {
        return needMatch;
    }
    const getValue = (values: any) => {
        if (!needMatch || values == null) { return dependRules?.value; }
        let isMatched = checkDependGroup(dependGroup, values);
        return isMatched === false ? undefined : dependRules?.value;
    };

    return [shouldUpdate, getValue];
}

export function getValiRules(rp?: MyFormRules, isPrice?: boolean) {
    let rules: any[] = [];
    if (rp) {
        let { required, regex, maxLength, minLength, maxValue, minValue } = rp;
        if (required) {
            rules.push({ required: true });
            if (isPrice && !isNumberOrStrNumber(minValue)) { minValue = 0.01; }
        }
        if (regex) { rules.push({ type: 'string', match: new RegExp(regex) }); }

        const hasMaxLength = isNumberOrStrNumber(maxLength);
        const hasMinLength = isNumberOrStrNumber(minLength);
        if (hasMaxLength || hasMinLength) {
            rules.push({
                validator: (value: any, callback: (error?: ReactNode) => void) => {
                    const isArrVal = isArray(value);
                    let length = isArrVal ? value.length
                        : isString(value) ? getStringLength(value, true)
                            : undefined;
                    if (isNumber(length)) {
                        if (hasMaxLength && hasMinLength) {
                            if (length > maxLength! || length < minLength!) {
                                if (isArrVal) {
                                    callback(`范围应为 ${minLength} ~ ${maxLength} 条之间`);
                                } else {
                                    callback(`范围应为 ${minLength! / 2} ~ ${maxLength! / 2} 个汉字（${minLength} ~ ${maxLength}字符）之间`);
                                }
                            }
                        }
                        else if (hasMaxLength && length > maxLength!) {
                            if (isArrVal) {
                                callback(`不能超过 ${maxLength} 条`);
                            } else {
                                callback(`最多允许输入 ${maxLength! / 2} 个汉字（${maxLength}字符）`);
                            }
                        }
                        else if (hasMinLength && length < minLength!) {
                            if (isArrVal) {
                                callback(`至少需要 ${maxLength} 条`);
                            } else {
                                callback(`至少输入 ${maxLength! / 2} 个汉字（${maxLength}字符）`);
                            }
                        }
                    }
                },
            });
        }

        const hasMaxValue = isNumberOrStrNumber(maxValue);
        const hasMinValue = isNumberOrStrNumber(minValue);
        if (hasMaxValue || hasMinValue) {
            rules.push({
                validator: (value: any, callback: (error?: ReactNode) => void) => {
                    const _value = parseFloat(value);
                    if (hasMaxValue && hasMinValue && maxValue != minValue) {
                        if (_value > maxValue! || _value < minValue!) {
                            callback(`值范围应为 ${minValue} ~ ${maxValue} 之间`);
                        }
                    }
                    else if (hasMaxValue && value > maxValue!) {
                        callback(`最大值为 ${maxValue}`);
                    }
                    else if (hasMinValue && value < minValue!) {
                        callback(`最小值为 ${minValue}`);
                    }
                }
            });
        }
    }
    return rules;
}

export function getUiTypeOrDefault(_props: MyFormItemProps): FieldUiType | undefined {
    const { uiType, type, name, allowCustom, options = [], rules = {}, tags = [] } = _props;
    if (uiType) { return uiType; }

    if (FieldNames.sku(tags)) { return 'skuEditTable'; }
    if (FieldNames.desc(tags)) { return 'richTextEditor'; }
    switch (type) {
        case 'input':
            {
                const numReg = /^[0-9]+.?[0-9]*/;
                const isNum = name?.includes('price') || numReg.test(`${rules.maxValue}`) || numReg.test(`${rules.minValue}`);
                return isNum ? 'inputNumber' : 'input';
            }
        case 'singleCheck':
            {
                const length = options.length;
                return (length == 0 || length > 3 || allowCustom) ? 'select' : 'radioGroup';
            }
        case 'multiCheck':
            {
                return 'multiSelect'
            }
    }
}

export function getTips(tipRules: MyFormDependRules[]): [
    (prev: any, next: any, info: any) => boolean,
    (values: any) => string[]
] {
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

    const getValues = (values: any): string[] => {
        return (getValuefunList.map((fun, index) => {
            const value = fun && fun(values);
            if (value) { return value }
        }));
    };
    return [shouldUpdate, getValues];
}

export function getStringLength(value: string, isByteUnit: boolean): number {
    if (!value) { return 0; }
    let length = 0;
    if (isByteUnit) {
        for (let i = 0; i < value.length; i++) {
            const c = value.charCodeAt(i);
            const isByte = (c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f);
            length += isByte ? 1 : 2;
        }
        return length
    }
    return value.length;
}

export function sliceString(value: string, start?: number, end?: number, isByteUnit?: boolean): string {
    if (!isString(value)) { return value; }
    if (isByteUnit && (start || end)) {
        let length = 0;
        let startSet = !start;
        let endSet = !end;
        for (let i = 0; i < value.length; i++) {
            if (startSet && endSet) { break; }
            const c = value.charCodeAt(i);
            const isByte = (c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f);
            length += isByte ? 1 : 2;
            if (!startSet && start && length > start) { start = i - 1; startSet = true; }
            if (!endSet && end && length > end) { end = i - 1; endSet = true; }
        }
    }
    return value.slice(start, end);
}


export function getQueryString(name: string) {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    const search = window.location.search.split('?')[1] || '';
    const r = search.match(reg) || [];
    return r[2];
}