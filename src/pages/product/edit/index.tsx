import { createContext, useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Message, Modal, PageHeader, Result, Skeleton, Space, Spin } from "@arco-design/web-react";
import styles from './style/index.module.less'
import { MyFormItemProps, ProductEditDataProps } from "./interface";
import { ProFormItem } from "../../../components/pro-form";
import { FieldNames } from "../../../components/until";
import { loadProductEditData, saveProductEditData } from "../../../components/api";

type ProductEditContextValue = {
    platformId?: number,
    shopId?: number,
    categoryId?: string;
};
export const ProductEditContext = createContext<ProductEditContextValue>({});
function ProductEdit() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [loadErrMsg, setLoadErrMsg] = useState<string>();
    const [productEditData, setProductEditData] = useState<ProductEditDataProps>();

    useEffect(() => {
        loadingInitData();
    }, [])

    const loadingInitData = async () => {
        setLoading(true);
        try {
            const productEditData = await loadProductEditData();
            setProductEditData(productEditData);
            form?.setFieldsValue(productEditData?.data || {});
        } catch (error: any) {
            setLoadErrMsg(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (publish?: boolean) => {
        try {
            const values = await form.validate();
            try {
                await saveProductEditData(values, publish);
                // console.log('values success', values);
                Message.info(`保存${publish ? '并发布' : ''}成功！`);
            } catch (error: any) {
                if (publish) {
                    Modal.error({
                        title: '保存并发布失败',
                        content: error?.message
                    });
                } else {
                    Message.error(error?.message);
                }
            }
        } catch (error) {
            console.log('validate error', JSON.stringify(error));
            Message.error('保存失败！');
        } finally {
            setSaveLoading(false);
            setPublishLoading(false);
        }
    }
    const { formSchema = [], platformName, shopName, categoryNamePath
        , platformId, shopId, categoryId
    } = productEditData || {};
    const [skuFullName, skuStockName, quantityFullName] = useMemo(() => {
        const skuProp = formSchema.find((f: any) => FieldNames.sku(f));
        const skuStockProp = skuProp?.subItems?.find((f: any) => FieldNames.skuStock(f));
        const quantityProp = formSchema.find((f: any) => FieldNames.quantity(f));
        if (skuProp && skuStockProp && quantityProp) {
            const skuName = skuProp.namePath?.join('.') || skuProp.name;
            const skuStockName = skuStockProp.name;
            const quantityName = quantityProp.namePath?.join('.') || skuStockProp.name;
            return [skuName, skuStockName, quantityName,];
        }
        return [undefined, undefined, undefined,];
    }, [JSON.stringify(formSchema)]);

    const salePropFieldName = useMemo(() => {
        const saleProp = formSchema.find((f: any) => FieldNames.saleProp(f));
        return saleProp?.namePath?.join('.') || saleProp?.name;
    }, [JSON.stringify(formSchema)]);

    return (
        <Spin loading={loading} tip='页面加载中，请稍后...'
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
                        <Card hoverable className={styles['product-card']}>
                            <Skeleton loading={loading} animation text={{ rows: 1 }}>
                                {`当前类目：${categoryNamePath || '--'}`}
                            </Skeleton>
                        </Card>
                        <ProductEditContext.Provider value={{ platformId, shopId, categoryId }}>
                            <Form id='spuForm'
                                form={form}
                                layout='vertical'
                                autoComplete='off'
                                scrollToFirstError={true}
                                // onSubmit={(values: FormData) => {
                                //     console.log('onSubmit', values);
                                // }}
                                // onSubmitFailed={(errors: { [key: string]: FieldError; }) => {
                                //     console.log('onSubmitFailed', errors);
                                // }}
                                onValuesChange={(value, values) => {
                                    if (form && skuFullName && skuStockName && quantityFullName) {
                                        const skuStockChanged = Object.keys(value).some(s => s.endsWith(skuStockName!));
                                        if (skuStockChanged) {
                                            let quantity = 0;
                                            const skus: any[] = form.getFieldValue(skuFullName!) || [];
                                            skus.forEach(f => { quantity += parseInt(f[skuStockName!]) || 0; });
                                            form.setFieldValue(quantityFullName!, quantity);
                                        }
                                    }
                                    // console.log('values', values);
                                }}
                                validateMessages={{
                                    required: (_, { label }) => `${label || ''}不能为空`,
                                    string: {
                                        length: `字符数必须是 #{length}`,
                                        match: `不匹配正则 #{pattern}`,
                                    },
                                }}
                            >
                                <Card hoverable className={styles['product-card']}>
                                    <Skeleton loading={loading} animation text={{ rows: 10 }}>
                                        {formSchema.map((m: MyFormItemProps, i: any) => {
                                            return <ProFormItem key={i} {...m} salePropFieldName={salePropFieldName} />
                                        })}
                                    </Skeleton>
                                </Card>
                                <Card hoverable className={styles['product-card']}>
                                    <Skeleton loading={loading} animation text={{ rows: 1 }}>
                                        <Space size={'large'}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Button
                                                type='primary'
                                                size='large'
                                                loading={publishLoading}
                                                disabled={saveLoading}
                                                onClick={() => {
                                                    setPublishLoading(true);
                                                    setTimeout(() => { handleSave(true); }, 100)
                                                }}>
                                                {publishLoading ? ' 保存并发布中...' : ' 保存并发布'}
                                            </Button>
                                            <Button
                                                size='large'
                                                loading={saveLoading}
                                                disabled={publishLoading}
                                                onClick={() => {
                                                    setSaveLoading(true);
                                                    setTimeout(() => { handleSave(); }, 10)
                                                }}>
                                                {saveLoading ? '保存中...' : '保 存'}
                                            </Button>
                                        </Space>
                                    </Skeleton>
                                </Card>
                            </Form>
                        </ProductEditContext.Provider>
                    </>
                }
            </div>
        </Spin>
    );
}

export default ProductEdit;