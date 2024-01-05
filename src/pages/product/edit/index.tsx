import { useEffect, useRef, useState } from "react";
import { Affix, Button, Card, Form, Message, Modal, PageHeader, Result, Space, Spin, Typography } from "@arco-design/web-react";
import Paragraph from "@arco-design/web-react/es/Typography/paragraph";
import { ProductEditDataProps } from "./interface";
import styles from './style/index.module.less'
import { loadProductEditData, saveProductEditData } from "../../../components/product-edit/api";
import ProductEditForm from "../../../components/product-edit";
import LeftProdInfo from "../../../components/product-edit/left-info";
import CategorySelect from "../../../components/CategorySelect";
import { Category } from "../../../components/CategorySelect/interface";
import { flattenTree } from "../../../components/CategorySelect/until";
import { getCategoryTree, getCategorys } from "../../../components/CategorySelect/api";
import { IconCheckCircleFill, IconFaceFrownFill, IconInfoCircleFill, } from "@arco-design/web-react/icon";
import { formatDate } from "../../../components/product-edit/until";
import classNames from "@arco-design/web-react/es/_util/classNames";

function ProductEditPage() {
    const [form] = Form.useForm();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [loadErrMsg, setLoadErrMsg] = useState<string>();
    const [productEditData, setProductEditData] = useState<ProductEditDataProps>();

    const [showCategorySelect, setShowCategorySelect] = useState(false);
    const [category, setCategory] = useState<{ pId: number, data: any }>();

    const { formSchema = [], formData = {}, origProdInfo,
        itemId, platformId, shopId, categoryId
        , platformName, shopName, categoryNamePath
    } = productEditData || {};

    const [lastModificationTime, setLastModificationTime] = useState<string>();
    useEffect(() => {
        setShowCategorySelect(false);
        loadInitData();
    }, [])

    const loadAllCategory = async (): Promise<Category[]> => {
        const cateTreeData = await getCategoryTree(platformId!);
        const flattenData = flattenTree(cateTreeData, 0);
        return flattenData;
    }

    const loadCateList = async function (parentId?: string | number): Promise<Category[] | undefined> {
        // const { pId, data } = category || {};
        // if (!data || pId != platformId) {
        //     const flattenData = await loadAllCategory();
        //     setCategory({ pId: platformId!, data: flattenData });
        //     return flattenData?.filter((f: any) => f.parentId == parentId) || [];
        // } else {
        //     return data?.filter((f: any) => f.parentId == parentId) || [];
        // }
        const cateData = await getCategorys(shopId!, parentId!);
        return cateData;
    };

    const loadInitData = async (categoryId?: string, shopId?: string) => {
        setLoading(true);
        setShowCategorySelect(false);
        try {
            const productEditData = await loadProductEditData(categoryId, shopId);
            setProductEditData(productEditData);
            setLastModificationTime(productEditData?.lastModificationTime);
            form?.setFieldsValue(productEditData?.formData || {});
        } catch (error: any) {
            if (error.code == -1000) {
                Message.info(error?.message);
                setShowCategorySelect(true);
                if (error.result) { setProductEditData(error.result); }
            } else {
                setLoadErrMsg(error?.message);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (id?: string | number, publish?: boolean) => {
        publish ? setPublishLoading(true) : setSaveLoading(true);
        if (publish) { showPublishLoading(true); }
        setTimeout(async () => {
            try {
                const values = await form.validate();
                try {
                    await saveProductEditData(values, publish, id);
                    console.log('values success', values);
                    Message.success(`保存${publish ? '并发布' : ''}成功！`);
                    setLastModificationTime(formatDate(new Date()));
                } catch (error: any) {
                    Modal.error({
                        maskClosable: false,
                        title: `保存${publish ? '并发布' : ''}失败`,
                        content: <Paragraph>
                            {error?.message}
                        </Paragraph>
                    });
                }
            } catch (error: any) {
                console.log('validate error', error?.errors);
                const keys = Object.keys(error?.errors || {})?.map(m => m && m.split('.')[0]);
                let labels: any[] = keys.length > 0 ? formSchema.filter(m => keys.includes(m.name!))?.map(m => m.label) || [] : [];
                Message.error(`检测到 [ ${labels?.join('、')} ] 有必填项未填或格式错误，请补充后重新保存！`);
            } finally {
                showPublishLoading(false);
                setPublishLoading(false);
                setSaveLoading(false);
            }
        }, 100);
    }

    const modalIns = useRef<any>();
    function showPublishLoading(publishLoading: boolean) {
        if (publishLoading === true && !modalIns?.current) {
            modalIns.current = Modal.confirm({
                title: '保存并发布',
                icon: <IconInfoCircleFill />,
                maskClosable: false,
                unmountOnExit: true,
                content: <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                    <Spin size={14} style={{ marginRight: '12px' }} />
                    <span>正在保存并发布至平台中,请稍后...</span>
                </span>,
                footer: null,
            });
        } else if (publishLoading === false && modalIns?.current) {
            modalIns.current.close();
            modalIns.current = null;
        }
    }


    const config = (window as any)?.prodEditConfig || {};
    return (<>
        {origProdInfo && <Affix offsetTop={50}>
            <LeftProdInfo data={origProdInfo} />
        </Affix>}
        <Spin loading={loading} delay={500}
            tip={'页面加载中，请稍后...'}
            className={styles['product']}
        >
            <div className={classNames({
                [styles['product-hide']]: loading
            })}>
                {loadErrMsg ?
                    <div className={styles['product-loadError']}>
                        <Result
                            status={null}
                            icon={<IconFaceFrownFill style={{ color: 'rgb(var(--arcoblue-6))' }} />}
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
                    : <div className={styles['product-content']}>
                        {showCategorySelect
                            ? <CategorySelect
                                title={<>{`选择商品类目`}
                                    {categoryNamePath
                                        ? <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>
                                            {`（参考类目：${categoryNamePath}）`}
                                        </span>
                                        : ''}
                                </>}
                                onGetChildrens={loadCateList}
                                onSubmit={(cate) => {
                                    loadInitData(`${cate[cate.length - 1].id}`, `${shopId}`);
                                }} />
                            : <>
                                <PageHeader className={styles['product-header']}
                                    title={platformName}
                                    subTitle={shopName}
                                />
                                <div>
                                    <Card hoverable className={styles['product-cate']}>
                                        <Space size='large'>
                                            <span>{`当前类目：${categoryNamePath || '--'}`}</span>
                                            <Button type='primary' shape='round' size='mini'
                                                onClick={() => {
                                                    Modal.confirm({
                                                        title: '确认操作',
                                                        content: '更换类目后，编辑过的商品信息会丢失，确定更换?',
                                                        onOk: () => {
                                                            setShowCategorySelect(true);
                                                        }
                                                    });
                                                }}>
                                                切换类目
                                            </Button>
                                        </Space>
                                    </Card>
                                    <Card hoverable className={styles['product-form']}>
                                        <ProductEditForm
                                            form={form}
                                            shopId={shopId}
                                            platformId={platformId}
                                            categoryId={categoryId}
                                            formSchema={formSchema}
                                            formData={formData}
                                            originalSaleProps={origProdInfo?.saleProp}
                                        />
                                    </Card>
                                </div>
                                <div className={styles['product-floor']}>
                                    <Card>
                                        <Space size={'large'}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {config?.btn?.publish !== false
                                                ? <Button
                                                    type='outline'
                                                    size='large'
                                                    loading={publishLoading}
                                                    disabled={saveLoading || publishLoading}
                                                    onClick={() => { handleSave(itemId, true); }}>
                                                    {publishLoading ? ' 保存并发布中...' : ' 保存并发布至平台'}
                                                </Button>
                                                : <></>}
                                            <Button
                                                type='primary'
                                                size='large'
                                                loading={saveLoading}
                                                disabled={saveLoading || publishLoading}
                                                onClick={() => { handleSave(itemId); }}>
                                                {saveLoading ? '保存中...' : '保 存'}
                                            </Button>
                                            {lastModificationTime && <div>
                                                <IconCheckCircleFill style={{ color: 'rgb(var(--success-6))', marginRight: '4px' }} />
                                                <span style={{ fontSize: '12px', color: 'var(--color-text-2)' }}>最后保存于</span>
                                                <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>{lastModificationTime}</span>
                                            </div>}
                                        </Space>
                                    </Card>
                                </div>
                            </>
                        }
                    </div>
                }
            </div>
        </Spin>
    </>

    );
}

export default ProductEditPage;

