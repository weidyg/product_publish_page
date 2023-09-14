import { useContext, useState } from "react";
import { Button, Card, ConfigProvider, Form, Message, PageHeader, Result, Space, Spin } from "@arco-design/web-react";
import styles from './style/index.module.less'

import publishSchema from './publishSchema.json'
import { ConfigContext } from "@arco-design/web-react/es/ConfigProvider";
import { MyFormItemProps } from "./interface";
import { ProFormItem } from "../../../components/pro-form";

function ProductEdit() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [loadErrMsg, setLoadErrMsg] = useState();

    const [shopName, setShopName] = useState('枫影乐购');
    const [platformName, setPlatformName] = useState('淘宝');
    const [categoryPath, setCategoryPath] = useState('女装/女士精品>>毛呢外套');

    const [formSchema, setFormSchema] = useState<any>(publishSchema);

    const handleSave = async () => {
        setSaveLoading(true);
        try {
            const values = await form.validate();
            try {
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
    const context = useContext(ConfigContext);
    return (
        <ConfigProvider {...context} componentConfig={{}}>
            <Spin loading={loading} dot tip='页面加载中，请稍后...'
                className={styles['product']} >
                <div className={styles['product-content']}>

                    {loadErrMsg ?
                        <div className={styles['product-content-loadErr']}>
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

                            <Card className={styles['product-card']}>
                                {`当前类目：${categoryPath}`}
                            </Card>
                            <Form id='spuForm'
                                form={form}
                                layout='vertical'
                                autoComplete='off'
                                scrollToFirstError={true}
                                onValuesChange={(_, values) => {
                                    console.log(values);
                                }}
                            >
                                <Card className={styles['product-card']}>
                                    {formSchema.map((m: MyFormItemProps, i: any) => {
                                        return <ProFormItem key={i} {...m} formSchema={formSchema} />
                                    })}
                                </Card>
                            </Form>
                            <Card className={styles['product-card']}>
                                <Space style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Button type='primary' size='large' loading={saveLoading} onClick={handleSave}>保存</Button>
                                </Space>
                            </Card>
                        </>
                    }
                </div>
            </Spin>
        </ConfigProvider>
    );
}
export default ProductEdit;