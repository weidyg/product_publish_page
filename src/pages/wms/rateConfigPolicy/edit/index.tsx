import { useEffect, useState } from "react";
import WmsRateEdit from "../../../../components/WmsRateEdit";
import { RateConfigPolicy, WmsRateOptions } from "../../../../components/WmsRateEdit/interface";
import { Button, Result, Spin } from "@arco-design/web-react";
import * as api from "../api";
import { IconFaceFrownFill } from "@arco-design/web-react/icon";
import styles from './style/index.module.less'

// const defaultValue = {
//     id: 10,
//     name: '默认费率策略',
//     storeId: 1545,
//     details: [
//         {
//             id: 6,
//             expenseType: 1,
//             calculateRule: 10,
//             operateType: 10,
//             unitPrice: 0.0,
//             weightRangePrice: [],
//             quantityRangePrice: []
//         },
//         {
//             id: 6,
//             expenseType: 2,
//             calculateRule: 20,
//             operateType: 10,
//             unitPrice: 0.0,
//             weightRangePrice: [],
//             quantityRangePrice: []
//         }
//     ]
// }

// const options = {
//     stores: [
//         { label: '奇门正式测试', value: 1471 },
//         { label: '青创网A099仓', value: 1545 },
//         { label: '青创网A100仓', value: 1659 },
//     ],
//     operateTypes: [
//         { label: '入库', value: 10 },
//         { label: '出库', value: 20 },
//     ],
//     expenseTypes: [
//         { label: '快递费', value: 1 },
//         { label: '操作费', value: 2 },
//         { label: '物料费', value: 3 },
//         { label: '储存费', value: 4 },
//     ],
//     calculateRules: [
//         { label: '固定费用', value: 10 },
//         { label: '数量区间', value: 20 },
//         { label: '重量区间', value: 30 },
//     ],
// }

const convertType = (calculateRule: number, expenseType: number) => {
    const isFixedFee = calculateRule == 10;
    const isIntervalFee = (calculateRule >= 0 && calculateRule != 10);
    const isWeight = calculateRule == 30;
    const isStorageFee = expenseType == 4;
    return { isFixedFee, isIntervalFee, isWeight, isStorageFee }
}

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
                    convertType={convertType}
                    options={options}
                    defaultValue={value}
                    onSubmit={handleSubmit}
                />
            }
        </div>
    </Spin>
}
export default WmsRateEditPage;

