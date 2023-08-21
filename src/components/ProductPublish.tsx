import React, { ReactNode, useRef, useState } from 'react';
import { Form, Input, Radio, Select, InputNumber, Grid, Upload } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import publishSchema from './publishSchema.json';
type MyFormNumRules = {
    value?: any,
    include?: boolean
}

type MyFormDependRules = {
    value?: any,
    dependGroup?: MyFormDependGroup
}

type MyFormDependGroup = {
    operator?: 'and' | 'or',
    expresses?: MyFormDependExpress[],
    groups?: MyFormDependGroup[],
}
type MyFormDependExpress = {
    fieldName: string,
    fieldValue: string,
    symbol?: '==' | '!='
}


type MyFormRules = {
    required?: boolean;
    valueType?: string;
    regex?: string;
    maxLength?: MyFormNumRules;
    maxValue?: MyFormNumRules;
    minValue?: MyFormNumRules;

    tips?: MyFormDependRules[];
    disable?: MyFormDependRules;
}
type MyFormItemProps = {
    label?: string;
    name?: string;
    type?: string;
    rules?: MyFormRules;
    options?: {
        label: string;
        value: string;
    }[];
    formItems?: MyFormItemProps[];
    isCateProp?: boolean;
    [key: string]: any;
}
function ProductPublish(props: {}) {
    const formRef = useRef<any>();

    const getrules = (rp: MyFormRules) => {
        let rules: any[] = [];
        if (rp) {
            const type = rp.valueType;
            if (rp.required) {
                rules.push({ required: true });
            }
            if (rp.regex) {
                rules.push({ type: 'string', match: new RegExp(rp.regex) });
            }
            if (rp.maxLength) {
                const { value: maxLength, include: includes } = rp.maxLength;
                rules.push({ type: 'string', maxLength, includes });
            }
            if (rp.maxValue) {
                const { value: max, include: includes } = rp.maxValue;
                rules.push({ type: 'number', max, includes });
            }
            if (rp.minValue) {
                const { value: min, include: includes } = rp.minValue;
                rules.push({ type: 'number', min, includes });
            }
        }
        return rules;
    }

    const checkDependGroup = (dependGroup?: MyFormDependGroup, values?: any): boolean | undefined => {
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
            const _val = values[exp.fieldName];
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

    const checkDependRules = (dependRules: MyFormDependRules): [boolean, (values: any) => any] => {
        const dependGroup = dependRules?.dependGroup;
        const operator = dependGroup?.operator;
        const expressLength = dependGroup?.expresses?.length || 0;
        const groupLength = dependGroup?.groups?.length || 0;

        const shouldUpdate = !!operator && (expressLength > 0 || groupLength > 0);
        let getValue = (values: any) => {
            let isMatched = checkDependGroup(dependGroup, values);
            return isMatched === false ? undefined : dependRules?.value;
        };
        return [shouldUpdate, getValue];
    }

    function CateProFormItem(p: MyFormItemProps) {

        return (<>
            <Grid.Row gutter={{ xs: 4, sm: 6, md: 12 }}>
                {p.formItems?.map((sm, si) => {
                    return <Grid.Col key={'cpi' + si} span={12}>
                        <FormItem
                            key={'si' + si} {...sm}
                            uiType={sm.type == 'singlecheck' ? 'select' : undefined}
                        />
                    </Grid.Col>
                })}
            </Grid.Row>
        </>)
    }

    function ComplexFormItem(p: MyFormItemProps) {
        const isCateProp = p.name == "catProp";//p.isCateProp;
        const isMainImg = p.name == "images";//TODO:主图图片字段类型
        const formItems = p.formItems;
        return (<>{
            isCateProp ? (
                <Grid.Row gutter={{ xs: 4, sm: 6, md: 12 }}>
                    {formItems?.map((sm, si) => {
                        const uiType = sm.type == 'singlecheck' ? 'select' : undefined;
                        return (
                            <Grid.Col key={'cpi' + si} span={12}>
                                <FormItem key={'si' + si} {...sm} uiType={uiType} />
                            </Grid.Col>
                        )
                    })}
                </Grid.Row>
            ) : isMainImg ? (
                <Grid cols={{ xs: 3, sm: 4, md: 5, lg: 6, xl: 7, xxl: 8 }}>
                    {formItems?.map((sm, si) => {
                        const uiType = 'upload';
                        return (
                            <Grid.GridItem key={'cpi' + si}>
                                <FormItem key={'si' + si} {...sm} uiType={uiType} />
                            </Grid.GridItem>
                        )
                    })}
                </Grid>
            ) : formItems?.map((sm, si) => {
                return <FormItem key={'si' + si} {...sm} />
            })
        }</>)
    }
    const getTips = (tipRules: MyFormDependRules[]): [boolean, (values: any) => any] => {
        let shouldUpdate = false;
        let getValuefunList: Array<(values: any) => any> = [];
        tipRules?.forEach(tipRule => {
            const [_shouldUpdate, _getValue] = checkDependRules(tipRule || {});
            if (_shouldUpdate === true) { shouldUpdate = true; }
            getValuefunList.push(_getValue);
        });

        let getValues = (values: any) => {
            return (
                getValuefunList.map((fun, index) => {
                    const value = fun && fun(values);
                    if (value) { return <div key={index} dangerouslySetInnerHTML={{ __html: value }} /> }
                })
            );
        };
        return [shouldUpdate, getValues];
    }


    function FormItem(p: MyFormItemProps) {
        const { tips, disable, ...restRules } = p.rules || {};
        const _rules = getrules(restRules);
        const [tipShouldUpdate, getTipValues] = getTips(tips || []);
        const [disShouldUpdate, getDisValue] = checkDependRules(disable || {});
        return (<>
            <Form.Item shouldUpdate={tipShouldUpdate || disShouldUpdate}>
                {(values) => {
                    const _disable = getDisValue(values) === true;
                    const _tips = getTipValues(values);
                    return _disable ? <div>{p.label + " : Disable rendering"}</div> :
                        <Form.Item
                            label={p.label} field={p.name}
                            rules={_rules}
                            extra={_tips}
                        >
                            {p.type == 'input' ? (
                                p.uiType == 'upload' ? (
                                    <Upload action='/'
                                        showUploadList={false}
                                        onChange={(_, currentFile) => { }}
                                        onProgress={(currentFile) => { }}
                                    >
                                        <div className='arco-upload-trigger-picture'
                                            style={{ width: '100px', height: '100px' }}>
                                            <div className='arco-upload-trigger-picture-text'>
                                                <IconPlus />
                                                <div style={{ marginTop: 10, }}>添加上传图片</div>
                                            </div>
                                        </div>
                                    </Upload>
                                ) : ((restRules.maxValue || restRules.minValue) ? (
                                    <InputNumber placeholder={`请输入${p.label}`} />
                                ) : (
                                    <Input placeholder={`请输入${p.label}`} />
                                )
                                )
                            ) : p.type == 'singlecheck' ? (
                                ((p.options && p.options.length > 3 && p.uiType != 'radio') || p.uiType == 'select')
                                    ? <Select options={p.options} placeholder={`请选择${p.label}`} />
                                    : <Radio.Group options={p.options} />
                            ) : p.type == 'complex' ? (
                                <ComplexFormItem {...p} />
                            ) : undefined
                            }
                        </Form.Item>;
                }}
            </Form.Item>
            {/* {JSON.stringify(p)} */}
        </>)
    }

    return (
        <div style={{ margin: '24px' }}>
            <Form
                ref={formRef}
                layout='vertical'
                autoComplete='off'
                onValuesChange={(_, values) => {
                    console.log(values);
                }}
            >
                {publishSchema.map((m, i) => {
                    return <FormItem key={i} {...m as any} />
                })}
            </Form>
        </div>
    );
}

export default ProductPublish;