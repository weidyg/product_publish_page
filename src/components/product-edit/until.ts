import _ from "lodash";
import { isArray, isNumber, isString } from "@arco-design/web-react/es/_util/is";
import { ReactNode } from "react";
import { FieldTag, FieldUiType, MyFormDependGroup, MyFormDependRules, MyFormItemOption, MyFormItemProps, MyFormRules } from "./interface";

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
        obj[key] = [];
        let temp: any[] = [];
        const salePropItem = saleProp[key];
        if (isArray(salePropItem)) {
            temp = [...salePropItem];
        } else if (isArray(salePropItem?.value)) {
            temp = [...salePropItem?.value];
        }
        temp = temp?.filter((f: any) => !!(f?.text));
        temp.forEach(f => {
            const hasValue = obj[key].some((item: any) => JSON.stringify(item) == JSON.stringify(f));
            if (!hasValue) { obj[key].push(f); }
        });
        next = obj[key]?.length > 0;
        if (!next) { obj = {}; }
    });
    // console.log('getSkuSaleProp', obj);
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
    // console.log('saleObjs', saleObjs);
    saleObjs.forEach(obj => {
        const key = getUniquekey(obj, v => v?.value || v?.text);
        if (!newData.some(s => s.key == key)) {
            const skuItem = tempSkuItems?.find(f => f.key == key) || {};
            const dataItem: any = { ...skuItem, key, [skuSalePropName]: obj };
            newData.push(dataItem)
        }
    });
    // console.log('newData', newData);
    return newData;
}


export const FieldNames = {
    images: (tags?: FieldTag[]) => tags?.includes(FieldTag.Images),
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
    let log = "";
    for (let i = 0; i < expressLength; i++) {
        const exp = expresses[i];
        const _val = getDeepValue(values, exp.fieldName, exp.namePath);
        if (exp.symbol == '!=') {
            _isMatcheds.push(_val != exp.fieldValue);
        } else if (exp.symbol == '==') {
            _isMatcheds.push(_val == exp.fieldValue);
        }
        log += `\n ${exp.fieldName}:${_val} ${exp.symbol} ${exp.fieldValue} `;
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
    //  console.log("checkDependGroup", log, isMatched, operator, _isMatcheds, values); 
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
                                    callback(`范围应为 ${Math.ceil(minLength! / 2)} ~ ${Math.ceil(maxLength! / 2)} 个汉字（${minLength} ~ ${maxLength}字符）之间`);
                                }
                            }
                        }
                        else if (hasMaxLength && length > maxLength!) {
                            if (isArrVal) {
                                callback(`不能超过 ${maxLength} 条`);
                            } else {
                                callback(`最多允许输入 ${Math.ceil(maxLength! / 2)} 个汉字（${maxLength}字符）`);
                            }
                        }
                        else if (hasMinLength && length < minLength!) {
                            if (isArrVal) {
                                callback(`至少需要 ${minLength} 条`);
                            } else {
                                callback(`至少输入 ${Math.ceil(minLength! / 2)} 个汉字（${minLength}字符）`);
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
                    else if (hasMaxValue && _value > maxValue!) {
                        callback(`最大值为 ${maxValue}`);
                    }
                    else if (hasMinValue && _value < minValue!) {
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
    if (FieldNames.desc(tags)) { return 'descEditor'; }
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

export function getOptions(options: MyFormItemOption[]): [
    (prev: any, next: any, info: any) => boolean,
    (values: any) => MyFormItemOption[]
] {
    let shouldUpdateList: Array<(prev: any, next: any, info: any) => boolean> = [];
    let getValuefunList: Array<[(values: any) => any, MyFormItemOption]> = [];

    options?.forEach(option => {
        const hideRule = option?.hide;
        if (hideRule) {
            const [_shouldUpdate, _getValue] = checkDependRules(hideRule || {});
            shouldUpdateList.push(_shouldUpdate);
            getValuefunList.push([_getValue, option]);
        } else {
            getValuefunList.push([(values: any) => false, option]);
        }
    });

    const shouldUpdate = (prev: any, next: any, info: any) => {
        for (let index = 0; index < shouldUpdateList.length; index++) {
            const fun = shouldUpdateList[index];
            const value = fun && fun(prev, next, info);
            if (value == true) { return true; }
        }
        return false;
    };

    const getValues = (values: any, b?: any): MyFormItemOption[] => {
        if (shouldUpdateList.length == 0) { return options; }
        let _options: MyFormItemOption[] = [];
        getValuefunList.map(([fun, option], index) => {
            const value = fun && fun(values);
            if (value !== true) { _options.push(option); }
        });
        return _options;
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

export const duplicate = function (arr: string | any[]) {
    let temp: any = {};
    for (let i = 0; i < arr.length; i++) {
        if (temp[arr[i]]) {
            console.log('temp[arr[i]]', temp[arr[i]]);
            return true
        } else {
            console.log('temp[arr[i]]=1', temp[arr[i]]);
            temp[arr[i]] = 1
        }
    }
    return false
}


const unitSizes = {
    B: 1.0,
    K: 1.0 * 1024,
    M: 1.0 * 1024 * 1024,
    G: 1.0 * 1024 * 1024 * 1024,
    T: 1.0 * 1024 * 1024 * 1024 * 1024,
    P: 1.0 * 1024 * 1024 * 1024 * 1024 * 1024,
}
export const convertTime = (timestamp?: number) => {
    if (!timestamp) { return ''; }
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var formattedDate = `${year}-${`${month < 9 ? '0' : ''}${month + 1}`}-${`${month < 10 ? '0' : ''}${day}`} ${hour}:${minute}:${second}`;
    return formattedDate;
}
export const convertByteUnit = (size?: number, precision: number = 2) => {
    if (size === undefined) { return ''; }
    if (size < unitSizes.K) { return `${size?.toFixed(precision)}B`; }
    if (size < unitSizes.M) { return `${(size / unitSizes.K)?.toFixed(precision)}K`; }
    if (size < unitSizes.G) { return `${(size / unitSizes.M)?.toFixed(precision)}M`; }
    if (size < unitSizes.T) { return `${(size / unitSizes.G)?.toFixed(precision)}G`; }
    if (size < unitSizes.P) { return `${(size / unitSizes.T)?.toFixed(precision)}T`; }
}
export const isAcceptFile = (file: File, accept: string | string[]) => {
    if (accept && file) {
        const accepts = Array.isArray(accept) ? accept : accept.split(',').map((x) => x.trim()).filter((x) => x);
        const fileExtension = file.name.indexOf('.') > -1 ? file.name.split('.').pop() : '';
        // console.log('accepts', accepts);
        // console.log('fileExtension', fileExtension);
        return accepts.some((type) => {
            const text = type && type.toLowerCase();
            const fileType = (file.type || '').toLowerCase();
            // console.log('text', text);
            // console.log('fileType', fileType);
            if (text === fileType) { return true; }
            if (/\/\*/.test(text)) {
                const regExp = new RegExp('\/.*$')
                // console.log('RegExp1', fileType.replace(regExp, ''), text.replace(regExp, ''));
                return fileType.replace(regExp, '') === text.replace(regExp, '');
            }
            if (/\..*/.test(text)) {
                // console.log('RegExp1', text, `.${fileExtension && fileExtension.toLowerCase()}`);
                return text === `.${fileExtension && fileExtension.toLowerCase()}`;
            }
            return false;
        });
    }
    return !!file;
}

const valMap: { [x: string]: string } = {
    '2XL': 'XXL', '3XL': 'XXXL', '4XL': 'XXXXL', '5XL': 'XXXXXL', '6XL': 'XXXXXXL',
}
export const sizeCompare = (t1: string, t2: string) => {
    let [val1, val2] = [t1?.toUpperCase(), t2?.toUpperCase()];
    val1 = (val1 && valMap[val1]) || val1;
    val2 = (val2 && valMap[val2]) || val2;
    return val1 == val2;
};

export const thumbnail = (url?: string, width?: number, height?: number) => {
    if (!url || (!width && !height)) { return url; }
    return `${url}?x-oss-process=image/resize,m_lfit${height ? `,h_${height}` : ''}${width ? `,w_${width}` : ''}`
}


export const arrayMoveMutate = (array: any[], from: any, to: number) => {
    const startIndex = to < 0 ? array.length + to : to;
    if (startIndex >= 0 && startIndex < array.length) {
        const item = array.splice(from, 1)[0];
        array.splice(startIndex, 0, item);
    }
};

export const arrayMove = (array: any[], from: any, to: number) => {
    array = [...array];
    arrayMoveMutate(array, from, to);
    return array;
};

export function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}