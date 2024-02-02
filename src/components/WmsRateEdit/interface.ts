
export interface WmsRateEditProps {
    options?: WmsRateOptions,
    defaultValue?: RateConfigPolicy,
    value?: RateConfigPolicy,
    onChange?: (value: RateConfigPolicy) => void | Promise<any>,
    onSubmit?: (value: RateConfigPolicy) => void | Promise<any>,
    onCancel?: () => void | Promise<any>,
    convertType: (calculateRule?: number, expenseType?: number) => {
        isFixedFee: boolean;
        isIntervalFee: boolean;
        isWeight: boolean;
        isStorageFee: boolean;
    }
}

export interface WmsRateOptions {
    stores?: Array<{ label: string, value: number }>,
    expenseTypes?: Array<{ label: string, value: number }>,
    calculateRules?: Array<{ label: string, value: number }>,
}

export interface RateConfigPolicy {
    id?: number,
    name?: string,
    storeId?: number,
    details?: RateConfigPolicyDetail[],
}

export interface RateConfigPolicyDetail {
    key?: string,
    id?: number,
    expenseType?: number,
    calculateRule?: number,
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