import { RateConfigPolicy, WmsRateOptions } from "../../../components/WmsRateEdit/interface";
declare global {
    interface Window {
        convertRateConfigType: any,
        getRateConfigOptions: any,
        loadRateConfigPolicy: any,
        saveRateConfigPolicy: any,
        cancelRateConfigPolicy: any,
    }
}
export function convertRateConfigType(calculateRule?: number, expenseType?: number) {
    return window.convertRateConfigType(calculateRule, expenseType);
}

export async function getRateConfigOptions(): Promise<WmsRateOptions> {
    return await window.getRateConfigOptions();
}
export async function loadRateConfigPolicy(id?: number): Promise<RateConfigPolicy> {
    return await window.loadRateConfigPolicy(id);
}
export async function saveRateConfigPolicy(value: RateConfigPolicy): Promise<void> {
    return await window.saveRateConfigPolicy(value);
}
export async function cancelRateConfigPolicy(): Promise<void> {
    return await window.cancelRateConfigPolicy();
}
