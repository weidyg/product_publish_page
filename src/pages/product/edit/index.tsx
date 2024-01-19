import { useEffect, useRef, useState } from "react";
import { Affix, Button, Card, Form, Message, Modal, PageHeader, Progress, Result, Space, Spin } from "@arco-design/web-react";
import { ProductEditDataProps } from "./interface";
import styles from './style/index.module.less'
import { getCategorys, getPublishProductJobInfo, loadProductEditData, publishProductWithJob, saveProductEditData } from "../../../components/product-edit/api";
import ProductEditForm from "../../../components/product-edit";
import LeftProdInfo from "../../../components/product-edit/left-info";
import CategorySelect from "../../../components/CategorySelect";
import { Category } from "../../../components/CategorySelect/interface";
import { IconCheckCircleFill, IconCloseCircleFill, IconExclamationCircleFill, IconFaceFrownFill, IconInfoCircleFill } from "@arco-design/web-react/icon";
import { formatDate } from "../../../components/product-edit/until";
import classNames from "@arco-design/web-react/es/_util/classNames";
import { ModalReturnProps } from "@arco-design/web-react/es/Modal/interface";
import { ConfirmProps } from "@arco-design/web-react/es/Modal/confirm";

function ProductEditPage() {
    const config = (window as any)?.prodEditConfig || {};

    const [form] = Form.useForm();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [loadErrMsg, setLoadErrMsg] = useState<string>();
    const [productEditData, setProductEditData] = useState<ProductEditDataProps>();
    const [showCategorySelect, setShowCategorySelect] = useState(false);

    const { formSchema = [], formData = {}, origProdInfo,
        itemId, platformId, shopId, categoryId
        , platformName, shopName, categoryNamePath
    } = productEditData || {};

    const [lastModificationTime, setLastModificationTime] = useState<string>();
    useEffect(() => {
        setShowCategorySelect(false);
        loadInitData();
    }, [])

    const loadCateList = async function (parentId?: string | number): Promise<Category[] | undefined> {
        const cateData = await getCategorys(shopId!, parentId!);
        return cateData;
    };

    let timer: any;
    const progressModalIns = useRef<ModalReturnProps>();
    const statusProgress = { waiting: 'normal', executing: 'normal', succeeded: 'success', failed: 'error' };
    const statusTitles = { waiting: '等待发布', executing: '发布中', succeeded: '发布成功', failed: '发布失败' };
    const statusIcons = { waiting: <IconExclamationCircleFill />, executing: <IconInfoCircleFill />, succeeded: <IconCheckCircleFill />, failed: <IconCloseCircleFill />, };
    function startPublishProgress(jobkey: string) {
        timer = setInterval(async () => {
            const publishProgress = await getPublishProductJobInfo(jobkey);
            const { progress, message, status, dateTime } = publishProgress || {};
            let confirmProps: ConfirmProps = {
                closable: true,
                maskClosable: false,
                unmountOnExit: true,
                title: statusTitles[status],
                icon: statusIcons[status],
                className: styles['product-modal'],
                content: <span className={styles['product-modal-content']}>
                    <Progress animation buffer size='large' percent={progress} status={statusProgress[status] as any} />
                    <span style={{ color: 'var(--color-text-3)' }}>{message}</span>
                </span>,
                footer: progress >= 100 ? undefined : null,
            };
            updatePublishLoading(confirmProps);
            if (progress >= 100) {
                clearInterval(timer);
                timer = null;
            }
        }, 1000);
    }
    function showPublishLoading(publish: boolean) {
        let confirmProps = {
            maskClosable: false,
            unmountOnExit: true,
            title: `保存${publish ? '并发布' : ''}`,
            icon: <IconInfoCircleFill />,
            className: styles['product-modal'],
            content: <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                <Spin size={14} style={{ marginRight: '12px' }} />
                <span>正在保存{publish ? '并发布至平台' : ''}中,请稍后...</span>
            </span>,
            footer: null,
        }
        updatePublishLoading(confirmProps);
    }
    function updatePublishLoading(confirmProps: ConfirmProps) {
        confirmProps.afterClose = () => {
            progressModalIns.current = undefined;
            if (timer != null) {
                clearInterval(timer);
                timer = null;
            }
        };
        if (progressModalIns.current) {
            progressModalIns.current.update(confirmProps);
        } else {
            progressModalIns.current = Modal.info(confirmProps);
        }
    }
    function closePublishLoading() {
        if (progressModalIns.current) {
            progressModalIns.current.close();
            progressModalIns.current = undefined;
        }
    }


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

    const isWithJob = config.isWithJob !== false;
    const handleSave = async (id?: string | number, publish?: boolean) => {
        publish ? setPublishLoading(true) : setSaveLoading(true);
        const _publish = (publish || false) && !isWithJob;
        showPublishLoading(_publish);
        setTimeout(async () => {
            try {
                const values = await form.validate();
                try {
                    await saveProductEditData(values, _publish, id);
                    setLastModificationTime(formatDate(new Date()));
                    if (publish && isWithJob) {
                        const jobkey = await publishProductWithJob(id);
                        startPublishProgress(jobkey);
                    } else {
                        closePublishLoading();
                        Message.success(`保存${_publish ? '并发布' : ''}成功！`);
                    }
                } catch (error: any) {
                    updatePublishLoading({
                        closable: true,
                        maskClosable: false,
                        unmountOnExit: true,
                        title: `保存${publish ? '并发布' : ''}失败`,
                        icon: statusIcons['failed'],
                        content: <div dangerouslySetInnerHTML={{ __html: error?.message }} />,
                        footer: undefined,
                    });
                }
            } catch (error: any) {
                console.log('validate error', error?.errors);
                const keys = Object.keys(error?.errors || {})?.map(m => m && m.split('.')[0]);
                let labels: any[] = keys.length > 0 ? formSchema.filter(m => keys.includes(m.name!))?.map(m => m.label) || [] : [];
                closePublishLoading();
                Message.error(`检测到 [ ${labels?.join('、')} ] 有必填项未填或格式错误，请补充后重新保存！`);
            } finally {
                setPublishLoading(false);
                setSaveLoading(false);
            }
        }, 100);
    }

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
                        <PageHeader className={styles['product-header']}
                            title={platformName}
                            subTitle={shopName}
                        />
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
                            </>}
                    </div>
                }
            </div>
        </Spin>
    </>

    );
}

export default ProductEditPage;

