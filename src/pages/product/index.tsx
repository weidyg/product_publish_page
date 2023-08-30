import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Radio, Select, InputNumber, Grid, Upload, Checkbox, Card, Space, Button, Spin, Table, Message } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import publishSchema from './publishSchema.json';
import styles from './index.module.less'
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";
import { FieldUiType, MyFormDependRules, MyFormItemProps } from './interface';
import SkuEditableTable from '../../components/SkuEditableTable';
import { checkDependRules, getValiRules } from '../../components/untis';
import * as _ from "lodash"
import { ProFormItem } from '../../components/multi-complex';

const data = {
    shopId: 0,
    spuId: 0,
};

const skuPropName = 'sku';

const formSchemaJson = publishSchema as MyFormItemProps[]

function ProductPublish(props: {}) {
    const formRef = useRef<any>();
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(true);
    const [formSchema, setFormSchema] = useState<MyFormItemProps[]>([]);

    useEffect(() => {
        loadingInitData();
    }, [])

    const loadingInitData = () => {
        const formValues = {
            "title": "测试标题",
            "sku": [
                {
                    "key": "p-20509_649458002|p-1627207_28321",
                    "props": {
                        "p-1627207": "28321",
                        "p-20509": "649458002"
                    },
                    "skuQuality": "mainSku",
                    "skuStock": 100
                },
                {
                    "key": "p-20509_649458002|p-1627207_28320",
                    "props": {
                        "p-1627207": "28320",
                        "p-20509": "649458002"
                    },
                    "skuQuality": "multipleMainSku",
                    "skuPrice": 10,
                    "skuStock": 1000
                },
                {
                    "key": "p-20509_66579689|p-1627207_28321",
                    "props": {
                        "p-1627207": "28321",
                        "p-20509": "66579689"
                    },
                    "skuQuality": "multipleMainSku",
                    "skuPrice": 14,
                    "skuStock": 1000
                },
                {
                    "key": "p-20509_66579689|p-1627207_28320",
                    "props": {
                        "p-1627207": "28320",
                        "p-20509": "66579689"
                    },
                    "skuQuality": "multipleMainSku",
                    "skuPrice": 100,
                    "skuStock": 1000
                }
            ],
            "stuffStatus": "5",
            "catProp": {
                "p-13021751": "hh",
                "p-20000": "3407618",
                "p-149422948": [{
                    "material_prop_name": "人造革",
                    "material_prop_content": 100
                }],
                "p-151386995": [{
                    "material_prop_name": "三乙烯基纤维",
                    "material_prop_content": 100
                }],
                "p-8560225": "740132938",
                "p-6103476": "100",
                // "p-122216608": "3493528",
                "p-21548": "81826195",
                "p-25206543": "7695765855",
                "p-122216345": [
                    "29456",
                    "30264400"
                ],
                "p-8418084": "493280569",
                "p-122276315": "80270793",
                "p-122216589": [
                    "80211937",
                    "66036976"
                ],
                "p-21299": "27013",
                "p-20019": [
                    "7850140",
                    "3217611"
                ],
                "p-122216688": [
                    "4428937",
                    "103411"
                ],
                "p-20551": "39026210",
                "p-122216562": "44597",
                "p-115930179": "483276326",
                "p-122216586": "4042331"
            },
            "globalStock": {
                "globalStockNav": "0"
            },
            "saleProp": {
                "p-1627207": [
                    "28321",
                    "28320"
                ],
                "p-20509": {
                    "p-20509-sizeGroup": "136553091-women_outdoor_tops",
                    "p-20509-sizeValue": {
                        "size-136553091-women_outdoor_tops": [
                            "649458002",
                            "66579689"
                        ]
                    }
                }
            },
            "deliveryTimeType": "0",
            "quantity": 10000,
            "images": {},
            "subStock": "1",
            "tbExtractWay": {},
            "sellPromise": "1",
            "sevenDaySupport": "true",
            "guaranteeService": [],
            "startTime": "0",
            "tbDeliveryTime": "3",
            "price": 100,
            "warranty": "1"
        }
        // setTimeout(() => {
        setLoading(false);
        setFormSchema(formSchemaJson);
        formRef?.current?.setFieldsValue(formValues);
        // }, 1000);
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

    const getDefaultUiType = (_props: MyFormItemProps) => {
        const { type, options = [], uiType } = _props;
        const length = options.length;
        const allowCustom = _props?.allowCustom;

        if (uiType) { return uiType; }
        if (type == 'singleCheck') {
            return (length > 3 || allowCustom) ? 'select' : 'radio';
        }
        return uiType;
    }

    function RenderInput(_props: MyFormItemProps) {
        const { value, defaultValue, onChange, readOnly, ...restProps } = _props;
        const { uiType, label, name, rules = {} } = restProps;
        let _commonProps = { value, defaultValue, onChange, disabled: readOnly };

        const numReg = /^[0-9]+.?[0-9]*/;
        const isNum = numReg.test(`${rules.maxValue}`) || numReg.test(`${rules.minValue}`);

        const _uiType = uiType || (name == 'desc' ? 'inputHtml' : isNum ? 'inputNumber' : undefined);
        return (
            _uiType == 'imageUpload' ? (
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
            ) : _uiType == 'inputNumber' ? (
                <InputNumber style={{ maxWidth: '358px' }}
                    placeholder={`请输入${label}`}
                    {..._commonProps} />
            ) : _uiType == 'inputHtml' ? (
                <ReactQuill theme="snow" {..._commonProps} />
            ) : (
                <Input allowClear style={{ maxWidth: '734px' }}
                    placeholder={`请输入${label}`}
                    {..._commonProps} />
            )
        )
    }
    function RenderSingleCheck(_props: MyFormItemProps) {
        const { value, defaultValue, onChange, readOnly, allowCustom, options = [], uiType, label } = _props;
        let _commonProps = { value, defaultValue, onChange, disabled: readOnly, allowClear: true };

        if (uiType == 'checkBox' && options.every(e => ['0', '1'].includes(e.value))) {
            _commonProps.onChange = (checked: boolean, e: Event) => {
                return onChange(checked ? '1' : '0', e)
            }
        }

        return (
            uiType == 'radio' ? (
                <Radio.Group options={options} {..._commonProps} />
            ) : uiType == 'select' ? (
                <Select showSearch
                    style={{ maxWidth: '358px' }} //labelInValue
                    placeholder={`请选择${allowCustom ? '或输入' : ''}${label}`}
                    filterOption={(inputValue, option) =>
                        option.props.value.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0 ||
                        option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                    }
                    options={options}
                    allowCreate={allowCustom}
                    {..._commonProps}
                />
            ) : uiType == 'checkBox' ? (
                <Checkbox {..._commonProps}>{label}</Checkbox>
            ) : <></>
        )
    }

    function RenderMultiCheck(_props: MyFormItemProps) {
        const { value, defaultValue, onChange, options = [], uiType, label, readOnly, allowCustom } = _props;
        let _commonProps = { value, defaultValue, onChange, disabled: readOnly, allowClear: true };
        return (
            <Select showSearch
                mode='multiple'
                style={{ maxWidth: '358px' }} //labelInValue
                placeholder={`请选择${allowCustom ? '或输入' : ''}${label}`}
                filterOption={(inputValue, option) =>
                    option.props.value.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0 ||
                    option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                }
                options={options}
                allowCreate={allowCustom}
                {..._commonProps}
            />
        )
    }

    function RenderComplex(_props: MyFormItemProps) {
        const { name, subItems } = _props;
        const isCateProp = name == "catProp";//p.isCateProp;
        const isMainImg = name == "images";//TODO:主图图片字段类型
        return (<>{
            isCateProp ? (
                <Grid cols={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2, xxl: 3, xxxl: 3 }} colGap={12}>
                    {subItems?.map((sm, si) => {
                        const uiType = sm.type == 'singleCheck' ? 'select' : sm.uiType;
                        return (
                            <Grid.GridItem key={'gcpi0' + si} style={{ maxWidth: '358px' }}>
                                {FormItem({ ...sm, uiType })}
                            </Grid.GridItem>
                        )
                    })}
                </Grid>
            ) : isMainImg ? (
                <Grid cols={5} colGap={12}>
                    {subItems?.map((sm, si) => {
                        const uiType: FieldUiType = 'imageUpload';
                        return (
                            <Grid.GridItem key={'gcpi1' + si}>
                                {FormItem({ ...sm, uiType })}
                            </Grid.GridItem>
                        )
                    })}
                </Grid>
            ) : subItems?.map((sm, si) => {
                return <span key={'si11' + si}>
                    {FormItem(sm)}
                </span>
            })
        }</>)
    }

    function FormItem(_props: MyFormItemProps) {
        const uiType = getDefaultUiType(_props);
        const props = { ..._props, uiType }

        const { type, label: propLabel, value, name, namePath = [],
            noStyle, noLabel,
            tips, hide, rules: propRules
        } = props || {};

        const rules = getValiRules(propRules, propLabel);

        const field = namePath.join('.');
        const [tipShouldUpdate, getTipValues] = getTips(tips || []);
        const [disShouldUpdate, getDisValue] = checkDependRules(hide || {});

        const shouldUpdate = (prev: any, next: any, info: any) => {
            return name == 'sku' || tipShouldUpdate(prev, next, info) || disShouldUpdate(prev, next, info);
        }
        const label = (uiType == 'checkBox' || noLabel) ? undefined : propLabel;
        const isComplex = type?.toLowerCase().indexOf('complex') !== -1;
        return (
            <Form.Item noStyle shouldUpdate={shouldUpdate} >
                {(values) => {
                    const _disable = getDisValue(values) === true;
                    const extra = getTipValues(values);
                    const _label = isComplex ? <>
                        <span>{label}</span>
                        <div className="arco-form-extra">{extra}</div>
                    </> : label;
                    return _disable ? undefined :
                        <Form.Item initialValue={value} noStyle={noStyle}
                            label={_label} field={field} rules={rules}
                            extra={isComplex == false ? extra : undefined}
                        >
                            {type == 'input' ? (
                                RenderInput(props)
                            ) : type == 'singleCheck' ? (
                                RenderSingleCheck(props)
                            ) : type == 'multiCheck' ? (
                                RenderMultiCheck(props)
                            ) : type == 'complex' ? (
                                RenderComplex(props)
                            ) : type == 'multiComplex' ? (
                                name == skuPropName
                                    ? <SkuEditableTable {...props}
                                        allFormItems={formSchema}
                                        values={values} />
                                    : <Form.List field={`${field}`} initialValue={value} noStyle>
                                        {(fields, { add, remove, move }) => {
                                            if (fields.length == 0) { add(); }
                                            return (fields.map((item, index) => {
                                                return (
                                                    <Form.Item key={item.key} noStyle>
                                                        <Space>
                                                            {
                                                                props?.subItems?.map((m: any, i: any) => {
                                                                    const _rules = getValiRules(m.rules, m.label);
                                                                    return <Form.Item
                                                                        key={item.key + m.name}
                                                                        field={item.field + '.' + m.name}
                                                                        rules={_rules}
                                                                    >
                                                                        {
                                                                            m.type == 'input' ? (
                                                                                RenderInput({ ...m })
                                                                            ) : m.type == 'singleCheck' ? (
                                                                                RenderSingleCheck({ ...m, uiType: 'select' })
                                                                            ) : m.type == 'multiCheck' ? (
                                                                                RenderMultiCheck({ ...m, uiType: 'multiSelect' })
                                                                            ) : undefined
                                                                        }
                                                                    </Form.Item>
                                                                })
                                                            }
                                                            {
                                                                (fields.length != 1)
                                                                    ? <Form.Item >
                                                                        <Button icon={<IconDelete />} type='text' onClick={() => remove(index)} />
                                                                    </Form.Item>
                                                                    : undefined
                                                            }{
                                                                index == fields.length - 1
                                                                    ? <Form.Item >
                                                                        <Button icon={<IconPlus />} type='text' onClick={() => {
                                                                            add();
                                                                        }} />
                                                                    </Form.Item>
                                                                    : undefined
                                                            }
                                                        </Space>
                                                    </Form.Item>
                                                );
                                            }));
                                        }}
                                    </Form.List>
                            ) : undefined}
                        </Form.Item>
                }}
            </Form.Item>
        )
    }

    const [skuForms, setSkuForms] = useState<any>({});
    const handleSave = async () => {
        setSaveLoading(true);
        try {
            Object.keys(skuForms || {}).forEach(async (n) => {
                try { await skuForms[n]?.validate(); } catch (error) { }
            });
            const values = await formRef.current.validate();
            Message.info('校验通过，提交成功！' + JSON.stringify(values));
        } catch (error) {
            Message.error('校验失败，请检查字段！' + JSON.stringify(error));
        } finally {
            setSaveLoading(false);
        }
    }

    return (
        <Spin loading={loading} dot tip='页面加载中，请稍后...'
            className={styles['product']} >
            <div className={styles['product-content']}>
                <Card className={styles['product-content-card']}>
                    <Form.Provider
                        onFormValuesChange={(name, changedValues, info) => {
                            if (name == 'spuForm' && changedValues?.hasOwnProperty(skuPropName)) {
                                const { spuForm, ...skuforms } = info?.forms || {};
                                setSkuForms(skuforms)
                            }
                            console.log('onFormValuesChange: ', name, changedValues, info);
                        }}
                        onFormSubmit={(name, values, info) => {
                            console.log('onFormSubmit: ', name, values, info);
                        }}>
                        <Form id='spuForm'
                            ref={formRef}
                            layout='vertical'
                            autoComplete='off'
                            scrollToFirstError={true}
                            onValuesChange={(_, values) => {
                                console.log(values);
                            }}
                        >
                            {formSchema.map((m, i) => {
                                return <ProFormItem key={i} {...m} formSchema={formSchema}/>
                                // return <div key={i}>{FormItem(m)}</div>
                                //  return <div key={i}>{ProFormItem(m)}</div>
                            })}
                        </Form>
                    </Form.Provider>
                </Card>
                <Card>
                    <Space style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Button type='primary' size='large' loading={loading} onClick={handleSave}>保存</Button>
                    </Space>
                </Card>
            </div>
        </Spin>
    );
}

export default ProductPublish;