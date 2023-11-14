import { createContext, useEffect, useState } from "react";
import { Affix, Button, Card, Form, Message, Modal, PageHeader, Result, Space, Spin } from "@arco-design/web-react";
import Paragraph from "@arco-design/web-react/es/Typography/paragraph";
import { ProductEditDataProps } from "./interface";
import styles from './style/index.module.less'
import { loadProductEditData, saveProductEditData } from "../../../components/product-edit/api";
import ProductEditForm from "../../../components/product-edit";
import LeftProdInfo from "../../../components/product-edit/left-info";
import { ProdInfo } from "../../../components/product-edit/left-info/interface";

function ProductEditPage() {
    const [form] = Form.useForm();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [loadErrMsg, setLoadErrMsg] = useState<string>();
    const [productEditData, setProductEditData] = useState<ProductEditDataProps>();

    const { formSchema = [], data = {},
        itemId, platformId, shopId, categoryId
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

    const handleSave = async (id?: string | number, publish?: boolean) => {
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

    const prodInfo: ProdInfo = {
        title: '逸凯服饰W03款式港风潮牌连帽套头纯棉卫衣男支持一件代发。',
        image: 'https://pics.17qcc.com/2018/product/201808/08/20978773208319.jpg',
        code: 'W031',
        cateProp: [
            { name: "适用对象", values: ["青少年"] },
            { name: "制作工艺", values: ["其他"] },
            { name: "风格", values: ["潮"] },
            { name: "适用季节", values: ["秋季"] },
            { name: "基础风格", values: ["其他"] },
            { name: "服装版型", values: ["修身型"] },
            { name: "图案", values: ["其他"] },
            { name: "流行元素/工艺", values: ["其他"] },
            { name: "面料", values: ["其他"] },
            { name: "适用场景", values: ["休闲", "休闲", "休闲", "休闲"] },
            { name: "领型", values: ["其他"] },
            { name: "材质", values: ["其他"] },
            { name: "厚薄", values: ["常规"] },
            { name: "货号", values: ["w03"] },
            { name: "袖型", values: ["常规"] },
            { name: "材质成分", values: ["100%棉"] },
            { name: "款式", values: ["套头"] },
        ],
        saleProp: [
            {
                name: '尺码',
                values: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL-185/96A']
            }, {
                name: '颜色分类',
                values: ['白色', '红色', '黑色']
            },
        ],
        skus: [
            {
                props: [{ name: '颜色分类', value: '白色' }, { name: '尺码', value: 'S' }],
                id: 1, code: "2358707", price: 1000,
            },
            {
                props: [{ name: '颜色分类', value: '白色' }, { name: '尺码', value: 'M' }],
                id: 2, code: "2358707", price: 1000,
            }, {
                props: [{ name: '颜色分类', value: '黑色' }, { name: '尺码', value: 'XL' }],
                id: 3, code: "2358707", price: 1000,
            }, {
                props: [{ name: '颜色分类', value: '白色' }, { name: '尺码', value: 'XL' }],
                id: 4, code: "2358707", price: 1000,
            }, {
                props: [{ name: '颜色分类', value: '白色' }, { name: '尺码', value: '2XL' }],
                id: 5, code: "2358707", price: 1000,
            }, {
                props: [{ name: '颜色分类', value: '白色' }, { name: '尺码', value: '2XL' }],
                id: 51, code: "2358707", price: 1000,
            }, {
                props: [{ name: '颜色分类', value: '黑色' }, { name: '尺码', value: '3XL' }],
                id: 6, code: "2358707", price: 1000,
            }, {
                props: [{ name: '颜色分类', value: '白色' }, { name: '尺码', value: '4XL-185/96A' }],
                id: 7, code: "2358707", price: 1000,
            },
        ]
    };

    return (<>
        <Affix offsetTop={50}>
            <LeftProdInfo data={prodInfo} />
        </Affix>
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
                                    originalSaleProps={prodInfo?.saleProp}
                                />
                            </Card>
                        </div>
                        <div className={styles['product-floor']}>
                            <Card>
                                <Space size={'large'}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Button
                                        type='outline'
                                        size='large'
                                        loading={publishLoading}
                                        disabled={saveLoading || publishLoading}
                                        onClick={() => { handleSave(itemId, true); }}>
                                        {publishLoading ? ' 保存并发布中...' : ' 保存并发布至平台'}
                                    </Button>
                                    <Button
                                        type='primary'
                                        size='large'
                                        loading={saveLoading}
                                        disabled={saveLoading || publishLoading}
                                        onClick={() => { handleSave(itemId); }}>
                                        {saveLoading ? '保存中...' : '保 存'}
                                    </Button>
                                </Space>
                            </Card>
                        </div>
                    </>
                }
            </div>
        </Spin>
    </>

    );
}

export default ProductEditPage;

