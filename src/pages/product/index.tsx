import React, { useEffect, useRef, useState } from 'react';
import { Form, Card, Space, Button, Spin, Message, PageHeader, Result } from '@arco-design/web-react';
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";
import * as _ from "lodash"
import { MyFormItemProps } from './interface';
import { ProFormItem } from '../../components/pro-form';
import styles from './index.module.less'

declare global {
    interface Window {
        loadProductEditData: any,
        saveProductEditData: any,
    }
}

function ProductPublish(props: {}) {
    const formRef = useRef<any>();
    const [loading, setLoading] = useState(true);
    const [platformName, setPlatformName] = useState('');
    const [shopName, setShopName] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [formSchema, setFormSchema] = useState<MyFormItemProps[]>([]);

    const [loadErrMsg, setLoadErrMsg] = useState();
    useEffect(() => {
        loadingInitData();
    }, [])

    const loadingInitData = async () => {
        setLoading(true);
        try {
            const { platformName, shopName, schema, data } = await window.loadProductEditData();
            setFormSchema(schema);
            setPlatformName(platformName);
            setShopName(shopName);
            formRef?.current?.setFieldsValue(data);
        } catch (error: any) {
            setLoadErrMsg(error?.message);
        } finally {
            setLoading(false);
        }

    }

    const handleSave = async () => {
        setSaveLoading(true);
        try {
            const values = await formRef.current.validate();
            try {
                await window.saveProductEditData(values);
                console.log('values success', values);
                Message.info('保存成功！');
            } catch (error: any) {
                Message.error(error?.message);
            }
        } catch (error) {
            const values = await formRef.current.getFieldsValue();
            console.log('validate error', values, error);
            Message.error('校验失败，请检查字段！');
        } finally {
            setSaveLoading(false);
        }
    }

    return (
        <Spin loading={loading} dot tip='页面加载中，请稍后...'
            className={styles['product']} >
            <div className={styles['product-content']}>

                {loadErrMsg ?
                    <div className={styles['product-content-loadErr']}>
                        <Result
                            status='500'
                            subTitle={loadErrMsg}
                            extra={
                                <Button type='primary'
                                    onClick={() => { location.reload(); }}
                                >刷新</Button>
                            }
                        />
                    </div>
                    : <>
                        <PageHeader title={platformName} subTitle={shopName} />
                        <Card className={styles['product-content-card']}>
                            <Form id='spuForm'
                                ref={formRef}
                                layout='vertical'
                                autoComplete='off'
                                scrollToFirstError={true}
                                onValuesChange={(_, values) => {
                                    console.log(values);
                                }}
                                validateMessages={{
                                    required: (_, { label }) => `${label || ''}不能为空`,
                                    string: {
                                        length: `字符数必须是 #{length}`,
                                        match: `不匹配正则 #{pattern}`,
                                    },
                                    number: {
                                        min: `最小值为 #{min}`,
                                        max: `最大值为 #{max}`,
                                    },
                                }}
                            >
                                {formSchema.map((m, i) => {
                                    return <ProFormItem key={i} {...m} formSchema={formSchema} />
                                })}
                            </Form>
                        </Card>
                        <Card>
                            <Space style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Button type='primary' size='large' loading={saveLoading} onClick={handleSave}>保存</Button>
                            </Space>
                        </Card>
                    </>
                }
            </div>
        </Spin>
    );
}

export default ProductPublish;

