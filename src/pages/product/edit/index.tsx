import { useEffect, useState } from "react";
import { Button, Card, Form, Message, PageHeader, Result, Skeleton, Space, Spin } from "@arco-design/web-react";
import styles from './style/index.module.less'
import { MyFormItemProps } from "./interface";
import { ProFormItem } from "../../../components/pro-form";

declare global {
    interface Window {
        loadProductEditData: any,
        saveProductEditData: any,
    }
}

function ProductEdit() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [formSchema, setFormSchema] = useState<MyFormItemProps[]>([]);
    const [shopName, setShopName] = useState('');
    const [platformName, setPlatformName] = useState('');
    const [categoryPath, setCategoryPath] = useState('');


    const [loadErrMsg, setLoadErrMsg] = useState();
    useEffect(() => {
        loadingInitData();
    }, [])

    const loadingInitData = async () => {
        setLoading(true);
        try {
            const {
                platformName, shopName,
                fullCategoryName,
                schema, data
            } = await window.loadProductEditData();
            setFormSchema(schema);
            setPlatformName(platformName);
            setShopName(shopName);
            setCategoryPath(fullCategoryName);
            form?.setFieldsValue(data);
        } catch (error: any) {
            setLoadErrMsg(error?.message);
        } finally {
            setLoading(false);
        }

    }

    const handleSave = async () => {
        setSaveLoading(true);
        try {
            const values = await form.validate();
            try {
                await window.saveProductEditData(values);
                console.log('values success', values);
                Message.info('保存成功！');
            } catch (error: any) {
                Message.error(error?.message);
            }
        } catch (error) {
            const values = form.getFieldsValue();
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
                    <div className={styles['product-content-loadError']}>
                        <Result
                            status='500'
                            subTitle={loadErrMsg}
                            extra={
                                <Button type='primary'
                                    onClick={() => { location.reload(); }}
                                >
                                    刷新
                                </Button>
                            }
                        />
                    </div>
                    : <>
                        <PageHeader title={platformName} subTitle={shopName} />
                        {categoryPath && <Card className={styles['product-card']}>
                            {`当前类目：${categoryPath}`}
                        </Card>}
                        <Form id='spuForm'
                            form={form}
                            layout='vertical'
                            autoComplete='off'
                            scrollToFirstError={true}
                            // onValuesChange={(_, values) => {
                            //     console.log(values);
                            // }}
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
                            <Card className={styles['product-card']}>
                                <Skeleton loading={loading} animation text={{ rows: 10 }}>
                                    {formSchema.map((m: MyFormItemProps, i: any) => {
                                        return <ProFormItem key={i} {...m} formSchema={formSchema} />
                                    })}
                                </Skeleton>
                            </Card>
                        </Form>
                        <Card className={styles['product-card']}>
                            <Skeleton loading={loading} animation text={{ rows: 1 }}>
                                <Space style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Button
                                        type='primary'
                                        size='large'
                                        loading={saveLoading}
                                        disabled={saveLoading}
                                        onClick={handleSave}>
                                        保 存
                                    </Button>
                                </Space>
                            </Skeleton>
                        </Card>
                    </>
                }
            </div>
        </Spin>
    );
}

export default ProductEdit;