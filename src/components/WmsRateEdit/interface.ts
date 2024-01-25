
export interface WmsRateEditProps {
    stores: Array<{ label: string, value: number }>,
    expenseTypes: Array<{ label: string, value: number }>,
    calculateRules: Array<{ label: string, value: number }>,
    operateTypes: Array<{ label: string, value: number }>,

    defaultValue?: RateConfigPolicy,
    value?: RateConfigPolicy,
    onChange?: (value: RateConfigPolicy) => void | Promise<any>,
}

export interface RateConfigPolicy {
    id?: number,
    name?: string,
    storeId?: number,
    details?: RateConfigPolicyDetail[],
}

export interface RateConfigPolicyDetail {
    id?: number,
    expenseType: number,
    calculateRule: number,
    operateType?: number,
    unitPrice?: number,
    weightRangePrice?: RateRangePrice[],
    quantityRangePrice?: RateRangePrice[],
}

export interface RateRangePrice {
    minValue: number,
    maxValue: number,
    firstValue: number,
    firstFee: number,
    overValue: number,
    overFee: number,
}