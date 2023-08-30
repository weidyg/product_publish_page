import _, { isNumber } from "lodash";
import { MyFormDependGroup, MyFormDependRules, MyFormRules } from "../pages/product/interface";

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

    const shouldUpdate = (prev: any, next: any, info: any) => {
        return !!operator && (expressLength > 0 || groupLength > 0);
    }
    const getValue = (values: any) => {
        let isMatched = dependGroup && checkDependGroup(dependGroup, values);
        return isMatched === false ? undefined : dependRules?.value;
    };

    return [shouldUpdate, getValue];
}

export function getValiRules(rp?: MyFormRules, label?: string) {
    let rules: any[] = [];
    if (rp) {
        label = label || '值';
        const type = rp.valueType;

        if (rp.required) {
            rules.push({ required: true, message: `${label}不能为空` });
        }

        if (rp.regex) {
            rules.push({ type: 'string', match: new RegExp(rp.regex), message: `${label}格式错误` });
        }

        if (isNumber(rp.maxLength) || isNumber(rp.minLength)) {
            rules.push({ maxLength: rp.maxLength, minLength: rp.minLength });
        }
        
        if (isNumber(rp.maxValue) || isNumber(rp.minValue)) {
            rules.push({ type: 'number', max: rp.maxValue, min: rp.minValue });
        }
    }
    return rules;
}
export function smoothData(skuSaleData: { [key: string]: any[] }, getValue?: (val: any) => any) {
    let newObjs: any[] = [];
    const keys = Object.keys(skuSaleData);
    for (let index = keys.length - 1; index >= 0; index--) {
        let tempObjs: any[] = [];
        const key = keys[index];
        const vals = skuSaleData[key] || [];
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

export function sortObj(obj: { [key: string]: any }): any {
    if (!obj) { return obj; }
    let newObj: { [key: string]: any } = {};
    let keysSorted = Object.keys(obj).sort((a, b) => { return obj[b] - obj[a] });
    for (let i = 0; i < keysSorted.length; i++) {
        newObj[keysSorted[i]] = obj[keysSorted[i]];
    }
    return newObj;
}

export function getUniquekey(obj: { [key: string]: any }): string {
    const newObj = sortObj(obj);
    const keys = Object.keys(newObj);
    let deepValues = [];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];
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
