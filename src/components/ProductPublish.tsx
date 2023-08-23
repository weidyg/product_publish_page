import React, { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { Form, Input, Radio, Select, InputNumber, Grid, Upload, Checkbox, Card, Space, Button } from '@arco-design/web-react';
import { IconDelete, IconPlus, IconPublic } from '@arco-design/web-react/icon';
import publishSchema from './publishSchema.json';
import styles from './ProductPublish.module.less'
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";

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
    namePath: string[];
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
    namePath?: string[];
    type?: string;
    rules?: MyFormRules;
    options?: {
        label: string;
        value: string;
    }[];
    formItems?: MyFormItemProps[];
    isCateProp?: boolean;
    uiType?: string;

    // [key: string]: any;
    value?: any;
    defaultValue?: any;
    onChange?: any;
    hideLabel?: boolean;
}
function ProductPublish(props: {}) {
    const formRef = useRef<any>();

    useEffect(() => {
        formRef.current.setFieldsValue(
            {
                "invoice": "1",
                "stuffStatus": "5",
                "subStock": "0",
                "p-20000": "1472037269"
            }
        );
    }, [])

    const getValiRules = (rp: MyFormRules) => {
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
            if (rules.every(e => e !== type)) {
                rules.push({ type: type });
            }
        }
        return rules;
    }

    const checkDependGroup = (dependGroup: MyFormDependGroup, values: any): boolean | undefined => {

        const getDeepValue = (values: any, fieldName: string, namePath: string[]) => {
            let value = values[fieldName];
            if (!value && namePath?.length > 0) {
                let _values = values;
                namePath?.forEach(field => {
                    if (typeof _values == 'object') {
                        _values = _values[field];
                    }
                });
                value = _values;
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

    const checkDependRules = (dependRules: MyFormDependRules): [
        (prev: any, next: any, info: any) => boolean,
        (values: any) => any
    ] => {
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
    const getTips = (tipRules: MyFormDependRules[]): [
        (prev: any, next: any, info: any) => boolean,
        (values: any) => any
    ] => {
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

        const getValues = (values: any) => {
            return (getValuefunList.map((fun, index) => {
                const value = fun && fun(values);
                if (value) { return <div key={index} dangerouslySetInnerHTML={{ __html: value }} /> }
            }));
        };
        return [shouldUpdate, getValues];
    }

    function RenderInput(_props: MyFormItemProps) {
        const { value, defaultValue, onChange, ...restProps } = _props;
        const { uiType, label, name, rules = {} } = restProps;
        const _commonProps = { value, defaultValue, onChange };

        const numReg = /^[0-9]+.?[0-9]*/;
        const isNum = numReg.test(rules.maxValue?.value) || numReg.test(rules.minValue?.value);

        const _uiType = uiType || (name == 'desc' ? 'input-html' : isNum ? 'input-number' : undefined);
        return (
            _uiType == 'upload' ? (
                <Upload action='/'
                    showUploadList={false}
                    onProgress={(currentFile) => { }}
                    {..._commonProps} >
                    <div className='arco-upload-trigger-picture'
                        style={{ width: '100px', height: '100px' }}>
                        <div className='arco-upload-trigger-picture-text'>
                            <IconPlus />
                            <div style={{ marginTop: 10, }}>添加上传图片</div>
                        </div>
                    </div>
                </Upload>
            ) : _uiType == 'input-number' ? (
                <InputNumber style={{ maxWidth: '358px' }}
                    placeholder={`请输入${label}`}
                    {..._commonProps} />
            ) : _uiType == 'input-html' ? (
                <ReactQuill theme="snow" {..._commonProps} />
            ) : (
                <Input allowClear style={{ maxWidth: '734px' }}
                    placeholder={`请输入${label}`}
                    {..._commonProps} />
            )
        )
    }
    function RenderSingleCheck(_props: MyFormItemProps) {
        const { value, defaultValue, onChange, ...restProps } = _props;
        const { options = [], uiType, label } = restProps;
        let _commonProps = { value, defaultValue, onChange, allowClear: true };

        if (uiType == 'checkbox' && options.every(e => ['0', '1'].includes(e.value))) {
            _commonProps.onChange = (checked: boolean, e: Event) => {
                return onChange(checked ? '1' : '0', e)
            }
        }

        return (
            uiType == 'radio' ? (
                <Radio.Group options={options} {..._commonProps} />
            ) : uiType == 'select' ? (
                <Select style={{ maxWidth: '358px' }}
                    placeholder={`请选择${label}`}
                    filterOption={(inputValue, option) =>
                        option.props.value.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0 ||
                        option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                    }
                    options={options} {..._commonProps}
                    showSearch
                // labelInValue allowCreate
                />
            ) : uiType == 'checkbox' ? (
                <Checkbox {..._commonProps}>{label}</Checkbox>
            ) : <></>
        )
    }
    function RenderMultiCheck(_props: MyFormItemProps) {
        const { value, defaultValue, onChange, ...restProps } = _props;
        const { options = [], uiType, label } = restProps;
        let _commonProps = { value, defaultValue, onChange, allowClear: true };
        return (
            <Select mode='multiple' style={{ maxWidth: '358px' }}
                placeholder={`请选择${label}`}
                filterOption={(inputValue, option) =>
                    option.props.value.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0 ||
                    option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                }
                options={options} {..._commonProps}
                showSearch
            // labelInValue allowCreate
            />
        )
    }
    function RenderComplex(_props: MyFormItemProps) {
        const { name, formItems } = _props;
        const isCateProp = name == "catProp";//p.isCateProp;
        const isMainImg = name == "images";//TODO:主图图片字段类型
        return (<>{
            isCateProp ? (
                <Grid cols={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2, xxl: 3, xxxl: 3 }} colGap={12}>
                    {formItems?.map((sm, si) => {
                        const uiType = sm.type == 'singlecheck' ? 'select' : sm.type;
                        return (
                            <Grid.GridItem key={'cpi' + si} style={{ maxWidth: '358px' }}>
                                <FormItem key={'si' + si} {...sm} uiType={uiType} />
                            </Grid.GridItem>
                        )
                    })}
                </Grid>
            ) : isMainImg ? (
                <Grid cols={5} colGap={12}>
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
    function RenderMultiComplex(_props: MyFormItemProps) {
        const { name, formItems } = _props;
        // const isCateProp = name == "catProp";//p.isCateProp;
        // const isMainImg = name == "images";//TODO:主图图片字段类型
        return (<>{
            <Grid cols={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2, xxl: 3, xxxl: 3 }} colGap={12}>
                {formItems?.map((sm, si) => {
                    const uiType = sm.type == 'singlecheck' ? 'select' : sm.type;
                    return (
                        <Grid.GridItem key={'cpi' + si} style={{ maxWidth: '358px' }}>
                            <FormItem key={'si' + si} {...sm} uiType={uiType} hideLabel />
                        </Grid.GridItem>
                    )
                })}
            </Grid>
        }</>)
    }

    function RenderMultiComplex0(_props: MyFormItemProps) {
        const { name, formItems } = _props;
        return (<>{
            <Form.List field='users'>
                {(fields, { add, remove, move }) => {
                    if (fields.length == 0) { add(); }
                    return (
                        <div>
                            {fields.map((item, index) => {
                                return (
                                    <div key={item.key}>
                                        <Form.Item>
                                            <Space>
                                                <Form.Item field={item.field + '.address'} rules={[{ required: true }]} noStyle>
                                                    <Input />
                                                </Form.Item>
                                                {
                                                    (fields.length != 1 )
                                                        ? <Button icon={<IconDelete />} type='text' onClick={() => remove(index)}></Button>
                                                        : undefined
                                                }{
                                                    index == fields.length - 1
                                                        ? <Button icon={<IconPlus />} type='text' onClick={() => add(index)}></Button>
                                                        : undefined
                                                }
                                            </Space>
                                        </Form.Item>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }}
            </Form.List>
        }</>)
    }
    // function RenderMultiComplex1(_props: MyFormItemProps) {
    //     const { name, formItems } = _props;
    //     return (<>{
    //         <Form.Item label={'User ' + index}>
    //             <Space>
    //                 <Form.Item field={item.field + '.username'} rules={[{ required: true }]} noStyle >
    //                     <Input />
    //                 </Form.Item>
    //                 <Form.Item field={item.field + '.address'} rules={[{ required: true }]} noStyle     >
    //                     <Input />
    //                 </Form.Item>
    //                 <Button icon={<IconDelete />} shape='circle' status='danger' onClick={() => remove(index)}    ></Button>
    //             </Space>
    //         </Form.Item>
    //     }</>)
    // }



    const getDefaultUiType = (_props: MyFormItemProps) => {
        const { type, options = [], uiType } = _props;
        const length = options.length;

        if (uiType) { return uiType; }
        if (type == 'singlecheck') {
            return length > 3 ? 'select' : 'radio';
        }
        return uiType;
    }

    function FormItem(_props: MyFormItemProps) {
        const uiType = getDefaultUiType(_props);
        const props = { ..._props, uiType }

        const { type, label: propLabel, value, name, namePath = [],
            hideLabel, rules: propRules } = props || {};
        const { tips, disable, ...restRules } = propRules || {};
        const rules = getValiRules(restRules);

        const field = namePath.join('.');
        const [tipShouldUpdate, getTipValues] = getTips(tips || []);
        const [disShouldUpdate, getDisValue] = checkDependRules(disable || {});

        const shouldUpdate = (prev: any, next: any, info: any) => {
            return tipShouldUpdate(prev, next, info) || disShouldUpdate(prev, next, info);
        }
        const label = (uiType == 'checkbox' || hideLabel) ? undefined : propLabel;
        const isComplex = type?.toLowerCase().indexOf('complex') !== -1;
        return (<>
            <Form.Item noStyle shouldUpdate={shouldUpdate} >
                {(values) => {
                    const _disable = getDisValue(values) === true;
                    const extra = getTipValues(values);
                    const _label = isComplex ? <>
                        <span>{label}</span>
                        <div className="arco-form-extra">{extra}</div>
                    </> : label;
                    return _disable ? undefined :
                        <Form.Item initialValue={value} label={_label}
                            field={field} rules={rules}
                            extra={isComplex == false ? extra : undefined}>
                            {type == 'input' ? (
                                <RenderInput {...props} />
                            ) : type == 'singlecheck' ? (
                                <RenderSingleCheck {...props} />
                            ) : type == 'multicheck' ? (
                                <RenderMultiCheck {...props} />
                            ) : type == 'complex' ? (
                                <RenderComplex {...props} />
                            ) : type == 'multicomplex' ? (
                                <RenderMultiComplex0 {...props} />
                            ) : undefined}
                        </Form.Item>;
                }}
            </Form.Item>
            {/* {JSON.stringify(p)} */}
        </>)
    }
    return (
        <div className={styles['struct-content']}>
            <Card className={styles['sell-card']}>
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
            </Card>

        </div>
    );
}

export default ProductPublish;