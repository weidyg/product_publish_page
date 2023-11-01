import { useEffect, useState } from "react";
import { Button, Card, Drawer, Form, Message, Modal, Result, Space, Spin, Tabs } from "@arco-design/web-react";
import styles from './style/index.module.less'
import { ProductEditDataProps } from "./interface"
import { loadProductEditData, saveProductEditData } from "../../../components/api";
import Paragraph from "@arco-design/web-react/es/Typography/paragraph";
import ProductEditForm from "../../../components/product-edit";


function ProductEditPage() {
    const [form] = Form.useForm();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [loadErrMsg, setLoadErrMsg] = useState<string>();
    const [productEditData, setProductEditData] = useState<ProductEditDataProps>();

    const { itemId, formSchema = [], data = {},
        platformId, shopId, categoryId
        , platformName, shopName, categoryNamePath
    } = productEditData || {};

    const loadingInitData = async (id: string | number) => {
        setLoading(true);
        try {
            setProductEditData(undefined);
            const productEditData = await loadProductEditData(id);
            setProductEditData(productEditData);
            form?.setFieldsValue(productEditData?.data || {});
        } catch (error: any) {
            setProductEditData(undefined);
            setLoadErrMsg(error?.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (id?: string | number, publish?: boolean) => {
        if (!itemId) { Message.error(`参数异常`); return; }
        publish ? setPublishLoading(true) : setSaveLoading(true);
        setTimeout(async () => {
            try {
                const values = await form.validate();
                try {
                    await saveProductEditData(values, publish, id);
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



    const tabList = [{ key: '2176', title: '淘宝' }, { key: '2062', title: '抖音' }];
    const [activeTab, setActiveTab] = useState('2176');
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        loadingInitData(activeTab);
    }, [activeTab]);
    const disabled = !!loadErrMsg || loading || saveLoading || publishLoading;
    return (
        <>
            <Drawer
                width={998}
                title={<span>商品编辑</span>}
                visible={visible}
                maskClosable={false}
                mountOnEnter={true}
                unmountOnExit={true}
                footer={
                    <Space size={'large'}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Button
                            type='primary' size='large'
                            loading={saveLoading}
                            disabled={disabled}
                            onClick={() => { handleSave(itemId); }}>
                            {saveLoading ? '保存中...' : '保 存'}
                        </Button>
                        <Button
                            type='outline' size='large'
                            loading={publishLoading}
                            disabled={disabled}
                            onClick={() => { handleSave(itemId, true); }}>
                            {publishLoading ? ' 保存并发布中...' : ' 保存并发布至平台'}
                        </Button>
                    </Space>
                }
                onCancel={() => {
                    setVisible(false);
                }}
            >
                <Tabs activeTab={activeTab} onChange={setActiveTab}>
                    {tabList.map(m => {
                        return <Tabs.TabPane key={m.key} title={m.title}></Tabs.TabPane>;
                    })}
                </Tabs>
                <Spin loading={loading} tip='加载中，请稍后...'>
                    {!loading && loadErrMsg ?
                        <div style={{
                            width: '960px',
                            minHeight: '320px',
                            height: 'calc(100vh - 230px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Result
                                status='500'
                                subTitle={loadErrMsg}
                                extra={
                                    <Button type='primary'
                                        loading={reload}
                                        onClick={() => {
                                            loadingInitData(activeTab);
                                        }}
                                    >
                                        刷新
                                    </Button>
                                }
                            />
                        </div>
                        : <Card hoverable bordered={false} style={{
                            width: '960px',
                            minHeight: '320px',
                            height: 'calc(100vh - 230px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Card bordered={false}>
                                {!loading && `当前类目：${categoryNamePath || '--'}`}
                            </Card>
                            {formSchema && <ProductEditForm
                                form={form}
                                shopId={shopId}
                                platformId={platformId}
                                categoryId={categoryId}
                                formSchema={formSchema}
                                formData={data}
                            />}
                        </Card>
                    }
                </Spin>
            </Drawer >
        </>
    );
}

export default ProductEditPage;