import { useEffect, useState } from "react";
import WmsRateEdit from "../../../../components/WmsRateEdit";
import { RateConfigPolicy, WmsRateOptions } from "../../../../components/WmsRateEdit/interface";
import { Button, Result, Spin } from "@arco-design/web-react";
import * as api from "../api";
import { IconFaceFrownFill } from "@arco-design/web-react/icon";
import styles from './style/index.module.less'

function WmsRateEditPage() {
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState<RateConfigPolicy>();
    const [options, setOptions] = useState<WmsRateOptions>();
    const [loadErrMsg, setLoadErrMsg] = useState<string>();
    const [reload, setReload] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData(): Promise<void | Promise<any>> {
        try {
            setLoading(true);
            const opts = await api.getRateConfigOptions();
            setOptions(opts);

            const result = await api.loadRateConfigPolicy();
            setValue(result || {});
        } catch (error: any) {
            setLoadErrMsg(error?.message);
        } finally {
            setLoading(false);
        }
    }
    
    async function handleSubmit(value: RateConfigPolicy): Promise<void | Promise<any>> {
        await api.saveRateConfigPolicy(value);
    }

    async function handleCancel(): Promise<void | Promise<any>> {
        await api.cancelRateConfigPolicy();
    }

    return <Spin loading={loading} tip='加载中...'>
        <div className={styles['policy']}>
            {loadErrMsg ?
                <div className={styles['loadError']}>
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
                : !loading && <WmsRateEdit
                    convertType={api.convertRateConfigType}
                    options={options}
                    defaultValue={value}
                    onCancel={handleCancel}
                    onSubmit={handleSubmit}
                />
            }
        </div>
    </Spin>
}
export default WmsRateEditPage;

