import { createContext, useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Message, Modal, PageHeader, Result, Skeleton, Space, Spin } from "@arco-design/web-react";
import styles from './style/index.module.less'
import { MyFormItemProps } from "./interface";
import { ProFormItem } from "../../../components/pro-form";
import { FieldNames } from "../../../components/until";
import { loadProductEditData, saveProductEditData } from "../../../components/api";

type OptVal = { id?: number, name?: string };
type ProductEditContextValue = {
    getShopId?: () => number | undefined
};
export const ProductEditContext = createContext<ProductEditContextValue>({});
function ProductEdit() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [formSchema, setFormSchema] = useState<MyFormItemProps[]>([]);
    const [shop, setShop] = useState<OptVal>();
    const [platform, setPlatform] = useState<OptVal>();
    const [categoryPath, setCategoryPath] = useState('');
    const [loadErrMsg, setLoadErrMsg] = useState();

    useEffect(() => {
        loadingInitData();
    }, [])

    const loadingInitData = async () => {
        setLoading(true);
        try {
            const {
                platformId, shopId,
                platformName, shopName,
                fullCategoryName,
                schema, data
            } = await loadProductEditData();
            setFormSchema(schema);
            setPlatform({ id: platformId, name: platformName });
            setShop({ id: shopId, name: shopName });
            setCategoryPath(fullCategoryName);
            form?.setFieldsValue(data);
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
                console.log('values success', values);
                Message.info('保存成功！');
            } catch (error: any) {
                Message.error(error?.message);
            }
        } catch (error) {
            console.log('validate error', JSON.stringify(error));
            Message.error('保存失败！');
        } finally {
            setSaveLoading(false);
            setPublishLoading(false);
        }
    }

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
                        <PageHeader title={platform?.name} subTitle={shop?.name} />
                        <Card hoverable className={styles['product-card']}>
                            <Skeleton loading={loading} animation text={{ rows: 1 }}>
                                {`当前类目：${categoryPath}`}
                            </Skeleton>
                        </Card>
                        <ProductEditContext.Provider value={{
                            getShopId: function () { return shop?.id }
                        }}>
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