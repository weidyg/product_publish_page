import { useState } from "react";
import WmsRateEdit from "../../../../components/WmsRateEdit";
import { RateConfigPolicy } from "../../../../components/WmsRateEdit/interface";
import { Message } from "@arco-design/web-react";


const options = {
    stores: [
        { label: '奇门正式测试', value: 1471 },
        { label: '青创网A099仓', value: 1545 },
        { label: '青创网A100仓', value: 1659 },
    ],
    operateTypes: [
        { label: '入库', value: 10 },
        { label: '出库', value: 20 },
    ],
    expenseTypes: [
        { label: '快递费', value: 1 },
        { label: '操作费', value: 2 },
        { label: '物料费', value: 3 },
        { label: '储存费', value: 4 },
    ],
    calculateRules: [
        { label: '固定费用', value: 10 },
        { label: '数量区间', value: 20 },
        { label: '重量区间', value: 30 },
    ],
}


function WmsRateEditPage() {
    const [value, SetValue] = useState<RateConfigPolicy>({
        id: 10,
        name: '默认费率策略',
        storeId: 1545,
        details: [
            {
                id: 6,
                expenseType: 1,
                calculateRule: 10,
                operateType: 10,
                unitPrice: 0.0,
                weightRangePrice: [],
                quantityRangePrice: []
            },
            {
                id: 6,
                expenseType: 2,
                calculateRule: 20,
                operateType: 10,
                unitPrice: 0.0,
                weightRangePrice: [],
                quantityRangePrice: []
            }
        ]
    })

    function handleChange(value: RateConfigPolicy): void {
        SetValue(value);
        Message.info(JSON.stringify(value));
    }

    return <WmsRateEdit
        stores={options.stores}
        operateTypes={options.operateTypes}
        expenseTypes={options.expenseTypes}
        calculateRules={options.calculateRules}
        value={value}
        onChange={handleChange}
    />
}
export default WmsRateEditPage;

