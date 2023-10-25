import { ReactElement, ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Message, Modal, PageHeader, Result, Space, Spin } from "@arco-design/web-react";
import styles from './style/index.module.less'
import { MyFormItemProps, ProductEditDataProps } from "./interface";
import { ProFormItem } from "../../../components/pro-form";
import { FieldNames } from "../../../components/until";
import { loadProductEditData, saveProductEditData } from "../../../components/api";
import Paragraph from "@arco-design/web-react/es/Typography/paragraph";

type ProductEditContextValue = {
    platformId?: number,
    shopId?: number,
    categoryId?: string;
};
export const ProductEditContext = createContext<ProductEditContextValue>({});
function ProductEdit() {
    const [form] = Form.useForm();
    const [reload, setReload] = useState(false);
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
        publish ? setPublishLoading(true) : setSaveLoading(true);
        setTimeout(async () => {
            try {
                const values = await form.validate();
                try {
                    await saveProductEditData(values, publish);
                    console.log('values success', values);
                    Message.info(`保存${publish ? '并发布' : ''}成功！`);
                } catch (error: any) {
                    if (publish) {
                        Modal.error({
                            maskClosable: false,
                            title: '保存并发布失败',
                            content: <Paragraph>{error?.message}</Paragraph>
                        });
                    } else {
                        Message.error(error?.message);
                    }
                }
            } catch (error) {
                console.log('validate error', error);
                Message.error('检测到有必填项未填或格式错误，请补充后重新保存！');
            } finally {
                setSaveLoading(false);
                setPublishLoading(false);
            }
        }, 100);
    }
    const { formSchema = [], platformName, shopName, categoryNamePath
        , platformId, shopId, categoryId
    } = productEditData || {};
    const [skuFullName, skuStockName, quantityFullName] = useMemo(() => {
        const skuProp = formSchema.find((f: MyFormItemProps) => FieldNames.sku(f?.tags));
        const skuStockProp = skuProp?.subItems?.find((f: MyFormItemProps) => FieldNames.skuStock(f?.tags));
        const quantityProp = formSchema.find((f: MyFormItemProps) => FieldNames.quantity(f?.tags));
        if (skuProp && skuStockProp && quantityProp) {
            const skuName = skuProp.namePath?.join('.') || skuProp.name;
            const skuStockName = skuStockProp.name;
            const quantityName = quantityProp.namePath?.join('.') || skuStockProp.name;
            return [skuName, skuStockName, quantityName,];
        }
        return [undefined, undefined, undefined,];
    }, [JSON.stringify(formSchema)]);

    const salePropFieldName = useMemo(() => {
        const saleProp = formSchema.find((f: MyFormItemProps) => FieldNames.saleProp(f?.tags));
        return saleProp?.namePath?.join('.') || saleProp?.name;
    }, [JSON.stringify(formSchema)]);

    return (
        <Spin loading={loading} tip='页面加载中，请稍后...' className={styles['product']}>
            <div className={styles['product-box']}>
                {loadErrMsg ?
                    <div className={styles['product-loadError']}>
                        <Result
                            status='500'
                            subTitle={loadErrMsg}
                            extra={
                                <Button type='primary'
                                    loading={reload}
                                    onClick={() => {
                                        setReload(true)
                                        location.reload();
                                    }}
                                >
                                    刷新
                                </Button>
                            }
                        />
                    </div>
                    : !loading && <>
                        <PageHeader className={styles['product-header']} title={platformName} subTitle={shopName} />
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
                                    <Card hoverable className={styles['product-cate']}>
                                        {`当前类目：${categoryNamePath || '--'}`}
                                    </Card>
                                    <ProductEditContext.Provider value={{ platformId, shopId, categoryId }}>
                                        <Form id='spuForm'
                                            form={form}
                                            labelCol={{ span: 3, offset: 0 }}
                                            wrapperCol={{ span: 21, offset: 0 }}
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
                                                    const skuChanged = Object.keys(value).some(s => s.endsWith(skuFullName!));
                                                    if (skuChanged) {
                                                        let quantity = 0;
                                                        const skus: any[] = form.getFieldValue(skuFullName!) || [];
                                                        skus.forEach(f => { quantity += parseInt(f[skuStockName!]) || 0; });
                                                        const oldQuantity = form.getFieldValue(quantityFullName!);
                                                        if (oldQuantity != quantity) { form.setFieldValue(quantityFullName!, quantity); }
                                                    }
                                                }
                                            }}
                                            validateMessages={{
                                                required: (_, { label }) => <>{'必填项'}{label || ''}{'不能为空,请修改'}</>,
                                                string: {
                                                    length: `字符数必须是 #{length}`,
                                                    match: `不匹配正则 #{pattern}`,
                                                },
                                            }}
                                        >
                                            <Card hoverable className={styles['product-form']}>
                                                {/* <Skeleton loading={loading} animation text={{ rows: 10 }}> */}
                                                {formSchema.map((m: MyFormItemProps, i: any) => {
                                                    return <ProFormItem key={i} {...m} salePropFieldName={salePropFieldName} />
                                                })}
                                                {/* </Skeleton> */}
                                            </Card>
                                        </Form>
                                    </ProductEditContext.Provider>
                                </>
                            }
                        </div>
                        <div className={styles['product-floor']}>
                            <Card>
                                <Space size={'large'}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Button
                                        type='primary'
                                        size='large'
                                        loading={publishLoading}
                                        disabled={saveLoading}
                                        onClick={() => { handleSave(true); }}>
                                        {publishLoading ? ' 保存并发布中...' : ' 保存并发布'}
                                    </Button>
                                    <Button
                                        type='outline'
                                        size='large'
                                        loading={saveLoading}
                                        disabled={publishLoading}
                                        onClick={() => { handleSave(); }}>
                                        {saveLoading ? '保存中...' : '保 存'}
                                    </Button>
                                </Space>
                            </Card>
                        </div>
                    </>
                }
            </div>
        </Spin>
    );
}

export default ProductEdit;