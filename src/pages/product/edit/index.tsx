import { ReactElement, ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Message, Modal, PageHeader, Result, Skeleton, Space, Spin } from "@arco-design/web-react";
import styles from './style/index.module.less'
import { MyFormItemProps, ProductEditDataProps } from "./interface";
import { ProFormItem } from "../../../components/pro-form";
import { FieldNames } from "../../../components/until";
import { loadProductEditData, saveProductEditData } from "../../../components/api";
import Paragraph from "@arco-design/web-react/es/Typography/paragraph";
import ProductEditForm from "../../../components/product-edit";

type ProductEditContextValue = {
    platformId?: number,
    shopId?: number,
    categoryId?: string;
};
export const ProductEditContext = createContext<ProductEditContextValue>({});
function ProductEditPage() {
    const [form] = Form.useForm();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [loadErrMsg, setLoadErrMsg] = useState<string>();
    const [productEditData, setProductEditData] = useState<ProductEditDataProps>();

    const { formSchema = [], data = {},
        platformId, shopId, categoryId
        , platformName, shopName, categoryNamePath
    } = productEditData || {};

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
                    Message.success(`保存${publish ? '并发布' : ''}成功！`);
                } catch (error: any) {
                    Modal.error({
                        maskClosable: false,
                        title: `保存${publish ? '并发布' : ''}失败`,
                        content: <Paragraph>{error?.message}</Paragraph>
                    });
                }
            } catch (error: any) {
                console.log('validate error', error?.errors);
                const keys = Object.keys(error?.errors || {})?.map(m => m && m.split('.')[0]);
                let labels: any[] = keys.length > 0 ? formSchema.filter(m => keys.includes(m.name!))?.map(m => m.label) || [] : [];
                Message.error(`检测到 [ ${labels?.join('、')} ] 有必填项未填或格式错误，请补充后重新保存！`);
            } finally {
                setSaveLoading(false);
                setPublishLoading(false);
            }
        }, 100);
    }

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
                                    <Card hoverable className={styles['product-form']}>
                                        <ProductEditForm
                                            form={form}
                                            shopId={shopId}
                                            platformId={platformId}
                                            categoryId={categoryId}
                                            formSchema={formSchema}
                                            formData={data}
                                        />
                                    </Card>
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
                                        disabled={saveLoading || publishLoading}
                                        onClick={() => { handleSave(true); }}>
                                        {publishLoading ? ' 保存并发布中...' : ' 保存并发布'}
                                    </Button>
                                    <Button
                                        type='outline'
                                        size='large'
                                        loading={saveLoading}
                                        disabled={saveLoading || publishLoading}
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

export default ProductEditPage;