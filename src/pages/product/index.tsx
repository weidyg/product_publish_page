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
                                return <ProFormItem key={i} {...m} formSchema={formSchema} />
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