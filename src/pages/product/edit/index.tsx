import { createContext, useEffect, useState } from "react";
import { Button, Card, Form, Message, PageHeader, Result, Skeleton, Space, Spin } from "@arco-design/web-react";
import styles from './style/index.module.less'
import { MyFormItemProps } from "./interface";
import { ProFormItem } from "../../../components/pro-form";
import { FieldNames } from "../../../components/until";
import { loadProductEditData, saveProductEditData } from "../../../components/api";

type OptVal = { id?: number, name?: string };
type ProductEditContextValue = { getShopId?: () => number | undefined };
export const ProductEditContext = createContext<ProductEditContextValue>({});
function ProductEdit() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
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

    const handleSave = async () => {
        try {
            const values = await form.validate();
            try {
                await saveProductEditData(values);
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
        }
    }

    const saleProp = formSchema.find((f: any) => FieldNames.saleProp(f));
    const salePropFieldName = saleProp?.namePath?.join('.') || saleProp?.name;
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
                        <PageHeader title={platform?.name} subTitle={shop?.name} />
                        {categoryPath && <Card className={styles['product-card']}>
                            {`当前类目：${categoryPath}`}
                        </Card>}
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
                                onValuesChange={(_, values) => {
                                    console.log(values);
                                }}
                                validateMessages={{
                                    required: (_, { label }) => `${label || ''}不能为空`,
                                    string: {
                                        length: `字符数必须是 #{length}`,
                                        match: `不匹配正则 #{pattern}`,
                                    },
                                }}
                            >
                                <Card className={styles['product-card']}>
                                    <Skeleton loading={loading} animation text={{ rows: 10 }}>
                                        {formSchema.map((m: MyFormItemProps, i: any) => {
                                            return <ProFormItem key={i} {...m} salePropFieldName={salePropFieldName} />
                                        })}
                                    </Skeleton>
                                </Card>
                                <Card className={styles['product-card']}>
                                    <Skeleton loading={loading} animation text={{ rows: 1 }}>
                                        <Space style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Button
                                                type='primary'
                                                size='large'
                                                loading={saveLoading}
                                                onClick={() => {
                                                    setSaveLoading(true);
                                                    setTimeout(() => { handleSave(); }, 1)
                                                }}>
                                                {saveLoading ? ' 保存中...' : ' 保 存'}
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